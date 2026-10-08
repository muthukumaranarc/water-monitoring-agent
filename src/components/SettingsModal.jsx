import React, { useState, useEffect } from 'react';
import {
  getStoredApiKey,
  saveApiKey,
  removeApiKey,
  isGeminiConfigured,
  AVAILABLE_MODELS,
  getStoredModel,
  saveModel,
  DEFAULT_MODEL
} from '../services/geminiService.js';

export default function SettingsModal({ isOpen, onClose, onSettingsUpdated }) {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [hasKey, setHasKey] = useState(false);
  const [message, setMessage] = useState(null);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const configured = isGeminiConfigured();
      setHasKey(configured);
      setSelectedModel(getStoredModel());
      setApiKeyInput('');
      setMessage(null);
      setShowKey(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();

    // Save model preference
    saveModel(selectedModel);

    // If key entered, save key as well
    if (apiKeyInput.trim()) {
      const saved = saveApiKey(apiKeyInput.trim());
      if (saved) {
        setHasKey(true);
        setApiKeyInput('');
        setMessage({
          type: 'success',
          text: `Settings saved! Using ${selectedModel} (with auto-fallback).`
        });
        if (onSettingsUpdated) onSettingsUpdated();
        return;
      }
    } else if (hasKey) {
      setMessage({
        type: 'success',
        text: `Active model set to ${selectedModel}.`
      });
      if (onSettingsUpdated) onSettingsUpdated();
      return;
    } else {
      setMessage({ type: 'error', text: 'Please enter a valid Gemini API key.' });
    }
  };

  const handleRemove = () => {
    removeApiKey();
    setHasKey(false);
    setApiKeyInput('');
    setMessage({
      type: 'info',
      text: 'API Key removed. Local rule-based Demo Mode is active.'
    });
    if (onSettingsUpdated) onSettingsUpdated();
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
    >
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-header__title-group">
            <span className="modal-icon" aria-hidden="true">⚙</span>
            <h2 id="modal-title" className="modal-title">Gemini API Settings</h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close settings dialog"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Status banner */}
          <div
            className={`key-status-banner ${hasKey ? 'key-status-banner--active' : 'key-status-banner--demo'}`}
          >
            <span className="key-status-icon" aria-hidden="true">
              {hasKey ? '🟢' : '⚪'}
            </span>
            <div className="key-status-text">
              <strong>Status: {hasKey ? 'Gemini AI Connected' : 'Not configured — Demo Mode'}</strong>
              <p>
                {hasKey
                  ? 'Key is loaded in browser session storage. You can run AI analyses.'
                  : 'No key stored. The application uses deterministic rule-based analysis.'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="modal-form">
            {/* Model Selection Dropdown */}
            <div className="form-group">
              <label htmlFor="gemini-model-select" className="form-label">
                AI Model (Low Traffic / High Quota)
              </label>
              <select
                id="gemini-model-select"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="input-field select-field"
              >
                {AVAILABLE_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <p className="form-helper-text">
                💡 <em>Gemini 2.0 Flash Lite</em> and <em>1.5 Flash 8B</em> have the lowest traffic pressure and highest rate limits on Google AI Studio. The app also cascades automatically if a model is busy.
              </p>
            </div>

            {/* API Key Input */}
            <div className="form-group">
              <label htmlFor="gemini-key-input" className="form-label">
                Gemini API Key
              </label>
              <div className="input-group">
                <input
                  id="gemini-key-input"
                  type={showKey ? 'text' : 'password'}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder={hasKey ? 'Key saved (enter new key to replace)...' : 'Paste your Gemini API key (AIza...)'}
                  className="input-field"
                  autoComplete="off"
                  spellCheck="false"
                />
                <button
                  type="button"
                  className="btn-toggle-vis"
                  onClick={() => setShowKey(!showKey)}
                  aria-label={showKey ? 'Hide key characters' : 'Show key characters'}
                >
                  {showKey ? 'Hide' : 'Show'}
                </button>
              </div>

              <p className="form-helper-text">
                The key is stored only in browser session storage for this demo and is never committed to Git or sent to any third-party server.
              </p>
            </div>

            {message && (
              <div
                className={`modal-feedback modal-feedback--${message.type}`}
                role="status"
              >
                {message.text}
              </div>
            )}

            <div className="modal-actions">
              <button type="submit" className="btn btn--primary">
                Save Settings
              </button>

              {hasKey && (
                <button
                  type="button"
                  className="btn btn--danger-outline"
                  onClick={handleRemove}
                >
                  Remove Key
                </button>
              )}

              <button
                type="button"
                className="btn btn--outline"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </form>

          <div className="modal-info-box">
            <h4>How to get a free API Key</h4>
            <ol>
              <li>Visit <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer">Google AI Studio</a>.</li>
              <li>Sign in and click <strong>Get API key</strong>.</li>
              <li>Paste it here and click <strong>Save Settings</strong>.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
