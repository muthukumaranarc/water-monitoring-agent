import React from 'react';
import StatusBadge from './StatusBadge';

export default function ParameterCard({
  title,
  value,
  unit,
  status = 'SAFE',
  thresholdLabel,
  icon,
  minVal,
  maxVal,
  currentValNum
}) {
  // Calculate a visual progress percentage for the mini meter
  let meterPercent = 50;
  if (typeof currentValNum === 'number' && maxVal) {
    if (minVal !== undefined) {
      // Range-based like pH (e.g. 0 to 14)
      meterPercent = Math.min(Math.max(((currentValNum - 4) / (10 - 4)) * 100, 5), 100);
    } else {
      // Upper-bound threshold based like Turbidity, TDS, Temp
      meterPercent = Math.min(Math.max((currentValNum / (maxVal * 1.5)) * 100, 5), 100);
    }
  }

  let meterColorClass = 'meter-bar--safe';
  if (status === 'CRITICAL') {
    meterColorClass = 'meter-bar--critical';
  } else if (status === 'WARNING') {
    meterColorClass = 'meter-bar--warning';
  }

  return (
    <div className={`parameter-card parameter-card--${status.toLowerCase()}`}>
      <div className="parameter-card__top">
        <div className="parameter-card__title-wrap">
          <span className="parameter-card__icon" aria-hidden="true">{icon}</span>
          <span className="parameter-card__name">{title}</span>
        </div>
        <StatusBadge status={status} size="small" />
      </div>

      <div className="parameter-card__value-wrap">
        <span className="parameter-card__value">{value}</span>
        {unit && <span className="parameter-card__unit">{unit}</span>}
      </div>

      <div className="parameter-card__meter-track" aria-hidden="true">
        <div
          className={`parameter-card__meter-bar ${meterColorClass}`}
          style={{ width: `${meterPercent}%` }}
        />
      </div>

      <div className="parameter-card__threshold">
        <span>{thresholdLabel}</span>
      </div>
    </div>
  );
}
