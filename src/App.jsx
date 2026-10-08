import React, { useState } from 'react';
import Header from './components/Header';
import SystemStatus from './components/SystemStatus';
import ParameterCard from './components/ParameterCard';
import AgentAnalysis from './components/AgentAnalysis';
import MonitoringChart from './components/MonitoringChart';
import RecentReadings from './components/RecentReadings';
import MonitoringControls from './components/MonitoringControls';
import SettingsModal from './components/SettingsModal';
import { useWaterMonitoring } from './hooks/useWaterMonitoring';
import { PARAMETER_CONFIG } from './data/initialWaterData';

export default function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const {
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
  } = useWaterMonitoring();

  const handleOpenSettings = () => setIsSettingsOpen(true);
  const handleCloseSettings = () => setIsSettingsOpen(false);

  const handleSettingsUpdated = () => {
    refreshKeyStatus();
  };

  const paramStatuses = analysis?.parameterStatuses || {
    ph: 'SAFE',
    turbidity: 'SAFE',
    tds: 'SAFE',
    temperature: 'NORMAL'
  };

  return (
    <div className="app-shell">
      <Header
        isMonitoring={isMonitoring}
        hasGeminiKey={hasGeminiKey}
        onOpenSettings={handleOpenSettings}
      />

      <main className="dashboard-content">
        {/* Overall Water Status & Quality Score */}
        <SystemStatus
          status={analysis?.status || 'SAFE'}
          score={analysis?.score ?? 100}
          lastUpdated={reading.timestamp}
          issueCount={analysis?.issues?.length || 0}
        />

        {/* 4 Parameter Cards */}
        <section className="parameter-grid" aria-label="Monitored Water Parameters">
          <ParameterCard
            title={PARAMETER_CONFIG.ph.name}
            value={PARAMETER_CONFIG.ph.format(reading.ph)}
            status={paramStatuses.ph}
            thresholdLabel={PARAMETER_CONFIG.ph.thresholdLabel}
            icon="🧪"
            minVal={PARAMETER_CONFIG.ph.min}
            maxVal={PARAMETER_CONFIG.ph.max}
            currentValNum={reading.ph}
          />

          <ParameterCard
            title={PARAMETER_CONFIG.turbidity.name}
            value={Number(reading.turbidity).toFixed(1)}
            unit={PARAMETER_CONFIG.turbidity.unit}
            status={paramStatuses.turbidity}
            thresholdLabel={PARAMETER_CONFIG.turbidity.thresholdLabel}
            icon="🌊"
            maxVal={PARAMETER_CONFIG.turbidity.max}
            currentValNum={reading.turbidity}
          />

          <ParameterCard
            title={PARAMETER_CONFIG.tds.name}
            value={Math.round(reading.tds)}
            unit={PARAMETER_CONFIG.tds.unit}
            status={paramStatuses.tds}
            thresholdLabel={PARAMETER_CONFIG.tds.thresholdLabel}
            icon="🧂"
            maxVal={PARAMETER_CONFIG.tds.max}
            currentValNum={reading.tds}
          />

          <ParameterCard
            title={PARAMETER_CONFIG.temperature.name}
            value={Number(reading.temperature).toFixed(1)}
            unit={PARAMETER_CONFIG.temperature.unit}
            status={paramStatuses.temperature}
            thresholdLabel={PARAMETER_CONFIG.temperature.thresholdLabel}
            icon="🌡️"
            maxVal={PARAMETER_CONFIG.temperature.max}
            currentValNum={reading.temperature}
          />
        </section>

        {/* Agent Analysis Section */}
        <AgentAnalysis
          ruleAnalysis={analysis}
          aiAnalysis={aiAnalysis}
          isAnalyzingAI={isAnalyzingAI}
          aiError={aiError}
          hasGeminiKey={hasGeminiKey}
          onAnalyzeWithGemini={analyzeWithGemini}
          onOpenSettings={handleOpenSettings}
          onClearAi={clearAiAnalysis}
        />

        {/* Telemetry Trend Chart */}
        <MonitoringChart history={history} />

        {/* Recent Readings Table */}
        <RecentReadings history={history} />

        {/* Monitoring Controls */}
        <MonitoringControls
          isMonitoring={isMonitoring}
          onStartMonitoring={startMonitoring}
          onStopMonitoring={stopMonitoring}
          onAnalyzeNow={analyzeCurrent}
          onAnalyzeWithGemini={analyzeWithGemini}
          onDemoNormal={setDemoNormal}
          onDemoWarning={setDemoWarning}
          onDemoCritical={setDemoCritical}
          onOpenSettings={handleOpenSettings}
          isAnalyzingAI={isAnalyzingAI}
        />
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="app-footer__inner">
          <p className="app-footer__text">
            <strong>Water Monitoring Agent</strong> — SDG 6 Clean Water & Sanitation Prototype
          </p>
          <p className="app-footer__disclaimer">
            Prototype demonstration using browser-simulated telemetry and rule engine. Not a certified laboratory compliance system.
          </p>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={handleCloseSettings}
        onSettingsUpdated={handleSettingsUpdated}
      />
    </div>
  );
}
