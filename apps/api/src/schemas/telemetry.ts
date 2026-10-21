import { z } from "zod";

export const deviceIdSchema = z.string().trim().min(1).max(80).regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/);

export const telemetrySchema = z.object({
  schemaVersion: z.literal(1),
  deviceId: deviceIdSchema,
  sequence: z.number().int().nonnegative().max(2_147_483_647),
  observedAt: z.iso.datetime({ offset: true }),
  mode: z.enum(["classroom", "security"]),
  source: z.enum(["simulated", "physical"]),
  measurement: z.object({
    distanceMm: z.number().int().min(1).max(2_147_483_647).optional(),
    valid: z.boolean(),
    status: z.enum(["ok", "out_of_range", "signal_fail", "timeout", "not_ready"]),
  }).strict().superRefine((measurement, context) => {
    if (measurement.valid && (measurement.status !== "ok" || measurement.distanceMm === undefined)) {
      context.addIssue({ code: "custom", message: "A valid measurement requires an in-range distanceMm and status 'ok'." });
    }
    if (!measurement.valid && (measurement.status === "ok" || measurement.distanceMm !== undefined)) {
      context.addIssue({ code: "custom", message: "An invalid measurement must use a failure status and omit distanceMm." });
    }
  }),
  deviceState: z.object({
    uptimeSeconds: z.number().int().nonnegative().optional(),
    alertOutput: z.enum(["off", "on"]).optional(),
  }).strict().optional(),
}).strict();

export type TelemetryPayload = z.infer<typeof telemetrySchema>;

export function formatValidationIssues(issues: z.ZodIssue[]) {
  return issues.map((issue) => ({ path: issue.path.join("."), message: issue.message }));
}
