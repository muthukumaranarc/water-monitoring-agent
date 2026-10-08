import React from 'react';
import StatusBadge from './StatusBadge';
import QualityScore from './QualityScore';

export default function SystemStatus({
  status = 'SAFE',
  score = 100,
  lastUpdated,
  issueCount = 0
}) {
  const formattedTime = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'Just now';

  let summaryText = 'Telemetry indicates clean, normal quality parameters across all monitored indicators.';
  if (status === 'WARNING') {
    summaryText = 'Telemetry indicates non-critical deviation in one or more water indicators.';
  } else if (status === 'CRITICAL') {
    summaryText = 'Significant telemetry anomalies detected. Water condition warrants immediate inspection.';
  }

  return (
    <section className="system-status-card" aria-labelledby="status-heading">
      <div className="system-status-main">
        <div className="system-status-header">
          <span className="card-eyebrow">MONITORING TELEMETRY OVERVIEW</span>
          <h2 id="status-heading" className="card-title">Overall Water Status</h2>
        </div>

        <div className="system-status-badge-row">
          <StatusBadge status={status} size="large" />
          <span className="system-status-timestamp">Last updated: {formattedTime}</span>
        </div>

        <p className="system-status-summary">{summaryText}</p>

        <div className="system-status-meta">
          <div className="meta-pill">
            <span className="meta-pill__label">Active Issues:</span>
            <span className={`meta-pill__val ${issueCount > 0 ? 'text-warning' : 'text-success'}`}>
              {issueCount}
            </span>
          </div>
          <div className="meta-pill">
            <span className="meta-pill__label">Simulation Mode:</span>
            <span className="meta-pill__val">Continuous Browser Telemetry</span>
          </div>
        </div>
      </div>

      <div className="system-status-score-wrap">
        <QualityScore score={score} status={status} />
      </div>
    </section>
  );
}
