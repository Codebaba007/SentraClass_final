import React, { useState } from 'react';
import { X, PlusCircle, Cpu, AlertCircle, Wand2 } from 'lucide-react';
import { registerNode } from '../api/api';

export default function RegisterNodeModal({ onClose, onRegistered }) {
  const [deviceMac, setDeviceMac] = useState('');
  const [label, setLabel] = useState('');
  const [locationZone, setLocationZone] = useState('');
  const [baseline, setBaseline] = useState(500);
  const [threshold, setThreshold] = useState(150);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Helper to generate a realistic random ESP32 MAC address
  const generateRandomMac = () => {
    const hex = () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase();
    const mac = `24:6F:28:${hex()}:${hex()}:${hex()}`;
    setDeviceMac(mac);
    if (!label) setLabel(`Desk ${Math.floor(Math.random() * 20) + 1}`);
    if (!locationZone) setLocationZone(`Zone ${String.fromCharCode(65 + Math.floor(Math.random() * 4))} - Room 402`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await registerNode({
        device_mac: deviceMac.trim(),
        label: label.trim() || undefined,
        location_zone: locationZone.trim() || undefined,
        baseline_distance: parseFloat(baseline) || 500,
        threshold_distance: parseFloat(threshold) || 150
      });
      onRegistered();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to register node');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ 
          padding: '1.25rem 1.5rem', 
          borderBottom: '1px solid var(--border-color)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Cpu size={20} style={{ color: '#38bdf8' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
              Register ESP32 Sensing Node
            </h3>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem' }}>
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {error && (
            <div style={{ 
              background: 'rgba(239,68,68,0.15)', 
              border: '1px solid rgba(239,68,68,0.3)', 
              color: '#f87171', 
              padding: '0.75rem', 
              borderRadius: '8px', 
              marginBottom: '1rem',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>
              Device MAC Address *
            </label>
            <button 
              type="button" 
              onClick={generateRandomMac}
              className="btn btn-secondary btn-sm" 
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
            >
              <Wand2 size={13} style={{ color: '#38bdf8' }} />
              Auto-Generate MAC
            </button>
          </div>
          <input 
            type="text" 
            required
            value={deviceMac}
            onChange={e => setDeviceMac(e.target.value)}
            className="input-field mono-font"
            placeholder="e.g. 24:6F:28:B4:42:01"
            style={{ marginBottom: '1.1rem' }}
          />

          <div style={{ marginBottom: '1.1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#fff', marginBottom: '0.4rem' }}>
              Node Label / Desk Identifier
            </label>
            <input 
              type="text" 
              value={label}
              onChange={e => setLabel(e.target.value)}
              className="input-field"
              placeholder="e.g. Desk 01 - Row 1, or Lab Bench A"
            />
          </div>

          <div style={{ marginBottom: '1.1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#fff', marginBottom: '0.4rem' }}>
              Location Zone
            </label>
            <input 
              type="text" 
              value={locationZone}
              onChange={e => setLocationZone(e.target.value)}
              className="input-field"
              placeholder="e.g. Classroom 402, or Hardware Lab 3"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#fff', marginBottom: '0.4rem' }}>
                Baseline Distance (mm)
              </label>
              <input 
                type="number" 
                step="1"
                value={baseline}
                onChange={e => setBaseline(e.target.value)}
                className="input-field mono-font"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#fff', marginBottom: '0.4rem' }}>
                Threshold Deviation (±mm)
              </label>
              <input 
                type="number" 
                step="1"
                value={threshold}
                onChange={e => setThreshold(e.target.value)}
                className="input-field mono-font"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              <PlusCircle size={16} />
              <span>{isSubmitting ? 'Registering Node...' : 'Register Node'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
