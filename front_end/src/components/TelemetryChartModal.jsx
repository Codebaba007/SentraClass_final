import React, { useEffect, useState } from 'react';
import { 
  X, 
  Activity, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle,
  RefreshCw 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ReferenceLine, 
  CartesianGrid 
} from 'recharts';
import { getTelemetryHistory } from '../api/api';

export default function TelemetryChartModal({ node, onClose, systemMode }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    if (!node) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getTelemetryHistory(node.id);
      // Format history for chart (oldest to newest)
      const formatted = (data.history || []).slice(0, 50).reverse().map(item => ({
        time: new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        distance: Math.round(item.measured_distance),
        state: item.detected_state,
        baseline: node.baseline_distance || 500,
        upperThreshold: (node.baseline_distance || 500) + (node.threshold_distance || 150),
        lowerThreshold: Math.max(0, (node.baseline_distance || 500) - (node.threshold_distance || 150))
      }));
      setHistory(formatted);
    } catch (err) {
      console.error(err);
      setError('Could not fetch telemetry history for this node.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [node]);

  if (!node) return null;

  const baseline = node.baseline_distance || 500;
  const threshold = node.threshold_distance || 150;
  const upper = baseline + threshold;
  const lower = Math.max(0, baseline - threshold);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '780px' }} 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ 
          padding: '1.25rem 1.5rem', 
          borderBottom: '1px solid var(--border-color)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Activity size={20} style={{ color: '#38bdf8' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
                {node.label || `Node #${node.id}`} - ToF Ranging History
              </h3>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              MAC: <span style={{ fontFamily: 'var(--font-mono)' }}>{node.device_mac}</span> | Zone: {node.location_zone || 'Classroom Desk'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button 
              onClick={fetchHistory} 
              className="btn btn-secondary btn-sm" 
              title="Refresh History"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
            <button 
              onClick={onClose} 
              className="btn btn-secondary btn-sm" 
              style={{ padding: '0.4rem' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Chart Content */}
        <div style={{ padding: '1.5rem' }}>
          {/* Reference stats row */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '0.75rem', 
            marginBottom: '1.25rem',
            fontSize: '0.78rem',
            fontFamily: 'var(--font-mono)'
          }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ color: 'var(--text-muted)' }}>Baseline Target</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#38bdf8', marginTop: '0.2rem' }}>{baseline} mm</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ color: 'var(--text-muted)' }}>Allowed Threshold (±)</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fbbf24', marginTop: '0.2rem' }}>±{threshold} mm</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ color: 'var(--text-muted)' }}>Normal Band</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34d399', marginTop: '0.2rem' }}>{lower} - {upper} mm</div>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
              <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 0.75rem' }} />
              <p>Querying time-of-flight logs from database...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: '#f87171' }}>
              <AlertTriangle size={28} style={{ margin: '0 auto 0.5rem' }} />
              <p>{error}</p>
            </div>
          ) : history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
              <Clock size={32} style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ color: '#fff' }}>No telemetry samples logged yet for this node.</p>
              <span style={{ fontSize: '0.78rem' }}>Use the simulator or physical ESP32 to ingest distance samples.</span>
            </div>
          ) : (
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="distGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={11} fontFamily="JetBrains Mono" />
                  <YAxis stroke="#64748b" fontSize={11} fontFamily="JetBrains Mono" domain={['dataMin - 50', 'dataMax + 50']} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderColor: 'rgba(255,255,255,0.15)', 
                      borderRadius: '8px',
                      fontFamily: 'JetBrains Mono',
                      fontSize: '12px'
                    }} 
                  />
                  <ReferenceLine y={baseline} stroke="#38bdf8" strokeDasharray="4 4" label={{ value: 'Baseline', fill: '#38bdf8', fontSize: 10 }} />
                  <ReferenceLine y={upper} stroke="#f43f5e" strokeDasharray="2 2" label={{ value: '+Threshold', fill: '#f43f5e', fontSize: 10 }} />
                  <ReferenceLine y={lower} stroke="#f43f5e" strokeDasharray="2 2" label={{ value: '-Threshold', fill: '#f43f5e', fontSize: 10 }} />
                  <Area 
                    type="monotone" 
                    dataKey="distance" 
                    stroke="#38bdf8" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#distGradient)" 
                    name="Distance (mm)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
