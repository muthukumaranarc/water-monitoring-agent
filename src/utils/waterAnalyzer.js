/**
 * Deterministic rule-based water quality analyzer for SDG 6 monitoring.
 *
 * Scoring:
 * - Base score: 100
 * - pH outside 6.5 - 8.5: -25
 * - Turbidity > 5 NTU: -25
 * - TDS > 500 mg/L: -25
 * - Temperature > 35 °C: -10
 *
 * Classification:
 * - Score >= 80: SAFE
 * - Score 50 - 79: WARNING
 * - Score < 50: CRITICAL
 */

export function analyzeWater(data) {
  if (!data) {
    return {
      score: 100,
      status: 'SAFE',
      issues: [],
      recommendation: 'Continue regular monitoring.',
      parameterStatuses: {
        ph: 'SAFE',
        turbidity: 'SAFE',
        tds: 'SAFE',
        temperature: 'NORMAL'
      }
    };
  }

  const issues = [];
  let score = 100;

  // Parameter individual statuses
  const parameterStatuses = {
    ph: 'SAFE',
    turbidity: 'SAFE',
    tds: 'SAFE',
    temperature: 'NORMAL'
  };

  // pH evaluation (standard demo range: 6.5 – 8.5)
  if (data.ph < 6.5 || data.ph > 8.5) {
    issues.push('pH level is outside the configured monitoring range.');
    score -= 25;
    parameterStatuses.ph = data.ph < 6.0 || data.ph > 9.0 ? 'CRITICAL' : 'WARNING';
  }

  // Turbidity evaluation (standard demo threshold: <= 5 NTU)
  if (data.turbidity > 5) {
    issues.push('Turbidity is above the configured monitoring threshold.');
    score -= 25;
    parameterStatuses.turbidity = data.turbidity > 10 ? 'CRITICAL' : 'WARNING';
  }

  // TDS evaluation (standard demo threshold: <= 500 mg/L)
  if (data.tds > 500) {
    issues.push('TDS is above the configured monitoring threshold.');
    score -= 25;
    parameterStatuses.tds = data.tds > 750 ? 'CRITICAL' : 'WARNING';
  }

  // Temperature evaluation (standard demo threshold: <= 35 °C)
  if (data.temperature > 35) {
    issues.push('Temperature is above the configured monitoring threshold.');
    score -= 10;
    parameterStatuses.temperature = data.temperature > 40 ? 'CRITICAL' : 'WARNING';
  }

  // Score clamping between 0 and 100
  score = Math.max(0, Math.min(100, score));

  // Determine overall status
  let status = 'SAFE';
  if (score < 50) {
    status = 'CRITICAL';
  } else if (score < 80) {
    status = 'WARNING';
  }

  // Deterministic recommendation
  let recommendation = 'Continue regular monitoring.';
  if (status === 'WARNING') {
    recommendation = 'Inspect the affected parameter and continue monitoring.';
  } else if (status === 'CRITICAL') {
    recommendation = 'Investigate the affected water-quality condition immediately.';
  }

  return {
    score,
    status,
    issues,
    recommendation,
    parameterStatuses
  };
}
