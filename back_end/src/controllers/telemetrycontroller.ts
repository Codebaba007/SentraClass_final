import { Request,Response } from "express";
import { getIO } from "../services/socket";
import db from "../db/databse";
import { timeStamp } from "node:console";


export const ingestTelemetry = async (req:Request,res:Response)=>{
    try{
        const {distance , device_mac} = req.body

        if(distance===undefined || !device_mac)
        {
            res.status(400).json({message:'distance and device is compulsory'})
            return
        }

        const node = await db('nodes').where({device_mac}).first()

        if(!node)
        {
            res.status(404).json({message:'device not found'})
            return
        }

        const system = await db('system_settings').first()
        const  currentmode = system?.global_mode || 'classroom_mode'
        const baseline = node.baseline_distance
        const deviation = Math.abs(baseline-distance)

        let detectedstate: 'normal'| 'posture_deviation'| 'intrusion_alert' = 'normal'

        if(deviation>node.threshold_distance)
        {
            detectedstate= currentmode === 'classroom_mode' ? 'posture_deviation':'intrusion_alert'
        }

        await db('telemetry_logs').insert({
            node_id:node.id,
            measured_distance:distance,
            detected_state:detectedstate,
        })

        await db('nodes').where({ id:node.id }).update({ last_ping:db.fn.now() })

        const io = getIO()
        if(detectedstate!=='normal')
        {
            const event_type = currentmode==='classroom_mode' ? 'posture_deviation':'intrusion_alert'
            const severity = currentmode==='classroom_mode' ? 'critical': 'high'

            const [newevent] = await db('events').insert({
                node_id:node.id,
                event_type,
                severity,
                message: `${node.label} detected anomaly. Measured distance:${distance} where baseline:${node.baseline_distance}`
            }).returning('*')

            io.emit('alert_event',newevent)


        }

        io.emit('telemetry_update',{
            node_id:node.id,
            label:node.label,
            measured_distance:distance,
            detectedstate,
            timeStamp:new Date()
        })

      return  res.json({message:'sensor data retrieved' ,mode:currentmode,state:detectedstate})

    }

    catch(err)
    {
        return res.status(500).json({ error: 'Internal server error processing telemetry' });
  
    }
}


export const telemetryhistory = async(req:Request,res:Response)=>{
    try{
        const {nodeID} = req.params
       const history = await db('telemetry_logs').where({node_id:nodeID}).orderBy('created_at','desc').select('*')

      return res.json({history})
    }
    catch(err)
    {
        return res.status(500).json({ error: 'Internal server error processing telemetry history' });
    }
}