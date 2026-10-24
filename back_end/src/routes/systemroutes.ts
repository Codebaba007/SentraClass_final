import { getallevents,getsystemstatus,setsystemmode } from "../controllers/systemcontroller";
import { Router } from "express";

const router = Router()

router.get('/status',getsystemstatus)
router.put('/setmode',setsystemmode)
router.get('/events',getallevents)

export default router