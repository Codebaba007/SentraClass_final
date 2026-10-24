import db from "../db/databse";

export const seedsystem = async () => {
    try {
        const existing = await db('system_settings').first()
        if (!existing) {
            await db('system_settings').insert({
                id: 1,
                global_mode: 'classroom_mode'
            })
            console.log('system seeded')
        }
    } catch (e) {
        console.log('seed check: ', e)
    }
}