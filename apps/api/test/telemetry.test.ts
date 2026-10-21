import assert from "node:assert/strict";
import { test } from "node:test";
import { telemetrySchema } from "../src/schemas/telemetry.js";

const validPayload = {
  schemaVersion: 1,
  deviceId: "SC-NODE-001",
  sequence: 42,
  observedAt: "2026-10-21T10:00:00Z",
  mode: "classroom",
  source: "simulated",
  measurement: { distanceMm: 615, valid: true, status: "ok" },
  deviceState: { uptimeSeconds: 3600, alertOutput: "off" },
};

test("accepts a valid version 1 simulated telemetry message", () => {
  assert.equal(telemetrySchema.safeParse(validPayload).success, true);
});

test("accepts a physical source using the same telemetry contract", () => {
  assert.equal(telemetrySchema.safeParse({ ...validPayload, source: "physical" }).success, true);
});

test("rejects missing required fields, invalid types, and unknown enum values", () => {
  assert.equal(telemetrySchema.safeParse({ ...validPayload, sequence: undefined }).success, false);
  assert.equal(telemetrySchema.safeParse({ ...validPayload, sequence: "42" }).success, false);
  assert.equal(telemetrySchema.safeParse({ ...validPayload, mode: "other" }).success, false);
  assert.equal(telemetrySchema.safeParse({ ...validPayload, source: "unknown" }).success, false);
});

test("rejects invalid timestamps and unsupported contract versions", () => {
  assert.equal(telemetrySchema.safeParse({ ...validPayload, observedAt: "not-a-date" }).success, false);
  assert.equal(telemetrySchema.safeParse({ ...validPayload, schemaVersion: 2 }).success, false);
});

test("represents an invalid sensor sample without fabricating a distance", () => {
  const invalidSample = { ...validPayload, measurement: { valid: false, status: "timeout" } };
  assert.equal(telemetrySchema.safeParse(invalidSample).success, true);
  assert.equal(telemetrySchema.safeParse({ ...validPayload, measurement: { valid: false, status: "timeout", distanceMm: 615 } }).success, false);
  assert.equal(telemetrySchema.safeParse({ ...validPayload, measurement: { valid: true, status: "timeout", distanceMm: 615 } }).success, false);
  assert.equal(telemetrySchema.safeParse({ ...validPayload, measurement: { valid: true, status: "ok" } }).success, false);
  assert.equal(telemetrySchema.safeParse({ ...validPayload, measurement: { valid: true, status: "ok", distanceMm: 0 } }).success, false);
});
