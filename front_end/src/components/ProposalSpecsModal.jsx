import React from 'react';
import { X, BookOpen, ShieldCheck, Cpu, Radio, Award, Layers, CheckCircle2 } from 'lucide-react';

export default function ProposalSpecsModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '820px' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ 
          padding: '1.25rem 1.75rem', 
          borderBottom: '1px solid var(--border-color)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(56,189,248,0.08) 0%, transparent 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '10px', background: 'rgba(56,189,248,0.15)', color: '#38bdf8' }}>
              <BookOpen size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                SentraClass System Specification & Proposal
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Department of Computer Science and Engineering, UITS • CSE402 IoT Lab
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem' }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.75rem', maxHeight: '75vh', overflowY: 'auto' }}>
          {/* Project Details Banner */}
          <div style={{
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem'
          }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                SUBMITTED BY
              </span>
              <div style={{ fontWeight: 700, color: '#fff', marginTop: '0.2rem', fontSize: '0.85rem' }}>
                • Mehedi Hassan Bhuiyan (0432320005101080)<br/>
                • Hasib Al Mahmud Siddique (0432320005101095)<br/>
                • Fahim Hossain (0432320005101085)
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                SUBMITTED TO
              </span>
              <div style={{ fontWeight: 700, color: '#38bdf8', marginTop: '0.2rem', fontSize: '0.85rem' }}>
                Abrar Mahbub Tanim
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Lecturer, Dept. of CSE, UITS
              </div>
            </div>
          </div>

          {/* Section 4 & 5 Objectives */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={18} style={{ color: '#10b981' }} />
              Dual-Mode Sensing Architecture
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ background: 'rgba(56,189,248,0.05)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '10px', padding: '1rem' }}>
                <div style={{ fontWeight: 700, color: '#38bdf8', fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                  4.1 Classroom Mode
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  During active hours, sensing nodes measure sitting distance relative to a calibrated baseline. Temporal algorithms classify deviations as temporary adjustments vs prolonged posture deviations (slouching, forward-head posture) without collecting optical imagery.
                </p>
              </div>

              <div style={{ background: 'rgba(244,63,94,0.05)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '10px', padding: '1rem' }}>
                <div style={{ fontWeight: 700, color: '#fb7185', fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                  4.2 Spatial Security Mode
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  When laboratories or classrooms are unoccupied, sensing nodes re-purpose as spatial perimeter guards. Sustained changes from configured empty distance trigger local buzzer/LED indicators and transmit real-time alerts to the central dashboard.
                </p>
              </div>
            </div>
          </div>

          {/* Section 6 Hardware Bill of Materials */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Cpu size={18} style={{ color: '#fbbf24' }} />
              Hardware Components & Specifications (Section 6)
            </h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.5rem 0.75rem' }}>Component</th>
                  <th style={{ padding: '0.5rem 0.75rem' }}>Function in SentraClass</th>
                </tr>
              </thead>
              <tbody style={{ color: 'var(--text-secondary)' }}>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '0.55rem 0.75rem', fontWeight: 600, color: '#fff' }}>ESP32 DevKit</td>
                  <td style={{ padding: '0.55rem 0.75rem' }}>Core microcontroller, Wi-Fi 802.11 b/g/n, I2C sensor polling, local temporal filtering</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '0.55rem 0.75rem', fontWeight: 600, color: '#fff' }}>VL53L0X ToF Sensor</td>
                  <td style={{ padding: '0.55rem 0.75rem' }}>Time-of-Flight 940nm laser ranging (30-2000mm) measuring target proximity</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '0.55rem 0.75rem', fontWeight: 600, color: '#fff' }}>Piezo Buzzer</td>
                  <td style={{ padding: '0.55rem 0.75rem' }}>Audible local acoustic alert for after-hours unauthorized zone breach</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '0.55rem 0.75rem', fontWeight: 600, color: '#fff' }}>LED Indicators</td>
                  <td style={{ padding: '0.55rem 0.75rem' }}>Local status feedback: Green (Normal), Amber (Warning), Red (Intrusion)</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 9.2 Privacy & Limitations */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Layers size={18} style={{ color: '#38bdf8' }} />
              Privacy-First Design Principles (Section 9.2)
            </h4>
            <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '10px', padding: '1rem', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0, marginTop: '0.1rem' }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <strong style={{ color: '#fff' }}>No Optical Video Processing:</strong> Unlike surveillance cameras, ToF distance sensors measure photons of flight time. Facial features, expressions, and identities are physically impossible to capture.
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0, marginTop: '0.1rem' }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <strong style={{ color: '#fff' }}>Objective Physical Geometry:</strong> Only distance deviations (in millimeters) are processed. No psychological profiling, attention scores, or emotional inferences.
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0, marginTop: '0.1rem' }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <strong style={{ color: '#fff' }}>Dual Infrastructure Reuse:</strong> Maximizes economic feasibility by reusing identical classroom hardware nodes for after-hours spatial asset protection.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
