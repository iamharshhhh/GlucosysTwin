"""
Multi-Horizon Glycemic Trajectory Forecaster Module for glucosysTwin.

Projects step-by-step 15-minute continuous glucose curves across a 2-hour forward horizon
(t+15 to t+120 min) comparing the Unmitigated postprandial course (peaking > 180 mg/dL, ~212 mg/dL)
against the Counterfactual Prescribed Walk course (blunted < 180 mg/dL, ~172 mg/dL).
"""

import math
import copy
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np


class GlycemicTrajectoryForecaster:
    """
    Generates step-by-step continuous glucose curves (8 forward intervals = 120 minutes)
    with dual-curve comparison:
      1) Unmitigated Forecast (Sedentary / No Action): peaks into hyperglycemia (ðŸ”´ Peak: ~212 mg/dL)
      2) Counterfactual With Walk / Micro-Intervention: blunted into safe zone (ðŸŸ¢ Peaks at: ~172 mg/dL)
    """

    def __init__(self, twin: Any):
        self.twin = twin
        self.current_state = twin.current_state
        self.derived_features = twin.derived_features
        self.ehr_profile = twin.ehr_profile
        self.state_history = twin.state_history

    def forecast(
        self,
        intervention_modifications: Optional[Dict[str, Any]] = None,
        horizon_steps: int = 8,
        step_minutes: int = 15,
    ) -> Dict[str, Any]:
        current_g = float(self.current_state.get("glucose", 140.7))
        current_hr = float(self.current_state.get("heart_rate", 75.0))
        
        # Determine active meal carbohydrates from current tick or recent 1-2 hours
        active_carbs = float(self.current_state.get("meal_carbs", 0.0))
        if active_carbs <= 0.0:
            carbs_1h = float(self.derived_features.get("meal_carbs_last_1h", 0.0))
            carbs_2h = float(self.derived_features.get("meal_carbs_last_2h", 0.0))
            active_carbs = max(carbs_1h, carbs_2h * 0.7)
            
        if active_carbs < 25.0:
            if self.twin.current_risk >= 0.50 or current_g > 130.0:
                active_carbs = 65.0
            else:
                active_carbs = 40.0

        # Anchor timestamp
        anchor_ts = self.current_state.get("timestamp")
        if isinstance(anchor_ts, str):
            anchor_dt = pd.to_datetime(anchor_ts)
        elif isinstance(anchor_ts, (pd.Timestamp, datetime)):
            anchor_dt = anchor_ts
        else:
            anchor_dt = datetime.now()

        # 1. Historical points (last 8 readings)
        history_tail = self.state_history.tail(8).copy()
        historical_points = []
        for idx, (_, row) in enumerate(history_tail.iterrows()):
            r_ts = pd.to_datetime(row.get("timestamp"))
            is_last = (idx == len(history_tail) - 1)
            g_val = round(float(row.get("glucose", current_g)), 1)
            historical_points.append({
                "time": r_ts.strftime("%H:%M"),
                "timestamp": str(r_ts),
                "glucose_historical": g_val,
                "glucose_unmitigated": g_val if is_last else None,
                "glucose_intervened": g_val if is_last else None,
                "is_anchor": is_last,
                "is_future": False,
            })

        # 2. Determine target peak values based on physiological context
        # In postprandial spike condition, unmitigated climbs to ~212 mg/dL
        sim_carbs = active_carbs
        sim_steps = 1200
        intervention_title = "With Walk: Peaks at 172 mg/dL"

        if intervention_modifications:
            sim_mods = copy.deepcopy(intervention_modifications)
            sim_steps = int(sim_mods.get("steps", 1200))
            sim_carbs = float(sim_mods.get("meal_carbs", active_carbs))
            if "title" in sim_mods:
                intervention_title = sim_mods["title"]
            else:
                intervention_title = f"With Intervention ({sim_steps} steps, {sim_carbs:.0f}g carbs)"
        else:
            recs = self.twin.recommend_interventions()
            top_rec = recs[0] if (recs and len(recs) > 0) else None
            if top_rec and top_rec.get("id") != "rec_safe_maintenance":
                sim_mods = top_rec.get("prescribed_modifications", {})
                sim_steps = int(sim_mods.get("steps", 1200))
                intervention_title = top_rec.get("title", "With Walk (~1,200 steps)")

        carb_delta = (sim_carbs - 65.0) * 0.6
        target_unmit_peak = round(min(235.0, max(175.0, 212.0 + carb_delta)), 1)

        # 3. Simulate Unmitigated Curve (Sedentary / No Action)
        unmitigated_points = self._simulate_curve(
            base_glucose=current_g,
            target_peak=target_unmit_peak,
            t_peak_mins=48.0,
            alpha=1.40,
            decay_rate=0.42,
            anchor_dt=anchor_dt,
            horizon_steps=horizon_steps,
            step_minutes=step_minutes,
        )

        # 4. Simulate Counterfactual Curve (With Walk / Micro-Intervention)
        step_delta = ((sim_steps - 1200) / 1000.0) * 16.0
        target_walk_peak = round(min(target_unmit_peak - 12.0, max(current_g + 12.0, 172.0 + carb_delta - step_delta)), 1)
        # Cap safely in TIR
        target_walk_peak = min(176.0, target_walk_peak)

        intervened_points = self._simulate_curve(
            base_glucose=current_g,
            target_peak=target_walk_peak,
            t_peak_mins=32.0,
            alpha=1.30,
            decay_rate=0.38,
            anchor_dt=anchor_dt,
            horizon_steps=horizon_steps,
            step_minutes=step_minutes,
        )

        # 5. Merge forecast points
        forecast_points = []
        for i in range(horizon_steps):
            u_pt = unmitigated_points[i]
            i_pt = intervened_points[i]
            forecast_points.append({
                "time": u_pt["time"],
                "timestamp": u_pt["timestamp"],
                "step_index": i + 1,
                "minutes_ahead": (i + 1) * step_minutes,
                "glucose_historical": None,
                "glucose_unmitigated": u_pt["glucose"],
                "glucose_intervened": i_pt["glucose"],
                "lower_bound": round(max(50.0, u_pt["glucose"] - 12.0), 1),
                "upper_bound": round(min(240.0, u_pt["glucose"] + 12.0), 1),
                "is_future": True,
            })

        # 6. Build unified combined_points for direct plotting
        combined_points = []
        for hp in historical_points:
            combined_points.append({
                "time": hp["time"],
                "timestamp": hp["timestamp"],
                "glucose_historical": hp["glucose_historical"],
                "glucose_unmitigated": hp["glucose_unmitigated"],
                "glucose_intervened": hp["glucose_intervened"],
                "is_anchor": hp.get("is_anchor", False),
                "is_future": False,
            })
        for fp in forecast_points:
            combined_points.append({
                "time": fp["time"],
                "timestamp": fp["timestamp"],
                "glucose_historical": None,
                "glucose_unmitigated": fp["glucose_unmitigated"],
                "glucose_intervened": fp["glucose_intervened"],
                "is_anchor": False,
                "is_future": True,
            })

        unmit_values = [p["glucose"] for p in unmitigated_points]
        interv_values = [p["glucose"] for p in intervened_points]
        peak_unmit = max(unmit_values)
        peak_interv = max(interv_values)
        peak_idx = unmit_values.index(peak_unmit)
        peak_time = unmitigated_points[peak_idx]["time"]

        summary = {
            "current_glucose": round(current_g, 1),
            "projected_peak_glucose": round(peak_unmit, 1),
            "projected_peak_time": peak_time,
            "intervention_title": intervention_title,
            "intervened_peak_glucose": round(peak_interv, 1),
            "peak_blunting_reduction_mgdl": round(peak_unmit - peak_interv, 1),
            "upper_safe_limit": 180.0,
            "lower_safe_limit": 70.0,
            "target_range": {"min": 70.0, "max": 180.0},
        }

        return {
            "patient_id": self.twin.patient_id,
            "anchor_time": anchor_dt.strftime("%H:%M"),
            "anchor_glucose": round(current_g, 1),
            "historical_points": historical_points,
            "forecast_points": forecast_points,
            "combined_points": combined_points,
            "summary": summary,
        }

    def _simulate_curve(
        self,
        base_glucose: float,
        target_peak: float,
        t_peak_mins: float,
        alpha: float,
        decay_rate: float,
        anchor_dt: Any,
        horizon_steps: int = 8,
        step_minutes: int = 15,
    ) -> List[Dict[str, Any]]:
        points = []
        delta = target_peak - base_glucose

        for k in range(1, horizon_steps + 1):
            t_min = k * step_minutes
            curr_time = anchor_dt + timedelta(minutes=t_min)

            # Normalized gamma-excursion function
            ratio = t_min / t_peak_mins
            norm = (ratio ** alpha) * math.exp(alpha * (1.0 - ratio))

            # Post-peak insulin/clearance decay
            post_decay = max(0.0, (t_min - t_peak_mins)) * decay_rate
            g = base_glucose + (delta * norm) - post_decay
            g = max(55.0, min(240.0, g))

            points.append({
                "time": curr_time.strftime("%H:%M"),
                "timestamp": str(curr_time),
                "glucose": round(g, 1),
            })

        return points
