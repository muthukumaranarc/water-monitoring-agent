import { useState, useEffect, useRef, useCallback } from 'react';
import { INITIAL_READING, DEMO_PRESETS } from '../data/initialWaterData.js';
import { analyzeWater } from '../utils/waterAnalyzer.js';
import { generateReading, getPresetReading } from '../utils/sensorSimulator.js';
import {
  analyzeWaterWithGemini,
  isGeminiConfigured,
  getStoredApiKey
} from '../services/geminiService.js';

const MAX_HISTORY_LENGTH = 20;
const MONITORING_INTERVAL_MS = 5000;

/**
 * Creates seed history around the initial reading so the trend chart
 * and recent readings table look great on initial page load.
 */
function createSeedHistory() {
  const now = Date.now();
  const seed = [];
  const basePh = 7.18;
  const baseTurb = 2.3;
  const baseTds = 315;
  const baseTemp = 26.4;

  for (let i = 4; i >= 0; i--) {
    const timestamp = now - i * 5000;
    const ph = Number((basePh + (4 - i) * 0.03 - 0.05).toFixed(2));
    const turbidity = Number((baseTurb + (4 - i) * 0.05 - 0.05).toFixed(1));
    const tds = Math.round(baseTds + (4 - i) * 2);
    const temperature = Number((baseTemp + (4 - i) * 0.04).toFixed(1));

    const reading = { timestamp, ph, turbidity, tds, temperature };
    const analysis = analyzeWater(reading);
    seed.push({ ...reading, status: analysis.status, score: analysis.score });
  }

  return seed;
}

export function useWaterMonitoring() {
  // Reading state
  const [reading, setReading] = useState(INITIAL_READING);

  // History state: chronological array of { timestamp, ph, turbidity, tds, temperature, status, score }
  const [history, setHistory] = useState(() => createSeedHistory());

  // Monitoring active state
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Rule-based deterministic analysis
  const [analysis, setAnalysis] = useState(() => analyzeWater(INITIAL_READING));

  // Gemini AI state
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [hasGeminiKey, setHasGeminiKey] = useState(() => isGeminiConfigured());

  const timerRef = useRef(null);

  // Update rule-based analysis whenever current reading changes
  useEffect(() => {
    const ruleResult = analyzeWater(reading);
    setAnalysis(ruleResult);
  }, [reading]);

  // Check key configuration on mount
  useEffect(() => {
    setHasGeminiKey(isGeminiConfigured());
  }, []);

  /**
   * Refreshes the Gemini key status (called when settings are saved/removed)
   */
  const refreshKeyStatus = useCallback(() => {
    const configured = isGeminiConfigured();
    setHasGeminiKey(configured);
    return configured;
  }, []);

  /**
   * Appends a reading to history, keeping max items
   */
  const appendToHistory = useCallback((newReading, newAnalysis) => {
    setHistory((prev) => {
      const entry = {
        ...newReading,
        status: newAnalysis.status,
        score: newAnalysis.score
      };
      const updated = [...prev, entry];
      if (updated.length > MAX_HISTORY_LENGTH) {
        return updated.slice(updated.length - MAX_HISTORY_LENGTH);
      }
      return updated;
    });
  }, []);

  /**
   * Generate next cycle reading and update state
   */
  const stepReading = useCallback(() => {
    setReading((prev) => {
      const next = generateReading(prev);
      const nextAnalysis = analyzeWater(next);
      appendToHistory(next, nextAnalysis);
      return next;
    });
  }, [appendToHistory]);

  /**
   * Monitoring timer loop
   */
  useEffect(() => {
    if (isMonitoring) {
      timerRef.current = setInterval(() => {
        stepReading();
      }, MONITORING_INTERVAL_MS);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isMonitoring, stepReading]);

  /**
   * Controls: Start monitoring
   */
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
  }, []);

  /**
   * Controls: Stop monitoring
   */
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  /**
   * Force an immediate rule-based analysis
   */
  const analyzeCurrent = useCallback(() => {
    const currentAnalysis = analyzeWater(reading);
    setAnalysis(currentAnalysis);
    return currentAnalysis;
  }, [reading]);

  /**
   * Set Demo Presets
   */
  const applyPreset = useCallback(
    (presetKey) => {
      const presetData = getPresetReading(presetKey);
      setReading(presetData);
      const presetAnalysis = analyzeWater(presetData);
      setAnalysis(presetAnalysis);
      appendToHistory(presetData, presetAnalysis);
      // Reset prior Gemini output so user can re-trigger for this new condition
      setAiAnalysis(null);
      setAiError(null);
    },
    [appendToHistory]
  );

  const setDemoNormal = useCallback(() => applyPreset('normal'), [applyPreset]);
  const setDemoWarning = useCallback(() => applyPreset('warning'), [applyPreset]);
  const setDemoCritical = useCallback(() => applyPreset('critical'), [applyPreset]);

  /**
   * Request Gemini AI analysis for current reading
   */
  const analyzeWithGemini = useCallback(async () => {
    setIsAnalyzingAI(true);
    setAiError(null);

    const currentAnalysis = analyzeWater(reading);
    const key = getStoredApiKey();

    if (!key || !key.trim()) {
      setIsAnalyzingAI(false);
      setAiError('Gemini is not configured. Demo analysis is active.');
      setAiAnalysis(null);
      return;
    }

    const result = await analyzeWaterWithGemini(reading, currentAnalysis, key);

    setIsAnalyzingAI(false);
    if (result.success) {
      setAiAnalysis(result);
      setAiError(null);
    } else {
      setAiAnalysis(null);
      setAiError(result.error);
    }
  }, [reading]);

  const clearAiAnalysis = useCallback(() => {
    setAiAnalysis(null);
    setAiError(null);
  }, []);

  return {
    reading,
    history,
    isMonitoring,
    analysis,
    aiAnalysis,
    isAnalyzingAI,
    aiError,
    hasGeminiKey,
    startMonitoring,
    stopMonitoring,
    analyzeCurrent,
    analyzeWithGemini,
    clearAiAnalysis,
    setDemoNormal,
    setDemoWarning,
    setDemoCritical,
    refreshKeyStatus
  };
}
