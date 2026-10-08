# Water Monitoring Agent

> **SDG 6 — Clean Water and Sanitation**  
> A lightweight, frontend-only intelligent web application prototype that observes simulated water-quality telemetry, calculates water safety scores via a deterministic rule engine, and provides optional AI-powered natural-language interpretations using Google Gemini.

---

## 📌 Project Overview

Access to clean, safe drinking water is a fundamental human right recognized under the United Nations **Sustainable Development Goal 6 (SDG 6)**. Real-world water monitoring systems require clear telemetry visualization, fast anomaly detection, and actionable guidance for operators.

The **Water Monitoring Agent** demonstrates how an agentic web dashboard can:
1. Simulate real-time water sensor data directly in the browser (no hardware required).
2. Continuously track 4 core physical and chemical parameters: **pH**, **Turbidity**, **Total Dissolved Solids (TDS)**, and **Temperature**.
3. Evaluate telemetry against established baseline thresholds using a deterministic rule engine to produce a **Water Quality Score (0–100)** and a status (**SAFE**, **WARNING**, or **CRITICAL**).
4. Provide immediate rule-based recommendations.
5. Offer optional natural-language analysis powered by the **Google Gemini API** (`gemini-3.8-flash`) when configured by the user at runtime.

---

## ✨ Features

- **In-Browser Sensor Simulation**: Generates realistic fluctuating telemetry every 5 seconds without backend servers, WebSockets, or hardware.
- **Multi-Parameter Monitoring**:
  - **pH Level**: Baseline 6.5 – 8.5
  - **Turbidity**: Baseline ≤ 5.0 NTU
  - **Total Dissolved Solids (TDS)**: Baseline ≤ 500 mg/L
  - **Temperature**: Baseline ≤ 35.0 °C
- **Deterministic Rule Engine**: Instantly computes water quality score, classifies status into `SAFE` / `WARNING` / `CRITICAL`, and generates safe action items.
- **Visual Circular Quality Score Ring**: Dynamic SVG gauge reflecting the overall quality index.
- **Interactive Trend Chart**: Line chart built with Recharts visualizing pH progression over time with safe boundary reference lines.
- **Telemetry History Log**: Tabular record of the latest 10 readings with responsive horizontal scrolling.
- **One-Click Demo Presets**: Instant simulation of `Demo Normal`, `Demo Warning`, and `Demo Critical` states for seamless evaluation and demonstrations.
- **Gemini AI Integration (`gemini-3.8-flash`)**: Interprets water conditions into plain English, noting specific parameter observations and recommendations.
- **Graceful Offline/Demo Fallback**: Works 100% out-of-the-box in local Demo Mode without an API key.
- **Secure Key Management**: API keys are entered through the UI, stored only in browser `sessionStorage`, and never exposed in code, commits, or logs.

---

## 🛠️ Technology Stack

- **Framework**: React 18 (Functional Components & Custom Hooks)
- **Tooling & Bundler**: Vite 6
- **Language**: Modern JavaScript (ESM)
- **Styling**: Pure CSS with CSS variables, responsive design, and accessible markup
- **Charting**: Recharts
- **AI SDK**: `@google/genai` (Google GenAI JavaScript SDK)
- **Backend / Database**: None (pure client-side static application)

---

## 📐 System Architecture

```text
+-----------------------------------------------------------+
|               Simulated Sensor Telemetry                  |
|          (Browser-generated every 5 seconds)              |
+-----------------------------------------------------------+
                             |
                             v
+-----------------------------------------------------------+
|                Deterministic Rule Engine                  |
|    - Evaluates pH, Turbidity, TDS, and Temperature        |
|    - Computes Quality Score (0 - 100)                     |
|    - Determines SAFE / WARNING / CRITICAL status          |
|    - Generates baseline recommendation                    |
+-----------------------------------------------------------+
             |                                 |
             v                                 v
+-------------------------+       +-------------------------+
|     React Dashboard     |       |   Gemini 3.8 Flash AI   |
|   - Parameter Cards     |       | (Triggered on demand    |
|   - Quality Score Ring  | <---- |  via runtime API key)   |
|   - Recharts Trend      |       | - Condition Summary     |
|   - History Table       |       | - Observations          |
|   - Simulation Controls |       | - AI Recommendation     |
+-------------------------+       +-------------------------+
```

---

## 🔒 Security Model

- **No Hardcoded Secrets**: No Gemini API keys are hardcoded, embedded in `.env`, or committed to the repository.
- **Browser-Only Session Storage**: Keys entered in the Settings modal are saved to `sessionStorage` under `water_monitoring_gemini_key`.
- **Automatic Cleansing**: Keys are removed upon clearing browser session or clicking **Remove Key**.
- **No Console Logging**: The application explicitly avoids logging credentials to the console.

---

## 🚀 Getting Started

### Prerequisites

- Node.js (version 18 or newer recommended)
- npm (version 9 or newer)

### Installation

1. Clone or navigate to the repository:
   ```bash
   git clone https://github.com/muthukumaranarc/water-monitoring-agent.git
   cd water-monitoring-agent
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000` (or the URL displayed in the terminal).

4. Run verification tests:
   ```bash
   npm test
   ```

5. Build for production:
   ```bash
   npm run build
   ```

---

## 🤖 Gemini AI Setup & Model Selection

The application functions completely without an API key using the local rule engine. When an API key is provided, it connects to Google Gemini with **automatic low-traffic model cascading**:

1. Obtain a free Gemini API key from [Google AI Studio](https://aistudio.google.com/).
2. Open the application.
3. Click the **Settings ⚙** button in the top navigation.
4. Select your preferred AI model:
   - **`Gemini 2.0 Flash Lite` (Recommended / Low Traffic)**: Ultra-fast response with minimal free-tier quota overhead.
   - **`Gemini 1.5 Flash 8B` (Ultra Lightweight)**: Ideal for high-frequency or busy environments.
   - **`Gemini 2.0 Flash` (Standard)**: Balanced reasoning and speed.
   - **`Gemini 1.5 Flash` (Stable)**: Production baseline.
   - **`Gemini 2.5 Flash`**: Next-generation reasoning.
5. Paste your API key into the input field and click **Save Settings**. The status indicator will turn **🟢 Gemini: Connected**.
6. Click **Analyze with Gemini**. If any model encounters temporary traffic or quota limits, the agent automatically cascades to alternate low-traffic models in real time without failing!

---

## 🧪 Demonstration & Presentation Guide

Follow these steps for an internship presentation or evaluator demo:

| Step | Action | Expected Result |
| :--- | :--- | :--- |
| **1** | Open the application | Initial state loads: **🟢 SAFE**, **100/100 Score**, baseline readings. |
| **2** | Click **Start Monitoring** | Telemetry samples dynamically every 5s; chart and history log update. |
| **3** | Click **Demo Warning** | Telemetry switches to warning parameters (Turbidity 6.2 NTU); status turns **🟡 WARNING** (Score 75). |
| **4** | Click **Demo Critical** | Telemetry switches to anomalous state (pH 5.9, Turbidity 12.4 NTU, TDS 680, Temp 39.1); status turns **🔴 CRITICAL** (Score 15). |
| **5** | Click **Analyze with Gemini** (Demo Mode) | Informative notice appears explaining Demo Mode is active and shows rule-based recommendations. |
| **6** | Configure Gemini API Key | Enter key in **Settings ⚙** and click **Save Key**. Badge shows **Gemini: Connected**. |
| **7** | Click **Analyze with Gemini** | Gemini 3.8 Flash returns condition summary, parameter observations, and actionable advice. |

---

## 🌐 Deployment

The project builds to static HTML/CSS/JS assets inside the `dist/` folder and requires no server.

### Deploying to Vercel

```bash
npm install -g vercel
vercel
```

### Deploying to Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Set public directory to "dist" and configure as single-page app
npm run build
firebase deploy
```

---

## ⚠️ Important Disclaimer

> **Educational Prototype Notice**: This application is a frontend prototype utilizing simulated telemetry data created for educational and internship demonstration purposes. It is **not** a certified water-quality testing instrument or drinking-water regulatory compliance system.

---

## 🔮 Future Scope (Reference Only)

In a future enterprise IoT deployment, the following enhancements could be incorporated:
- Direct hardware sensor integration (ESP32 / Arduino / LoRaWAN).
- Cloud time-series database (InfluxDB or PostgreSQL).
- Backend proxy for centralized API key management and alert dispatching (SMS / Email).
- Geospatial mapping (GIS) of municipal water distribution nodes.
- Machine learning models for predictive anomaly detection and pump failure forecasting.