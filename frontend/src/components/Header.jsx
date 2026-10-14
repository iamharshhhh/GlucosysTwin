import React from 'react';
import { Activity, AlertTriangle, Sparkles } from 'lucide-react';

export default function Header({ patientId }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div className="glass-panel" style={{ padding: '22px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 className="title-gradient" style={{ fontSize: '2.2rem', margin: 0, letterSpacing: '-0.5px' }}>
                🧬 Glucosys Twin
              </h1>
              <span style={{
                background: 'rgba(166, 77, 121, 0.2)',
                border: '1px solid rgb(166, 77, 121)',
                color: 'rgb(180, 176, 178)',
                padding: '3px 12px',
                borderRadius: '14px',
                fontSize: '0.78rem',
                fontWeight: 700
              }}>
                AI Clinical Digital Twin
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '6px' }}>
              Next-Generation Healthcare Digital Twin for Early Glucose Spike Prediction (2-Hour Horizon)
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* System Status Pill */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(166, 77, 121, 0.18)',
              border: '1px solid rgb(166, 77, 121)',
              color: 'var(--text-main)',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '0.82rem',
              fontWeight: 800
            }}>
              <span style={{
                height: '8px',
                width: '8px',
                backgroundColor: 'rgb(52, 236, 28)',
                borderRadius: '50%',
                boxShadow: '0 0 10px rgb(52, 236, 28)',
                animation: 'pulse 1.8s infinite'
              }}></span>
              GLUCOSYS TWIN ENGINE ACTIVE
            </div>
          </div>
        </div>
      </div>

      <div style={{
        background: 'rgba(55, 45, 52, 0.65)',
        borderLeft: '4px solid rgb(166, 77, 121)',
        border: '1px solid rgba(106, 30, 85, 0.4)',
        borderLeftWidth: '4px',
        borderRadius: '8px',
        padding: '11px 16px',
        color: 'var(--text-secondary)',
        fontSize: '0.84rem',
        marginTop: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <AlertTriangle size={19} style={{ color: 'rgb(255, 0, 17)', flexShrink: 0 }} />
        <div>
          <strong>RESEARCH PROOF-OF-CONCEPT:</strong> Glucosys Twin uses synthetic patient & wearable sensor telemetry for demonstration. This platform is not intended for clinical diagnosis, treatment, or direct medical decision-making.
        </div>
      </div>
    </div>
  );
}
