import  knex from "knex";
import dotenv from "dotenv";
import { table, timeStamp } from "node:console";
dotenv.config();
const db = knex({
  client: "pg",
  connection: {
    host: process.env.DB_HOST|| "127.0.0.1",
    port: parseInt(process.env.DB_PORT || "5434"),
    user: process.env.DB_USER|| "postgres",
    password: process.env.DB_PASSWORD|| "postgrespassword",
    database: process.env.DB_NAME|| "sentraclass_db",
 },

 pool: {
    min:2,
    max:10,
    acquireTimeoutMillis:3000,
    idleTimeoutMillis:3000
 }
});


export async function initdb() {
    try{
        const hastable_system_settings = await db.schema.hasTable('system_settings')
        if(!hastable_system_settings) 
          {
            await db.schema.createTable('system_settings',(table)=>{
                table.increments('id').primary()
                table.enum('global_mode',['classroom_mode','security_mode']).defaultTo('classroom_mode')
                table.timestamp('updated_at').defaultTo(db.fn.now())
            })

             console.log('system_settings table created')
          }

        const hastable_nodes = await db.schema.hasTable('nodes')
        if(!hastable_nodes)
        {
            await db.schema.createTable('nodes',(table)=>{
                table.increments('id').primary()
                table.string('device_mac').notNullable().unique()
                table.string('location_zone')
                table.string('label')
                table.boolean('is_active').defaultTo(true)
                table.float('baseline_distance').defaultTo(500.0)
                table.float('threshold_distance').defaultTo(150.0)
                table.timestamp('last_ping')
                table.timestamps(true,true)
            })
             console.log('nodes table created')
        }

        const hastable_telemetry_logs = await db.schema.hasTable('telemetry_logs')
        if(!hastable_telemetry_logs)
        {
            await db.schema.createTable('telemetry_logs',(table)=>{
                table.increments('id').primary()
                table.integer('node_id').notNullable().references('id').inTable('nodes').onDelete('CASCADE')
                table.float('measured_distance').notNullable()
                table.enum('detected_state',['normal','posture_deviation','intrusion_alert'])
                table.timestamp('created_at').defaultTo(db.fn.now())
            })
             console.log('telemetry table created')
        }

        const hastable_events = await db.schema.hasTable('events')
        if(!hastable_events)
        {
            await db.schema.createTable('events',(table)=>{
                table.increments('id').primary()
                table.integer('node_id').notNullable().references('id').inTable('nodes').onDelete('CASCADE')
                table.enum('event_type',['posture_deviation','intrusion_alert','node_offline'])
                table.enum('severity',['low','medium','high','critical'])
                table.text('message')
                table.boolean('is_resolved').defaultTo(false)
                table.timestamp('created_at').defaultTo(db.fn.now())
            })
            console.log('events table created')
        }
    }
    catch(err)
    {
        console.log('error',err)
    }
}

initdb()
export default db



