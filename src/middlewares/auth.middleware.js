import { createError } from "../utils/createError.js";
import { generatePublicToken, verifyToken } from "../utils/jwt.util.js";

export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) createError(401, "Empty Token");

    const token = authHeader.split(' ')[1];
    try {
        const payload = verifyToken(token);
        req.player_id = payload.player_id;
        next();
    } catch (error) {
        createError(403, "Invalid Token")
    }
}

export const authAdminMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) createError(401, "Empty Token");

    const token = authHeader.split(' ')[1];
    try {
        const payload = verifyToken(token);
        if (payload.role !== 'ADMIN') createError(400, 'Unauthorized Access');
        req.player_id = payload.player_id;
        next();
    } catch (error) {
        createError(403, "Invalid Token")
    }
}

export const SocketMiddleware = async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token;
        const player_id = socket.handshake.auth?.player_id;
        const playerName = socket.handshake.auth?.nick_name;
        const role = socket.handshake.auth?.role;
        socket.id = 

        // Guest Route
        if (!token) {

            const guestData = {
                nick_name: `Guest${Math.floor(Math.random() * 10000)}`,
                player_id: socket.id.slice(5, 10),
                role: 'GUEST'
            };

            if (!socket.user) socket.user = {};

            socket.user.name = guestData.nick_name;
            socket.user.id = guestData.player_id;
            socket.user.role = guestData.role;

            const guestToken = generatePublicToken(guestData);

            socket.emit('guestPlayerCreated', guestToken);

            if (socket.recover) {

            }
            // next();
        }

        if (token) {
            const payload = verifyToken(token);
            if (payload.role === 'MEMBER') {

                const player = await getPlayer(payload.player_id);

                if (!socket.user) socket.user = {};
                socket.user.name = player.nick_name;
                socket.user.id = player.player_id;
                socket.user.role = player.role;
            }
        }

    } catch (error) {
        next(error);
    }
}