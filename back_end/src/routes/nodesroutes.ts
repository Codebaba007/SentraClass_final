import { Router } from "express";
import { registernode,calibratenode,getallnodes } from "../controllers/nodecontroller";

const router =  Router()
 router.get('/',getallnodes)
 router.put('/calibrate/:nodeID',calibratenode)
 router.post('/register',registernode)

 export default router