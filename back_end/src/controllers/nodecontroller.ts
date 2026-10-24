import { Request,Response } from "express";
import { getIO } from "../services/socket";
import db from "../db/databse";

export const getallnodes = async(req:Request,res:Response)=>{
    try{
        const nodes = await db('nodes').select('*').orderBy('created_at','desc')
       return res.json({nodes})
    }

    catch(err)
    {
        return res.status(500).json({ error: 'Failed to retrieve nodes' });
    }
}

export const registernode = async(req:Request,res:Response)=>{
    try{
        const {device_mac,location_zone,label,baseline_distance,threshold_distance} = req.body
        if(!device_mac)
        {
            res.status(400).json({message:'device mac is compulsory'})
            return
        }

        const node_exists = await db('nodes').where({device_mac}).first()
        if(node_exists)
        {
            return res.status(400).json({message:'device already registered'})
        }

        const [newnode]=await db('nodes').insert({
            device_mac,
            location_zone,
            label,
            baseline_distance:baseline_distance || 500.0,
            threshold_distance:threshold_distance || 150.0
        }).returning('*')

       return  res.json({message:'node created',newnode})
    }

    catch(err)
    {
        return res.status(500).json({ error: 'Failed to register node' });
    }
}


export const calibratenode = async(req:Request,res:Response)=>{
    try{
            const {nodeID} = req.params
    const {baseline_distance,threshold_distance} = req.body

    const updates:any = {}
    if(baseline_distance !== undefined)
    {
        updates.baseline_distance = baseline_distance
    }

    if(threshold_distance !== undefined)
    {
        updates.threshold_distance = threshold_distance
    }

   

    if(Object.keys(updates).length<=0)
    {
        res.status(400).json({message:'no inputs given'})
        return
    }


    const [updated_node] = await db('nodes').where({id:nodeID}).update(updates).returning('*')
    return res.json({updated_node,message:'node updated'})
    }

    catch(err)

    {
        return res.status(500).json({ error: 'Failed to calibrate node' });
    }

}