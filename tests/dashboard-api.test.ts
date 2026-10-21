import assert from "node:assert/strict";
import test from "node:test";
import { fetchDashboardData } from "../lib/api.js";

const classroom = { id: "room-204", name: "Room 204", mode: "classroom", benchCount: 2 };
const bench = (id: string, label: string, device: unknown) => ({ id, classroomId: classroom.id, label, row: 1, column: label === "A1" ? 1 : 2, active: true, device });

test("maps unassigned benches and registered devices without telemetry honestly", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    const url = String(input);
    const data = url.endsWith("/api/classrooms") ? [classroom]
      : url.endsWith("/api/devices") ? [{ id: "device-1", externalId: "SC-NODE-001", source: "simulated", benchId: "bench-a1", lastSeen: null, lastDistanceMm: null, lastMeasurementStatus: null }]
      : url.endsWith("/api/events?limit=50") ? []
      : [bench("bench-a1", "A1", { externalId: "SC-NODE-001", source: "simulated", readings: [] }), bench("bench-b1", "B1", null)];
    return new Response(JSON.stringify({ data }), { status: 200, headers: { "Content-Type": "application/json" } });
  };
  try {
    const result = await fetchDashboardData();
    assert.equal(result.benches.length, 2);
    assert.equal(result.benches[0]?.state, "no-telemetry");
    assert.equal(result.benches[0]?.distanceMm, undefined);
    assert.equal(result.benches[0]?.lastSeen, undefined);
    assert.equal(result.benches[1]?.state, "unassigned");
    assert.equal(result.benches[1]?.deviceId, undefined);
    assert.equal(result.devices[0]?.lastSeen, null);
    assert.deepEqual(result.events, []);
  } finally { globalThis.fetch = originalFetch; }
});

test("rejects malformed API collection envelopes instead of fabricating data", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ data: {} }), { status: 200 });
  try { await assert.rejects(fetchDashboardData(), /invalid classrooms response/); }
  finally { globalThis.fetch = originalFetch; }
});
