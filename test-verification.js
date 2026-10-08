import { analyzeWater } from './src/utils/waterAnalyzer.js';
import { generateReading, getPresetReading } from './src/utils/sensorSimulator.js';
import { INITIAL_READING, DEMO_PRESETS } from './src/data/initialWaterData.js';
import { analyzeWaterWithGemini } from './src/services/geminiService.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  }
}

console.log('--- Testing Water Analyzer & Rule Engine ---');

// 1. Initial / Normal State
const normalAnalysis = analyzeWater(INITIAL_READING);
assert(normalAnalysis.status === 'SAFE', `Normal status is SAFE (got ${normalAnalysis.status})`);
assert(normalAnalysis.score === 100, `Normal score is 100 (got ${normalAnalysis.score})`);
assert(normalAnalysis.issues.length === 0, `Normal issues is 0 (got ${normalAnalysis.issues.length})`);
assert(normalAnalysis.recommendation === 'Continue regular monitoring.', 'Normal recommendation matches');

// 2. Demo Warning State
const warningReading = getPresetReading('warning');
const warningAnalysis = analyzeWater(warningReading);
assert(warningAnalysis.status === 'WARNING', `Warning status is WARNING (got ${warningAnalysis.status})`);
assert(warningAnalysis.score >= 50 && warningAnalysis.score < 80, `Warning score between 50 and 79 (got ${warningAnalysis.score})`);
assert(warningAnalysis.issues.length > 0, `Warning has issues (got ${warningAnalysis.issues.length})`);
assert(warningAnalysis.recommendation === 'Inspect the affected parameter and continue monitoring.', 'Warning recommendation matches');

// 3. Demo Critical State
const criticalReading = getPresetReading('critical');
const criticalAnalysis = analyzeWater(criticalReading);
assert(criticalAnalysis.status === 'CRITICAL', `Critical status is CRITICAL (got ${criticalAnalysis.status})`);
assert(criticalAnalysis.score < 50, `Critical score < 50 (got ${criticalAnalysis.score})`);
assert(criticalAnalysis.recommendation === 'Investigate the affected water-quality condition immediately.', 'Critical recommendation matches');

// 4. Score Clamping (all parameters failing)
const extremeReading = {
  ph: 3.0,
  turbidity: 45.0,
  tds: 1500,
  temperature: 55.0
};
const extremeAnalysis = analyzeWater(extremeReading);
assert(extremeAnalysis.score === 15, `Extreme score calculated properly (-25 -25 -25 -10 = 15)`);
assert(extremeAnalysis.status === 'CRITICAL', `Extreme status is CRITICAL`);

// Score cannot drop below 0
const offChartReading = {
  ph: 2.0,
  turbidity: 100,
  tds: 5000,
  temperature: 100
};
const offChartAnalysis = analyzeWater(offChartReading);
assert(offChartAnalysis.score >= 0, `Score is clamped to >= 0 (got ${offChartAnalysis.score})`);

console.log('\n--- Testing Sensor Simulator ---');
let prev = INITIAL_READING;
let allValid = true;
for (let i = 0; i < 20; i++) {
  const next = generateReading(prev);
  if (
    typeof next.ph !== 'number' || isNaN(next.ph) ||
    typeof next.turbidity !== 'number' || isNaN(next.turbidity) ||
    typeof next.tds !== 'number' || isNaN(next.tds) ||
    typeof next.temperature !== 'number' || isNaN(next.temperature)
  ) {
    allValid = false;
  }
  prev = next;
}
assert(allValid, 'Generated 20 sequential sensor readings with valid numeric values');

console.log('\n--- Testing Gemini Service Fallback & Error Handling ---');

async function testGemini() {
  // Test 1: No API key passed
  const noKeyResult = await analyzeWaterWithGemini(INITIAL_READING, normalAnalysis, '');
  assert(noKeyResult.success === false, 'No key returns success=false');
  assert(noKeyResult.error.includes('not configured'), `No key error explains not configured (got: "${noKeyResult.error}")`);

  // Test 2: Invalid API key
  const invalidKeyResult = await analyzeWaterWithGemini(INITIAL_READING, normalAnalysis, 'AIzaSy_INVALID_KEY_TEST_XYZ');
  assert(invalidKeyResult.success === false, 'Invalid key returns success=false without crashing');
  assert(typeof invalidKeyResult.error === 'string', 'Invalid key returns user-friendly error message');

  console.log(`\n========================================`);
  console.log(`Total Passed: ${passed} | Total Failed: ${failed}`);
  console.log(`========================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

testGemini();
