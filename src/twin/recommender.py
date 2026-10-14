"""
Micro-Intervention Recommender Module for glucosysTwin.

Computes personalized, clinically bounded counterfactual micro-interventions
to reduce 2-hour glucose spike risks into the safe zone (< 30%).
"""

from typing import List, Dict, Any, Optional
import copy


class MicroInterventionRecommender:
    """
    Evaluates patient state, SHAP risk attributions, and physiological constraints
    to discover minimal-effort micro-interventions that mitigate glucose spikes.
    """

    def __init__(self, twin: Any):
        self.twin = twin
        self.patient_id = twin.patient_id
        self.current_risk = twin.current_risk
        self.risk_level = twin.risk_level
        self.current_state = twin.current_state
        self.ehr_profile = twin.ehr_profile

    def generate_recommendations(self) -> List[Dict[str, Any]]:
        """
        Generates and ranks counterfactual micro-interventions using in-silico simulation.
        Returns a list of ranked recommendations.
        """
        # If risk is already low, return a maintenance confirmation
        if self.current_risk < 0.35:
            return [
                {
                    "id": "rec_safe_maintenance",
                    "priority": 1,
                    "title": "Maintain Baseline Routine",
                    "category": "Maintenance",
                    "difficulty": "Minimal",
                    "action_window": "Ongoing",
                    "action_summary": "Current glucose trajectory is within the safe glycemic range.",
                    "current_risk": round(self.current_risk * 100, 1),
                    "projected_risk": round(self.current_risk * 100, 1),
                    "risk_reduction_pp": 0.0,
                    "prescribed_modifications": {},
                    "clinical_rationale": "Digital twin indicates low probability (< 35%) of significant glucose spike.",
                }
            ]

        # Extract current physiological readings
        current_glucose = float(self.current_state.get("glucose", 120.0))
        current_steps = int(self.current_state.get("steps", 0))
        current_carbs = float(self.current_state.get("meal_carbs", 0.0))
        current_hr = float(self.current_state.get("heart_rate", 75.0))

        # Personalization limits based on EHR
        patient_age = float(self.ehr_profile.get("age", 45))
        patient_bmi = float(self.ehr_profile.get("bmi", 26.0))

        # Determine safe step recommendations based on age & BMI
        if patient_age > 65 or patient_bmi > 35:
            walk_steps_light = 600
            walk_steps_moderate = 1000
            walk_desc_light = "Take a 8-10 min gentle stroll (~600 steps)"
            walk_desc_moderate = "Take a 12-15 min light walk (~1,000 steps)"
        else:
            walk_steps_light = 800
            walk_steps_moderate = 1400
            walk_desc_light = "Take a 10 min light walk (~800 steps)"
            walk_desc_moderate = "Take a 15-20 min brisk post-meal walk (~1,400 steps)"

        candidate_plans = []

        # Candidate 1: Postprandial Physical Activity (Brisk Walk)
        target_steps = current_steps + walk_steps_moderate
        candidate_plans.append({
            "id": "rec_activity_moderate",
            "title": "Postprandial Brisk Walk",
            "category": "Physical Activity",
            "difficulty": "Easy",
            "action_window": "Next 20 minutes",
            "action_summary": walk_desc_moderate,
            "modifications": {"steps": target_steps},
            "clinical_rationale": "Skeletal muscle contraction stimulates non-insulin-dependent GLUT4 translocation, accelerating circulating glucose uptake.",
            "feasibility_weight": 1.0,
        })

        # Candidate 2: Light Activity
        target_light_steps = current_steps + walk_steps_light
        candidate_plans.append({
            "id": "rec_activity_light",
            "title": "Gentle Movement / Light Pacing",
            "category": "Physical Activity",
            "difficulty": "Very Easy",
            "action_window": "Next 15 minutes",
            "action_summary": walk_desc_light,
            "modifications": {"steps": target_light_steps},
            "clinical_rationale": "Interrupts postprandial sedentary stagnation to blunt rapid glucose ascension.",
            "feasibility_weight": 0.95,
        })

        # Candidate 3: Dietary / Meal Carb Attenuation (if carbs were recently logged)
        if current_carbs > 20.0:
            carb_reduction = min(current_carbs * 0.4, 35.0)
            target_carbs = max(0.0, current_carbs - carb_reduction)
            candidate_plans.append({
                "id": "rec_dietary_attenuation",
                "title": "Portion / Carb Attenuation",
                "category": "Dietary Timing",
                "difficulty": "Easy",
                "action_window": "Immediate",
                "action_summary": f"Hold or delay remaining dessert / refined carbs (-{round(carb_reduction)}g carbs)",
                "modifications": {"meal_carbs": round(target_carbs, 1)},
                "clinical_rationale": "Reduces peak intestinal glucose absorption and flattens postprandial glycemic crest.",
                "feasibility_weight": 0.9,
            })

            # Candidate 4: Synergistic Combo (Activity + Carb moderation)
            combo_carbs = max(0.0, current_carbs - (carb_reduction * 0.6))
            candidate_plans.append({
                "id": "rec_synergistic_combo",
                "title": "Synergistic Walk & Carb Moderation",
                "category": "Combined Protocol",
                "difficulty": "Moderate",
                "action_window": "Next 25 minutes",
                "action_summary": f"{walk_desc_light} and reduce sweet carbohydrates by {round(carb_reduction * 0.6)}g",
                "modifications": {
                    "steps": target_light_steps,
                    "meal_carbs": round(combo_carbs, 1),
                },
                "clinical_rationale": "Dual-action: reduces exogenous glucose influx while simultaneously boosting peripheral glucose disposal.",
                "feasibility_weight": 0.85,
            })

        # Candidate 5: Autonomic Stress Down-regulation (if HR is elevated > 80 bpm)
        if current_hr > 78.0:
            relaxed_hr = max(65.0, current_hr - 8.0)
            candidate_plans.append({
                "id": "rec_stress_mitigation",
                "title": "Vagal / Box Breathing & Rest",
                "category": "Autonomic Stress",
                "difficulty": "Very Easy",
                "action_window": "Next 10 minutes",
                "action_summary": "Practice 5 minutes of guided 4-7-8 diaphragmatic breathing to stabilize heart rate",
                "modifications": {"heart_rate": round(relaxed_hr, 1)},
                "clinical_rationale": "Suppresses acute sympathetic tone and cortisol/adrenaline, which otherwise trigger hepatic glycogen breakdown.",
                "feasibility_weight": 0.8,
            })

        # Evaluate all candidates via in-silico twin simulation
        evaluated_recommendations = []
        for plan in candidate_plans:
            sim_res = self.twin.simulate(plan["modifications"])
            simulated_risk_pct = float(sim_res["simulated_risk"])
            current_risk_pct = float(sim_res["current_risk"])
            risk_reduction_pp = round(simulated_risk_pct - current_risk_pct, 1)

            # Prioritize candidates that actually lower or stabilize risk
            impact_score = (-risk_reduction_pp) * plan["feasibility_weight"]

            evaluated_recommendations.append({
                "id": plan["id"],
                "title": plan["title"],
                "category": plan["category"],
                "difficulty": plan["difficulty"],
                "action_window": plan["action_window"],
                "action_summary": plan["action_summary"],
                "current_risk": current_risk_pct,
                "projected_risk": simulated_risk_pct,
                "risk_reduction_pp": risk_reduction_pp,
                "prescribed_modifications": plan["modifications"],
                "clinical_rationale": plan["clinical_rationale"],
                "impact_score": impact_score,
            })

        # Sort recommendations by highest positive impact (largest risk drop)
        evaluated_recommendations.sort(key=lambda x: x["impact_score"], reverse=True)

        # Assign priority ranking (1, 2, 3...)
        for idx, rec in enumerate(evaluated_recommendations):
            rec["priority"] = idx + 1
            del rec["impact_score"]

        return evaluated_recommendations[:4]
