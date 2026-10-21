import Fastify, { type FastifyInstance } from "fastify";
import { Prisma, PrismaClient } from "./generated/prisma/client.js";
import { formatValidationIssues, telemetrySchema, deviceIdSchema } from "./schemas/telemetry.js";

const idSchema = deviceIdSchema;
const eventQuerySchema = (value: unknown) => {
  const parsed = Number(value ?? 50);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 100 ? parsed : null;
};

export function buildApp(prisma: PrismaClient): FastifyInstance {
  const app = Fastify({ logger: true, bodyLimit: 16_384 });

  // Allow the local dashboard origins; this unauthenticated prototype API must
  // not be exposed publicly.
  app.addHook("onSend", async (_request, reply, payload) => {
    const origin = _request.headers.origin;
    if (origin === "http://localhost:3000" || origin === "http://127.0.0.1:3000") {
      reply.header("access-control-allow-origin", origin);
      reply.header("vary", "Origin");
    }
    return payload;
  });

  app.setErrorHandler((error, request, reply) => {
    request.log.error({ err: error }, "Unhandled request error");
    reply.status(500).send({ error: { code: "internal_error", message: "An unexpected server error occurred." } });
  });

  app.get("/api/health", async () => ({ status: "ok" }));

  app.get("/api/health/ready", async (_request, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { status: "ready", database: "connected" };
    } catch (error) {
      app.log.warn({ err: error }, "Database readiness check failed");
      return reply.status(503).send({ error: { code: "database_unavailable", message: "The database is not available." } });
    }
  });

  app.get("/api/classrooms", async () => {
    const classrooms = await prisma.classroom.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { benches: true } } },
    });
    return { data: classrooms.map(({ _count, ...classroom }) => ({ ...classroom, benchCount: _count.benches })) };
  });

  app.get<{ Params: { classroomId: string } }>("/api/classrooms/:classroomId/benches", async (request, reply) => {
    const parsedId = idSchema.safeParse(request.params.classroomId);
    if (!parsedId.success) return reply.status(400).send({ error: { code: "invalid_parameter", message: "classroomId is invalid." } });
    const classroom = await prisma.classroom.findUnique({ where: { id: parsedId.data }, select: { id: true } });
    if (!classroom) return reply.status(404).send({ error: { code: "classroom_not_found", message: "Classroom was not found." } });
    const data = await prisma.bench.findMany({
      where: { classroomId: classroom.id },
      orderBy: [{ row: "asc" }, { column: "asc" }],
      include: { device: { include: { readings: { orderBy: { receivedAt: "desc" }, take: 1 } } } },
    });
    return { data };
  });

  app.get("/api/devices", async () => {
    const data = await prisma.device.findMany({
      orderBy: { externalId: "asc" },
      include: { bench: { include: { classroom: { select: { id: true, name: true, mode: true } } } } },
    });
    return { data };
  });

  app.get<{ Querystring: { limit?: string } }>("/api/events", async (request, reply) => {
    const limit = eventQuerySchema(request.query.limit);
    if (limit === null) return reply.status(400).send({ error: { code: "invalid_parameter", message: "limit must be an integer from 1 to 100." } });
    const data = await prisma.event.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { classroom: { select: { id: true, name: true } }, device: { select: { id: true, externalId: true, source: true } } },
    });
    return { data };
  });

  app.post("/api/telemetry", async (request, reply) => {
    const parsed = telemetrySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: { code: "invalid_telemetry", message: "Telemetry payload is invalid.", issues: formatValidationIssues(parsed.error.issues) } });
    }
    const payload = parsed.data;
    const device = await prisma.device.findUnique({ where: { externalId: payload.deviceId } });
    if (!device) return reply.status(404).send({ error: { code: "unknown_device", message: "Device is not registered." } });
    if (device.source !== payload.source) {
      return reply.status(409).send({ error: { code: "source_mismatch", message: "Telemetry source does not match the registered device source." } });
    }

    const receivedAt = new Date();
    try {
      const reading = await prisma.$transaction(async (transaction) => {
        const created = await transaction.telemetryReading.create({
          data: {
            deviceId: device.id,
            schemaVersion: payload.schemaVersion,
            sequence: payload.sequence,
            observedAt: new Date(payload.observedAt),
            receivedAt,
            mode: payload.mode,
            source: payload.source,
            distanceMm: payload.measurement.distanceMm,
            valid: payload.measurement.valid,
            status: payload.measurement.status,
            uptimeSeconds: payload.deviceState?.uptimeSeconds,
            alertOutput: payload.deviceState?.alertOutput,
          },
          select: { id: true, receivedAt: true, deviceId: true, sequence: true, source: true, valid: true, distanceMm: true, status: true },
        });
        await transaction.device.update({
          where: { id: device.id },
          data: {
            lastSeen: receivedAt,
            lastDistanceMm: payload.measurement.valid ? payload.measurement.distanceMm : null,
            lastMeasurementStatus: payload.measurement.status,
          },
        });
        return created;
      });
      return reply.status(201).send({ data: reading });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return reply.status(409).send({ error: { code: "duplicate_sequence", message: "This device sequence number has already been recorded." } });
      }
      throw error;
    }
  });

  return app;
}
