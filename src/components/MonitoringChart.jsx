import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';

export default function MonitoringChart({ history = [] }) {
  // Format data for Recharts
  const chartData = history.map((item) => {
    const date = new Date(item.timestamp);
    const timeLabel = date.toLocaleTimeString([], {
      minute: '2-digit',
      second: '2-digit'
    });

    return {
      time: timeLabel,
      ph: item.ph,
      status: item.status,
      timestamp: item.timestamp
    };
  });

  return (
    <section className="monitoring-chart-card" aria-labelledby="chart-heading">
      <div className="monitoring-chart-header">
        <div className="monitoring-chart-titles">
          <span className="card-eyebrow">TELEMETRY TREND</span>
          <h2 id="chart-heading" className="card-title">pH Trend Over Time</h2>
        </div>
        <div className="chart-legend-badge">
          <span className="legend-indicator" aria-hidden="true" />
          <span>pH Level (Safe Zone: 6.5 – 8.5)</span>
        </div>
      </div>

      <div className="monitoring-chart-canvas-wrap" style={{ width: '100%', height: 260 }}>
        {chartData.length === 0 ? (
          <div className="chart-empty">Waiting for telemetry data...</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 12, right: 20, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                domain={[5.0, 9.5]}
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
                tickFormatter={(v) => Number(v).toFixed(1)}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="chart-tooltip">
                        <p className="chart-tooltip__time">{data.time}</p>
                        <p className="chart-tooltip__val">
                          pH: <strong>{data.ph}</strong>
                        </p>
                        <p className="chart-tooltip__status">Status: {data.status}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/* Lower safe boundary (6.5) */}
              <ReferenceLine
                y={6.5}
                stroke="#16A34A"
                strokeDasharray="4 4"
                label={{ value: 'Min 6.5', position: 'insideTopLeft', fill: '#16A34A', fontSize: 11 }}
              />
              {/* Upper safe boundary (8.5) */}
              <ReferenceLine
                y={8.5}
                stroke="#16A34A"
                strokeDasharray="4 4"
                label={{ value: 'Max 8.5', position: 'insideBottomLeft', fill: '#16A34A', fontSize: 11 }}
              />
              <Line
                type="monotone"
                dataKey="ph"
                stroke="#1677FF"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#1677FF', strokeWidth: 1, stroke: '#FFFFFF' }}
                activeDot={{ r: 5, fill: '#0B3A6E' }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
