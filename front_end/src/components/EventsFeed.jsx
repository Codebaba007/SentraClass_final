import React, { useState } from 'react';
import { AlertOctagon, ShieldAlert, CheckCircle2, Clock, Filter, AlertTriangle } from 'lucide-react';

export default function EventsFeed({ events }) {
  const [filter, setFilter] = useState('all');

  const filteredEvents = events.filter(e => {
    if (filter === 'all') return true;
    if (filter === 'posture') return e.event_type === 'posture_deviation';
    if (filter === 'security') return e.event_type === 'intrusion_alert';
    return true;
  });

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertOctagon size={20} style={{ color: '#fbbf24' }} />
            Security & Posture Event Log
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Real-time verified anomaly stream with temporal filtering
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(0,0,0,0.3)', padding: '0.25rem', borderRadius: '10px' }}>
          <button
            onClick={() => setFilter('all')}
            className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.3rem 0.75rem' }}
          >
            All ({events.length})
          </button>
          <button
            onClick={() => setFilter('posture')}
            className={`btn btn-sm ${filter === 'posture' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.3rem 0.75rem' }}
          >
            Posture ({events.filter(e => e.event_type === 'posture_deviation').length})
          </button>
          <button
            onClick={() => setFilter('security')}
            className={`btn btn-sm ${filter === 'security' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.3rem 0.75rem' }}
          >
            Intrusion ({events.filter(e => e.event_type === 'intrusion_alert').length})
          </button>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
          <CheckCircle2 size={36} style={{ color: '#10b981', margin: '0 auto 0.75rem' }} />
          <p style={{ fontSize: '0.9rem', color: '#fff' }}>No Anomaly Events Recorded</p>
          <span style={{ fontSize: '0.78rem' }}>All classroom desks and security zones are within calibrated limits.</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '420px', overflowY: 'auto' }}>
          {filteredEvents.map((evt, idx) => {
            const isSecurity = evt.event_type === 'intrusion_alert';
            const severityColor = evt.severity === 'critical' ? '#f43f5e' : evt.severity === 'high' ? '#fb923c' : '#fbbf24';

            return (
              <div
                key={evt.id || idx}
                style={{
                  background: 'rgba(0, 0, 0, 0.35)',
                  borderLeft: `4px solid ${isSecurity ? '#f43f5e' : '#f59e0b'}`,
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRight: '1px solid rgba(255, 255, 255, 0.05)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '10px',
                  padding: '0.9rem 1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{
                    padding: '0.5rem',
                    borderRadius: '8px',
                    background: isSecurity ? 'rgba(244, 63, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: isSecurity ? '#fb7185' : '#fbbf24'
                  }}>
                    {isSecurity ? <ShieldAlert size={18} /> : <AlertTriangle size={18} />}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>
                        {evt.node_label || `Node #${evt.node_id}`}
                      </span>
                      <span className={`status-badge ${evt.event_type}`}>
                        {evt.event_type?.replace('_', ' ')}
                      </span>
                      <span style={{ 
                        fontSize: '0.7rem', 
                        fontFamily: 'var(--font-mono)', 
                        padding: '0.15rem 0.45rem', 
                        borderRadius: '4px',
                        background: `${severityColor}20`,
                        color: severityColor,
                        fontWeight: 700,
                        textTransform: 'uppercase'
                      }}>
                        {evt.severity || 'HIGH'}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      {evt.message}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  <Clock size={13} />
                  <span>{new Date(evt.created_at).toLocaleTimeString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
