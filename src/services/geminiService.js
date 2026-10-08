import { GoogleGenAI } from '@google/genai';

export const SESSION_STORAGE_KEY = 'water_monitoring_gemini_key';
export const SESSION_STORAGE_MODEL_KEY = 'water_monitoring_gemini_model';

/**
 * List of available Google Gemini models, prioritized by low traffic and fast response.
 * Models like gemini-2.0-flash-lite and gemini-1.5-flash-8b have the lowest quota pressure.
 */
export const AVAILABLE_MODELS = [
  {
    id: 'gemini-2.0-flash-lite',
    name: 'Gemini 2.0 Flash Lite (Recommended / Low Traffic)',
    description: 'High throughput, lowest latency, and minimal quota consumption'
  },
  {
    id: 'gemini-1.5-flash-8b',
    name: 'Gemini 1.5 Flash 8B (Ultra Lightweight)',
    description: 'Lowest traffic overhead for rapid sensor evaluations'
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash (Standard)',
    description: 'General-purpose low-latency multimodel flash'
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash (Legacy Stable)',
    description: 'High reliability stable production model'
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    description: 'Next-generation reasoning flash model'
  }
];

export const DEFAULT_MODEL = 'gemini-2.0-flash-lite';

/**
 * Fallback order for low-traffic models when auto-cascading.
 */
const CASCADING_MODELS = [
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash-8b',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-2.5-flash'
];

/**
 * Retrieves the stored Gemini API key from sessionStorage.
 * @returns {string} The stored API key or empty string.
 */
export function getStoredApiKey() {
  try {
    return sessionStorage.getItem(SESSION_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

/**
 * Stores the Gemini API key in sessionStorage.
 * @param {string} key
 */
export function saveApiKey(key) {
  try {
    if (key && key.trim()) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, key.trim());
      return true;
    }
  } catch {
    // SessionStorage may be restricted in some environments
  }
  return false;
}

/**
 * Removes the stored Gemini API key from sessionStorage.
 */
export function removeApiKey() {
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // Ignore error
  }
}

/**
 * Retrieves the user's preferred model from sessionStorage.
 */
export function getStoredModel() {
  try {
    return sessionStorage.getItem(SESSION_STORAGE_MODEL_KEY) || DEFAULT_MODEL;
  } catch {
    return DEFAULT_MODEL;
  }
}

/**
 * Saves the user's preferred model in sessionStorage.
 */
export function saveModel(modelId) {
  try {
    if (modelId && modelId.trim()) {
      sessionStorage.setItem(SESSION_STORAGE_MODEL_KEY, modelId.trim());
      return true;
    }
  } catch {
    // Ignore error
  }
  return false;
}

/**
 * Checks if a Gemini API key is currently configured.
 * @returns {boolean}
 */
export function isGeminiConfigured() {
  const key = getStoredApiKey();
  return Boolean(key && key.trim().length > 0);
}

/**
 * Makes an API call to a specific Gemini model using the official @google/genai SDK
 * with a direct REST fallback for resilience.
 */
async function callSingleModel(modelName, apiKey, prompt) {
  let lastError = null;

  // 1. Try using the official @google/genai SDK first
  try {
    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt
    });

    const text = response?.text || '';
    if (text.trim()) {
      return { success: true, text: text.trim(), model: modelName };
    }
  } catch (sdkErr) {
    lastError = sdkErr;
  }

  // 2. Direct browser REST fetch fallback
  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 600
        }
      })
    });

    if (res.ok) {
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (text.trim()) {
        return { success: true, text: text.trim(), model: modelName };
      }
    } else {
      const errorData = await res.json().catch(() => ({}));
      const message = errorData?.error?.message || `HTTP ${res.status}`;
      const status = errorData?.error?.status || '';
      throw { message, httpStatus: res.status, status };
    }
  } catch (fetchErr) {
    lastError = fetchErr;
  }

  throw lastError;
}

/**
 * Sends water quality readings to Gemini for AI-powered interpretation.
 * Supports low-traffic models with automatic cascading fallback to prevent 404 or 429 quota errors.
 * Never logs or exposes the API key.
 *
 * @param {Object} reading - The current water reading
 * @param {Object} ruleAnalysis - Deterministic rule analysis results
 * @param {string} [providedApiKey] - Optional API key override
 * @param {string} [preferredModel] - Optional specific model to use
 * @returns {Promise<{success: boolean, text?: string, summary?: string, observations?: string[], recommendation?: string, error?: string, modelUsed?: string}>}
 */
export async function analyzeWaterWithGemini(
  reading,
  ruleAnalysis,
  providedApiKey = null,
  preferredModel = null
) {
  const apiKey = providedApiKey || getStoredApiKey();

  if (!apiKey || !apiKey.trim()) {
    return {
      success: false,
      error: 'Gemini AI is not configured. Using Demo Analysis.'
    };
  }

  const payload = {
    ph: reading.ph,
    turbidity: reading.turbidity,
    tds: reading.tds,
    temperature: reading.temperature,
    ruleBasedStatus: ruleAnalysis?.status || 'SAFE',
    score: ruleAnalysis?.score ?? 100,
    issues: ruleAnalysis?.issues || []
  };

  const prompt = `You are the AI engine of the Water Monitoring Agent (SDG 6 - Clean Water and Sanitation).
Analyze the following simulated water sensor telemetry data:
${JSON.stringify(payload, null, 2)}

Requirements:
1. Provide a concise condition summary (1-2 sentences).
2. Note key parameter observations against standard thresholds (pH: 6.5-8.5, Turbidity: <= 5 NTU, TDS: <= 500 mg/L, Temp: <= 35 °C).
3. Provide one actionable recommendation.
4. Do NOT claim the water is certified safe for human drinking. Mention this is an educational prototype simulation.
5. Keep the total output concise, professional, and suitable for a compact dashboard card.

Format your response clearly with these three labeled sections:
SUMMARY: [Short summary]
OBSERVATIONS: [Bulleted observations]
RECOMMENDATION: [Concise recommendation]`;

  // Build list of models to try (preferred first, then cascading low-traffic models)
  const targetModel = preferredModel || getStoredModel() || DEFAULT_MODEL;
  const modelsToTry = [targetModel, ...CASCADING_MODELS.filter((m) => m !== targetModel)];

  let lastErrorMessage = '';
  let isAuthFailure = false;

  for (const model of modelsToTry) {
    try {
      const result = await callSingleModel(model, apiKey, prompt);
      if (result?.success && result?.text) {
        const text = result.text;

        // Parse sections for clean structured presentation
        const summaryMatch = text.match(/SUMMARY:\s*([\s\S]*?)(?=OBSERVATIONS:|$)/i);
        const observationsMatch = text.match(/OBSERVATIONS:\s*([\s\S]*?)(?=RECOMMENDATION:|$)/i);
        const recommendationMatch = text.match(/RECOMMENDATION:\s*([\s\S]*?)$/i);

        return {
          success: true,
          text,
          modelUsed: result.model,
          summary: summaryMatch ? summaryMatch[1].trim() : text,
          observations: observationsMatch
            ? observationsMatch[1]
                .split('\n')
                .map((s) => s.replace(/^[-*•\d.]\s*/, '').trim())
                .filter(Boolean)
            : [],
          recommendation: recommendationMatch
            ? recommendationMatch[1].trim()
            : ruleAnalysis?.recommendation || ''
        };
      }
    } catch (err) {
      const msg = String(err?.message || err || '');

      // Check for authentication / invalid key failures (stop trying other models if key is invalid)
      if (
        msg.includes('API_KEY_INVALID') ||
        msg.includes('API key not valid') ||
        msg.includes('UNAUTHENTICATED') ||
        msg.includes('401') ||
        (err?.httpStatus === 400 && msg.includes('API key'))
      ) {
        isAuthFailure = true;
        lastErrorMessage = 'Unable to connect to Gemini. Please verify your API key in Settings.';
        break;
      }

      // If rate limited or quota exceeded
      if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
        lastErrorMessage = `Model ${model} traffic limit reached. Trying alternate low-traffic model...`;
        continue;
      }

      // If model not found (404), try next model
      if (msg.includes('404') || msg.includes('not found') || msg.includes('NOT_FOUND')) {
        lastErrorMessage = `Model ${model} not available on this API tier. Trying alternate low-traffic model...`;
        continue;
      }

      lastErrorMessage = msg;
    }
  }

  if (isAuthFailure) {
    return {
      success: false,
      error: 'Unable to connect to Gemini. Please verify your API key in Settings.'
    };
  }

  return {
    success: false,
    error:
      lastErrorMessage.includes('traffic') || lastErrorMessage.includes('quota')
        ? 'Gemini quota or traffic limit reached. Please wait a moment or try the low-traffic Flash Lite model.'
        : 'Gemini analysis is currently unavailable. Showing rule-based analysis instead.'
  };
}
