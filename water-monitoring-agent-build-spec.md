# Water Monitoring Agent — Complete Build Structure & Master Prompt

## 1. Project Overview

**Project:** Water Monitoring Agent  
**SDG:** SDG 6 – Clean Water and Sanitation  
**Type:** Simple frontend-only prototype for internship delivery  
**Primary stack:** React + Vite + JavaScript + CSS  
**AI:** Gemini API (optional, real AI analysis)  
**Backend:** None  
**Database:** None  
**Sensor hardware:** None; values are simulated in the browser  
**Deployment:** Vercel or Firebase Hosting

### Goal

Build a simple web dashboard that simulates water-quality monitoring and acts as a small "Water Monitoring Agent".

The application should:

1. Generate simulated water readings.
2. Display pH, turbidity, TDS, and temperature.
3. Analyze readings using simple predefined rules.
4. Calculate a simple water-quality score.
5. Show SAFE / WARNING / CRITICAL status.
6. Generate a recommendation.
7. Optionally send the current readings to Gemini for an AI-generated analysis.
8. Show a small monitoring history and chart.
9. Work fully in the browser.
10. Be easy to host and share as an internship deliverable.

---

# 2. Important AI/API Architecture Decision

## Is this actual AI?

Yes.

When Gemini API is enabled, the application sends the current simulated water-quality readings to a real Gemini model and receives an AI-generated explanation/recommendation.

The deterministic rule engine is still kept in the application because it gives predictable status/score results.

### Recommended architecture

```text
Simulated Sensor Data
        |
        v
Rule-Based Analyzer
        |
        +----> Score
        |
        +----> SAFE / WARNING / CRITICAL
        |
        v
Gemini AI (optional)
        |
        +----> Natural-language analysis
        |
        +----> Recommendation
        |
        v
React Dashboard
```

## API-key security model

Do NOT hardcode a Gemini API key into the deployed frontend.

Instead:

- Provide a Settings/API Key dialog.
- Allow the user to paste their own Gemini API key.
- Keep the key only in browser session storage, or memory if possible.
- Never commit the key to Git.
- Never put the key into source code.
- Do not create `.env` for a production static deployment if it results in the key being bundled into the browser.
- If no key is provided, the application continues in Demo AI Mode using the local rule-based analyzer.

This keeps the project frontend-only while avoiding placing a secret directly in the deployed bundle.

For a real production application, replace this direct browser-to-Gemini approach with a backend/serverless proxy that stores the Gemini key securely.

---

# 3. Recommended Gemini Integration

Use the official JavaScript SDK:

```bash
npm install @google/genai
```

Use a current stable Flash model, preferably:

```text
gemini-3.8-flash
```

The AI should only be responsible for interpreting the already-collected readings and producing a concise explanation.

Do NOT ask Gemini to invent sensor values.

The application itself owns the sensor values.

---

# 4. Final User Experience

The application should be a single-page dashboard.

```text
+------------------------------------------------------+
| 💧 Water Monitoring Agent                            |
| SDG 6 — Clean Water and Sanitation                   |
|                                                      |
| [Monitoring ON]                     [Settings ⚙]     |
+------------------------------------------------------+

+------------------------------------------------------+
| Overall Water Status                                 |
|                                                      |
|                 🟢 SAFE                              |
|                                                      |
|                 92 / 100                             |
|                 Water Quality Score                  |
+------------------------------------------------------+

+-------------+-------------+-------------+-------------+
| pH          | Turbidity   | TDS         | Temperature |
| 7.2         | 2.4 NTU     | 320 mg/L    | 26.5 °C     |
| SAFE        | SAFE        | SAFE        | NORMAL      |
+-------------+-------------+-------------+-------------+

+------------------------------------------------------+
| Agent Analysis                                       |
|                                                      |
| Water quality is currently within the configured     |
| monitoring range.                                    |
|                                                      |
| Recommendation: Continue regular monitoring.         |
|                                                      |
| [ Analyze with Gemini ]                              |
+------------------------------------------------------+

+------------------------------------------------------+
| Monitoring Trend                                     |
|                                                      |
|                 Line Chart                            |
+------------------------------------------------------+

+------------------------------------------------------+
| Recent Readings                                      |
|                                                      |
| Time     pH    Turbidity    TDS    Temp    Status    |
| 10:32    7.2   2.4          320    26.5    SAFE      |
| 10:31    7.3   2.7          325    26.7    SAFE      |
| 10:30    7.1   3.1          330    26.6    SAFE      |
+------------------------------------------------------+

[ Start Monitoring ] [ Stop Monitoring ] [ Analyze ]
```

---

# 5. Functional Requirements

## 5.1 Monitoring

When monitoring starts:

- Generate a new reading every 5 seconds.
- Slightly vary each value.
- Analyze each reading.
- Update the dashboard.
- Add the reading to recent history.
- Keep the latest 10–20 readings.

Do not create a real WebSocket, MQTT system, or backend.

This is a browser simulation.

---

## 5.2 Water Parameters

Only use four primary parameters:

### pH

Initial example:

```text
7.2
```

Normal demo range:

```text
6.5 – 8.5
```

### Turbidity

Unit:

```text
NTU
```

Example:

```text
2.4 NTU
```

Demo warning threshold:

```text
> 5 NTU
```

### TDS

Unit:

```text
mg/L
```

Example:

```text
320 mg/L
```

Demo warning threshold:

```text
> 500 mg/L
```

### Temperature

Unit:

```text
°C
```

Example:

```text
26.5 °C
```

Demo warning threshold:

```text
> 35 °C
```

These are prototype/demo thresholds. Do not describe them as a certified drinking-water compliance system.

---

# 6. Rule-Based Analyzer

Create:

```text
src/utils/waterAnalyzer.js
```

Responsibilities:

- Validate readings.
- Determine parameter status.
- Calculate score.
- Determine overall status.
- Generate fallback recommendation.

Example logic:

```javascript
export function analyzeWater(data) {
  const issues = [];
  let score = 100;

  if (data.ph < 6.5 || data.ph > 8.5) {
    issues.push("pH level is outside the configured monitoring range.");
    score -= 25;
  }

  if (data.turbidity > 5) {
    issues.push("Turbidity is above the configured monitoring threshold.");
    score -= 25;
  }

  if (data.tds > 500) {
    issues.push("TDS is above the configured monitoring threshold.");
    score -= 25;
  }

  if (data.temperature > 35) {
    issues.push("Temperature is above the configured monitoring threshold.");
    score -= 10;
  }

  score = Math.max(0, score);

  let status = "SAFE";

  if (score < 50) {
    status = "CRITICAL";
  } else if (score < 80) {
    status = "WARNING";
  }

  let recommendation = "Continue regular monitoring.";

  if (status === "WARNING") {
    recommendation = "Inspect the affected parameter and continue monitoring.";
  }

  if (status === "CRITICAL") {
    recommendation = "Investigate the affected water-quality condition immediately.";
  }

  return {
    score,
    status,
    issues,
    recommendation
  };
}
```

Keep this simple.

---

# 7. Simulated Sensor Generator

Create:

```text
src/utils/sensorSimulator.js
```

Responsibilities:

- Generate realistic-ish demo values.
- Produce small changes between samples.
- Occasionally generate abnormal readings so the warning/critical UI can be demonstrated.

Example concept:

```javascript
export function generateReading(previous = null) {
  // Create a reading near the previous reading.
  // Occasionally create a larger deviation.
  // Return:
  // {
  //   timestamp,
  //   ph,
  //   turbidity,
  //   tds,
  //   temperature
  // }
}
```

The generator should NOT randomly create extreme values every time.

Use mostly normal values with occasional warning conditions.

---

# 8. Gemini AI Service

Create:

```text
src/services/geminiService.js
```

Responsibilities:

- Read Gemini API key from runtime memory/session storage.
- Initialize the Gemini client.
- Send the current readings plus deterministic rule results.
- Request a short analysis.
- Return structured data.

### AI prompt concept

Gemini should receive data such as:

```json
{
  "ph": 7.2,
  "turbidity": 2.4,
  "tds": 320,
  "temperature": 26.5,
  "ruleBasedStatus": "SAFE",
  "score": 92,
  "issues": []
}
```

### AI instructions

The model should:

- Explain the current condition.
- Mention which parameters look normal or abnormal.
- Give one concise recommendation.
- Avoid inventing measurements.
- Never claim that the water is legally certified as safe for drinking.
- State that this is a prototype/simulation if appropriate.
- Return concise text suitable for a dashboard.

---

# 9. Settings / API Key UI

Create:

```text
src/components/SettingsModal.jsx
```

The modal should contain:

```text
Gemini API Key

[ ******************************* ]

[ Save Key ]

The key is used directly from this browser for
the demo and is not stored in the source code.

[ Remove Key ]
```

Use `sessionStorage` rather than permanently saving the key.

Suggested key name:

```text
water_monitoring_gemini_key
```

When the page closes, the key should normally disappear.

Do not log the API key to the console.

---

# 10. AI Modes

The app has two modes.

## Mode A — Gemini AI Mode

When an API key exists:

```text
Gemini AI: Connected
```

Clicking:

```text
Analyze with Gemini
```

calls Gemini and displays the response.

## Mode B — Demo Mode

When no API key exists:

```text
Gemini AI: Not configured
Demo Analysis: Active
```

The application uses the rule engine's fallback analysis.

This ensures the deployed project still works for an evaluator who does not have a Gemini key.

---

# 11. Suggested Component Structure

Use these components:

```text
src/
├── components/
│   ├── Header.jsx
│   ├── SystemStatus.jsx
│   ├── ParameterCard.jsx
│   ├── QualityScore.jsx
│   ├── AgentAnalysis.jsx
│   ├── MonitoringChart.jsx
│   ├── RecentReadings.jsx
│   ├── MonitoringControls.jsx
│   ├── SettingsModal.jsx
│   └── StatusBadge.jsx
│
├── services/
│   └── geminiService.js
│
├── utils/
│   ├── waterAnalyzer.js
│   └── sensorSimulator.js
│
├── hooks/
│   └── useWaterMonitoring.js
│
├── App.jsx
├── main.jsx
└── index.css
```

---

# 12. Recommended Hook

Create:

```text
src/hooks/useWaterMonitoring.js
```

This hook should manage:

- current reading
- history
- monitoring state
- automatic interval
- analysis result

Conceptual state:

```javascript
const [reading, setReading] = useState(initialReading);
const [history, setHistory] = useState([]);
const [isMonitoring, setIsMonitoring] = useState(false);
const [analysis, setAnalysis] = useState(null);
const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
const [aiAnalysis, setAiAnalysis] = useState("");
```

Keep the hook simple.

---

# 13. App State Flow

```text
Start Monitoring
      |
      v
setInterval(...)
      |
      v
generateReading()
      |
      v
setReading()
      |
      v
analyzeWater()
      |
      +-------> score
      |
      +-------> status
      |
      +-------> issues
      |
      +-------> fallback recommendation
      |
      v
update chart/history
```

Gemini is only called when the user presses:

```text
Analyze with Gemini
```

Do NOT send data to Gemini every 5 seconds.

That would be wasteful and unnecessary.

---

# 14. Chart

Use one simple line chart.

Recommended package:

```bash
npm install recharts
```

Display:

- X axis: time
- Y axis: pH

Keep the chart simple.

Do not create four separate charts.

---

# 15. Dashboard Design

## Style

Modern, clean, minimal, professional.

### Colors

```text
Background: #F5F9FC
Primary Blue: #1677FF
Primary Dark: #0B3A6E
Success: #16A34A
Warning: #F59E0B
Critical: #DC2626
Text: #172033
Muted: #6B7280
White: #FFFFFF
Border: #E5E7EB
```

Use CSS variables.

---

# 16. Responsive Design

The dashboard must support:

- Desktop
- Laptop
- Tablet
- Mobile

On desktop:

```text
4 parameter cards in one row
```

On tablet:

```text
2 x 2 parameter cards
```

On mobile:

```text
1 column
```

Keep controls usable on touch screens.

---

# 17. Status Display

## Safe

```text
🟢 SAFE
```

## Warning

```text
🟡 WARNING
```

## Critical

```text
🔴 CRITICAL
```

Use both icon and text. Do not rely on color alone.

---

# 18. Demo Sensor Behavior

Use values like:

### Normal

```text
pH: 7.2
Turbidity: 2.4
TDS: 320
Temperature: 26.5
```

### Warning example

```text
pH: 7.4
Turbidity: 6.2
TDS: 410
Temperature: 27.2
```

### Critical example

```text
pH: 5.9
Turbidity: 12.4
TDS: 680
Temperature: 39.1
```

Add a small "Demo Event" option so the evaluator can intentionally trigger:

```text
Normal
Warning
Critical
```

This is better than waiting for random data.

---

# 19. Controls

Only include:

```text
Start Monitoring
Stop Monitoring
Analyze Now
Analyze with Gemini
Demo: Normal
Demo: Warning
Demo: Critical
Settings
```

Do not add unnecessary admin panels.

---

# 20. Error Handling

The application must gracefully handle:

### No Gemini API key

Show:

```text
Gemini AI is not configured.
Using Demo Analysis.
```

### Gemini API failure

Show:

```text
Gemini analysis is currently unavailable.
Showing rule-based analysis instead.
```

Never crash the dashboard.

### Invalid API key

Show:

```text
Unable to connect to Gemini.
Please verify your API key.
```

### Empty sensor data

Fallback safely to the initial reading.

---

# 21. Accessibility

Include:

- semantic buttons
- labels
- readable contrast
- keyboard focus
- descriptive headings
- aria labels where needed
- no color-only status indication

---

# 22. File Structure

Final project should look like this:

```text
water-monitoring-agent/
│
├── public/
│   └── favicon.svg
│
├── src/
│   │
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── SystemStatus.jsx
│   │   ├── ParameterCard.jsx
│   │   ├── QualityScore.jsx
│   │   ├── AgentAnalysis.jsx
│   │   ├── MonitoringChart.jsx
│   │   ├── RecentReadings.jsx
│   │   ├── MonitoringControls.jsx
│   │   ├── SettingsModal.jsx
│   │   └── StatusBadge.jsx
│   │
│   ├── services/
│   │   └── geminiService.js
│   │
│   ├── utils/
│   │   ├── waterAnalyzer.js
│   │   └── sensorSimulator.js
│   │
│   ├── hooks/
│   │   └── useWaterMonitoring.js
│   │
│   ├── data/
│   │   └── initialWaterData.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── .gitignore
├── package.json
├── README.md
└── vite.config.js
```

---

# 23. Dependencies

Use only what is necessary:

```bash
npm install
npm install @google/genai
npm install recharts
```

Do not install large UI frameworks unless required.

You may use plain CSS.

---

# 24. README Requirements

The generated README must include:

## Project Title

Water Monitoring Agent

## Description

A simple frontend prototype for SDG 6 water-quality monitoring.

## Features

- simulated water sensor data
- pH monitoring
- turbidity monitoring
- TDS monitoring
- temperature monitoring
- rule-based analysis
- water quality score
- monitoring history
- trend chart
- Gemini AI analysis
- demo fallback mode

## Technology

- React
- Vite
- JavaScript
- Recharts
- Google Gemini API

## How to Run

```bash
npm install
npm run dev
```

## Gemini Setup

Explain:

1. Create a Gemini API key in Google AI Studio.
2. Open the application.
3. Open Settings.
4. Paste the key.
5. Save it.
6. Click "Analyze with Gemini".

Never put a real API key in the README.

## Important Note

This project uses simulated sensor readings and is an educational/internship prototype. It is not a certified water-quality or drinking-water compliance system.

---

# 25. Deployment

Deploy to either:

## Option A — Vercel

```text
GitHub
   ↓
Vercel
   ↓
Live URL
```

## Option B — Firebase Hosting

```text
Build
   ↓
Firebase Hosting
   ↓
Live URL
```

The application must work without a server.

---

# 26. Testing Checklist

Before deployment, verify:

### UI

- [ ] dashboard loads
- [ ] mobile layout works
- [ ] cards display correctly
- [ ] status badge works
- [ ] chart works

### Monitoring

- [ ] Start Monitoring works
- [ ] Stop Monitoring works
- [ ] readings update every 5 seconds
- [ ] history updates

### Analysis

- [ ] Safe state works
- [ ] Warning state works
- [ ] Critical state works
- [ ] score updates

### Gemini

- [ ] missing key fallback works
- [ ] valid key works
- [ ] invalid key does not crash app
- [ ] Gemini errors fall back gracefully
- [ ] API key never appears in console
- [ ] API key never appears in Git

### Deployment

- [ ] production build works
- [ ] page loads from public URL
- [ ] no console-breaking errors
- [ ] README includes live URL

---

# 27. What NOT to Build

Do not add:

```text
❌ Spring Boot backend
❌ MongoDB
❌ Authentication
❌ User accounts
❌ Admin dashboard
❌ MQTT
❌ IoT hardware integration
❌ ESP32
❌ Machine learning model
❌ Python service
❌ Microservices
❌ Docker
❌ Kubernetes
❌ Real-time WebSocket server
❌ Complex GIS maps
❌ Payment system
❌ Notifications backend
```

Those are outside the internship deliverable scope.

---

# 28. Final Project Story

When explaining the project:

> The Water Monitoring Agent is a lightweight SDG 6 prototype designed to demonstrate how a digital monitoring system can observe water-quality parameters, classify their condition, and provide recommendations. Sensor values are simulated in the browser for this prototype. A deterministic rule engine provides the monitoring status and score, while Gemini can optionally provide a natural-language AI analysis of the current readings.

---

# 29. MASTER PROMPT FOR GOOGLE ANTIGRAVITY

Copy everything below into Google Antigravity as the main build prompt.

---

## MASTER PROMPT

You are an expert frontend engineer and UI designer.

Build a complete, polished, responsive React + Vite web application called:

**"Water Monitoring Agent"**

This is a simple internship deliverable for:

**SDG 6 – Clean Water and Sanitation**

The project MUST remain intentionally simple.

Do not turn it into a complex enterprise application.

### Primary Objective

Create a one-page water-quality monitoring dashboard that:

1. Simulates water sensor readings in the browser.
2. Displays pH, turbidity, TDS, and temperature.
3. Automatically analyzes readings using simple rule-based logic.
4. Calculates a water-quality score.
5. Displays SAFE / WARNING / CRITICAL.
6. Shows a recommendation.
7. Provides a monitoring history.
8. Provides one simple trend chart.
9. Optionally uses the real Gemini API for natural-language analysis.
10. Can be deployed as a static frontend application.

### Strict Architecture

This application must be:

- React
- Vite
- JavaScript
- CSS
- Recharts for the chart
- @google/genai for optional Gemini integration

There must be:

- NO backend
- NO Spring Boot
- NO database
- NO authentication
- NO server
- NO Python
- NO MongoDB
- NO Docker
- NO WebSocket
- NO MQTT
- NO IoT hardware

The entire application must operate in the browser.

---

## Important Gemini Security Requirement

Do NOT hardcode a Gemini API key.

Do NOT put a Gemini key in source code.

Do NOT commit a Gemini key to GitHub.

Do NOT automatically build a production `.env` value into the client bundle.

Instead, create a Settings modal where the user can manually enter a Gemini API key during runtime.

Store the key only in `sessionStorage` or in in-memory React state.

Use this session storage key:

`water_monitoring_gemini_key`

Provide buttons:

- Save Key
- Remove Key

If no API key exists, the application MUST continue working using the local rule-based analysis.

Clearly show:

`Gemini: Not configured — Demo Mode`

When the Gemini key is configured:

`Gemini: Connected`

Never print the API key to the console.

Never expose the key in the UI after saving it.

---

## Gemini Configuration

Use:

```bash
npm install @google/genai
```

Use the stable Gemini model:

```text
gemini-3.8-flash
```

Use the current official Google GenAI JavaScript SDK.

Create:

```text
src/services/geminiService.js
```

Export a function such as:

```javascript
analyzeWaterWithGemini(reading, ruleAnalysis, apiKey)
```

Send Gemini the actual current values supplied by the application.

Do not let Gemini invent sensor readings.

Ask Gemini to return a concise dashboard-friendly analysis.

The response should contain:

- condition summary
- important observations
- recommendation

Gemini should NOT make medical or legal claims.

Gemini must not claim that water is certified safe for human consumption.

Treat this as an educational prototype.

---

## Dashboard Layout

Create a clean modern dashboard.

Top:

- logo/water icon
- title
- subtitle
- Gemini connection indicator
- Settings button

Main:

1. Overall Status
2. Water Quality Score
3. Four Parameter Cards
4. Agent Analysis
5. Monitoring Trend Chart
6. Recent Readings
7. Monitoring Controls

---

## Parameters

Use exactly:

### pH

Normal demo range:

6.5 – 8.5

### Turbidity

Normal demo threshold:

less than or equal to 5 NTU

### TDS

Demo threshold:

less than or equal to 500 mg/L

### Temperature

Demo threshold:

less than or equal to 35 °C

Clearly treat these as prototype thresholds.

---

## Initial Reading

Use:

```javascript
{
  timestamp: Date.now(),
  ph: 7.2,
  turbidity: 2.4,
  tds: 320,
  temperature: 26.5
}
```

---

## Rule Engine

Create:

```text
src/utils/waterAnalyzer.js
```

The analyzer must return:

```javascript
{
  score,
  status,
  issues,
  recommendation
}
```

Use simple scoring:

Start with:

`100`

Subtract:

- pH abnormal = 25
- turbidity high = 25
- TDS high = 25
- temperature high = 10

Clamp to:

`0–100`

Status:

- score >= 80 => SAFE
- score >= 50 and < 80 => WARNING
- score < 50 => CRITICAL

Do not make the logic more complicated.

---

## Sensor Simulation

Create:

```text
src/utils/sensorSimulator.js
```

Every 5 seconds generate a new reading.

Values should normally vary slightly.

Do not create absurd random numbers.

Occasionally allow abnormal readings so the application can demonstrate warning/critical states.

Also create demo buttons:

- Demo Normal
- Demo Warning
- Demo Critical

These should instantly load known sample states.

---

## React Hook

Create:

```text
src/hooks/useWaterMonitoring.js
```

Manage:

- current reading
- history
- monitoring state
- timer
- rule analysis
- Gemini analysis state

Expose functions such as:

```javascript
startMonitoring()
stopMonitoring()
analyzeCurrent()
setDemoNormal()
setDemoWarning()
setDemoCritical()
```

Keep this hook easy to understand.

---

## Components

Create these:

```text
src/components/Header.jsx
src/components/SystemStatus.jsx
src/components/ParameterCard.jsx
src/components/QualityScore.jsx
src/components/AgentAnalysis.jsx
src/components/MonitoringChart.jsx
src/components/RecentReadings.jsx
src/components/MonitoringControls.jsx
src/components/SettingsModal.jsx
src/components/StatusBadge.jsx
```

---

## Visual Design

Use a professional water/clean-tech style.

Background:

`#F5F9FC`

Primary:

`#1677FF`

Dark blue:

`#0B3A6E`

Success:

`#16A34A`

Warning:

`#F59E0B`

Critical:

`#DC2626`

Text:

`#172033`

Muted:

`#6B7280`

White:

`#FFFFFF`

Border:

`#E5E7EB`

Use CSS variables.

Add:

- rounded cards
- subtle shadows
- clear typography
- plenty of whitespace
- responsive grid
- simple animations
- accessible focus states

Do NOT make the page overly flashy.

---

## Status

Display:

```text
🟢 SAFE
🟡 WARNING
🔴 CRITICAL
```

Use icon + text so status is not color-only.

---

## Water Quality Score

Display a large:

```text
92 / 100
```

Make the score visually attractive with a circular progress component or clean progress ring.

---

## Agent Analysis

Show:

```text
Agent Analysis
```

Display:

- status explanation
- issues
- recommendation

Example:

```text
Water quality is currently within the configured monitoring range.

Recommendation:
Continue regular monitoring.
```

When Gemini is used, clearly label:

```text
Gemini AI Analysis
```

Do not make the Gemini output huge.

Limit the displayed result to concise paragraphs or structured sections.

---

## Chart

Use Recharts.

Show exactly one chart:

**pH Trend**

Use recent history.

X-axis = time

Y-axis = pH

Do not create multiple charts.

---

## Recent Readings

Create a simple table:

```text
Time
pH
Turbidity
TDS
Temperature
Status
```

Show the most recent 10 readings.

---

## Monitoring Controls

Buttons:

```text
Start Monitoring
Stop Monitoring
Analyze Now
Analyze with Gemini
Demo Normal
Demo Warning
Demo Critical
Settings
```

Use disabled states where appropriate.

---

## Gemini Error Handling

If API key missing:

Use local analysis and show:

```text
Gemini is not configured. Demo analysis is active.
```

If Gemini fails:

Show:

```text
Gemini analysis is unavailable right now.
Showing rule-based analysis instead.
```

Never crash the application.

---

## Responsive Design

Desktop:

4 parameter cards in one row.

Tablet:

2x2 cards.

Mobile:

single-column layout.

The table must be horizontally scrollable on very small screens if necessary.

---

## Accessibility

Include:

- semantic HTML
- button labels
- heading hierarchy
- keyboard accessibility
- visible focus
- aria labels where appropriate
- sufficient contrast
- text + icon for states

---

## File Structure

Create:

```text
water-monitoring-agent/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── SystemStatus.jsx
│   │   ├── ParameterCard.jsx
│   │   ├── QualityScore.jsx
│   │   ├── AgentAnalysis.jsx
│   │   ├── MonitoringChart.jsx
│   │   ├── RecentReadings.jsx
│   │   ├── MonitoringControls.jsx
│   │   ├── SettingsModal.jsx
│   │   └── StatusBadge.jsx
│   ├── services/
│   │   └── geminiService.js
│   ├── utils/
│   │   ├── waterAnalyzer.js
│   │   └── sensorSimulator.js
│   ├── hooks/
│   │   └── useWaterMonitoring.js
│   ├── data/
│   │   └── initialWaterData.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .gitignore
├── package.json
├── README.md
└── vite.config.js
```

---

## README

Create a professional README with:

- project title
- project description
- SDG 6 purpose
- features
- technology
- architecture
- setup instructions
- Gemini setup
- deployment instructions
- screenshots section
- limitations
- future improvements
- disclaimer

Include:

> This project is a frontend prototype using simulated sensor readings. It is not a certified water-quality monitoring or drinking-water compliance system.

---

## Development Rules

1. Keep the code simple.
2. Prefer readable React components.
3. Use functional components.
4. Use hooks.
5. Avoid unnecessary abstractions.
6. Avoid unnecessary packages.
7. Do not introduce a backend.
8. Do not add authentication.
9. Do not add a database.
10. Do not overengineer.
11. Keep the dashboard as a single main page.
12. Make the application production-buildable.
13. Handle errors gracefully.
14. Do not use fake AI claims; Gemini should only be called when configured.
15. Clearly distinguish Gemini AI analysis from local rule-based analysis.

---

## Testing Requirements

Before finishing:

1. Run npm install.
2. Run the development server.
3. Verify dashboard loads.
4. Verify Start Monitoring.
5. Verify Stop Monitoring.
6. Verify readings change.
7. Verify score changes.
8. Verify safe/warning/critical states.
9. Verify demo buttons.
10. Verify chart.
11. Verify history table.
12. Verify Settings modal.
13. Verify no Gemini key fallback.
14. Verify Gemini call with a valid key.
15. Verify invalid-key error handling.
16. Verify production build.

Run:

```bash
npm run build
```

and fix all build errors.

---

## Final Quality Requirement

The result should look like a polished internship project, not a tutorial example.

It should be:

- clean
- modern
- minimal
- responsive
- understandable
- easy to demo
- easy to deploy

Do not add features just to make the project look bigger.

The goal is a small but complete Water Monitoring Agent prototype.

---

# 30. Suggested Final Demonstration

During your internship presentation:

### Step 1

Open the live website.

### Step 2

Show:

```text
SAFE
92 / 100
```

### Step 3

Click:

```text
Start Monitoring
```

Show changing readings.

### Step 4

Click:

```text
Demo Warning
```

Show:

```text
WARNING
```

### Step 5

Click:

```text
Demo Critical
```

Show:

```text
CRITICAL
```

### Step 6

Open Settings.

Enter your Gemini API key.

### Step 7

Click:

```text
Analyze with Gemini
```

Show the real AI response.

### Step 8

Explain:

> "The application uses simulated sensor data for this prototype. A rule-based analyzer determines the monitoring status and score, and Gemini provides an optional natural-language analysis and recommendation."

This is enough for a simple internship project.

---

# 31. Future Scope — Mention Only, Do Not Build

For the report, you may mention:

```text
Future Version:

Real IoT sensors
ESP32 integration
Cloud backend
Historical database
Real-time telemetry
Location-based monitoring
Alerts
Water-source mapping
ML anomaly detection
Mobile application
```

Do NOT implement these in this version.
