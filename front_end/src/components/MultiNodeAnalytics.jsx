import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { BarChart3, Info } from 'lucide-react';

export default function MultiNodeAnalytics({ nodes, telemetryByNode, systemMode }) {
  const isSecurity = systemMode === 'security_mode';

  // Prepare data comparing current distance, baseline, and deviation
  const chartData = nodes.map(node => {
    const live = telemetryByNode[node.id];
    const currentDist = live ? live.measured_distance : node.baseline_distance;
    const baseline = node.baseline_distance || 500;
    const threshold = node.threshold_distance || 150;
    const deviation = Math.abs(currentDist - baseline);
    const isExceeded = deviation > threshold;

    let state = live?.detectedstate || 'normal';
    if (isExceeded && !live) {
      state = isSecurity ? 'intrusion_alert' : 'posture_deviation';
    }

    return {
      name: node.label || `Node ${node.id}`,
      mac: node.device_mac,
      distance: Math.round(currentDist),
      baseline: Math.round(baseline),
      deviation: Math.round(deviation),
      threshold: Math.round(threshold),
      state
    };
  });

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={20} style={{ color: '#38bdf8' }} />
            Multi-Node Ranging & Deviation Analytics
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Comparing instantaneous ToF distance vs calibrated sitting baseline across all deployed sensing nodes
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', fontSize: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
            <span style={{ width: '12px', height: '12px', background: '#38bdf8', borderRadius: '3px' }} />
            <span>Target Baseline</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
            <span style={{ width: '12px', height: '12px', background: '#10b981', borderRadius: '3px' }} />
            <span>Normal</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
            <span style={{ width: '12px', height: '12px', background: '#f59e0b', borderRadius: '3px' }} />
            <span>Posture Warning</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
            <span style={{ width: '12px', height: '12px', background: '#f43f5e', borderRadius: '3px' }} />
            <span>Intrusion Alert</span>
          </div>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <Info size={28} style={{ margin: '0 auto 0.5rem' }} />
          <p>Register sensing nodes to see comparative distance analytics.</p>
        </div>
      ) : (
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} unit="mm" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderColor: 'rgba(255,255,255,0.15)', 
                  borderRadius: '8px',
                  fontFamily: 'JetBrains Mono',
                  fontSize: '12px'
                }} 
              />
              <Bar dataKey="baseline" name="Baseline (mm)" fill="rgba(56, 189, 248, 0.3)" />
              <Bar dataKey="distance" name="Live Distance (mm)" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => {
                  let barColor = '#10b981';
                  if (entry.state === 'posture_deviation') barColor = '#f59e0b';
                  if (entry.state === 'intrusion_alert') barColor = '#f43f5e';
                  return <Cell key={`cell-${index}`} fill={barColor} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
