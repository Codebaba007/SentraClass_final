"use client";

import { useMemo, useState } from "react";
import { benches, modePresentations } from "@/data/mock-classroom";
import type { Bench, BenchState, DashboardMode } from "@/models/classroom";
import { Icon } from "./icon";

const navItems = [
  ["classroom", "Classroom", "grid"], ["security", "Security", "shield"], ["devices", "Devices", "devices"], ["events", "Events", "events"], ["settings", "Settings", "settings"],
] as const;

const stateOrder: BenchState[] = ["normal", "movement", "alert", "unassigned", "offline"];

function BenchTile({ bench, selected, mode, onSelect }: { bench: Bench; selected: boolean; mode: DashboardMode; onSelect: (bench: Bench) => void }) {
  const label = modePresentations[mode].stateLabels[bench.state];
  return <button className={`bench bench--${bench.state} ${selected ? "bench--selected" : ""}`} onClick={() => onSelect(bench)} aria-pressed={selected} aria-label={`${bench.label}: ${label}`}>
    <span className="bench__status" aria-hidden="true" />
    <span className="bench__label">{bench.label}</span>
    <span className="bench__state">{label}</span>
  </button>;
}

function BenchDetails({ bench, mode, onClose }: { bench: Bench; mode: DashboardMode; onClose: () => void }) {
  const presentation = modePresentations[mode];
  const stateLabel = presentation.stateLabels[bench.state];
  const deviation = bench.distanceMm && bench.baselineMm ? bench.distanceMm - bench.baselineMm : undefined;
  const isAlert = bench.state === "alert";
  return <aside className="details" aria-label="Selected bench details">
    <div className="details__title"><div><p className="eyebrow">SIMULATED DEVICE</p><h2>{bench.label}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close bench details"><Icon name="close" /></button></div>
    <div className={`details__status details__status--${bench.state}`}><span className="status-dot" /><div><strong>{stateLabel}</strong><p>{isAlert && mode === "classroom" ? presentation.alertTitle : presentation.stateDescriptions[bench.state]}</p></div></div>
    <dl className="spec-list">
      <div><dt>Device ID</dt><dd>{bench.deviceId ?? "Not assigned"}</dd></div>
      <div><dt>Telemetry source</dt><dd>Simulated</dd></div>
      <div><dt>Current distance</dt><dd>{bench.distanceMm ? `${bench.distanceMm} mm` : "Unavailable"}</dd></div>
      <div><dt>Baseline distance</dt><dd>{bench.baselineMm ? `${bench.baselineMm} mm` : "Not calibrated"}</dd></div>
      <div><dt>Deviation</dt><dd className={deviation && deviation > 0 ? "emphasis" : ""}>{deviation !== undefined ? `${deviation > 0 ? "+" : ""}${deviation} mm` : "—"}</dd></div>
      <div><dt>Last update</dt><dd>{bench.lastSeen}</dd></div>
    </dl>
    <div className="details__note"><span className="status-dot" /> Sample readings are simulated for demonstration.</div>
  </aside>;
}

export function Dashboard({ onSignOut }: { onSignOut: () => void }) {
  const [mode, setMode] = useState<DashboardMode>("classroom");
  const [activeSection, setActiveSection] = useState("classroom");
  const [selectedBench, setSelectedBench] = useState<Bench | null>(benches.find((bench) => bench.label === "B2") ?? null);
  const presentation = modePresentations[mode];
  const counts = useMemo(() => ({ online: benches.filter((bench) => bench.state !== "offline" && bench.state !== "unassigned").length, offline: benches.filter((bench) => bench.state === "offline").length }), []);
  const selectMode = (nextMode: DashboardMode) => { setMode(nextMode); setActiveSection(nextMode); };

  return <main className="shell">
    <aside className="sidebar" aria-label="Primary navigation">
      <div className="brand"><span className="brand__mark"><Icon name="cap" size={30} /></span><div><strong>SentraClass</strong><span>Spatial monitoring</span></div></div>
      <nav>{navItems.map(([key, label, icon]) => <button key={key} className={`nav-item ${activeSection === key ? "nav-item--active" : ""}`} onClick={() => { setActiveSection(key); if (key === "classroom" || key === "security") selectMode(key); }}><Icon name={icon} /><span>{label}</span><Icon name="chevron" size={16} /></button>)}</nav>
      <div className="sidebar__foot"><span className="sim-badge">SIMULATION</span><p>Phase 1 interface</p><button className="sign-out-button" onClick={onSignOut}>Sign out</button></div>
    </aside>
    <section className="workspace">
      <header className="topbar">
        <div className="mode-tabs" role="tablist" aria-label="Monitoring mode">
          {(["classroom", "security"] as DashboardMode[]).map((item) => <button key={item} role="tab" aria-selected={mode === item} className={`mode-tab ${mode === item ? "mode-tab--active" : ""}`} onClick={() => selectMode(item)}><Icon name={item === "classroom" ? "cap" : "shield"} /><span>{item === "classroom" ? "Classroom" : "Security"} Mode</span></button>)}
        </div>
        <div className="connection-summary"><span className="status-dot" /><strong>{counts.online} online</strong><span>{counts.offline} offline</span></div>
      </header>
      <div className="mode-description"><span className="sim-badge">SIMULATED DATA</span><p>{presentation.description}</p></div>
      <div className="dashboard-grid">
        <section className="classroom-card" aria-label="Classroom bench layout">
          <div className="classroom-card__header"><div><p className="eyebrow">ROOM 204 · 15 BENCHES</p><h1>{presentation.title}</h1></div><span className="live-indicator"><i /> polling demo</span></div>
          <div className="classroom-layout">
            <div className="teacher-zone">Instructor zone</div>
            <div className="column-labels" aria-hidden="true">{["A", "B", "C", "D", "E"].map((label) => <span key={label}>{label}</span>)}</div>
            <div className="row-labels" aria-hidden="true">{[1, 2, 3].map((label) => <span key={label}>{label}</span>)}</div>
            <div className="bench-grid">{benches.map((bench) => <BenchTile key={bench.id} bench={bench} mode={mode} selected={selectedBench?.id === bench.id} onSelect={setSelectedBench} />)}</div>
          </div>
          <div className="legend" aria-label="Bench state legend">{stateOrder.map((state) => <div key={state}><span className={`legend__dot legend__dot--${state}`} /><span>{presentation.stateLabels[state]}</span></div>)}</div>
        </section>
        {selectedBench ? <BenchDetails bench={selectedBench} mode={mode} onClose={() => setSelectedBench(null)} /> : <aside className="details details--empty"><Icon name="grid" size={34} /><h2>Select a bench</h2><p>Choose a position in the grid to inspect simulated device details.</p></aside>}
      </div>
    </section>
  </main>;
}
