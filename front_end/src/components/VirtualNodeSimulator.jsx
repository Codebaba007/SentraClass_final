import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Cpu, 
  Send, 
  Play, 
  Pause, 
  Zap, 
  Radio, 
  Volume2, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  ArrowRight 
} from 'lucide-react';
import { ingestTelemetry } from '../api/api';

export default function VirtualNodeSimulator({ nodes, selectedNode, onClose, systemMode }) {
  const isSecurity = systemMode === 'security_mode';
  
  const [activeNodeId, setActiveNodeId] = useState(
    selectedNode ? selectedNode.id : (nodes.length > 0 ? nodes[0].id : null)
  );

  const currentNode = nodes.find(n => n.id === activeNodeId) || nodes[0] || {
    id: 1,
    device_mac: '24:6F:28:B4:42:01',
    label: 'Test Desk 01',
    baseline_distance: 500,
    threshold_distance: 150
  };

  const [simDistance, setSimDistance] = useState(currentNode.baseline_distance || 500);
  const [isSending, setIsSending] = useState(false);
  const [lastResponse, setLastResponse] = useState(null);
  const [isAutoStreaming, setIsAutoStreaming] = useState(false);
  const autoStreamRef = useRef(null);

  // Keep slider aligned if node changes
  useEffect(() => {
    if (currentNode) {
      setSimDistance(currentNode.baseline_distance || 500);
    }
  }, [currentNode?.id]);

  const baseline = currentNode.baseline_distance || 500;
  const threshold = currentNode.threshold_distance || 150;
  const deviation = Math.abs(simDistance - baseline);
  const isExceeded = deviation > threshold;

  // Expected state
  const expectedState = !isExceeded ? 'normal' : isSecurity ? 'intrusion_alert' : 'posture_deviation';

  const handleSendTelemetry = async (distOverride) => {
    const distToSend = distOverride !== undefined ? distOverride : simDistance;
    setIsSending(true);
    try {
      const res = await ingestTelemetry({
        device_mac: currentNode.device_mac,
        distance: parseFloat(distToSend)
      });
      setLastResponse({
        success: true,
        data: res,
        time: new Date().toLocaleTimeString()
      });
    } catch (err) {
      setLastResponse({
        success: false,
        error: err.message,
        time: new Date().toLocaleTimeString()
      });
    } finally {
      setIsSending(false);
    }
  };

  // Toggle continuous streaming (every 2.5 seconds)
  useEffect(() => {
    if (isAutoStreaming) {
      autoStreamRef.current = setInterval(() => {
        // Add subtle sensor jitter (± 15mm)
        const jitter = Math.floor(Math.random() * 30) - 15;
        const targetDist = Math.max(50, Math.round(simDistance + jitter));
        handleSendTelemetry(targetDist);
      }, 2500);
    } else {
      if (autoStreamRef.current) clearInterval(autoStreamRef.current);
    }
    return () => {
      if (autoStreamRef.current) clearInterval(autoStreamRef.current);
    };
  }, [isAutoStreaming, simDistance, currentNode?.device_mac]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ 
          padding: '1.25rem 1.5rem', 
          borderBottom: '1px solid var(--border-color)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Cpu size={22} style={{ color: '#38bdf8' }} />
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
                ESP32 & VL53L0X Hardware Testbench
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Simulate physical ToF telemetry ingestion into SentraClass REST API
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem' }}>
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.5rem' }}>
          {/* Node Selector */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#fff', marginBottom: '0.4rem' }}>
              Select Active ESP32 Node
            </label>
            <select
              value={activeNodeId}
              onChange={e => setActiveNodeId(Number(e.target.value))}
              className="input-field mono-font"
            >
              {nodes.map(n => (
                <option key={n.id} value={n.id}>
                  {n.label} ({n.device_mac}) - Zone: {n.location_zone || 'Desk'}
                </option>
              ))}
            </select>
          </div>

          {/* Virtual Hardware Diagram & Virtual LED / Buzzer indicators */}
          <div style={{
            background: 'rgba(5, 8, 14, 0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '1.25rem',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>VIRTUAL ESP32 DEVKIT ON-BOARD STATUS</span>
              <span className="mono-font">GPIO2 / I2C SDA-SCL</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              {/* Green LED: Normal */}
              <div style={{
                background: expectedState === 'normal' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${expectedState === 'normal' ? '#10b981' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: '8px',
                padding: '0.6rem',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: expectedState === 'normal' ? '#10b981' : '#334155',
                  boxShadow: expectedState === 'normal' ? '0 0 12px #10b981' : 'none',
                  margin: '0 auto 0.4rem'
                }} />
                <span style={{ fontSize: '0.72rem', color: expectedState === 'normal' ? '#34d399' : 'var(--text-muted)', fontWeight: 600 }}>
                  GREEN LED (Normal)
                </span>
              </div>

              {/* Amber LED: Posture Warning */}
              <div style={{
                background: expectedState === 'posture_deviation' ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${expectedState === 'posture_deviation' ? '#f59e0b' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: '8px',
                padding: '0.6rem',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: expectedState === 'posture_deviation' ? '#f59e0b' : '#334155',
                  boxShadow: expectedState === 'posture_deviation' ? '0 0 12px #f59e0b' : 'none',
                  margin: '0 auto 0.4rem'
                }} />
                <span style={{ fontSize: '0.72rem', color: expectedState === 'posture_deviation' ? '#fbbf24' : 'var(--text-muted)', fontWeight: 600 }}>
                  AMBER LED (Posture)
                </span>
              </div>

              {/* Red LED & Buzzer: Security Intrusion */}
              <div style={{
                background: expectedState === 'intrusion_alert' ? 'rgba(244,63,94,0.2)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${expectedState === 'intrusion_alert' ? '#f43f5e' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: '8px',
                padding: '0.6rem',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: expectedState === 'intrusion_alert' ? '#f43f5e' : '#334155',
                  boxShadow: expectedState === 'intrusion_alert' ? '0 0 14px #f43f5e' : 'none',
                  margin: '0 auto 0.4rem'
                }} />
                <span style={{ fontSize: '0.72rem', color: expectedState === 'intrusion_alert' ? '#fb7185' : 'var(--text-muted)', fontWeight: 600 }}>
                  BUZZER & RED LED
                </span>
              </div>
            </div>
          </div>

          {/* Distance Slider */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>
                VL53L0X Measured Distance:
              </label>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: isExceeded ? (isSecurity ? '#fb7185' : '#fbbf24') : '#38bdf8' }}>
                  {simDistance}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>mm</span>
              </div>
            </div>

            <input 
              type="range"
              min="50"
              max="1200"
              step="5"
              value={simDistance}
              onChange={e => setSimDistance(Number(e.target.value))}
              style={{ width: '100%', accentColor: isExceeded ? (isSecurity ? '#f43f5e' : '#f59e0b') : '#38bdf8' }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem', fontFamily: 'var(--font-mono)' }}>
              <span>50 mm (Close)</span>
              <span>Baseline: {baseline} mm (±{threshold} mm)</span>
              <span>1200 mm (Distant)</span>
            </div>
          </div>

          {/* Test Scenario Presets */}
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>
              SIMULATE SCENARIOS (SECTION 4 PROPOSAL):
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setSimDistance(baseline);
                  handleSendTelemetry(baseline);
                }}
              >
                Normal Sitting ({baseline}mm)
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  const val = Math.max(80, baseline - threshold - 80);
                  setSimDistance(val);
                  handleSendTelemetry(val);
                }}
              >
                Slouch / Head Down ({baseline - threshold - 80}mm)
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  const val = baseline + threshold + 150;
                  setSimDistance(val);
                  handleSendTelemetry(val);
                }}
              >
                Vacated / Moved ({baseline + threshold + 150}mm)
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ borderColor: 'rgba(244,63,94,0.4)', color: '#fda4af' }}
                onClick={() => {
                  const val = 180;
                  setSimDistance(val);
                  handleSendTelemetry(val);
                }}
              >
                Intrusion Breach (180mm)
              </button>
            </div>
          </div>

          {/* Ingestion & Continuous Stream controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsAutoStreaming(!isAutoStreaming)}
              className={`btn btn-sm ${isAutoStreaming ? 'btn-danger' : 'btn-secondary'}`}
            >
              {isAutoStreaming ? <Pause size={15} /> : <Play size={15} />}
              <span>{isAutoStreaming ? 'Stop Auto-Stream' : 'Live Auto-Stream (2.5s)'}</span>
            </button>

            <button
              onClick={() => handleSendTelemetry()}
              disabled={isSending}
              className="btn btn-primary"
            >
              <Send size={15} />
              <span>{isSending ? 'Transmitting Ingest...' : 'Send Single Ingest'}</span>
            </button>
          </div>

          {/* Response payload preview */}
          {lastResponse && (
            <div style={{
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '8px',
              padding: '0.75rem',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                <span>LAST BACKEND INGEST RESPONSE:</span>
                <span>{lastResponse.time}</span>
              </div>
              <pre style={{ color: lastResponse.success ? '#34d399' : '#f87171', whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(lastResponse.data || lastResponse.error, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
