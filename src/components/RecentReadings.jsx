import React from 'react';
import StatusBadge from './StatusBadge';

export default function RecentReadings({ history = [] }) {
  // Show most recent 10 readings, newest first
  const displayReadings = [...history].reverse().slice(0, 10);

  return (
    <section className="recent-readings-card" aria-labelledby="readings-heading">
      <div className="recent-readings-header">
        <div>
          <span className="card-eyebrow">TELEMETRY LOG</span>
          <h2 id="readings-heading" className="card-title">Recent Readings</h2>
        </div>
        <span className="readings-count-badge">Showing last {displayReadings.length} samples</span>
      </div>

      <div className="table-responsive-container">
        <table className="readings-table">
          <thead>
            <tr>
              <th scope="col">Time</th>
              <th scope="col">pH</th>
              <th scope="col">Turbidity (NTU)</th>
              <th scope="col">TDS (mg/L)</th>
              <th scope="col">Temp (°C)</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {displayReadings.length === 0 ? (
              <tr>
                <td colSpan="6" className="table-empty">
                  No telemetry entries recorded yet.
                </td>
              </tr>
            ) : (
              displayReadings.map((row, index) => {
                const date = new Date(row.timestamp);
                const timeString = date.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                });

                return (
                  <tr key={row.timestamp + '-' + index} className={index === 0 ? 'row-latest' : ''}>
                    <td className="cell-time">
                      {timeString}
                      {index === 0 && <span className="badge-latest">Latest</span>}
                    </td>
                    <td className="cell-num">{Number(row.ph).toFixed(2)}</td>
                    <td className="cell-num">{Number(row.turbidity).toFixed(1)}</td>
                    <td className="cell-num">{Math.round(row.tds)}</td>
                    <td className="cell-num">{Number(row.temperature).toFixed(1)}</td>
                    <td className="cell-status">
                      <StatusBadge status={row.status} size="small" />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
