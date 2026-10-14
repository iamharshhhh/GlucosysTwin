# 🧬 Glucosys Twin — React Clinician Dashboard

Interactive frontend interface for **Glucosys Twin**, built with **React 18**, **Vite**, **Recharts**, and **Lucide Icons**.

---

## 🎨 Velvet Plum Design System

The interface is styled around a cohesive 4-color palette:
- **Obsidian Canvas:** `rgb(26, 26, 29)` (`#1A1A1D`) — Deep base background and input surfaces
- **Midnight Plum:** `rgb(59, 28, 50)` (`#3B1C32`) — Elevated glassmorphism cards and sidebar panels
- **Boysenberry Velvet:** `rgb(106, 30, 85)` (`#6A1E55`) — Secondary accents, card borders, and chart gridlines
- **Radiant Rose Plum:** `rgb(166, 77, 121)` (`#A64D79`) — Primary action buttons, active tab indicators, and historical CGM telemetry

---

## 🖥️ Dashboard Views

1. **Twin Dashboard (`TwinDashboard.jsx`)**: Displays patient EHR clinical profile, live wearable vitals telemetry, and real-time 2-hour spike risk status.
2. **Time Series Signals (`TimeSeriesCharts.jsx` & `TrajectoryForecastChart.jsx`)**:
   - **2-Hour Continuous Glycemic Trajectory Projection**: Dual-curve forward projection comparing the **🔴 Unmitigated Peak (~212 mg/dL)** against the **🟢 With Walk Counterfactual Peak (~172 mg/dL)** across a fixed $50\text{–}240\text{ mg/dL}$ clinical axis with $70\text{–}180\text{ mg/dL}$ Time-in-Range reference bounds.
   - Real-time CGM, Heart Rate & HRV, and Physical Activity & Carbs charts.
3. **Spike Prediction & SHAP (`PredictionView.jsx`, `InterventionCards.jsx`, `SHAPExplainer.jsx`)**:
   - Spike probability gauge and clinical alert banner.
   - **Prescribed Counterfactual Micro-Interventions**: Actionable cards with one-click synchronization to the What-If Simulator.
   - **SHAP Feature Contributions**: Horizontal bar chart and breakdown of risk-increasing vs. risk-decreasing physiological drivers.
4. **What-If Simulator (`WhatIfSimulator.jsx`)**: Interactive sliders for glucose, meal carbs, steps, sleep, heart rate, and HRV with instant counterfactual risk re-evaluation.
5. **Patient Timeline (`PatientTimeline.jsx`)**: Chronological audit log of dietary ingestion, physical activity bursts, and hyperglycemia alerts.
6. **Model Benchmarks (`ModelBenchmarks.jsx`)**: Comparative metrics table and confusion matrices for Logistic Regression, Random Forest, and XGBoost.

---

## 🚀 Development & Build Commands

```bash
# Install dependencies
npm install

# Start development server on http://localhost:5173
npm run dev

# Build production bundle
npm run build
```
