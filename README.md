# SentraClass

SentraClass is a capstone prototype for privacy-preserving classroom distance monitoring and spatial security. The frontend is a Next.js dashboard with isolated demonstration data. The backend foundation is a separate Node.js, TypeScript, Fastify, PostgreSQL, and Prisma application under `apps/api`.

## Frontend

From the repository root:

```powershell
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The frontend's public demo-only credentials are `demo-admin@sentraclass.local` / `sentra-demo-only`. This browser-side sign-in is not authentication and does not protect an API. See `lib/demo-auth.ts` and the frontend section below for its limitations.

Existing frontend checks remain available:

```powershell
npm run lint
npm run type-check
npm run build
```

## Backend prerequisites

- Node.js 24 LTS or another Prisma 7 supported Node.js release.
- npm.
- A locally installed/running PostgreSQL server and a development database/user you control.
- A separate PostgreSQL database ending in `_test` if running database integration tests.

PostgreSQL is not bundled with this repository and Docker is not required. If PostgreSQL is unavailable, backend unit/contract tests can still run; readiness, migrations, seeding, and database integration tests cannot be verified.

## Backend local setup

In PowerShell, from the repository root:

```powershell
npm install --prefix apps/api
Copy-Item apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env` with your local development `DATABASE_URL`, for example:

```text
DATABASE_URL="postgresql://sentraclass:YOUR_LOCAL_PASSWORD@localhost:5432/sentraclass_dev?schema=public"
HOST="127.0.0.1"
PORT="4000"
```

Keep `.env` private; `.env.example` contains placeholders only. Set up the database and local database user in PostgreSQL yourself. Then, from the repository root:

```powershell
npm run api:prisma:generate
npm run api:prisma:migrate
npm run api:prisma:seed
npm run api:dev
```

Prisma 7 requires explicit client generation and does not automatically seed as part of migration. The seed is idempotent: it upserts Room 204, the fifteen A1-E3 benches, four simulated devices, and Classroom/Security demonstration configurations. It does not wipe the database or create historical intrusion events. The example defaults (120 mm change, 30 second persistence, 15 second recovery, and 90 second offline timeout) are configurable demonstration values and have not been validated with physical sensors.

API scripts can also be run from `apps/api` using the local npm scripts in its `package.json`; root scripts prefixed with `api:` are shortcuts. Start the API with `npm run api:dev` and visit `http://127.0.0.1:4000/api/health`. Use `/api/health/ready` to confirm PostgreSQL connectivity.

## API endpoints

- `GET /api/health` reports process liveness only.
- `GET /api/health/ready` checks PostgreSQL and returns 503 if it is unavailable.
- `GET /api/classrooms` returns rooms and bench counts.
- `GET /api/classrooms/:classroomId/benches` returns fixed bench positions, optional assignments, and latest reading.
- `GET /api/devices` returns registered devices and assignments.
- `GET /api/events?limit=50` returns recent events; limit must be 1-100.
- `POST /api/telemetry` validates, records, and acknowledges one versioned telemetry message.

Telemetry shape, field rules, responses, and device registration behavior are documented in [`apps/api/docs/telemetry-v1.md`](apps/api/docs/telemetry-v1.md). Both simulated and physical devices use the same contract. Unknown device IDs are rejected; telemetry does not create devices. Source must match the registered device. Invalid sensor measurements may be stored with a failure status and no distance. Readings and device last-seen/last-measurement summaries are updated transactionally. Telemetry does not create intrusion events or run detection logic.

## Initial database model

- `Classroom` owns the active room-level mode and an optional `rawTelemetryRetentionDays` setting. A null retention setting means no automatic raw-reading retention period has been configured; no deletion job exists yet. Event records have no automatic expiry.
- `Bench` belongs to one classroom, keeps its stable label and row/column, and allows at most one assigned device. Classroom/label and classroom/position are unique.
- `Device` has a unique external identifier, an explicit `simulated` or `physical` source, an optional bench, and last-seen/last-measurement summary fields.
- `ModeConfiguration` stores typed, per-classroom, per-mode distance threshold, persistence, recovery, and offline timeout values. Seeded values are demonstration defaults only.
- `TelemetryReading` stores observation time separately from server receipt time; per-device sequence numbers are unique. Invalid measurements store a null distance.
- `Event` is a long-term historical record for future possible-intrusion, offline, or recovery events. Its optional JSONB `metadata` is reserved for event-specific extra context; core fields remain typed columns. JSON metadata is flexible but has less database-enforced shape, so it must be validated by whichever event-producing code is added later.

Foreign keys prevent removal of devices with telemetry history and classrooms with events. Removing a bench detaches its device while preserving readings. No API endpoint in this phase deletes or edits those records.

Example request:

```powershell
$body = @{
  schemaVersion = 1
  deviceId = "SC-NODE-001"
  sequence = 42
  observedAt = "2026-10-21T10:00:00Z"
  mode = "classroom"
  source = "simulated"
  measurement = @{ distanceMm = 615; valid = $true; status = "ok" }
  deviceState = @{ uptimeSeconds = 3600; alertOutput = "off" }
} | ConvertTo-Json -Depth 4
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:4000/api/telemetry -ContentType "application/json" -Body $body
```

## Tests and checks

```powershell
npm run api:lint
npm run api:type-check
npm run api:test
npm run api:build
npm run lint
npm run type-check
npm run build
```

Unit tests use Fastify's in-process request injection and do not require PostgreSQL. Database integration tests are skipped unless `TEST_DATABASE_URL` is supplied. Create a separate database named with a `_test` suffix and configure `TEST_DATABASE_URL` in `apps/api/.env`; never point it at your development database. Apply the existing migration to that database with `npm run api:prisma:migrate:test`, then run `npm run api:test:db`. This migration command uses only `TEST_DATABASE_URL`; the test checks the `_test` suffix before creating any records. Tests create uniquely named rows and clean up only those rows.

## Security and scope limitations

Device authentication/registration administration and administrator API authentication are not implemented. The local telemetry endpoint is unauthenticated and must not be exposed as a public production API. The frontend demo login remains a client-only convenience; it is not related to API authorization.

The backend stores distance measurements and validated sensor status. It does not infer posture, attention, fatigue, psychological state, identity, or a confirmed intrusion. Persistence thresholds, temporal detection, alert recovery, offline processing, simulator integration, ESP32 firmware, Docker, and cloud deployment remain future work.
