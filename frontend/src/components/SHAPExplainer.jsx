import React from 'react';
import { Search, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

export default function SHAPExplainer({ explanation }) {
  if (!explanation) return null;

  const topFeatures = explanation.top_features || [];
  const riskIncreasers = topFeatures.filter((item) => item.shap_value > 0).slice(0, 4);
  const riskDecreasers = topFeatures.filter((item) => item.shap_value < 0).slice(0, 4);

  // Prepare chart data (sorted for display)
  const chartData = [...topFeatures].reverse().map((f) => ({
    name: f.feature_name,
    shap: f.shap_value,
    val: f.feature_value
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-panel">
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Search size={20} style={{ color: 'rgb(166, 77, 121)' }} /> Explainable AI — SHAP Feature Contributions
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
          Quantifies the exact push/pull of each physiological and clinical variable on the model's spike prediction output.
        </p>

        <div style={{ width: '100%', height: 360 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={chartData} margin={{ top: 10, right: 30, left: 120, bottom: 0 }}>
              <XAxis type="number" stroke="#9e8895" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis type="category" dataKey="name" stroke="#9e8895" tick={{ fontSize: 12, fill: 'var(--text-main)' }} width={120} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(48, 24, 42, 0.95)',
                  border: '1.5px solid rgb(106, 30, 85)',
                  borderRadius: '10px',
                  color: 'var(--text-main)',
                  boxShadow: 'var(--shadow-card)'
                }}
                formatter={(val) => [val.toFixed(4), 'SHAP Value']}
              />
              <Bar dataKey="shap" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.shap > 0 ? '#e05368' : 'rgb(166, 77, 121)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Primary Drivers Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Risk Increasers */}
        <div style={{ background: 'rgba(224, 83, 104, 0.1)', border: '1px solid rgba(224, 83, 104, 0.35)', borderRadius: '12px', padding: '18px' }}>
          <h4 style={{ color: '#f87185', fontSize: '0.95rem', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ArrowUpRight size={18} /> Factors Increasing Risk (▲ Push Up)
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {riskIncreasers.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <span>• <strong>{item.feature_name}</strong> ({typeof item.feature_value === 'number' ? item.feature_value.toFixed(1) : item.feature_value})</span>
                <span style={{ color: '#f87185', fontWeight: 700 }}>+{typeof item.shap_value === 'number' ? item.shap_value.toFixed(3) : item.shap_value} SHAP</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Decreasers */}
        <div style={{ background: 'rgba(166, 77, 121, 0.15)', border: '1px solid rgba(166, 77, 121, 0.4)', borderRadius: '12px', padding: '18px' }}>
          <h4 style={{ color: 'rgb(166, 77, 121)', fontSize: '0.95rem', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ArrowDownRight size={18} /> Factors Decreasing Risk (▼ Pull Down)
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {riskDecreasers.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <span>• <strong>{item.feature_name}</strong> ({typeof item.feature_value === 'number' ? item.feature_value.toFixed(1) : item.feature_value})</span>
                <span style={{ color: 'rgb(166, 77, 121)', fontWeight: 700 }}>{typeof item.shap_value === 'number' ? item.shap_value.toFixed(3) : item.shap_value} SHAP</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
