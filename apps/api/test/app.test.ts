import assert from "node:assert/strict";
import { test } from "node:test";
import type { PrismaClient } from "../src/generated/prisma/client.js";
import { buildApp } from "../src/app.js";

test("GET /api/health reports process liveness without a database query", async () => {
  const app = buildApp({} as PrismaClient);
  const response = await app.inject({ method: "GET", url: "/api/health", headers: { origin: "http://localhost:3000" } });
  assert.equal(response.statusCode, 200);
  assert.equal(response.headers["access-control-allow-origin"], "http://localhost:3000");
  assert.deepEqual(response.json(), { status: "ok" });
  await app.close();
});

test("GET /api/health/ready reports database availability accurately", async () => {
  const connected = buildApp({ $queryRaw: async () => [{ result: 1 }] } as unknown as PrismaClient);
  const readyResponse = await connected.inject({ method: "GET", url: "/api/health/ready" });
  assert.equal(readyResponse.statusCode, 200);
  assert.deepEqual(readyResponse.json(), { status: "ready", database: "connected" });
  await connected.close();

  const disconnected = buildApp({ $queryRaw: async () => { throw new Error("test connection failure"); } } as unknown as PrismaClient);
  const unavailableResponse = await disconnected.inject({ method: "GET", url: "/api/health/ready" });
  assert.equal(unavailableResponse.statusCode, 503);
  assert.deepEqual(unavailableResponse.json(), { error: { code: "database_unavailable", message: "The database is not available." } });
  await disconnected.close();
});

test("POST /api/telemetry returns a structured client error before database access for malformed input", async () => {
  const app = buildApp({} as PrismaClient);
  const response = await app.inject({ method: "POST", url: "/api/telemetry", payload: { schemaVersion: 1 } });
  assert.equal(response.statusCode, 400);
  assert.equal(response.json().error.code, "invalid_telemetry");
  assert.ok(Array.isArray(response.json().error.issues));
  await app.close();
});
