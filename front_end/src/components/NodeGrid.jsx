import React from 'react';
import { Sliders, LineChart, Cpu, Wifi, MapPin, Gauge, AlertCircle, Play } from 'lucide-react';

export default function NodeGrid({ 
  nodes, 
  telemetryByNode, 
  onCalibrate, 
  onViewHistory, 
  onSimulateNode,
  systemMode 
}) {
  const isSecurity = systemMode === 'security_mode';

  if (!nodes || nodes.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', marginBottom: '1.5rem' }}>
        <Cpu size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>No Sensing Nodes Registered Yet</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '420px', margin: '0.5rem auto 1.5rem' }}>
          Connect an ESP32 node or click "Register Node" above to add your first classroom desk or lab security zone.
        </p>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
      gap: '1.25rem',
      marginBottom: '1.5rem' 
    }}>
      {nodes.map(node => {
        const live = telemetryByNode[node.id];
        const currentDistance = live ? live.measured_distance : node.baseline_distance;
        const baseline = node.baseline_distance || 500;
        const threshold = node.threshold_distance || 150;
        const deviation = Math.abs(currentDistance - baseline);
        
        let state = live?.detectedstate || 'normal';
        const isExceeded = deviation > threshold;
        if (isExceeded && !live) {
          state = isSecurity ? 'intrusion_alert' : 'posture_deviation';
        }

        const deviationPercent = Math.min(100, Math.round((deviation / (threshold * 1.5)) * 100));

        let stateColor = '#10b981';
        let stateBg = 'rgba(16,185,129,0.1)';
        let stateText = 'NORMAL';

        if (state === 'posture_deviation') {
          stateColor = '#f59e0b';
          stateBg = 'rgba(245,158,11,0.15)';
          stateText = 'POSTURE DEVIATION';
        } else if (state === 'intrusion_alert') {
          stateColor = '#f43f5e';
          stateBg = 'rgba(244,63,94,0.15)';
          stateText = 'INTRUSION DETECTED';
        }

        return (
          <div 
            key={node.id} 
            className="glass-panel"
            style={{ 
              padding: '1.25rem', 
              position: 'relative', 
              overflow: 'hidden',
              borderColor: state !== 'normal' ? stateColor : 'var(--border-color)',
              boxShadow: state !== 'normal' ? `0 0 20px -5px ${stateColor}40` : 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {/* Top Row: Label, Zone & State */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.85rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className={`pulse-dot ${state === 'normal' ? 'online' : state === 'posture_deviation' ? 'warning' : 'danger'}`} />
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
                    {node.label || `Node #${node.id}`}
                  </h4>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                  <MapPin size={13} style={{ color: '#38bdf8' }} />
                  <span>{node.location_zone || 'Unassigned Zone'}</span>
                </div>
              </div>

              <span className={`status-badge ${state}`}>
                {stateText}
              </span>
            </div>

            {/* Hardware MAC & Ranging Chips */}
            <div style={{ 
              background: 'rgba(0,0,0,0.3)', 
              borderRadius: '8px', 
              padding: '0.6rem 0.85rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              fontSize: '0.78rem',
              fontFamily: 'var(--font-mono)',
              marginBottom: '1rem',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              <span style={{ color: 'var(--text-muted)' }}>MAC: {node.device_mac}</span>
              <span style={{ color: '#38bdf8' }}>VL53L0X ToF</span>
            </div>

            {/* Metric Meters */}
            <div style={{ marginBottom: '1.1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Gauge size={14} /> Measured Distance
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
                  <span style={{ 
                    fontSize: '1.45rem', 
                    fontWeight: 800, 
                    fontFamily: 'var(--font-mono)', 
                    color: state !== 'normal' ? stateColor : '#fff' 
                  }}>
                    {Math.round(currentDistance)}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>mm</span>
                </div>
              </div>

              {/* Progress Bar with Baseline Reference Marker */}
              <div style={{ 
                height: '8px', 
                background: 'rgba(255,255,255,0.07)', 
                borderRadius: '4px', 
                overflow: 'hidden', 
                position: 'relative' 
              }}>
                <div style={{ 
                  height: '100%', 
                  width: `${deviationPercent}%`, 
                  background: state !== 'normal' ? stateColor : '#38bdf8', 
                  borderRadius: '4px',
                  transition: 'width 0.4s ease'
                }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem', fontFamily: 'var(--font-mono)' }}>
                <span>Deviation: {Math.round(deviation)}mm</span>
                <span>Threshold: ±{threshold}mm</span>
                <span>Baseline: {baseline}mm</span>
              </div>
            </div>

            {/* Action Bar */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              gap: '0.5rem', 
              paddingTop: '0.85rem', 
              borderTop: '1px solid var(--border-color)' 
            }}>
              <button 
                onClick={() => onCalibrate(node)}
                className="btn btn-secondary btn-sm"
                title="Calibrate baseline distance & threshold"
                style={{ flex: 1 }}
              >
                <Sliders size={14} />
                <span>Calibrate</span>
              </button>

              <button 
                onClick={() => onViewHistory(node)}
                className="btn btn-secondary btn-sm"
                title="View ToF time-series history"
                style={{ flex: 1 }}
              >
                <LineChart size={14} />
                <span>History</span>
              </button>

              <button 
                onClick={() => onSimulateNode(node)}
                className="btn btn-sm"
                title="Send test ingestion to this node"
                style={{ 
                  background: 'rgba(56,189,248,0.1)', 
                  borderColor: 'rgba(56,189,248,0.25)', 
                  color: '#38bdf8' 
                }}
              >
                <Play size={14} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
