import React from 'react';

export default function MonitoringControls({
  isMonitoring,
  onStartMonitoring,
  onStopMonitoring,
  onAnalyzeNow,
  onAnalyzeWithGemini,
  onDemoNormal,
  onDemoWarning,
  onDemoCritical,
  onOpenSettings,
  isAnalyzingAI
}) {
  return (
    <section className="monitoring-controls-card" aria-label="Monitoring and Simulation Controls">
      <div className="controls-group">
        <span className="controls-group__label">Simulation Engine</span>
        <div className="controls-buttons-row">
          <button
            type="button"
            className="btn btn--success"
            onClick={onStartMonitoring}
            disabled={isMonitoring}
            aria-label="Start continuous water telemetry monitoring"
          >
            <span aria-hidden="true">▶</span>
            <span>Start Monitoring</span>
          </button>

          <button
            type="button"
            className="btn btn--danger"
            onClick={onStopMonitoring}
            disabled={!isMonitoring}
            aria-label="Stop continuous water telemetry monitoring"
          >
            <span aria-hidden="true">⏸</span>
            <span>Stop Monitoring</span>
          </button>

          <button
            type="button"
            className="btn btn--secondary"
            onClick={onAnalyzeNow}
            aria-label="Run immediate deterministic rule analysis"
          >
            <span aria-hidden="true">🔍</span>
            <span>Analyze Now</span>
          </button>
        </div>
      </div>

      <div className="controls-group">
        <span className="controls-group__label">AI & Settings</span>
        <div className="controls-buttons-row">
          <button
            type="button"
            className="btn btn--ai"
            onClick={onAnalyzeWithGemini}
            disabled={isAnalyzingAI}
            aria-label="Analyze current reading using Gemini AI"
          >
            {isAnalyzingAI ? (
              <>
                <span className="spinner-sm" aria-hidden="true" />
                <span>AI Processing...</span>
              </>
            ) : (
              <>
                <span aria-hidden="true">✨</span>
                <span>Analyze with Gemini</span>
              </>
            )}
          </button>

          <button
            type="button"
            className="btn btn--outline"
            onClick={onOpenSettings}
            aria-label="Open settings dialog"
          >
            <span aria-hidden="true">⚙</span>
            <span>Settings</span>
          </button>
        </div>
      </div>

      <div className="controls-group">
        <span className="controls-group__label">Preset Test Conditions</span>
        <div className="controls-buttons-row">
          <button
            type="button"
            className="btn btn--preset btn--preset-normal"
            onClick={onDemoNormal}
            title="Load standard baseline readings (pH 7.2, Turb 2.4, TDS 320, Temp 26.5)"
          >
            Demo Normal
          </button>

          <button
            type="button"
            className="btn btn--preset btn--preset-warning"
            onClick={onDemoWarning}
            title="Load warning condition readings (pH 7.4, Turb 6.2, TDS 410, Temp 27.2)"
          >
            Demo Warning
          </button>

          <button
            type="button"
            className="btn btn--preset btn--preset-critical"
            onClick={onDemoCritical}
            title="Load critical condition readings (pH 5.9, Turb 12.4, TDS 680, Temp 39.1)"
          >
            Demo Critical
          </button>
        </div>
      </div>
    </section>
  );
}
