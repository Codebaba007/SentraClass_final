import React from 'react';
import { Monitor, ShieldAlert, AlertTriangle, CheckCircle, MapPin } from 'lucide-react';

export default function SpatialLayoutView({ nodes, telemetryByNode, onSelectNode, systemMode }) {
  const isSecurity = systemMode === 'security_mode';

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={20} style={{ color: '#38bdf8' }} />
            Spatial Topology & Floor Plan
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Real-time physical desk arrangement and protected zone perimeter mapping
          </p>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', fontSize: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
            <span>Normal / Secured</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
            <span>Posture Deviation</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fb7185' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f43f5e' }} />
            <span>Intrusion Alert</span>
          </div>
        </div>
      </div>

      {/* Classroom / Lab Grid Visualizer */}
      <div style={{
        background: 'rgba(5, 8, 14, 0.85)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '14px',
        padding: '1.5rem',
        position: 'relative',
        minHeight: '280px'
      }}>
        {/* Front of Classroom / Podium */}
        <div style={{
          width: '50%',
          margin: '0 auto 2rem',
          padding: '0.6rem',
          background: 'rgba(56, 189, 248, 0.08)',
          border: '1px dashed rgba(56, 189, 248, 0.3)',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#38bdf8',
          fontSize: '0.78rem',
          fontWeight: 600,
          letterSpacing: '0.05em'
        }}>
          FRONT OF CLASSROOM / TEACHER PODIUM & WHITEBOARD
        </div>

        {/* Nodes Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '1.25rem'
        }}>
          {nodes.map((node, index) => {
            const live = telemetryByNode[node.id];
            const currentDist = live ? live.measured_distance : node.baseline_distance;
            const baseline = node.baseline_distance || 500;
            const threshold = node.threshold_distance || 150;
            const dev = Math.abs(currentDist - baseline);

            let state = live?.detectedstate || 'normal';
            if (dev > threshold && !live) {
              state = isSecurity ? 'intrusion_alert' : 'posture_deviation';
            }

            let borderColor = 'rgba(16, 185, 129, 0.3)';
            let bgColor = 'rgba(16, 185, 129, 0.08)';
            let stateBadgeColor = '#34d399';

            if (state === 'posture_deviation') {
              borderColor = 'rgba(245, 158, 11, 0.5)';
              bgColor = 'rgba(245, 158, 11, 0.15)';
              stateBadgeColor = '#fbbf24';
            } else if (state === 'intrusion_alert') {
              borderColor = 'rgba(244, 63, 94, 0.6)';
              bgColor = 'rgba(244, 63, 94, 0.2)';
              stateBadgeColor = '#fb7185';
            }

            return (
              <div
                key={node.id}
                onClick={() => onSelectNode(node)}
                style={{
                  background: bgColor,
                  border: `1px solid ${borderColor}`,
                  borderRadius: '12px',
                  padding: '1rem',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: state !== 'normal' ? `0 0 16px ${borderColor}` : 'none'
                }}
              >
                {/* Desk Icon & Title */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    ZONE {index + 1}
                  </span>
                  <span className={`pulse-dot ${state === 'normal' ? 'online' : state === 'posture_deviation' ? 'warning' : 'danger'}`} />
                </div>

                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff', marginBottom: '0.2rem' }}>
                  {node.label || `Desk #${node.id}`}
                </div>

                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.65rem' }}>
                  {node.location_zone || 'Classroom Desk'}
                </div>

                {/* Real-time distance reading */}
                <div style={{
                  background: 'rgba(0,0,0,0.4)',
                  padding: '0.35rem 0.6rem',
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem'
                }}>
                  <span style={{ color: 'var(--text-muted)' }}>ToF:</span>
                  <span style={{ color: stateBadgeColor, fontWeight: 700 }}>
                    {Math.round(currentDist)} mm
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Classroom Rear / Lab Storage */}
        <div style={{
          width: '70%',
          margin: '2rem auto 0',
          padding: '0.45rem',
          background: 'rgba(255, 255, 255, 0.02)',
          borderTop: '1px dashed rgba(255, 255, 255, 0.1)',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.72rem'
        }}>
          EXIT / REAR ENTRANCE & EQUIPMENT STORAGE
        </div>
      </div>
    </div>
  );
}
