import React from 'react';

export default function AgentAnalysis({
  ruleAnalysis,
  aiAnalysis,
  isAnalyzingAI,
  aiError,
  hasGeminiKey,
  onAnalyzeWithGemini,
  onOpenSettings,
  onClearAi
}) {
  const issues = ruleAnalysis?.issues || [];
  const recommendation = ruleAnalysis?.recommendation || 'Continue regular monitoring.';

  return (
    <section className="agent-analysis-card" aria-labelledby="agent-analysis-heading">
      <div className="agent-analysis-header">
        <div className="agent-analysis-title-group">
          <span className="card-eyebrow">INTELLIGENCE & RECOMMENDATIONS</span>
          <h2 id="agent-analysis-heading" className="card-title">
            Agent Analysis
          </h2>
        </div>

        <div className="agent-analysis-actions">
          <button
            type="button"
            className="btn btn--primary"
            onClick={onAnalyzeWithGemini}
            disabled={isAnalyzingAI}
            aria-label="Request AI analysis using Google Gemini"
          >
            {isAnalyzingAI ? (
              <>
                <span className="spinner" aria-hidden="true" />
                <span>Analyzing with Gemini...</span>
              </>
            ) : (
              <>
                <span aria-hidden="true">✨</span>
                <span>Analyze with Gemini</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Error or Configuration Notice */}
      {aiError && (
        <div className="analysis-alert analysis-alert--warning" role="alert">
          <div className="analysis-alert__icon" aria-hidden="true">ℹ️</div>
          <div className="analysis-alert__content">
            <p className="analysis-alert__message">{aiError}</p>
            <div className="analysis-alert__links">
              {!hasGeminiKey ? (
                <button
                  type="button"
                  className="btn btn--link"
                  onClick={onOpenSettings}
                >
                  Configure Gemini API Key in Settings →
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn--link"
                  onClick={onOpenSettings}
                >
                  Change AI Model in Settings (Try Low Traffic Flash Lite) →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Gemini AI Result Card (when present) */}
      {aiAnalysis && (
        <div className="gemini-result-box" aria-live="polite">
          <div className="gemini-result-box__header">
            <div className="gemini-result-box__title">
              <span className="gemini-sparkle" aria-hidden="true">✨</span>
              <strong>Gemini AI Analysis</strong>
              <span className="badge-model">
                {aiAnalysis.modelUsed || 'gemini-2.0-flash-lite'}
              </span>
            </div>
            {onClearAi && (
              <button
                type="button"
                className="btn btn--ghost-sm"
                onClick={onClearAi}
                title="Dismiss AI analysis and view local rule output"
              >
                Dismiss AI View
              </button>
            )}
          </div>

          <div className="gemini-result-box__body">
            {aiAnalysis.summary && (
              <div className="gemini-section">
                <h4 className="gemini-section__label">Condition Summary</h4>
                <p className="gemini-section__text">{aiAnalysis.summary}</p>
              </div>
            )}

            {aiAnalysis.observations && aiAnalysis.observations.length > 0 && (
              <div className="gemini-section">
                <h4 className="gemini-section__label">Observations</h4>
                <ul className="gemini-observations-list">
                  {aiAnalysis.observations.map((obs, idx) => (
                    <li key={idx}>{obs}</li>
                  ))}
                </ul>
              </div>
            )}

            {aiAnalysis.recommendation && (
              <div className="gemini-section gemini-section--rec">
                <h4 className="gemini-section__label">AI Recommendation</h4>
                <p className="gemini-section__rec-text">{aiAnalysis.recommendation}</p>
              </div>
            )}

            <div className="gemini-disclaimer">
              <span>Prototype note: Simulated browser telemetry analyzed via {aiAnalysis.modelUsed || 'Gemini'}. Not a certified laboratory test.</span>
            </div>
          </div>
        </div>
      )}

      {/* Deterministic Rule Engine Section (Always visible as baseline) */}
      <div className="rule-engine-section">
        <div className="rule-engine-section__header">
          <span className="rule-badge">Deterministic Rule Engine</span>
          <span className="rule-status-label">
            Status: <strong>{ruleAnalysis?.status}</strong> (Score {ruleAnalysis?.score}/100)
          </span>
        </div>

        <div className="rule-engine-section__content">
          <div className="rule-issues">
            <h4 className="section-subtitle">Observed Parameters & Conditions</h4>
            {issues.length === 0 ? (
              <div className="issue-item issue-item--clean">
                <span className="issue-icon" aria-hidden="true">✅</span>
                <span>Water quality parameters are currently within normal configured baseline ranges.</span>
              </div>
            ) : (
              <ul className="issues-list">
                {issues.map((issue, idx) => (
                  <li key={idx} className="issue-item issue-item--flagged">
                    <span className="issue-icon" aria-hidden="true">⚠️</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rule-recommendation">
            <h4 className="section-subtitle">Recommended Action</h4>
            <div className="recommendation-box">
              <span className="rec-icon" aria-hidden="true">💡</span>
              <p className="rec-text">{recommendation}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
