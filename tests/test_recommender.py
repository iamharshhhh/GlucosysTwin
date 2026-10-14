"""
Tests for Micro-Intervention Recommender engine.
"""
import pytest
from datetime import datetime
from src.data.generate_synthetic import generate_ehr_profiles, generate_wearable_timeseries
from src.twin.digital_twin import DigitalTwin
from src.twin.recommender import MicroInterventionRecommender

def test_recommender_generation():
    ehr_df = generate_ehr_profiles(n_patients=1, seed=42)
    wearable_df = generate_wearable_timeseries(ehr_df, days=3, interval_minutes=15, seed=42)
    
    patient_id = ehr_df.iloc[0]["patient_id"]
    ehr_profile = ehr_df.iloc[0].to_dict()
    
    twin = DigitalTwin(
        patient_id=patient_id,
        ehr_profile=ehr_profile,
        state_history=wearable_df
    )
    
    # Simulate high risk spike scenario with high carbs and 0 steps
    high_spike_reading = {
        "timestamp": datetime.now(),
        "glucose": 185.0,
        "heart_rate": 86.0,
        "hrv": 32.0,
        "steps": 0,
        "sleep_hours": 5.0,
        "activity_level": "Sedentary",
        "meal_carbs": 80.0,
        "meal_type": "Lunch"
    }
    twin.update_sensor_data(high_spike_reading)
    
    recommendations = twin.recommend_interventions()
    assert isinstance(recommendations, list)
    assert len(recommendations) > 0
    
    for rec in recommendations:
        assert "id" in rec
        assert "title" in rec
        assert "current_risk" in rec
        assert "projected_risk" in rec
        assert "risk_reduction_pp" in rec
        assert "prescribed_modifications" in rec
        assert "clinical_rationale" in rec

def test_recommender_low_risk_maintenance():
    ehr_df = generate_ehr_profiles(n_patients=1, seed=42)
    wearable_df = generate_wearable_timeseries(ehr_df, days=3, interval_minutes=15, seed=42)
    
    patient_id = ehr_df.iloc[0]["patient_id"]
    ehr_profile = ehr_df.iloc[0].to_dict()
    
    twin = DigitalTwin(
        patient_id=patient_id,
        ehr_profile=ehr_profile,
        state_history=wearable_df
    )
    
    # Artificially set risk to low to test maintenance branch
    twin.current_risk = 0.15
    twin.risk_level = "LOW"
    
    recommender = MicroInterventionRecommender(twin)
    recs = recommender.generate_recommendations()
    
    assert len(recs) == 1
    assert recs[0]["id"] == "rec_safe_maintenance"
    assert recs[0]["category"] == "Maintenance"
