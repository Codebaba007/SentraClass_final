import React from 'react';
import { 
  ShieldAlert, 
  GraduationCap, 
  Activity, 
  Volume2, 
  VolumeX, 
  PlusCircle, 
  Cpu, 
  Wifi, 
  WifiOff, 
  RefreshCw 
} from 'lucide-react';

export default function Header({ 
  systemMode, 
  onToggleMode, 
  isConnected, 
  isAudioEnabled, 
  onToggleAudio, 
  onOpenRegister, 
  onOpenSimulator,
  onRefresh,
  isRefreshing 
}) {
  const isSecurity = systemMode === 'security_mode';

  return (
    <header className="glass-panel" style={{ padding: '1rem 1.75rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
      {/* Brand & Subtitle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ 
          width: '46px', 
          height: '46px', 
          borderRadius: '12px', 
          background: isSecurity 
            ? 'linear-gradient(135deg, rgba(244,63,94,0.2) 0%, rgba(225,29,72,0.4) 100%)' 
            : 'linear-gradient(135deg, rgba(56,189,248,0.2) 0%, rgba(2,132,199,0.4) 100%)',
          border: isSecurity ? '1px solid rgba(244,63,94,0.5)' : '1px solid rgba(56,189,248,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isSecurity ? '#fb7185' : '#38bdf8',
          boxShadow: isSecurity ? '0 0 16px rgba(244,63,94,0.25)' : '0 0 16px rgba(56,189,248,0.25)'
        }}>
          {isSecurity ? <ShieldAlert size={26} /> : <Activity size={26} />}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
              Sentra<span style={{ color: isSecurity ? '#fb7185' : '#38bdf8' }}>Class</span>
            </h1>
            <span style={{ 
              fontSize: '0.7rem', 
              fontFamily: 'var(--font-mono)', 
              background: 'rgba(255,255,255,0.06)', 
              padding: '0.15rem 0.5rem', 
              borderRadius: '6px', 
              color: 'var(--text-secondary)' 
            }}>
              v1.0 IoT Core
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
            Privacy-Preserving ToF Classroom Monitoring & Spatial Security
          </p>
        </div>
      </div>

      {/* Central Mode Switcher */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        background: 'rgba(0,0,0,0.35)', 
        padding: '0.3rem', 
        borderRadius: '14px', 
        border: '1px solid rgba(255,255,255,0.08)' 
      }}>
        <button
          onClick={() => isSecurity && onToggleMode('classroom_mode')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '10px',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: !isSecurity ? 'linear-gradient(135deg, #0284c7, #0369a1)' : 'transparent',
            color: !isSecurity ? '#fff' : 'var(--text-secondary)',
            boxShadow: !isSecurity ? '0 2px 10px rgba(2,132,199,0.4)' : 'none'
          }}
        >
          <GraduationCap size={17} />
          Classroom Mode
        </button>

        <button
          onClick={() => !isSecurity && onToggleMode('security_mode')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '10px',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: isSecurity ? 'linear-gradient(135deg, #e11d48, #be123c)' : 'transparent',
            color: isSecurity ? '#fff' : 'var(--text-secondary)',
            boxShadow: isSecurity ? '0 2px 10px rgba(225,29,72,0.4)' : 'none'
          }}
        >
          <ShieldAlert size={17} />
          Security Mode
        </button>
      </div>

      {/* Action Controls & Indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        {/* Socket.io Connectivity indicator */}
        <div 
          title={isConnected ? 'Backend WebSocket Connected' : 'Backend WebSocket Disconnected'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 0.75rem',
            borderRadius: '9999px',
            background: isConnected ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            border: isConnected ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(239,68,68,0.25)',
            fontSize: '0.78rem',
            fontFamily: 'var(--font-mono)',
            color: isConnected ? '#34d399' : '#f87171'
          }}
        >
          {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
          <span>{isConnected ? 'LIVE' : 'DISCONNECTED'}</span>
          <span className={`pulse-dot ${isConnected ? 'online' : 'danger'}`} />
        </div>

        {/* Audio Toggle */}
        <button 
          onClick={onToggleAudio}
          className="btn btn-secondary btn-sm"
          title={isAudioEnabled ? 'Mute synthesized alerts' : 'Enable synthesized alerts'}
          style={{ padding: '0.45rem' }}
        >
          {isAudioEnabled ? <Volume2 size={17} style={{ color: '#38bdf8' }} /> : <VolumeX size={17} style={{ color: 'var(--text-muted)' }} />}
        </button>

        {/* Manual Refresh */}
        <button 
          onClick={onRefresh}
          className="btn btn-secondary btn-sm"
          title="Refresh telemetry & nodes"
          style={{ padding: '0.45rem' }}
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
        </button>

        {/* Hardware Testbench / Virtual ESP32 Simulator */}
        <button 
          onClick={onOpenSimulator}
          className="btn btn-secondary btn-sm"
          style={{ borderColor: 'rgba(56,189,248,0.3)', color: '#38bdf8' }}
        >
          <Cpu size={15} />
          <span>ESP32 Simulator</span>
        </button>

        {/* Register Node button */}
        <button 
          onClick={onOpenRegister}
          className="btn btn-primary btn-sm"
        >
          <PlusCircle size={15} />
          <span>Register Node</span>
        </button>
      </div>
    </header>
  );
}
