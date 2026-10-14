import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Legend
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import TrajectoryForecastChart from './TrajectoryForecastChart';

export default function TimeSeriesCharts({ wearables, trajectory, presetModifications }) {
  if (!wearables || wearables.length === 0) {
    return <div className="glass-panel" style={{ color: 'var(--text-muted)' }}>No time series data available for plotting.</div>;
  }

  // Format timestamp strings for chart axis (HH:mm)
  const chartData = wearables.map((w) => {
    const dt = new Date(w.timestamp);
    const timeLabel = isNaN(dt.getTime()) ? w.timestamp.slice(11, 16) : dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return {
      ...w,
      timeLabel,
      cgmThreshold: 140
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 2-Hour Continuous Glycemic Trajectory Projection */}
      <TrajectoryForecastChart
        trajectory={trajectory}
        presetModifications={presetModifications}
      />

      {/* CGM Monitor */}
      <div className="glass-panel">
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <TrendingUp size={20} style={{ color: 'rgb(166, 77, 121)' }} /> Continuous Glucose Monitoring (CGM) [mg/dL]
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
          Real-time glucose telemetry with 140 mg/dL hyperglycemia target line and meal flags.
        </p>

        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(106, 30, 85, 0.35)" />
              <XAxis dataKey="timeLabel" stroke="#9e8895" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis domain={['dataMin - 10', 'dataMax + 20']} stroke="#9e8895" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(48, 24, 42, 0.95)',
                  border: '1.5px solid rgb(106, 30, 85)',
                  borderRadius: '10px',
                  color: 'var(--text-main)',
                  boxShadow: 'var(--shadow-card)'
                }}
                formatter={(val, name) => [typeof val === 'number' ? val.toFixed(1) : val, name]}
              />
              <Legend verticalAlign="top" height={36} />
              <ReferenceLine y={140} label={{ value: '140 mg/dL Threshold', fill: '#e05368', fontSize: 11, fontWeight: 700 }} stroke="#e05368" strokeDasharray="4 4" />
              <Line type="monotone" dataKey="glucose" name="Glucose (mg/dL)" stroke="rgb(166, 77, 121)" strokeWidth={2.8} dot={false} activeDot={{ r: 6 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Autonomic Vitals (HR & HRV) */}
      <div className="glass-panel">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
          🫀 Heart Rate (bpm) & HRV RMSSD (ms)
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
          Autonomic tone tracking sympathetic stress and recovery responses.
        </p>

        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(106, 30, 85, 0.35)" />
              <XAxis dataKey="timeLabel" stroke="#9e8895" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis stroke="#9e8895" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(48, 24, 42, 0.95)',
                  border: '1.5px solid rgb(106, 30, 85)',
                  borderRadius: '10px',
                  color: 'var(--text-main)',
                  boxShadow: 'var(--shadow-card)'
                }}
              />
              <Legend verticalAlign="top" height={36} />
              <Line type="monotone" dataKey="heart_rate" name="Heart Rate (bpm)" stroke="#e05368" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="hrv" name="HRV (ms)" stroke="rgb(166, 77, 121)" strokeWidth={2} strokeDasharray="3 3" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Physical Activity & Carbs Ingestion */}
      <div className="glass-panel">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
          🏃 Physical Activity (Steps) & Dietary Carbs (g)
        </h3>
        <div style={{ width: '100%', height: 220, marginTop: '12px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(106, 30, 85, 0.35)" />
              <XAxis dataKey="timeLabel" stroke="#9e8895" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis stroke="#9e8895" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(48, 24, 42, 0.95)',
                  border: '1.5px solid rgb(106, 30, 85)',
                  borderRadius: '10px',
                  color: 'var(--text-main)',
                  boxShadow: 'var(--shadow-card)'
                }}
              />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="steps" name="Steps" fill="rgb(166, 77, 121)" opacity={0.88} radius={[4, 4, 0, 0]} />
              <Bar dataKey="meal_carbs" name="Carbs (g)" fill="rgb(106, 30, 85)" opacity={0.92} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
