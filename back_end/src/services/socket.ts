import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

let io:Server

export const initSocket = (server: HttpServer): Server => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  })

  io.on('connection',(socket:Socket)=>{
    console.log(`socket connected:${socket.id}`)

    socket.on('disconnect',()=>{
        console.log(`socket disconnected:${socket.id}`)
    })
  })

  return io
}

export const getIO = ():Server=>{
    if(!io)
    {
        throw new Error('socket has not been initialisec');
        
    }
    return io
}
