import dotenv from 'dotenv';
import app, { corsSetting } from './app.js'
import http from 'http';
import { Server } from 'socket.io'
import { registerSocketHandlers } from './handlers/socket.handler.js';

dotenv.config();

const PORT = process.env.PORT || 3069;


const waitForDisconnected = 15; // time in second for disconnecting player

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: corsSetting,
    },
    connectionStateRecovery: {
        maxDisconnectionDuration: waitForDisconnected *1000, // Keep disconnection  time
        skipMiddlewares : true,
    }
})

io.on('connection', (socket) => {
    registerSocketHandlers(io, socket);


})


server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
})