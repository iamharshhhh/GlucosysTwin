import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Clock, Zap, CheckCircle2 } from 'lucide-react';

export default function InterventionCards({ recommendations, onSelectIntervention }) {
  if (!recommendations || recommendations.length === 0) return null;

  const isMaintenanceOnly =
    recommendations.length === 1 && recommendations[0].id === 'rec_safe_maintenance';

  if (isMaintenanceOnly) {
    const rec = recommendations[0];
    return (
      <div
        className="glass-panel"
        style={{
          borderLeft: '4px solid #4eba88',
          background: 'rgba(78, 186, 136, 0.12)',
          marginTop: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <ShieldCheck size={22} style={{ color: '#4eba88' }} />
          <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.05rem', fontWeight: 800 }}>
            {rec.title}
          </h4>
          <span
            style={{
              background: 'rgba(78, 186, 136, 0.25)',
              color: '#4eba88',
              padding: '2px 10px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: 800
            }}
          >
            SAFE GLYCEMIC ZONE
          </span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
          {rec.clinical_rationale}
        </p>
      </div>
    );
  }

  const priorityIcons = ['🥇 Priority 1', '🥈 Priority 2', '🥉 Priority 3', '4️⃣ Priority 4'];

  return (
    <div style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <h3
          style={{
            fontSize: '1.15rem',
            fontWeight: 800,
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            margin: 0
          }}
        >
          <Sparkles size={20} style={{ color: 'rgb(166, 77, 121)' }} />
          Twin Intelligence: Prescribed Counterfactual Micro-Interventions
        </h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Target: Drop risk to Safe Zone (&lt; 35%)
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {recommendations.map((rec, index) => {
          const isSafeAfter = rec.projected_risk < 35;
          const deltaColor = rec.risk_reduction_pp <= -30 ? '#4eba88' : 'rgb(166, 77, 121)';

          return (
            <div
              key={rec.id || index}
              className="glass-panel"
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: index === 0 ? '1.5px solid rgb(166, 77, 121)' : '1px solid var(--border-card)',
                background: index === 0 ? 'var(--bg-surface-subtle)' : 'var(--bg-card)'
              }}
            >
              <div>
                {/* Header tags */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span
                    style={{
                      background: index === 0 ? 'rgba(166, 77, 121, 0.25)' : 'rgba(106, 30, 85, 0.35)',
                      color: index === 0 ? 'rgb(166, 77, 121)' : 'var(--text-main)',
                      padding: '3px 9px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 800
                    }}
                  >
                    {priorityIcons[index] || `Option ${index + 1}`}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: 'var(--text-muted)',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}
                    >
                      <Clock size={12} /> {rec.action_window}
                    </span>
                    <span
                      style={{
                        background: 'rgba(106, 30, 85, 0.25)',
                        color: 'var(--text-muted)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 600
                      }}
                    >
                      {rec.difficulty}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
                  {rec.title}
                </h4>

                {/* Summary */}
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: 1.45, marginBottom: '14px' }}>
                  {rec.action_summary}
                </p>

                {/* Projected Risk Comparison Bar */}
                <div
                  style={{
                    background: 'rgba(26, 26, 29, 0.65)',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    marginBottom: '12px',
                    border: '1px solid rgba(106, 30, 85, 0.4)',
                    boxShadow: 'var(--shadow-card)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Projected Risk Shift:</span>
                    <strong style={{ fontSize: '0.85rem', color: deltaColor }}>
                      {rec.current_risk.toFixed(1)}% <ArrowRight size={12} style={{ display: 'inline', margin: '0 2px' }} /> {rec.projected_risk.toFixed(1)}% ({rec.risk_reduction_pp > 0 ? `+${rec.risk_reduction_pp}` : rec.risk_reduction_pp} pp)
                    </strong>
                  </div>

                  {/* Visual delta progress bar */}
                  <div style={{ width: '100%', height: '6px', background: 'rgba(26, 26, 29, 0.7)', borderRadius: '3px', overflow: 'hidden', position: 'relative' }}>
                    <div
                      style={{
                        width: `${Math.min(100, rec.current_risk)}%`,
                        height: '100%',
                        background: 'rgba(224, 83, 104, 0.5)',
                        position: 'absolute'
                      }}
                    />
                    <div
                      style={{
                        width: `${Math.min(100, rec.projected_risk)}%`,
                        height: '100%',
                        background: isSafeAfter ? '#4eba88' : '#e5a84b',
                        position: 'absolute',
                        transition: 'width 0.4s ease'
                      }}
                    />
                  </div>
                  {isSafeAfter && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#4eba88', fontSize: '0.72rem', marginTop: '6px', fontWeight: 700 }}>
                      <CheckCircle2 size={12} /> Projected to reach Safe Glycemic Zone (&lt; 35%)
                    </div>
                  )}
                </div>

                {/* Clinical rationale */}
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '14px' }}>
                  💡 {rec.clinical_rationale}
                </div>
              </div>

              {/* Action Button */}
              {onSelectIntervention && (
                <button
                  className="btn-primary"
                  onClick={() => onSelectIntervention(rec.prescribed_modifications)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    background: index === 0
                      ? 'linear-gradient(135deg, rgb(166, 77, 121) 0%, rgb(106, 30, 85) 100%)'
                      : 'var(--btn-secondary-bg)',
                    color: index === 0 ? '#ffffff' : 'var(--btn-secondary-color)',
                    border: index === 0 ? 'none' : '1px solid var(--btn-secondary-border)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 700,
                    boxShadow: index === 0 ? 'var(--btn-primary-shadow)' : 'none'
                  }}
                >
                  <Zap size={14} /> Test in What-If Simulator
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
