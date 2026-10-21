import type { Bench } from "@/models/classroom";

const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:4000").replace(/\/$/, "");

export interface Classroom { id: string; name: string; mode: "classroom" | "security"; benchCount: number }
export interface Device { id: string; externalId: string; source: "simulated" | "physical"; benchId: string | null; lastSeen: string | null; lastDistanceMm: number | null; lastMeasurementStatus: string | null }
export interface Event { id: string; type: string; severity: string; description: string; createdAt: string }
export interface DashboardData { classrooms: Classroom[]; benches: Bench[]; devices: Device[]; events: Event[] }

export class ApiError extends Error {}
function record(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
function text(value: unknown): value is string { return typeof value === "string"; }
function nullableText(value: unknown): value is string | null { return value === null || text(value); }
function number(value: unknown): value is number { return typeof value === "number" && Number.isFinite(value); }
function list(value: unknown, name: string): unknown[] {
  if (!record(value) || !Array.isArray(value.data)) throw new ApiError(`The API returned an invalid ${name} response.`);
  return value.data;
}
async function get(path: string): Promise<unknown> {
  let response: Response;
  try { response = await fetch(`${baseUrl}${path}`, { headers: { Accept: "application/json" }, cache: "no-store" }); }
  catch { throw new ApiError("Could not reach the SentraClass API. Check that it is running and try again."); }
  if (!response.ok) {
    let message = `The SentraClass API returned HTTP ${response.status}.`;
    try { const body: unknown = await response.json(); if (record(body) && record(body.error) && text(body.error.message)) message = body.error.message; } catch { /* Keep the safe status message. */ }
    throw new ApiError(message);
  }
  try { return await response.json(); } catch { throw new ApiError("The SentraClass API returned invalid JSON."); }
}

function mapClassroom(value: unknown): Classroom {
  if (!record(value) || !text(value.id) || !text(value.name) || (value.mode !== "classroom" && value.mode !== "security") || !number(value.benchCount)) throw new ApiError("The API returned an invalid classroom record.");
  return { id: value.id, name: value.name, mode: value.mode, benchCount: value.benchCount };
}
function mapDevice(value: unknown): Device {
  if (!record(value) || !text(value.id) || !text(value.externalId) || (value.source !== "simulated" && value.source !== "physical") || !(value.benchId === null || text(value.benchId)) || !nullableText(value.lastSeen) || !(value.lastDistanceMm === null || number(value.lastDistanceMm)) || !nullableText(value.lastMeasurementStatus)) throw new ApiError("The API returned an invalid device record.");
  return { id: value.id, externalId: value.externalId, source: value.source, benchId: value.benchId, lastSeen: value.lastSeen, lastDistanceMm: value.lastDistanceMm, lastMeasurementStatus: value.lastMeasurementStatus };
}
function mapBench(value: unknown): Bench {
  if (!record(value) || !text(value.id) || !text(value.label) || !number(value.row) || !number(value.column)) throw new ApiError("The API returned an invalid bench record.");
  const device = value.device;
  if (device === null) return { id: value.id, label: value.label, row: value.row, column: value.column, state: "unassigned" };
  if (!record(device) || !text(device.externalId) || (device.source !== "simulated" && device.source !== "physical") || !Array.isArray(device.readings)) throw new ApiError("The API returned an invalid bench device record.");
  const latest = device.readings[0];
  if (latest === undefined) return { id: value.id, label: value.label, row: value.row, column: value.column, deviceId: device.externalId, source: device.source, state: "no-telemetry" };
  if (!record(latest) || !(latest.distanceMm === null || number(latest.distanceMm)) || typeof latest.valid !== "boolean" || !text(latest.observedAt) || (latest.source !== "simulated" && latest.source !== "physical")) throw new ApiError("The API returned an invalid telemetry record.");
  return { id: value.id, label: value.label, row: value.row, column: value.column, deviceId: device.externalId, source: device.source, state: latest.valid && latest.distanceMm !== null ? "reported" : "unavailable", distanceMm: latest.valid ? latest.distanceMm ?? undefined : undefined, lastSeen: latest.observedAt };
}
function mapEvent(value: unknown): Event {
  if (!record(value) || !text(value.id) || !text(value.type) || !text(value.severity) || !text(value.description) || !text(value.createdAt)) throw new ApiError("The API returned an invalid event record.");
  return { id: value.id, type: value.type, severity: value.severity, description: value.description, createdAt: value.createdAt };
}

export async function fetchDashboardData(classroomId?: string): Promise<DashboardData> {
  const [classroomResult, devicesResult, eventsResult] = await Promise.all([get("/api/classrooms"), get("/api/devices"), get("/api/events?limit=50")]);
  const classrooms = list(classroomResult, "classrooms").map(mapClassroom);
  const selectedId = classroomId && classrooms.some((room) => room.id === classroomId) ? classroomId : classrooms[0]?.id;
  const benches = selectedId ? list(await get(`/api/classrooms/${encodeURIComponent(selectedId)}/benches`), "benches").map(mapBench) : [];
  return { classrooms, benches, devices: list(devicesResult, "devices").map(mapDevice), events: list(eventsResult, "events").map(mapEvent) };
}
