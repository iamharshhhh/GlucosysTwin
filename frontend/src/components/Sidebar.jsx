import React from 'react';
import { Users, FastForward, RotateCcw, Cpu, Play, Pause } from 'lucide-react';

export default function Sidebar({
  patients,
  selectedPatientId,
  onSelectPatient,
  streamIndex,
  totalReadings,
  onNextTick,
  onResetStream,
  isAutoPlay,
  onToggleAutoPlay,
  metrics
}) {
  const progressPct = totalReadings > 0 ? Math.min(100, Math.round((streamIndex / totalReadings) * 100)) : 0;

  return (
    <div className="sidebar">
      {/* Brand Header */}
      <div style={{ textAlign: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-card)' }}>
        <div style={{
          display: 'inline-flex',
          padding: '12px',
          background: 'rgba(166, 77, 121, 0.18)',
          borderRadius: '16px',
          marginBottom: '10px',
          border: '1px solid rgba(106, 30, 85, 0.5)'
        }}>
          <Cpu size={32} style={{ color: 'rgb(166, 77, 121)' }} />
        </div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'rgb(166, 77, 121)', margin: 0, letterSpacing: '-0.3px' }}>
          Glucosys Twin Control
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Patient & Wearable Telemetry Manager
        </p>
      </div>

      {/* Patient Selector */}
      <div>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.85rem',
          fontWeight: 700,
          color: 'var(--text-main)',
          marginBottom: '8px'
        }}>
          <Users size={16} style={{ color: 'rgb(166, 77, 121)' }} /> Select Patient Profile
        </label>
        <select
          value={selectedPatientId}
          onChange={(e) => onSelectPatient(e.target.value)}
          style={{
            width: '100%',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            color: 'var(--text-main)',
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '0.88rem',
            fontWeight: 600,
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          {patients.map((p) => (
            <option key={p.patient_id} value={p.patient_id}>
              {p.patient_id} ({p.age}y {p.sex}, {p.diabetes_status})
            </option>
          ))}
        </select>
      </div>

      {/* Live Wearable Streaming Controls */}
      <div style={{
        background: 'var(--bg-surface-subtle)',
        border: '1px solid var(--border-card)',
        borderRadius: '14px',
        padding: '18px'
      }}>
        <h3 style={{
          fontSize: '0.92rem',
          fontWeight: 700,
          color: 'var(--text-main)',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <FastForward size={16} style={{ color: 'rgb(166, 77, 121)' }} /> Wearable Stream (15m Ticks)
        </h3>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <button className="btn-primary" onClick={onNextTick} style={{ flex: 1, padding: '9px 12px', fontSize: '0.82rem' }}>
            <FastForward size={14} /> +15m Tick
          </button>

          <button
            className="btn-secondary"
            onClick={onToggleAutoPlay}
            style={{
              padding: '9px 12px',
              fontSize: '0.82rem',
              borderColor: isAutoPlay ? 'rgb(166, 77, 121)' : 'var(--btn-secondary-border)',
              background: isAutoPlay ? 'rgba(166, 77, 121, 0.25)' : 'var(--btn-secondary-bg)',
              color: isAutoPlay ? 'rgb(245, 243, 244)' : 'var(--btn-secondary-color)',
              fontWeight: 700
            }}
          >
            {isAutoPlay ? <Pause size={14} /> : <Play size={14} />} {isAutoPlay ? 'Stop' : 'Auto'}
          </button>
        </div>

        <button
          className="btn-secondary"
          onClick={onResetStream}
          style={{ width: '100%', padding: '9px 12px', fontSize: '0.82rem', display: 'flex', justifyContent: 'center', gap: '6px' }}
        >
          <RotateCcw size={14} /> Reset Window
        </button>

        <div style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '5px' }}>
            <span>Window Progress</span>
            <span style={{ color: 'rgb(166, 77, 121)', fontWeight: 700 }}>{streamIndex} / {totalReadings}</span>
          </div>
          <div style={{ width: '100%', height: '7px', background: 'rgba(26, 26, 29, 0.7)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              width: `${progressPct}%`,
              height: '100%',
              background: 'linear-gradient(90deg, rgb(106, 30, 85), rgb(166, 77, 121))',
              transition: 'width 0.3s ease'
            }}></div>
          </div>
        </div>
      </div>

      {/* Model Benchmark Badges */}
      <div style={{ marginTop: 'auto' }}>
        <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '10px' }}>Active ML Ensembles</h3>
        {metrics && Object.keys(metrics).map((mName) => {
          const m = metrics[mName];
          const isBest = mName === 'XGBoost';
          return (
            <div
              key={mName}
              style={{
                background: 'var(--bg-card)',
                border: isBest ? '1.5px solid rgb(166, 77, 121)' : '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '9px 12px',
                marginBottom: '8px'
              }}
            >
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: isBest ? 'rgb(166, 77, 121)' : 'var(--text-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{mName}</span>
                {isBest && (
                  <span style={{
                    fontSize: '0.68rem',
                    background: 'rgba(166, 77, 121, 0.25)',
                    color: 'rgb(166, 77, 121)',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontWeight: 800
                  }}>
                    CHAMPION
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                F1: <strong style={{ color: 'var(--text-main)' }}>{m.f1_score.toFixed(3)}</strong> | ROC-AUC: <strong style={{ color: 'var(--text-main)' }}>{m.roc_auc.toFixed(3)}</strong>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
