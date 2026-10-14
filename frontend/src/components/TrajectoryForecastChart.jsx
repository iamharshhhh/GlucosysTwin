import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  ReferenceArea,
  Legend
} from 'recharts';
import { TrendingUp, Footprints, ShieldAlert, Sparkles } from 'lucide-react';

export default function TrajectoryForecastChart({ trajectory, currentGlucose, presetModifications }) {
  const summary = trajectory?.summary;
  const anchorTime = trajectory?.anchor_time || 'NOW';
  
  // Prepare chart points
  let chartData = [];
  if (trajectory?.combined_points && trajectory.combined_points.length > 0) {
    chartData = trajectory.combined_points;
  } else if (trajectory?.forecast_points) {
    const hist = (trajectory.historical_points || []).map(p => ({
      time: p.time,
      glucose_historical: p.glucose_historical,
      glucose_unmitigated: p.is_anchor ? p.glucose_historical : null,
      glucose_intervened: p.is_anchor ? p.glucose_historical : null,
      is_anchor: p.is_anchor || false,
    }));
    const fore = trajectory.forecast_points.map(p => ({
      time: p.time,
      glucose_historical: null,
      glucose_unmitigated: p.glucose_unmitigated,
      glucose_intervened: p.glucose_intervened,
      is_anchor: false,
    }));
    chartData = [...hist, ...fore];
  } else {
    // Graceful default postprandial curve matching user ASCII diagram
    chartData = [
      { time: '12:00', glucose_historical: 110.0, glucose_unmitigated: null, glucose_intervened: null },
      { time: '12:30', glucose_historical: 104.0, glucose_unmitigated: null, glucose_intervened: null },
      { time: '1:00', glucose_historical: 158.0, glucose_unmitigated: null, glucose_intervened: null },
      { time: '1:15', glucose_historical: 140.7, glucose_unmitigated: 140.7, glucose_intervened: 140.7, is_anchor: true },
      { time: '1:30', glucose_historical: null, glucose_unmitigated: 182.0, glucose_intervened: 165.8 },
      { time: '1:45', glucose_historical: null, glucose_unmitigated: 211.8, glucose_intervened: 171.9 },
      { time: '2:00', glucose_historical: null, glucose_unmitigated: 204.3, glucose_intervened: 164.5 },
      { time: '2:30', glucose_historical: null, glucose_unmitigated: 173.6, glucose_intervened: 130.0 },
      { time: '3:15', glucose_historical: null, glucose_unmitigated: 142.0, glucose_intervened: 112.1 },
    ];
  }

  const unmitPeak = summary?.projected_peak_glucose || 212;
  const walkPeak = summary?.intervened_peak_glucose || 172;
  const reduction = summary?.peak_blunting_reduction_mgdl || Math.round(unmitPeak - walkPeak);

  return (
    <div className="glass-panel" style={{
      border: '1.5px solid rgba(166, 77, 121, 0.45)',
      boxShadow: 'var(--shadow-card)'
    }}>
      {/* Title & Micro-Intervention Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={22} style={{ color: 'rgb(166, 77, 121)' }} /> 2-Hour Continuous Glycemic Trajectory Projection
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
            Multi-horizon kinetic simulation comparing <strong>sedentary unmitigated trajectory</strong> vs. <strong>counterfactual brisk walk micro-intervention</strong>.
          </p>
        </div>

        {/* Clinical badges */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{
            background: 'rgba(224, 83, 104, 0.15)',
            border: '1px solid rgba(224, 83, 104, 0.4)',
            borderRadius: '10px',
            padding: '7px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#f87185',
            fontSize: '0.82rem',
            fontWeight: 700
          }}>
            <ShieldAlert size={15} /> 🔴 Unmitigated Peak: {unmitPeak} mg/dL
          </div>

          <div style={{
            background: 'rgba(78, 186, 136, 0.18)',
            border: '1px solid rgba(78, 186, 136, 0.45)',
            borderRadius: '10px',
            padding: '7px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#4eba88',
            fontSize: '0.82rem',
            fontWeight: 700
          }}>
            <Footprints size={15} /> 🟢 With Walk: Peaks at {walkPeak} mg/dL
          </div>

          <div style={{
            background: 'rgba(166, 77, 121, 0.22)',
            border: '1.5px solid rgb(166, 77, 121)',
            borderRadius: '10px',
            padding: '7px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'rgb(166, 77, 121)',
            fontSize: '0.82rem',
            fontWeight: 800
          }}>
            🛡️ Glycemic Blunting: -{reduction} mg/dL
          </div>
        </div>
      </div>

      {/* Main Trajectory Chart */}
      <div style={{ width: '100%', height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 15, right: 35, left: 10, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(106, 30, 85, 0.35)" />

            {/* Fixed X-Axis with clinical interval labels */}
            <XAxis
              dataKey="time"
              stroke="#9e8895"
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              label={{
                value: '◀── Historical Readings (CGM) ──┼── 2-Hour Projected Curve ──►',
                position: 'insideBottom',
                offset: -16,
                fill: 'var(--text-muted)',
                fontSize: 11,
                fontWeight: 600
              }}
            />

            {/* Fixed Y-Axis spanning 50 - 240 mg/dL exactly like clinical ASCII chart */}
            <YAxis
              domain={[50, 240]}
              ticks={[60, 80, 100, 120, 140, 160, 180, 200, 220, 240]}
              stroke="#9e8895"
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              label={{
                value: 'Glucose (mg/dL)',
                angle: -90,
                position: 'insideLeft',
                fill: 'var(--text-muted)',
                fontSize: 11,
                offset: 5
              }}
            />

            {/* Target Time-in-Range Safe Zone Corridor (70-180 mg/dL) */}
            <ReferenceArea
              y1={70}
              y2={180}
              fill="rgba(78, 186, 136, 0.12)"
              ifOverflow="extendDomain"
            />

            {/* Upper Safe Limit (180 mg/dL) */}
            <ReferenceLine
              y={180}
              stroke="#e05368"
              strokeWidth={1.5}
              strokeDasharray="5 5"
              label={{
                value: 'Upper Safe Limit (180 mg/dL)',
                fill: '#e05368',
                position: 'insideTopRight',
                fontSize: 11,
                fontWeight: 700
              }}
            />

            {/* Lower Safe Limit (70 mg/dL) */}
            <ReferenceLine
              y={70}
              stroke="#e5a84b"
              strokeWidth={1.5}
              strokeDasharray="5 5"
              label={{
                value: 'Lower Safe Limit (70 mg/dL)',
                fill: '#e5a84b',
                position: 'insideBottomRight',
                fontSize: 11,
                fontWeight: 700
              }}
            />

            {/* NOW / Forecast Anchor line */}
            {anchorTime && (
              <ReferenceLine
                x={anchorTime}
                stroke="rgb(166, 77, 121)"
                strokeWidth={2}
                strokeDasharray="3 3"
                label={{
                  value: 'NOW (Forecast Start) ⏱️',
                  fill: 'rgb(166, 77, 121)',
                  position: 'top',
                  fontSize: 11,
                  fontWeight: 800
                }}
              />
            )}

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div style={{
                      background: 'rgba(48, 24, 42, 0.95)',
                      border: '1.5px solid rgb(106, 30, 85)',
                      borderRadius: '10px',
                      padding: '12px 16px',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      boxShadow: 'var(--shadow-card-hover)'
                    }}>
                      <div style={{ fontWeight: 800, marginBottom: '6px', color: '#ffffff', borderBottom: '1px solid rgba(106, 30, 85, 0.4)', paddingBottom: '4px' }}>
                        Timestamp: {label}
                      </div>
                      {payload.map((entry, idx) => {
                        if (entry.value === null || entry.value === undefined) return null;
                        return (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginTop: '4px' }}>
                            <span style={{ color: entry.color, display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: entry.color }} />
                              {entry.name}:
                            </span>
                            <span style={{ fontWeight: 800, color: '#ffffff' }}>
                              {Number(entry.value).toFixed(1)} mg/dL
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                }
                return null;
              }}
            />

            <Legend
              verticalAlign="top"
              height={38}
              wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
            />

            {/* 1. Historical Readings (Solid Rose Plum — rgb(166, 77, 121)) */}
            <Line
              type="monotone"
              dataKey="glucose_historical"
              name="Historical Readings (CGM)"
              stroke="rgb(166, 77, 121)"
              strokeWidth={3}
              dot={{ r: 3.5, fill: 'rgb(166, 77, 121)' }}
              activeDot={{ r: 6 }}
              connectNulls={false}
            />

            {/* 2. Unmitigated Trajectory (Red Dashed) */}
            <Line
              type="monotone"
              dataKey="glucose_unmitigated"
              name={`🔴 Unmitigated Peak: ${unmitPeak} mg/dL`}
              stroke="#e05368"
              strokeWidth={3}
              strokeDasharray="6 4"
              dot={{ r: 3, fill: '#e05368' }}
              activeDot={{ r: 6 }}
              connectNulls={false}
            />

            {/* 3. With Walk Trajectory (Green Dashed) */}
            <Line
              type="monotone"
              dataKey="glucose_intervened"
              name={`🟢 With Walk: Peaks at ${walkPeak} mg/dL`}
              stroke="#4eba88"
              strokeWidth={3.5}
              strokeDasharray="4 4"
              dot={{ r: 3.5, fill: '#4eba88' }}
              activeDot={{ r: 6 }}
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Narrative Clinical Callout Footer */}
      <div style={{
        marginTop: '16px',
        padding: '12px 16px',
        borderRadius: '10px',
        background: 'var(--bg-surface-subtle)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '0.84rem',
        color: 'var(--text-secondary)'
      }}>
        <div>
          💡 <strong>Clinical Trajectory Insight:</strong> Without physical movement, postprandial glucose surges past the 180 mg/dL upper threshold to <span style={{ color: '#f87185', fontWeight: 700 }}>{unmitPeak} mg/dL</span>. Immediate brisk walking accelerates GLUT4 muscle glucose extraction, blunting the peak to <span style={{ color: '#4eba88', fontWeight: 700 }}>{walkPeak} mg/dL</span>.
        </div>
        <div style={{ color: 'rgb(166, 77, 121)', fontWeight: 800 }}>
          Target Safe Range: 70 – 180 mg/dL (TIR 100%)
        </div>
      </div>
    </div>
  );
}
