import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { buildApp } from "../src/app.js";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;

test("registered device telemetry is persisted and retrievable", { skip: !testDatabaseUrl }, async () => {
  const databaseUrl = new URL(testDatabaseUrl!);
  if (!databaseUrl.pathname.slice(1).split("?")[0]?.endsWith("_test")) {
    throw new Error("Refusing database integration test: TEST_DATABASE_URL database name must end with _test.");
  }

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: testDatabaseUrl! }) });
  const app = buildApp(prisma);
  const suffix = randomUUID();
  let classroomId: string | undefined;
  let deviceId: string | undefined;

  try {
    const classroom = await prisma.classroom.create({ data: { name: `Integration test ${suffix}` } });
    classroomId = classroom.id;
    const bench = await prisma.bench.create({ data: { classroomId, label: "T1", row: 1, column: 1 } });
    const device = await prisma.device.create({ data: { externalId: `IT-${suffix}`, source: "simulated", benchId: bench.id } });
    deviceId = device.id;

    const payload = {
      schemaVersion: 1,
      deviceId: device.externalId,
      sequence: 1,
      observedAt: new Date().toISOString(),
      mode: "classroom",
      source: "simulated",
      measurement: { distanceMm: 615, valid: true, status: "ok" },
      deviceState: { uptimeSeconds: 4, alertOutput: "off" },
    };
    const accepted = await app.inject({ method: "POST", url: "/api/telemetry", payload });
    assert.equal(accepted.statusCode, 201);
    assert.equal(accepted.json().data.source, "simulated");
    assert.equal(accepted.json().data.distanceMm, 615);

    const duplicate = await app.inject({ method: "POST", url: "/api/telemetry", payload });
    assert.equal(duplicate.statusCode, 409);
    assert.equal(duplicate.json().error.code, "duplicate_sequence");

    const unknownDevice = await app.inject({ method: "POST", url: "/api/telemetry", payload: { ...payload, deviceId: `missing-${suffix}`, sequence: 2 } });
    assert.equal(unknownDevice.statusCode, 404);
    assert.equal(unknownDevice.json().error.code, "unknown_device");

    const sourceMismatch = await app.inject({ method: "POST", url: "/api/telemetry", payload: { ...payload, source: "physical", sequence: 2 } });
    assert.equal(sourceMismatch.statusCode, 409);
    assert.equal(sourceMismatch.json().error.code, "source_mismatch");

    const benches = await app.inject({ method: "GET", url: `/api/classrooms/${classroomId}/benches` });
    assert.equal(benches.statusCode, 200);
    assert.equal(benches.json().data[0].device.lastDistanceMm, 615);
    assert.equal(benches.json().data[0].device.readings[0].distanceMm, 615);

    const invalidMeasurement = await app.inject({
      method: "POST",
      url: "/api/telemetry",
      payload: { ...payload, sequence: 2, measurement: { valid: false, status: "timeout" } },
    });
    assert.equal(invalidMeasurement.statusCode, 201);
    assert.equal(invalidMeasurement.json().data.distanceMm, null);
    assert.equal(invalidMeasurement.json().data.valid, false);
    const deviceAfterInvalidSample = await prisma.device.findUniqueOrThrow({ where: { id: device.id } });
    assert.equal(deviceAfterInvalidSample.lastSeen?.toISOString(), invalidMeasurement.json().data.receivedAt);
    assert.equal(deviceAfterInvalidSample.lastDistanceMm, null);
    assert.equal(deviceAfterInvalidSample.lastMeasurementStatus, "timeout");
  } finally {
    await app.close();
    if (deviceId) await prisma.telemetryReading.deleteMany({ where: { deviceId } });
    if (deviceId) await prisma.device.delete({ where: { id: deviceId } });
    if (classroomId) await prisma.bench.deleteMany({ where: { classroomId } });
    if (classroomId) await prisma.event.deleteMany({ where: { classroomId } });
    if (classroomId) await prisma.modeConfiguration.deleteMany({ where: { classroomId } });
    if (classroomId) await prisma.classroom.delete({ where: { id: classroomId } });
    await prisma.$disconnect();
  }
});
