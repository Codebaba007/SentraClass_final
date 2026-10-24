import React, { useState } from 'react';
import { X, Sliders, CheckCircle2, AlertCircle } from 'lucide-react';
import { calibrateNode } from '../api/api';

export default function CalibrateModal({ node, onClose, onUpdated }) {
  const [baseline, setBaseline] = useState(node.baseline_distance || 500);
  const [threshold, setThreshold] = useState(node.threshold_distance || 150);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await calibrateNode(node.id, {
        baseline_distance: parseFloat(baseline),
        threshold_distance: parseFloat(threshold)
      });
      onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to calibrate node');
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
            <Sliders size={20} style={{ color: '#38bdf8' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
              Calibrate Node: {node.label || node.device_mac}
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

          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Calibrate the normal sitting baseline distance (mm) and the acceptable deviation tolerance before triggering posture warnings (in Classroom Mode) or intrusion alerts (in Security Mode).
          </p>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#fff', marginBottom: '0.4rem' }}>
              Baseline Distance (mm)
            </label>
            <input 
              type="number"
              step="1"
              min="50"
              max="2000"
              required
              value={baseline}
              onChange={e => setBaseline(e.target.value)}
              className="input-field mono-font"
              placeholder="e.g. 500"
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'block' }}>
              Calibrated distance between ToF sensor and student in standard sitting posture
            </span>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#fff', marginBottom: '0.4rem' }}>
              Allowed Deviation Threshold (± mm)
            </label>
            <input 
              type="number"
              step="1"
              min="10"
              max="1000"
              required
              value={threshold}
              onChange={e => setThreshold(e.target.value)}
              className="input-field mono-font"
              placeholder="e.g. 150"
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'block' }}>
              Maximum acceptable displacement before classifying sustained posture deviation
            </span>
          </div>

          {/* Quick presets */}
          <div style={{ marginBottom: '1.5rem', background: 'rgba(0,0,0,0.25)', padding: '0.75rem', borderRadius: '10px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>QUICK PRESETS:</div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => { setBaseline(500); setThreshold(150); }}
              >
                Standard Desk (500±150mm)
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => { setBaseline(650); setThreshold(120); }}
              >
                Lab PC Bench (650±120mm)
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => { setBaseline(400); setThreshold(80); }}
              >
                High Sensitivity (400±80mm)
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              <CheckCircle2 size={16} />
              <span>{isSubmitting ? 'Saving Calibration...' : 'Save Calibration'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
