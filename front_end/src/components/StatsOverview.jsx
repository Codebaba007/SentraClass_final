import React from 'react';
import { Cpu, CheckCircle2, AlertTriangle, ShieldAlert, Radio, Clock } from 'lucide-react';

export default function StatsOverview({ nodes, events, systemMode, latestTelemetry }) {
  const isSecurity = systemMode === 'security_mode';

  const totalNodes = nodes.length;
  // Node is active if last_ping was within 3 minutes or has recent telemetry
  const activeNodes = nodes.filter(n => {
    if (!n.is_active) return false;
    if (!n.last_ping) return true; // newly registered
    const pingTime = new Date(n.last_ping).getTime();
    return (Date.now() - pingTime) < 180000; // 3 mins
  }).length;

  const anomalies = events.filter(e => !e.is_resolved).length;
  const intrusionCount = events.filter(e => e.event_type === 'intrusion_alert').length;
  const postureCount = events.filter(e => e.event_type === 'posture_deviation').length;

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
      gap: '1rem', 
      marginBottom: '1.5rem' 
    }}>
      {/* Total Nodes */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>MONITORED NODES</span>
          <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(56,189,248,0.1)', color: '#38bdf8' }}>
            <Cpu size={18} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)' }}>
            {totalNodes}
          </span>
          <span style={{ fontSize: '0.78rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <CheckCircle2 size={13} /> {activeNodes} Online
          </span>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
          ESP32 + VL53L0X I2C sensing nodes
        </p>
      </div>

      {/* System State */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>OPERATING MODE</span>
          <div style={{ 
            padding: '0.4rem', 
            borderRadius: '8px', 
            background: isSecurity ? 'rgba(244,63,94,0.1)' : 'rgba(56,189,248,0.1)', 
            color: isSecurity ? '#fb7185' : '#38bdf8' 
          }}>
            {isSecurity ? <ShieldAlert size={18} /> : <Radio size={18} />}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
          <span style={{ 
            fontSize: '1.25rem', 
            fontWeight: 800, 
            color: isSecurity ? '#fb7185' : '#38bdf8', 
            textTransform: 'uppercase',
            letterSpacing: '0.02em'
          }}>
            {isSecurity ? 'Security' : 'Classroom'}
          </span>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
          {isSecurity ? 'Zone perimeter defense active' : 'Continuous posture & desk analysis'}
        </p>
      </div>

      {/* Active Anomaly Alerts */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>UNRESOLVED ALERTS</span>
          <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(245,158,11,0.1)', color: '#fbbf24' }}>
            <AlertTriangle size={18} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginTop: '0.5rem' }}>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: anomalies > 0 ? '#fbbf24' : '#fff', fontFamily: 'var(--font-mono)' }}>
            {anomalies}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            ({postureCount} posture, {intrusionCount} intrusion)
          </span>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
          Verified with temporal filter logic
        </p>
      </div>

      {/* Last Real-Time Ingest */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>LATEST TELEMETRY</span>
          <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', color: '#34d399' }}>
            <Clock size={18} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
          <span style={{ fontSize: '1.35rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>
            {latestTelemetry?.measured_distance ? `${latestTelemetry.measured_distance} mm` : 'Standing By'}
          </span>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {latestTelemetry?.label ? `Node: ${latestTelemetry.label} (${latestTelemetry.detectedstate})` : 'Awaiting sensor stream'}
        </p>
      </div>
    </div>
  );
}
