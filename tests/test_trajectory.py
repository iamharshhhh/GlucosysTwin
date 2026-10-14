"""
Unit tests for Glycemic Trajectory Forecaster module.
"""
import pytest
from datetime import datetime
from src.data.generate_synthetic import generate_ehr_profiles, generate_wearable_timeseries
from src.twin.digital_twin import DigitalTwin


def get_test_twin():
    ehr_df = generate_ehr_profiles(n_patients=1, seed=42)
    wearable_df = generate_wearable_timeseries(ehr_df, days=3, interval_minutes=15, seed=42)
    patient_id = ehr_df.iloc[0]["patient_id"]
    ehr_profile = ehr_df.iloc[0].to_dict()
    twin = DigitalTwin(
        patient_id=patient_id,
        ehr_profile=ehr_profile,
        state_history=wearable_df
    )
    return twin


def test_trajectory_forecast_structure():
    twin = get_test_twin()
    res = twin.forecast_trajectory()
    assert isinstance(res, dict)
    assert "patient_id" in res
    assert "anchor_time" in res
    assert "anchor_glucose" in res
    assert "historical_points" in res
    assert "forecast_points" in res
    assert "combined_points" in res
    assert "summary" in res

    summary = res["summary"]
    assert "current_glucose" in summary
    assert "projected_peak_glucose" in summary
    assert "intervened_peak_glucose" in summary
    assert "peak_blunting_reduction_mgdl" in summary
    assert "upper_safe_limit" in summary
    assert summary["upper_safe_limit"] == 180.0
    assert summary["lower_safe_limit"] == 70.0


def test_trajectory_forecast_8_steps():
    twin = get_test_twin()
    res = twin.forecast_trajectory(horizon_steps=8, step_minutes=15)
    forecast_pts = res["forecast_points"]
    assert len(forecast_pts) == 8
    assert forecast_pts[0]["minutes_ahead"] == 15
    assert forecast_pts[-1]["minutes_ahead"] == 120
    for pt in forecast_pts:
        assert pt["glucose_unmitigated"] is not None
        assert pt["glucose_intervened"] is not None
        assert pt["is_future"] is True


def test_trajectory_blunting_effect():
    twin = get_test_twin()
    # High postprandial carb reading
    twin.update_sensor_data({
        "timestamp": datetime.now(),
        "glucose": 140.7,
        "heart_rate": 82.0,
        "hrv": 35.0,
        "steps": 0,
        "sleep_hours": 7.0,
        "activity_level": "Sedentary",
        "meal_carbs": 65.0,
        "meal_type": "Breakfast"
    })
    res = twin.forecast_trajectory()
    summary = res["summary"]

    assert summary["projected_peak_glucose"] > summary["intervened_peak_glucose"]
    assert summary["peak_blunting_reduction_mgdl"] > 20.0
    # Intervened peak should remain safely under or at safe threshold
    assert summary["intervened_peak_glucose"] <= 180.0


def test_trajectory_seamless_anchor():
    twin = get_test_twin()
    res = twin.forecast_trajectory()
    combined = res["combined_points"]

    # Locate the anchor point
    anchor_pts = [p for p in combined if p.get("is_anchor")]
    assert len(anchor_pts) == 1
    anchor = anchor_pts[0]

    # Anchor point must have identical readings across historical, unmitigated, and intervened
    assert anchor["glucose_historical"] == res["anchor_glucose"]
    assert anchor["glucose_unmitigated"] == res["anchor_glucose"]
    assert anchor["glucose_intervened"] == res["anchor_glucose"]


def test_trajectory_custom_modifications():
    twin = get_test_twin()
    twin.update_sensor_data({
        "timestamp": datetime.now(),
        "glucose": 140.7,
        "heart_rate": 82.0,
        "hrv": 35.0,
        "steps": 0,
        "sleep_hours": 7.0,
        "activity_level": "Sedentary",
        "meal_carbs": 65.0,
        "meal_type": "Breakfast"
    })
    modifications = {"steps": 2500, "meal_carbs": 30.0, "title": "Intensive Walk"}
    res = twin.forecast_trajectory(intervention_modifications=modifications)
    summary = res["summary"]

    assert summary["intervention_title"] == "Intensive Walk"
    assert summary["intervened_peak_glucose"] < summary["projected_peak_glucose"]
    assert summary["intervened_peak_glucose"] <= 175.0
