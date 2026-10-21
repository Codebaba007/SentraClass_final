"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, fetchDashboardData, type DashboardData } from "@/lib/api";
import type { Bench, DashboardMode } from "@/models/classroom";
import { Icon } from "./icon";

const navItems = [["classroom", "Classroom", "grid"], ["security", "Security", "shield"], ["devices", "Devices", "devices"], ["events", "Events", "events"], ["settings", "Settings", "settings"]] as const;
const stateLabel: Record<Bench["state"], string> = { reported: "Telemetry available", unavailable: "Measurement unavailable", "no-telemetry": "No telemetry", unassigned: "Unassigned" };

function BenchTile({ bench, selected, onSelect }: { bench: Bench; selected: boolean; onSelect: (bench: Bench) => void }) {
  return <button className={`bench bench--${bench.state} ${selected ? "bench--selected" : ""}`} onClick={() => onSelect(bench)} aria-pressed={selected} aria-label={`${bench.label}: ${stateLabel[bench.state]}`}>
    <span className="bench__status" aria-hidden="true" /><span className="bench__label">{bench.label}</span><span className="bench__state">{stateLabel[bench.state]}</span>
  </button>;
}

function BenchDetails({ bench, onClose }: { bench: Bench; onClose: () => void }) {
  const detail = bench.state === "unassigned" ? "No device is assigned to this bench." : bench.state === "no-telemetry" ? "Device is registered; no telemetry has been received." : bench.state === "unavailable" ? "Latest telemetry did not contain a valid distance measurement." : "A distance measurement was reported. No alert or attention inference is available.";
  return <aside className="details" aria-label="Selected bench details">
    <div className="details__title"><div><p className="eyebrow">{bench.source ? `${bench.source.toUpperCase()} DEVICE` : "BENCH POSITION"}</p><h2>{bench.label}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close bench details"><Icon name="close" /></button></div>
    <div className={`details__status details__status--${bench.state}`}><span className="status-dot" /><div><strong>{stateLabel[bench.state]}</strong><p>{detail}</p></div></div>
    <dl className="spec-list">
      <div><dt>Device ID</dt><dd>{bench.deviceId ?? "Not assigned"}</dd></div>
      <div><dt>Source</dt><dd>{bench.source ?? "—"}</dd></div>
      <div><dt>Current distance</dt><dd>{bench.distanceMm !== undefined ? `${bench.distanceMm} mm` : "Unavailable"}</dd></div>
      <div><dt>Last observation</dt><dd>{bench.lastSeen ? new Date(bench.lastSeen).toLocaleString() : "No telemetry"}</dd></div>
    </dl>
    <div className="details__note"><span className="status-dot" /> Distance alone does not indicate attention, concentration, fatigue, or security events.</div>
  </aside>;
}

export function Dashboard({ onSignOut }: { onSignOut: () => void }) {
  const [mode, setMode] = useState<DashboardMode>("classroom");
  const [activeSection, setActiveSection] = useState("classroom");
  const [data, setData] = useState<DashboardData | null>(null);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string | null>(null);
  const [selectedBenchId, setSelectedBenchId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchDashboardData(selectedClassroomId ?? undefined).then((result) => {
      if (!active) return;
      setData(result); setError(null);
      if (selectedClassroomId === null && result.classrooms[0]) setSelectedClassroomId(result.classrooms[0].id);
      setSelectedBenchId((current) => result.benches.some((bench) => bench.id === current) ? current : result.benches[0]?.id ?? null);
    }).catch((cause: unknown) => { if (active) setError(cause instanceof ApiError ? cause.message : "Unable to load dashboard data."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [refreshKey, selectedClassroomId]);

  const retry = useCallback(() => setRefreshKey((key) => key + 1), []);
  const benches = data?.benches ?? [];
  const selectedBench = benches.find((bench) => bench.id === selectedBenchId) ?? null;
  const rooms = data?.classrooms ?? [];
  const selectedRoom = rooms.find((room) => room.id === selectedClassroomId) ?? rooms[0];
  const selectMode = (nextMode: DashboardMode) => { setMode(nextMode); setActiveSection(nextMode); };

  return <main className="shell">
    <aside className="sidebar" aria-label="Primary navigation">
      <div className="brand"><span className="brand__mark"><Icon name="cap" size={30} /></span><div><strong>SentraClass</strong><span>Spatial monitoring</span></div></div>
      <nav>{navItems.map(([key, label, icon]) => <button key={key} className={`nav-item ${activeSection === key ? "nav-item--active" : ""}`} onClick={() => { setActiveSection(key); if (key === "classroom" || key === "security") selectMode(key); }}><Icon name={icon} /><span>{label}</span><Icon name="chevron" size={16} /></button>)}</nav>
      <div className="sidebar__foot"><span className="sim-badge">API DATA</span><p>Mode selection is temporary UI state.</p><button className="sign-out-button" onClick={onSignOut}>Sign out</button></div>
    </aside>
    <section className="workspace">
      <header className="topbar">
        <div className="mode-tabs" role="tablist" aria-label="Monitoring mode">{(["classroom", "security"] as DashboardMode[]).map((item) => <button key={item} role="tab" aria-selected={mode === item} className={`mode-tab ${mode === item ? "mode-tab--active" : ""}`} onClick={() => selectMode(item)}><Icon name={item === "classroom" ? "cap" : "shield"} /><span>{item === "classroom" ? "Classroom" : "Security"} Mode</span></button>)}</div>
        <div className="connection-summary">{rooms.length > 1 && <label>Classroom <select aria-label="Select classroom" value={selectedClassroomId ?? ""} onChange={(event) => setSelectedClassroomId(event.target.value)}>{rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}</select></label>}<span className="status-dot" /><strong>{data?.devices.length ?? 0} registered devices</strong><span>{data?.events.length ?? 0} events</span><button className="refresh-button" onClick={retry} disabled={loading} aria-label="Refresh dashboard data">Refresh</button></div>
      </header>
      <div className="mode-description"><span className="sim-badge">{loading ? "LOADING API DATA" : "LIVE API DATA"}</span><p>{mode === "classroom" ? "Classroom view · no detection or attention inference is implemented." : "Security view · temporary display selection; no persisted mode or intrusion detection."}</p></div>
      {loading && !data ? <div className="page-state" role="status">Loading classroom, benches, devices, and events…</div> : error && !data ? <div className="page-state page-state--error" role="alert"><p>{error}</p><button className="refresh-button" onClick={retry}>Retry</button></div> : rooms.length === 0 ? <div className="page-state">No classrooms are available from the API.</div> : <div className="dashboard-grid">
        <section className="classroom-card" aria-label="Classroom bench layout">
          <div className="classroom-card__header"><div><p className="eyebrow">{selectedRoom?.name.toUpperCase()} · {benches.length} BENCHES</p><h1>{mode === "classroom" ? "Classroom Mode" : "Security Mode"}</h1></div><span className="live-indicator"><i /> API snapshot</span></div>
          {error && <div role="alert" className="inline-error">Refresh failed: {error} <button className="refresh-button" onClick={retry}>Retry</button></div>}
          {benches.length === 0 ? <div className="page-state">No benches are configured for this classroom.</div> : <div className="classroom-layout"><div className="teacher-zone">Instructor zone</div><div className="column-labels" aria-hidden="true">{["A", "B", "C", "D", "E"].map((label) => <span key={label}>{label}</span>)}</div><div className="row-labels" aria-hidden="true">{[1, 2, 3].map((label) => <span key={label}>{label}</span>)}</div><div className="bench-grid">{benches.map((bench) => <BenchTile key={bench.id} bench={bench} selected={selectedBench?.id === bench.id} onSelect={(item) => setSelectedBenchId(item.id)} />)}</div></div>}
          <div className="legend" aria-label="Bench state legend">{(["reported", "unavailable", "no-telemetry", "unassigned"] as Bench["state"][]).map((state) => <div key={state}><span className={`legend__dot legend__dot--${state}`} /><span>{stateLabel[state]}</span></div>)}</div>
          <div className="events-summary"><h2>Recent events</h2>{data?.events.length ? <ul>{data.events.map((event) => <li key={event.id}>{event.severity}: {event.description} · {new Date(event.createdAt).toLocaleString()}</li>)}</ul> : <p>No events recorded.</p>}</div>
        </section>
        {selectedBench ? <BenchDetails bench={selectedBench} onClose={() => setSelectedBenchId(null)} /> : <aside className="details details--empty"><Icon name="grid" size={34} /><h2>{benches.length ? "Select a bench" : "No benches"}</h2><p>{benches.length ? "Choose a position in the grid to inspect reported data." : "This classroom has no configured bench positions."}</p></aside>}
      </div>}
    </section>
  </main>;
}
