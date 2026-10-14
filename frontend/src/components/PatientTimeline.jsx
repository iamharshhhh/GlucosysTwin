import React from 'react';
import { Clock, Utensils, AlertCircle, Activity } from 'lucide-react';

export default function PatientTimeline({ wearables }) {
  if (!wearables || wearables.length === 0) {
    return <div className="glass-panel" style={{ color: 'var(--text-muted)' }}>No event history available.</div>;
  }

  // Filter key events: Meals > 0, High Glucose >= 160, High Steps > 1000
  const events = [];
  [...wearables].reverse().forEach((w) => {
    const ts = w.timestamp;
    const g = w.glucose;
    const carbs = w.meal_carbs;
    const mtype = w.meal_type;
    const steps = w.steps;

    if (carbs > 0) {
      events.push({
        id: `meal-${ts}`,
        timestamp: ts,
        icon: <Utensils size={16} style={{ color: 'rgb(166, 77, 121)' }} />,
        type: 'Meal Ingestion',
        details: `${carbs.toFixed(0)}g carbs (${mtype})`,
        glucose: `${g.toFixed(1)} mg/dL`,
        severity: '🟡 Moderate',
        color: '#e5a84b'
      });
    }
    if (g >= 160) {
      events.push({
        id: `high-${ts}`,
        timestamp: ts,
        icon: <AlertCircle size={16} style={{ color: '#e05368' }} />,
        type: 'Hyperglycemia Alert',
        details: `Glucose elevated to ${g.toFixed(1)} mg/dL`,
        glucose: `${g.toFixed(1)} mg/dL`,
        severity: '🔴 High',
        color: '#e05368'
      });
    }
    if (steps >= 1000) {
      events.push({
        id: `steps-${ts}`,
        timestamp: ts,
        icon: <Activity size={16} style={{ color: '#4eba88' }} />,
        type: 'Physical Activity',
        details: `${steps} steps recorded`,
        glucose: `${g.toFixed(1)} mg/dL`,
        severity: '🟢 Positive',
        color: '#4eba88'
      });
    }
  });

  return (
    <div className="glass-panel">
      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <Clock size={20} style={{ color: 'rgb(166, 77, 121)' }} /> Patient Chronological Event Log
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
        Audit trail of dietary ingestion, physical activity bursts, and hyperglycemia alerts.
      </p>

      {events.length === 0 ? (
        <div style={{ color: 'var(--text-muted)' }}>No major physiological events recorded in recent history.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {events.slice(0, 15).map((evt) => (
            <div
              key={evt.id}
              style={{
                background: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '8px', background: 'rgba(26, 26, 29, 0.7)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  {evt.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>{evt.type}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{evt.details}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginLeft: 'auto', fontSize: '0.82rem' }}>
                <div>Glucose: <strong style={{ color: 'rgb(166, 77, 121)' }}>{evt.glucose}</strong></div>
                <div style={{ color: evt.color, fontWeight: 700 }}>{evt.severity}</div>
                <div style={{ color: 'var(--text-muted)' }}>{evt.timestamp.slice(0, 16)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
