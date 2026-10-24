import { Request, Response } from "express";
import { getIO } from "../services/socket";
import db from "../db/databse";

export const getsystemstatus = async (req: Request, res: Response) => {
    try {
        const settings = await db('system_settings').first()
        return res.json({
            settings
        })
    }

    catch (err) {
        return res.status(500).json({ error: 'Failed to fetch system settings' });
    }
}


export const setsystemmode = async (req: Request, res: Response) => {
    try {
        const { mode } = req.body
        const existing = await db('system_settings').first()
        if (existing) {
            await db('system_settings').where({ id: existing.id }).update({ global_mode: mode, updated_at: db.fn.now() })
        } else {
            await db('system_settings').insert({ global_mode: mode })
        }

        const io = getIO()

        io.emit('system_changed',
            { global_mode: mode }
        )

        return res.json({ message: 'system chanegd', mode })
    }

    catch (err) {
        return res.status(500).json({ error: 'Failed to update system mode' });
    }


}

export const getallevents = async (req: Request, res: Response) => {
    try {
        const events = await db('events').join('nodes', 'events.node_id', 'nodes.id')
            .select('events.*', 'nodes.label as node_label', 'nodes.device_mac as device_mac')
            .orderBy('events.created_at', 'desc')

        return res.json({ events })

    }

    catch (err) {
        return res.status(500).json({ error: 'Failed to fetch events' });
    }
}