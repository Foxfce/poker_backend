import { createError } from "../utils/createError.js";
import { verifyToken } from "../utils/jwt.util.js";

export const authMiddleware =  ( req, res, next) =>{
    const authHeader = req.headers.authorization;
    if(!authHeader) createError(401, "Empty Token");

    const token = authHeader.split(' ')[1];
    try {
        const payload = verifyToken(token);
        req.playerId = payload.playerId;
        next();
    } catch (error) {
        createError(403, "Invalid Token")
    }
}

export const authAdminMiddleware = (req, res, next) =>{
    const authHeader = req.headers.authorization;
    if(!authHeader) createError(401, "Empty Token");

    const token = authHeader.split(' ')[1];
    try {
        const payload = verifyToken(token);
        req.playerId = payload.playerId;
        next();
    } catch (error) {
        createError(403, "Invalid Token")
    }
}

export const SocketMiddleware = (socket, next) =>{
    const token = socket.handshake.auth.token;
    const userId = socket.handshake.auth.player_id;

    // Guest Route
    if(!token){
        if(socket.recover)



        if (!socket.user) socket.user = {};

        socket.user.name = `Guest${Math.floor(Math.random() * 10000)}`;
        socket.user.id = socket.id.slice(5, 10);
        socket.user.role = 'GUEST';

        socket.emit('guestPlayerCreated', guestData);
        socket.user = {}
    }
}