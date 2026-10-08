import React from 'react';

export default function QualityScore({ score = 100, status = 'SAFE' }) {
  // SVG circular gauge geometry
  const radius = 68;
  const strokeWidth = 10;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let strokeColor = '#16A34A'; // Success green
  if (status === 'CRITICAL') {
    strokeColor = '#DC2626'; // Critical red
  } else if (status === 'WARNING') {
    strokeColor = '#F59E0B'; // Warning amber
  }

  return (
    <div className="quality-score-card">
      <div className="quality-score-card__ring-wrapper">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="quality-score-ring"
          aria-label={`Water Quality Score: ${score} out of 100`}
        >
          {/* Background circle track */}
          <circle
            stroke="#E5E7EB"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Foreground progress circle */}
          <circle
            stroke={strokeColor}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{
              strokeDashoffset,
              transition: 'stroke-dashoffset 0.6s ease-in-out, stroke 0.4s ease'
            }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            transform={`rotate(-90 ${radius} ${radius})`}
          />
        </svg>

        <div className="quality-score-center">
          <span className="quality-score-value">{score}</span>
          <span className="quality-score-max">/ 100</span>
        </div>
      </div>

      <div className="quality-score-details">
        <h3 className="quality-score-title">Water Quality Score</h3>
        <p className="quality-score-subtitle">
          {status === 'SAFE' && 'All primary parameters conform to normal baseline criteria.'}
          {status === 'WARNING' && 'One or more parameters exceed the target baseline range.'}
          {status === 'CRITICAL' && 'Multiple severe deviations detected. Investigation required.'}
        </p>
      </div>
    </div>
  );
}
