import { io } from 'socket.io-client';

export const BACKEND_URL = 'http://localhost:5000';

export async function getSystemStatus() {
  const res = await fetch(`${BACKEND_URL}/system/status`);
  if (!res.ok) throw new Error('Failed to fetch system status');
  return res.json();
}

export async function setSystemMode(mode) {
  const res = await fetch(`${BACKEND_URL}/system/setmode`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode })
  });
  if (!res.ok) throw new Error('Failed to update system mode');
  return res.json();
}

export async function getAllNodes() {
  const res = await fetch(`${BACKEND_URL}/nodes`);
  if (!res.ok) throw new Error('Failed to fetch nodes');
  return res.json();
}

export async function registerNode(nodeData) {
  const res = await fetch(`${BACKEND_URL}/nodes/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(nodeData)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to register node');
  }
  return res.json();
}

export async function calibrateNode(nodeId, updates) {
  const res = await fetch(`${BACKEND_URL}/nodes/calibrate/${nodeId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error('Failed to calibrate node');
  return res.json();
}

export async function getAllEvents() {
  const res = await fetch(`${BACKEND_URL}/system/events`);
  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json();
}

export async function getTelemetryHistory(nodeId) {
  const res = await fetch(`${BACKEND_URL}/telemetry/history/${nodeId}`);
  if (!res.ok) throw new Error('Failed to fetch telemetry history');
  return res.json();
}

export async function ingestTelemetry(data) {
  const res = await fetch(`${BACKEND_URL}/telemetry/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to ingest telemetry');
  }
  return res.json();
}

let socketInstance = null;

export function connectSocket({ onSystemChanged, onTelemetryUpdate, onAlertEvent, onConnectChange }) {
  if (!socketInstance) {
    socketInstance = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000
    });

    socketInstance.on('connect', () => {
      console.log('Connected to SentraClass Socket.IO server:', socketInstance.id);
      if (onConnectChange) onConnectChange(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from SentraClass Socket.IO server');
      if (onConnectChange) onConnectChange(false);
    });

    socketInstance.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
      if (onConnectChange) onConnectChange(false);
    });
  }

  if (onSystemChanged) {
    socketInstance.off('system_changed');
    socketInstance.on('system_changed', onSystemChanged);
  }

  if (onTelemetryUpdate) {
    socketInstance.off('telemetry_update');
    socketInstance.on('telemetry_update', onTelemetryUpdate);
  }

  if (onAlertEvent) {
    socketInstance.off('alert_event');
    socketInstance.on('alert_event', onAlertEvent);
  }

  return socketInstance;
}
