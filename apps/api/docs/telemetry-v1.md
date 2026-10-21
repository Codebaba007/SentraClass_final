# Telemetry Contract v1

`POST /api/telemetry` accepts one JSON message for a previously registered device. The simulator and ESP32 will use this same contract and endpoint.

```json
{
  "schemaVersion": 1,
  "deviceId": "SC-NODE-001",
  "sequence": 42,
  "observedAt": "2026-10-21T10:00:00Z",
  "mode": "classroom",
  "source": "simulated",
  "measurement": {
    "distanceMm": 615,
    "valid": true,
    "status": "ok"
  },
  "deviceState": {
    "uptimeSeconds": 3600,
    "alertOutput": "off"
  }
}
```

## Fields

- `schemaVersion`: required integer literal `1`.
- `deviceId`: required registered external device identifier (1-80 ASCII letters, digits, `.`, `_`, or `-`; first character alphanumeric).
- `sequence`: required non-negative 32-bit integer, unique per registered device. Replays receive HTTP 409.
- `observedAt`: required ISO 8601 timestamp with timezone; stored separately from API `receivedAt`.
- `mode`: required `classroom` or `security`, the device's reported mode at observation time.
- `source`: required `simulated` or `physical`; must match the registered device's source.
- `measurement.valid`: required boolean.
- `measurement.status`: required `ok`, `out_of_range`, `signal_fail`, `timeout`, or `not_ready`.
- `measurement.distanceMm`: for valid readings, required positive signed 32-bit integer with status `ok`. This is a storage/type bound, not a claim about the sensor's validated physical range. For invalid readings, omit it and supply a non-`ok` status. The API never substitutes a value.
- `deviceState`: optional object with optional non-negative integer `uptimeSeconds` and `alertOutput` (`off` or `on`).
- Unknown fields are rejected at every object level.

The API looks up `deviceId` by `Device.externalId`; it never creates a device from incoming telemetry. Device registration and source assignment are local database administration tasks at this phase. Device authentication is not implemented, so the endpoint is for local development only.

Successful requests return HTTP 201 with the reading ID, device ID, sequence, source, validity, measured distance/status, and server receipt timestamp. Invalid payloads return HTTP 400 with field issues. Unknown devices return 404, a source mismatch or repeated sequence returns 409, and unexpected server/database errors return a generic 500 response.

Invalid measurements still create a record and update the device's last-seen and last-status values. Their distance remains null. The transaction ensures that reading storage and device summary updates succeed or fail together. No event or intrusion classification is created from telemetry in this phase.
