# Glucosys Twin — Executive Project Summary

## Executive Summary

**Glucosys Twin** demonstrates a proactive paradigm in metabolic healthcare: combining static Electronic Health Record (EHR) profiles with continuous wearable time-series streams into a stateful **Digital Twin** to deliver **early predictions of significant glucose spikes ($\ge 40\text{ mg/dL}$ increase)** within a **2-hour prediction horizon**, alongside **Prescribed Counterfactual Micro-Interventions** and a **2-Hour Continuous Glycemic Trajectory Projection**.

---

## Key Capabilities

1. **Multi-Modal Synthetic Data Pipeline**:
   * Synthetic EHR profiles for 50 patients (Age, Sex, BMI, HbA1c, Diabetes Status, Medication, Hypertension, Family Risk Score).
   * 67,200 continuous 15-minute wearable sensor readings (CGM Glucose, Heart Rate, HRV RMSSD, Steps, Sleep Duration, Dietary Carbohydrates).
   * Realistic physiological coupling (digestion kinetics, circadian rhythms, GLUT4 exercise clearance, and sleep debt).

2. **Feature Engineering & Zero Data-Leakage Guard**:
   * 35+ engineered features including rolling statistics (1h, 2h, 4h), short-term glucose trends (15m, 30m, 1h), HRV recovery deltas, sleep deficits, and meal proximity.
   * Zero data leakage: future glucose readings in the $[t+15\text{m}, t+2\text{h}]$ horizon are strictly isolated for target construction (`target_spike`).

3. **Machine Learning Model Benchmarks**:
   * Evaluated **Logistic Regression**, **Random Forest**, and **XGBoost**.
   * Selected **XGBoost** as the champion model (**ROC-AUC: 0.8716**, **Recall: 87.82%**, **PR-AUC: 0.5053**).

4. **Twin Intelligence & Counterfactual Trajectory Engine**:
   * **`DigitalTwin` (`src/twin/digital_twin.py`)**: Stateful patient twin with real-time sensor ingestion, SHAP attribution, and in-silico cloning.
   * **`MicroInterventionRecommender` (`src/twin/recommender.py`)**: Evaluates counterfactual lifestyle actions (postprandial brisk walk, carbohydrate moderation, restorative sleep) and ranks them by projected risk drop.
   * **`GlycemicTrajectoryForecaster` (`src/twin/trajectory_forecaster.py`)**: Projects 8 forward 15-minute steps comparing the **🔴 Unmitigated Peak (~212 mg/dL)** against the **🟢 Counterfactual Walk Trajectory (~172 mg/dL)**.

5. **Interactive Clinician Dashboard**:
   * Built with React 18, Vite, and Recharts using the custom **Velvet Plum** design system (`rgb(26, 26, 29)`, `rgb(59, 28, 50)`, `rgb(106, 30, 85)`, `rgb(166, 77, 121)`).

---

## Machine Learning Performance Summary

| Model | Precision | Recall | F1 Score | ROC-AUC | PR-AUC |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Logistic Regression** | 0.2675 | 0.8380 | 0.4049 | 0.8324 | 0.4145 |
| **Random Forest** | 0.2810 | 0.8522 | 0.4226 | 0.8594 | 0.4748 |
| **XGBoost (Champion)** | **0.2831** | **0.8782** | **0.4272** | **0.8716** | **0.5053** |

---

## Disclaimer

> **Research Proof-of-Concept:** Glucosys Twin is intended solely for research, academic, and demonstration purposes. Not for medical diagnosis or clinical treatment.
