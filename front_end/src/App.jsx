import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ModeBanner from './components/ModeBanner';
import StatsOverview from './components/StatsOverview';
import NodeGrid from './components/NodeGrid';
import SpatialLayoutView from './components/SpatialLayoutView';
import MultiNodeAnalytics from './components/MultiNodeAnalytics';
import EventsFeed from './components/EventsFeed';
import RegisterNodeModal from './components/RegisterNodeModal';
import CalibrateModal from './components/CalibrateModal';
import TelemetryChartModal from './components/TelemetryChartModal';
import VirtualNodeSimulator from './components/VirtualNodeSimulator';
import ProposalSpecsModal from './components/ProposalSpecsModal';

import { 
  getSystemStatus, 
  setSystemMode, 
  getAllNodes, 
  getAllEvents, 
  connectSocket,
  registerNode 
} from './api/api';
import { audioAlerts } from './utils/audioAlert';

import { 
  LayoutDashboard, 
  MapPin, 
  BarChart3, 
  AlertOctagon, 
  BookOpen, 
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  X
} from 'lucide-react';

export default function App() {
  const [systemMode, setSystemModeState] = useState('classroom_mode');
  const [nodes, setNodes] = useState([]);
  const [events, setEvents] = useState([]);
  const [telemetryByNode, setTelemetryByNode] = useState({});
  const [latestTelemetry, setLatestTelemetry] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'spatial' | 'analytics' | 'events'

  // Modals state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isSpecsOpen, setIsSpecsOpen] = useState(false);
  const [calibratingNode, setCalibratingNode] = useState(null);
  const [historyNode, setHistoryNode] = useState(null);
  const [toastAlert, setToastAlert] = useState(null);

  // Fetch initial system data
  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [sysRes, nodesRes, eventsRes] = await Promise.allSettled([
        getSystemStatus(),
        getAllNodes(),
        getAllEvents()
      ]);

      if (sysRes.status === 'fulfilled' && sysRes.value.settings?.global_mode) {
        setSystemModeState(sysRes.value.settings.global_mode);
      }

      if (nodesRes.status === 'fulfilled' && nodesRes.value.nodes) {
        setNodes(nodesRes.value.nodes);
      }

      if (eventsRes.status === 'fulfilled' && eventsRes.value.events) {
        setEvents(eventsRes.value.events);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Seed sample nodes if DB is brand new
  const handleSeedSampleNodes = async () => {
    try {
      setIsRefreshing(true);
      const samples = [
        { device_mac: '24:6F:28:B4:42:01', label: 'Desk 01 - Row 1', location_zone: 'Zone A - Center Front', baseline_distance: 500, threshold_distance: 150 },
        { device_mac: '24:6F:28:B4:42:02', label: 'Desk 02 - Row 1', location_zone: 'Zone A - Right Window', baseline_distance: 520, threshold_distance: 140 },
        { device_mac: '24:6F:28:C8:11:03', label: 'Desk 03 - Row 2', location_zone: 'Zone B - Center Mid', baseline_distance: 480, threshold_distance: 150 },
        { device_mac: '24:6F:28:C8:11:04', label: 'Desk 04 - Row 2', location_zone: 'Zone B - Left Wall', baseline_distance: 510, threshold_distance: 160 },
        { device_mac: '24:6F:28:D9:90:05', label: 'Lab Bench - PC Station 1', location_zone: 'Lab 402 - North Zone', baseline_distance: 650, threshold_distance: 120 },
        { device_mac: '24:6F:28:D9:90:06', label: 'Lab Bench - Oscilloscope Rack', location_zone: 'Lab 402 - Equipment Bay', baseline_distance: 700, threshold_distance: 100 }
      ];

      for (const item of samples) {
        await registerNode(item).catch(() => {});
      }
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Switch operating mode
  const handleToggleMode = async (newMode) => {
    try {
      await setSystemMode(newMode);
      setSystemModeState(newMode);
    } catch (err) {
      console.error('Error toggling system mode:', err);
    }
  };

  // Toggle audio alerts
  const handleToggleAudio = () => {
    const nextState = !isAudioEnabled;
    setIsAudioEnabled(nextState);
    audioAlerts.toggle(nextState);
  };

  // Socket.IO real-time hooks
  useEffect(() => {
    loadData();

    const socket = connectSocket({
      onConnectChange: (connected) => {
        setIsConnected(connected);
      },
      onSystemChanged: (payload) => {
        if (payload?.global_mode) {
          setSystemModeState(payload.global_mode);
        }
      },
      onTelemetryUpdate: (data) => {
        setLatestTelemetry(data);
        if (data.node_id) {
          setTelemetryByNode(prev => ({
            ...prev,
            [data.node_id]: data
          }));
        }
      },
      onAlertEvent: (newAlert) => {
        // Prepend to events list
        setEvents(prev => [newAlert, ...prev]);

        // Trigger Audio Warning / Alarm
        if (newAlert.event_type === 'intrusion_alert') {
          audioAlerts.playIntrusionAlarm();
        } else {
          audioAlerts.playPostureWarning();
        }

        // Show toast alert
        setToastAlert(newAlert);
        setTimeout(() => {
          setToastAlert(null);
        }, 6000);
      }
    });

    return () => {
      // Keep socket open
    };
  }, [loadData]);

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.5rem 1.25rem' }}>
      {/* Toast Alert Popup */}
      {toastAlert && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 9999,
          background: toastAlert.event_type === 'intrusion_alert' ? '#1c0a0f' : '#1c1308',
          border: `1px solid ${toastAlert.event_type === 'intrusion_alert' ? '#f43f5e' : '#f59e0b'}`,
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
          maxWidth: '420px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.85rem',
          animation: 'modal-enter 0.3s ease-out'
        }}>
          <div style={{ 
            padding: '0.4rem', 
            borderRadius: '8px', 
            background: toastAlert.event_type === 'intrusion_alert' ? 'rgba(244,63,94,0.2)' : 'rgba(245,158,11,0.2)',
            color: toastAlert.event_type === 'intrusion_alert' ? '#fb7185' : '#fbbf24'
          }}>
            {toastAlert.event_type === 'intrusion_alert' ? <ShieldAlert size={22} /> : <AlertTriangle size={22} />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ 
                fontWeight: 800, 
                fontSize: '0.85rem', 
                textTransform: 'uppercase', 
                color: toastAlert.event_type === 'intrusion_alert' ? '#fb7185' : '#fbbf24' 
              }}>
                {toastAlert.event_type?.replace('_', ' ')}
              </span>
              <button 
                onClick={() => setToastAlert(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#fff', marginTop: '0.25rem' }}>
              {toastAlert.message}
            </p>
          </div>
        </div>
      )}

      {/* Top Header */}
      <Header
        systemMode={systemMode}
        onToggleMode={handleToggleMode}
        isConnected={isConnected}
        isAudioEnabled={isAudioEnabled}
        onToggleAudio={handleToggleAudio}
        onOpenRegister={() => setIsRegisterOpen(true)}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onRefresh={loadData}
        isRefreshing={isRefreshing}
      />

      {/* Operating Mode Banner */}
      <ModeBanner systemMode={systemMode} />

      {/* High-Level Stats Overview */}
      <StatsOverview 
        nodes={nodes}
        events={events}
        systemMode={systemMode}
        latestTelemetry={latestTelemetry}
      />

      {/* Primary Dashboard Navigation Tabs */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        flexWrap: 'wrap', 
        gap: '0.75rem',
        marginBottom: '1.25rem',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '0.75rem'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('overview')}
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          >
            <LayoutDashboard size={17} />
            <span>Desks & Node Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('spatial')}
            className={`tab-btn ${activeTab === 'spatial' ? 'active' : ''}`}
          >
            <MapPin size={17} />
            <span>Classroom Spatial Floorplan</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          >
            <BarChart3 size={17} />
            <span>Multi-Node Ranging Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('events')}
            className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`}
          >
            <AlertOctagon size={17} />
            <span>Audit & Event Feed ({events.length})</span>
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {nodes.length === 0 && (
            <button
              onClick={handleSeedSampleNodes}
              className="btn btn-secondary btn-sm"
              style={{ color: '#38bdf8', borderColor: 'rgba(56,189,248,0.3)' }}
            >
              <Sparkles size={14} />
              <span>Seed Sample Classroom Desks</span>
            </button>
          )}

          <button
            onClick={() => setIsSpecsOpen(true)}
            className="btn btn-secondary btn-sm"
            style={{ color: '#94a3b8' }}
          >
            <BookOpen size={14} />
            <span>UITS Proposal Specs</span>
          </button>
        </div>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'overview' && (
        <>
          <NodeGrid
            nodes={nodes}
            telemetryByNode={telemetryByNode}
            onCalibrate={(node) => setCalibratingNode(node)}
            onViewHistory={(node) => setHistoryNode(node)}
            onSimulateNode={(node) => {
              setIsSimulatorOpen(true);
            }}
            systemMode={systemMode}
          />
          <EventsFeed events={events.slice(0, 5)} />
        </>
      )}

      {activeTab === 'spatial' && (
        <SpatialLayoutView
          nodes={nodes}
          telemetryByNode={telemetryByNode}
          onSelectNode={(node) => setHistoryNode(node)}
          systemMode={systemMode}
        />
      )}

      {activeTab === 'analytics' && (
        <MultiNodeAnalytics
          nodes={nodes}
          telemetryByNode={telemetryByNode}
          systemMode={systemMode}
        />
      )}

      {activeTab === 'events' && (
        <EventsFeed events={events} />
      )}

      {/* Modals */}
      {isRegisterOpen && (
        <RegisterNodeModal
          onClose={() => setIsRegisterOpen(false)}
          onRegistered={loadData}
        />
      )}

      {calibratingNode && (
        <CalibrateModal
          node={calibratingNode}
          onClose={() => setCalibratingNode(null)}
          onUpdated={loadData}
        />
      )}

      {historyNode && (
        <TelemetryChartModal
          node={historyNode}
          onClose={() => setHistoryNode(null)}
          systemMode={systemMode}
        />
      )}

      {isSimulatorOpen && (
        <VirtualNodeSimulator
          nodes={nodes}
          selectedNode={historyNode || calibratingNode}
          onClose={() => setIsSimulatorOpen(false)}
          systemMode={systemMode}
        />
      )}

      {isSpecsOpen && (
        <ProposalSpecsModal
          onClose={() => setIsSpecsOpen(false)}
        />
      )}

      {/* Academic Project Footer */}
      <footer style={{
        marginTop: '3.5rem',
        paddingTop: '1.5rem',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        fontSize: '0.78rem',
        color: 'var(--text-muted)'
      }}>
        <div>
          <strong style={{ color: '#fff' }}>SentraClass</strong>: A Privacy-Preserving IoT Framework for Classroom Monitoring & Spatial Security
        </div>
        <div>
          University of Information Technology and Sciences (UITS) • Dept. of CSE • Course: CSE402
        </div>
      </footer>
    </div>
  );
}
