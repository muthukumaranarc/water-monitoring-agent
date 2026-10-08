import React from 'react';

export default function Header({
  isMonitoring,
  hasGeminiKey,
  onOpenSettings
}) {
  return (
    <header className="app-header">
      <div className="app-header__branding">
        <div className="app-header__logo-wrap" aria-hidden="true">
          <span className="app-header__logo-icon">💧</span>
        </div>
        <div className="app-header__titles">
          <h1 className="app-header__title">Water Monitoring Agent</h1>
          <p className="app-header__subtitle">
            SDG 6 — Clean Water and Sanitation
          </p>
        </div>
      </div>

      <div className="app-header__actions">
        {/* Monitoring status pill */}
        <div
          className={`monitoring-pill ${isMonitoring ? 'monitoring-pill--active' : 'monitoring-pill--paused'}`}
          title={isMonitoring ? 'Simulation is active (sampling every 5s)' : 'Simulation paused'}
        >
          <span className="monitoring-pill__pulse" aria-hidden="true" />
          <span className="monitoring-pill__text">
            {isMonitoring ? 'Monitoring Active' : 'Monitoring Paused'}
          </span>
        </div>

        {/* Gemini connection pill */}
        <div
          className={`gemini-badge ${hasGeminiKey ? 'gemini-badge--connected' : 'gemini-badge--demo'}`}
          title={hasGeminiKey ? 'Gemini API key is configured in session storage' : 'No API key set - running in local deterministic demo mode'}
        >
          <span className="gemini-badge__dot" aria-hidden="true" />
          <span className="gemini-badge__text">
            {hasGeminiKey ? 'Gemini: Connected' : 'Gemini: Not configured — Demo Mode'}
          </span>
        </div>

        {/* Settings button */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="btn btn--settings"
          aria-label="Open Settings to configure Gemini API Key"
        >
          <span aria-hidden="true" className="btn__icon">⚙</span>
          <span>Settings</span>
        </button>
      </div>
    </header>
  );
}
