import React from 'react';

/**
 * Status badge displaying both icon and label to prevent color-only indication.
 * Supports SAFE, WARNING, CRITICAL, and NORMAL.
 */
export default function StatusBadge({ status = 'SAFE', size = 'medium' }) {
  const normalized = String(status).toUpperCase();

  let icon = '🟢';
  let label = 'SAFE';
  let variantClass = 'status-badge--safe';

  if (normalized === 'CRITICAL') {
    icon = '🔴';
    label = 'CRITICAL';
    variantClass = 'status-badge--critical';
  } else if (normalized === 'WARNING') {
    icon = '🟡';
    label = 'WARNING';
    variantClass = 'status-badge--warning';
  } else if (normalized === 'NORMAL') {
    icon = '🟢';
    label = 'NORMAL';
    variantClass = 'status-badge--normal';
  }

  return (
    <span
      className={`status-badge ${variantClass} status-badge--${size}`}
      role="status"
      aria-label={`Water Quality Status: ${label}`}
    >
      <span className="status-badge__icon" aria-hidden="true">{icon}</span>
      <span className="status-badge__label">{label}</span>
    </span>
  );
}
