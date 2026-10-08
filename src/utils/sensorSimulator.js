import { INITIAL_READING, DEMO_PRESETS } from '../data/initialWaterData.js';

/**
 * Helper to clamp values within logical physical limits.
 */
function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/**
 * Random float helper within [min, max]
 */
function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Generates a realistic simulated sensor reading.
 * Small continuous fluctuations with realistic physics and occasional mild deviation.
 *
 * @param {Object|null} previous - The previous sensor reading
 * @returns {Object} New reading with timestamp, ph, turbidity, tds, temperature
 */
export function generateReading(previous = null) {
  const base = previous || INITIAL_READING;

  // 8% chance of a slight abnormal fluctuation to demonstrate warning transitions
  const hasSpike = Math.random() < 0.08;

  // pH: drift +-0.08 normally, or +-0.25 on spike. Bound between 5.5 and 9.0
  const phDelta = hasSpike ? randomBetween(-0.35, 0.35) : randomBetween(-0.08, 0.08);
  // Gentle reversion towards normal center (7.2) if too far
  const phCenterPull = (7.2 - base.ph) * 0.05;
  const newPh = clamp(base.ph + phDelta + phCenterPull, 5.5, 9.2);

  // Turbidity: drift +-0.2 normally, or +1.5 on spike. Bound between 0.8 and 14.0 NTU
  const turbDelta = hasSpike ? randomBetween(-0.5, 2.0) : randomBetween(-0.25, 0.25);
  const turbCenterPull = (2.4 - base.turbidity) * 0.05;
  const newTurb = clamp(base.turbidity + turbDelta + turbCenterPull, 0.8, 14.0);

  // TDS: drift +-6 normally, or +-30 on spike. Bound between 150 and 750 mg/L
  const tdsDelta = hasSpike ? randomBetween(-20, 50) : randomBetween(-6, 6);
  const tdsCenterPull = (320 - base.tds) * 0.04;
  const newTds = clamp(base.tds + tdsDelta + tdsCenterPull, 150, 750);

  // Temperature: drift +-0.2 normally. Bound between 20.0 and 40.0 °C
  const tempDelta = hasSpike ? randomBetween(-0.5, 1.2) : randomBetween(-0.2, 0.2);
  const tempCenterPull = (26.5 - base.temperature) * 0.04;
  const newTemp = clamp(base.temperature + tempDelta + tempCenterPull, 20.0, 41.0);

  return {
    timestamp: Date.now(),
    ph: Number(newPh.toFixed(2)),
    turbidity: Number(newTurb.toFixed(1)),
    tds: Math.round(newTds),
    temperature: Number(newTemp.toFixed(1))
  };
}

/**
 * Returns a designated demo preset reading with fresh timestamp.
 *
 * @param {'normal'|'warning'|'critical'} type - Preset type
 * @returns {Object} Reading matching the preset
 */
export function getPresetReading(type = 'normal') {
  const preset = DEMO_PRESETS[type] || DEMO_PRESETS.normal;
  return {
    timestamp: Date.now(),
    ph: preset.ph,
    turbidity: preset.turbidity,
    tds: preset.tds,
    temperature: preset.temperature
  };
}
