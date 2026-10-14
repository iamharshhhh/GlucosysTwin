import React, { useState, useEffect } from 'react';
import { FlaskConical, Zap, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function WhatIfSimulator({ patientId, streamIndex, currentVitals, onRunSimulation, presetModifications }) {
  const [glucose, setGlucose] = useState(currentVitals.glucose || 120);
  const [carbs, setCarbs] = useState(currentVitals.meal_carbs || 0);
  const [sleep, setSleep] = useState(currentVitals.sleep_hours || 7);
  const [steps, setSteps] = useState(currentVitals.steps || 100);
  const [hr, setHr] = useState(currentVitals.heart_rate || 72);
  const [hrv, setHrv] = useState(currentVitals.hrv || 45);

  const [simResult, setSimResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [appliedPresetNotice, setAppliedPresetNotice] = useState(false);

  useEffect(() => {
    if (presetModifications && Object.keys(presetModifications).length > 0) {
      if (presetModifications.glucose !== undefined) setGlucose(presetModifications.glucose);
      if (presetModifications.meal_carbs !== undefined) setCarbs(presetModifications.meal_carbs);
      if (presetModifications.sleep_hours !== undefined) setSleep(presetModifications.sleep_hours);
      if (presetModifications.steps !== undefined) setSteps(presetModifications.steps);
      if (presetModifications.heart_rate !== undefined) setHr(presetModifications.heart_rate);
      if (presetModifications.hrv !== undefined) setHrv(presetModifications.hrv);
      setAppliedPresetNotice(true);

      // Auto-trigger simulation for immediate verification
      const runPresetSim = async () => {
        setLoading(true);
        try {
          const res = await onRunSimulation({
            glucose: presetModifications.glucose !== undefined ? presetModifications.glucose : parseFloat(glucose),
            meal_carbs: presetModifications.meal_carbs !== undefined ? presetModifications.meal_carbs : parseFloat(carbs),
            sleep_hours: presetModifications.sleep_hours !== undefined ? presetModifications.sleep_hours : parseFloat(sleep),
            steps: presetModifications.steps !== undefined ? presetModifications.steps : parseInt(steps),
            heart_rate: presetModifications.heart_rate !== undefined ? presetModifications.heart_rate : parseFloat(hr),
            hrv: presetModifications.hrv !== undefined ? presetModifications.hrv : parseFloat(hrv)
          });
          setSimResult(res);
        } catch (err) {
          console.error('Error auto-running preset simulation:', err);
        } finally {
          setLoading(false);
        }
      };
      runPresetSim();
    }
  }, [presetModifications]);

  const handleSimulate = async () => {
    setLoading(true);
    const modifications = {
      glucose: parseFloat(glucose),
      meal_carbs: parseFloat(carbs),
      sleep_hours: parseFloat(sleep),
      steps: parseInt(steps),
      heart_rate: parseFloat(hr),
      hrv: parseFloat(hrv)
    };

    try {
      const res = await onRunSimulation(modifications);
      setSimResult(res);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="glass-panel" style={{
        background: 'var(--bg-surface-subtle)',
        border: '1.5px solid rgb(166, 77, 121)'
      }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'rgb(166, 77, 121)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <FlaskConical size={22} /> Digital Twin What-If Scenario Simulator
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Interactively alter the patient's physiological parameters (e.g. reducing carbohydrate intake, adding post-meal activity) to model prospective risk changes.
        </p>
        {appliedPresetNotice && (
          <div style={{
            marginTop: '12px',
            background: 'rgba(78, 186, 136, 0.2)',
            border: '1px solid #4eba88',
            color: '#4eba88',
            padding: '7px 14px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 700
          }}>
            <CheckCircle2 size={16} /> Prescribed Micro-Intervention Parameters Loaded & Simulated Successfully!
          </div>
        )}
      </div>

      <div className="glass-panel">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
          {/* Glycemic Controls */}
          <div>
            <h4 style={{ color: 'var(--text-main)', fontSize: '0.92rem', fontWeight: 800, marginBottom: '14px' }}>🩸 Glycemic & Diet Controls</h4>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                <span>Simulated Glucose</span>
                <strong style={{ color: 'rgb(166, 77, 121)' }}>{glucose} mg/dL</strong>
              </div>
              <input type="range" min="60" max="300" step="5" value={glucose} onChange={(e) => setGlucose(e.target.value)} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                <span>Meal Carbs Intake</span>
                <strong style={{ color: 'rgb(166, 77, 121)' }}>{carbs}g</strong>
              </div>
              <input type="range" min="0" max="150" step="5" value={carbs} onChange={(e) => setCarbs(e.target.value)} />
            </div>
          </div>

          {/* Activity & Sleep Controls */}
          <div>
            <h4 style={{ color: 'var(--text-main)', fontSize: '0.92rem', fontWeight: 800, marginBottom: '14px' }}>🏃 Activity & Sleep Controls</h4>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                <span>Physical Steps (15m)</span>
                <strong style={{ color: 'rgb(166, 77, 121)' }}>{steps}</strong>
              </div>
              <input type="range" min="0" max="3500" step="100" value={steps} onChange={(e) => setSteps(e.target.value)} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                <span>Sleep Last Night</span>
                <strong style={{ color: '#4eba88' }}>{sleep} hrs</strong>
              </div>
              <input type="range" min="3" max="10" step="0.5" value={sleep} onChange={(e) => setSleep(e.target.value)} />
            </div>
          </div>

          {/* Autonomic Vitals */}
          <div>
            <h4 style={{ color: 'var(--text-main)', fontSize: '0.92rem', fontWeight: 800, marginBottom: '14px' }}>🫀 Autonomic Vitals</h4>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                <span>Heart Rate</span>
                <strong style={{ color: '#e05368' }}>{hr} bpm</strong>
              </div>
              <input type="range" min="50" max="150" step="2" value={hr} onChange={(e) => setHr(e.target.value)} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                <span>HRV RMSSD</span>
                <strong style={{ color: 'rgb(166, 77, 121)' }}>{hrv} ms</strong>
              </div>
              <input type="range" min="10" max="100" step="2" value={hrv} onChange={(e) => setHrv(e.target.value)} />
            </div>
          </div>
        </div>

        <button className="btn-primary" onClick={handleSimulate} disabled={loading} style={{ width: '100%', marginTop: '24px', padding: '14px', fontSize: '0.95rem' }}>
          <Zap size={18} /> {loading ? 'Computing Digital Twin Simulation...' : '⚡ RE-EVALUATE DIGITAL TWIN RISK'}
        </button>
      </div>

      {/* Simulation Outcomes Card */}
      {simResult && (
        <div className="glass-panel" style={{ borderLeft: '4px solid rgb(166, 77, 121)' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px' }}>
            📊 Scenario Simulation Risk Outcomes
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="metric-box">
              <span className="metric-label">Baseline Risk</span>
              <span className="metric-value">{simResult.current_risk.toFixed(1)}%</span>
              <span className="metric-delta" style={{ background: 'rgba(106, 30, 85, 0.35)', color: 'var(--text-main)' }}>{simResult.current_risk_level}</span>
            </div>

            <div className="metric-box">
              <span className="metric-label">Simulated Twin Risk</span>
              <span className="metric-value">{simResult.simulated_risk.toFixed(1)}%</span>
              <span className="metric-delta" style={{ background: 'rgba(166, 77, 121, 0.25)', color: 'rgb(166, 77, 121)' }}>{simResult.simulated_risk_level}</span>
            </div>

            <div className="metric-box">
              <span className="metric-label">Risk Delta</span>
              <span className="metric-value" style={{ color: simResult.risk_delta_percentage_points > 0 ? '#e05368' : '#4eba88' }}>
                {simResult.risk_delta_percentage_points > 0 ? `+${simResult.risk_delta_percentage_points.toFixed(1)}%` : `${simResult.risk_delta_percentage_points.toFixed(1)}%`}
              </span>
              <span className="metric-delta" style={{
                background: simResult.risk_delta_percentage_points > 0 ? 'rgba(224, 83, 104, 0.2)' : 'rgba(78, 186, 136, 0.2)',
                color: simResult.risk_delta_percentage_points > 0 ? '#e05368' : '#4eba88'
              }}>
                {simResult.risk_delta_percentage_points > 0 ? 'Increased Spike Risk' : 'Reduced Spike Risk'}
              </span>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-surface-subtle)',
            borderLeft: '4px solid rgb(166, 77, 121)',
            borderRadius: '8px',
            padding: '12px 16px',
            marginTop: '16px',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertTriangle size={16} style={{ color: 'rgb(166, 77, 121)' }} /> <strong>Medical Disclaimer:</strong> {simResult.disclaimer}
          </div>
        </div>
      )}
    </div>
  );
}
