/**
 * Initial water quality readings and predefined demo states
 * for Water Monitoring Agent (SDG 6).
 */

export const INITIAL_READING = {
  timestamp: Date.now(),
  ph: 7.2,
  turbidity: 2.4,
  tds: 320,
  temperature: 26.5
};

export const DEMO_PRESETS = {
  normal: {
    ph: 7.2,
    turbidity: 2.4,
    tds: 320,
    temperature: 26.5,
    label: 'Normal'
  },
  warning: {
    ph: 7.4,
    turbidity: 6.2,
    tds: 410,
    temperature: 27.2,
    label: 'Warning'
  },
  critical: {
    ph: 5.9,
    turbidity: 12.4,
    tds: 680,
    temperature: 39.1,
    label: 'Critical'
  }
};

export const PARAMETER_CONFIG = {
  ph: {
    name: 'pH Level',
    unit: '',
    min: 6.5,
    max: 8.5,
    format: (val) => Number(val).toFixed(2),
    thresholdLabel: 'Normal: 6.5 – 8.5'
  },
  turbidity: {
    name: 'Turbidity',
    unit: 'NTU',
    max: 5.0,
    format: (val) => `${Number(val).toFixed(1)} NTU`,
    thresholdLabel: 'Threshold: ≤ 5.0 NTU'
  },
  tds: {
    name: 'Total Dissolved Solids (TDS)',
    unit: 'mg/L',
    max: 500,
    format: (val) => `${Math.round(val)} mg/L`,
    thresholdLabel: 'Threshold: ≤ 500 mg/L'
  },
  temperature: {
    name: 'Temperature',
    unit: '°C',
    max: 35.0,
    format: (val) => `${Number(val).toFixed(1)} °C`,
    thresholdLabel: 'Threshold: ≤ 35.0 °C'
  }
};
