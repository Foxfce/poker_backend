import { createError } from "../utils/createError.js";
import { verifyToken } from "../utils/jwt.js";

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