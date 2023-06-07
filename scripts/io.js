const socketIO = require('socket.io');
const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);
const pool = require('./db')

const io = socketIO(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
    },
});
io.on("connection", (socket) => {
    socket.on('join-room', function (roomId) {
        socket.join(roomId)
        console.log(`Joined ${roomId}`)
    })
    socket.on('leave', (roomId) => {
        console.log("Left the room")
        socket.leave(roomId)
    })

    socket.on('message', async (data) => {
        try {
            let room = await pool.query(`SELECT id FROM room WHERE room_id = '${data.room}'`)
            room  =  room.rows[0].id
            query =  await pool.query(`INSERT INTO chat (chat, room, from_id) VALUES ($1,$2,$3) RETURNING * `, [data.message,room,data.from])
            io.of('/').to(data.room).emit('message', query.rows[0])
        } catch (e) {
           console.log(e)
        }

        
    })
});




module.exports = { server, io, app }