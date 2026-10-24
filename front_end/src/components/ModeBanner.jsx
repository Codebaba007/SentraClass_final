import React from 'react';
import { GraduationCap, ShieldAlert, AlertTriangle, EyeOff, Radio } from 'lucide-react';

export default function ModeBanner({ systemMode }) {
  const isSecurity = systemMode === 'security_mode';

  return (
    <div 
      className="glass-panel" 
      style={{ 
        padding: '1rem 1.5rem', 
        marginBottom: '1.5rem',
        borderLeft: isSecurity ? '4px solid #f43f5e' : '4px solid #38bdf8',
        background: isSecurity ? 'rgba(244, 63, 94, 0.04)' : 'rgba(56, 189, 248, 0.04)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
        <div style={{ 
          padding: '0.5rem', 
          borderRadius: '10px', 
          background: isSecurity ? 'rgba(244, 63, 94, 0.15)' : 'rgba(56, 189, 248, 0.15)',
          color: isSecurity ? '#fb7185' : '#38bdf8'
        }}>
          {isSecurity ? <ShieldAlert size={22} /> : <GraduationCap size={22} />}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
              {isSecurity ? 'Active Mode: Spatial Security & Zone Intrusion Detection' : 'Active Mode: Classroom Desk & Posture Monitoring'}
            </h3>
            <span style={{ 
              fontSize: '0.7rem', 
              fontFamily: 'var(--font-mono)', 
              fontWeight: 700,
              padding: '0.2rem 0.5rem',
              borderRadius: '9999px',
              background: isSecurity ? 'rgba(244,63,94,0.2)' : 'rgba(56,189,248,0.2)',
              color: isSecurity ? '#fb7185' : '#38bdf8'
            }}>
              {isSecurity ? 'SEC-ARMED' : 'CLS-ACTIVE'}
            </span>
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.2rem', maxWidth: '820px' }}>
            {isSecurity 
              ? 'After-hours surveillance armed across all lab benches and equipment zones. Any sustained distance deviation above threshold triggers local buzzer alerts and central intrusion logs.'
              : 'Continuous physical distance tracking active. Temporal filtering identifies sitting baseline changes, detecting prolonged slouching or posture deviation while strictly safeguarding student privacy.'
            }
          </p>
        </div>
      </div>

      {/* Badges / Guarantees */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.4rem', 
          background: 'rgba(255,255,255,0.04)', 
          padding: '0.35rem 0.75rem', 
          borderRadius: '8px', 
          border: '1px solid var(--border-color)',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)'
        }}>
          <EyeOff size={14} style={{ color: '#10b981' }} />
          <span>Zero Video / Facial Storage</span>
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.4rem', 
          background: 'rgba(255,255,255,0.04)', 
          padding: '0.35rem 0.75rem', 
          borderRadius: '8px', 
          border: '1px solid var(--border-color)',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)'
        }}>
          <Radio size={14} style={{ color: '#38bdf8' }} />
          <span>VL53L0X Time-of-Flight (ToF)</span>
        </div>
      </div>
    </div>
  );
}
