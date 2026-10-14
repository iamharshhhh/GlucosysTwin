import React from 'react';
import { Award, Cpu, ShieldCheck } from 'lucide-react';

export default function ModelBenchmarks({ metrics }) {
  if (!metrics) {
    return <div className="glass-panel" style={{ color: 'var(--text-muted)' }}>Loading Model Benchmark Metrics...</div>;
  }

  const modelNames = Object.keys(metrics);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-panel">
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Cpu size={20} style={{ color: 'rgb(166, 77, 121)' }} /> Machine Learning Model Benchmarks
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
          Comparative evaluation of candidate classifiers trained on historical wearable and EHR features.
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface-subtle)', borderBottom: '1px solid var(--border-card)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>Model Name</th>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>Precision</th>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>Recall</th>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>F1 Score</th>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>ROC-AUC</th>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>PR-AUC</th>
              </tr>
            </thead>
            <tbody>
              {modelNames.map((name) => {
                const m = metrics[name];
                const isBest = name === 'XGBoost';
                return (
                  <tr
                    key={name}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      background: isBest ? 'rgba(166, 77, 121, 0.15)' : 'transparent'
                    }}
                  >
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: isBest ? 'rgb(166, 77, 121)' : 'var(--text-main)' }}>
                      {name} {isBest && (
                        <span style={{
                          fontSize: '0.72rem',
                          background: 'rgba(166, 77, 121, 0.25)',
                          color: 'rgb(166, 77, 121)',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          marginLeft: '8px',
                          fontWeight: 800
                        }}>
                          CHAMPION
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{m.precision.toFixed(4)}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{m.recall.toFixed(4)}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: 'var(--text-main)' }}>{m.f1_score.toFixed(4)}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: 'rgb(166, 77, 121)' }}>{m.roc_auc.toFixed(4)}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{m.pr_auc.toFixed(4)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confusion Matrices Grid */}
      <div className="glass-panel">
        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px' }}>
          Confusion Matrices
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {modelNames.map((name) => {
            const cm = metrics[name].confusion_matrix;
            return (
              <div key={name} style={{ background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '16px' }}>
                <h5 style={{ color: 'rgb(166, 77, 121)', fontSize: '0.92rem', fontWeight: 800, marginBottom: '12px' }}>{name}</h5>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'center' }}>
                  <thead>
                    <tr style={{ color: 'var(--text-muted)' }}>
                      <th></th>
                      <th style={{ padding: '4px' }}>Pred 0</th>
                      <th style={{ padding: '4px' }}>Pred 1</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 700, color: 'var(--text-muted)', textAlign: 'left', padding: '6px' }}>True 0</td>
                      <td style={{ background: 'rgba(166, 77, 121, 0.2)', padding: '8px', borderRadius: '4px', fontWeight: 700, color: 'var(--text-main)' }}>{cm[0][0]}</td>
                      <td style={{ background: 'rgba(224, 83, 104, 0.15)', padding: '8px', borderRadius: '4px', color: '#e05368', fontWeight: 700 }}>{cm[0][1]}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700, color: 'var(--text-muted)', textAlign: 'left', padding: '6px' }}>True 1</td>
                      <td style={{ background: 'rgba(224, 83, 104, 0.15)', padding: '8px', borderRadius: '4px', color: '#e05368', fontWeight: 700 }}>{cm[1][0]}</td>
                      <td style={{ background: 'rgba(166, 77, 121, 0.3)', padding: '8px', borderRadius: '4px', fontWeight: 800, color: 'rgb(166, 77, 121)' }}>{cm[1][1]}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
