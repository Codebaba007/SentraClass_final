import { telemetryhistory,ingestTelemetry } from "../controllers/telemetrycontroller";

import { Router } from "express";


const router = Router()

router.post('/ingest',ingestTelemetry)
router.get('/history/:nodeID',telemetryhistory)

export default router;