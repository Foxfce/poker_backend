import {
    createPlayer,
    findUserByEmail,
    updatePlayerPassword,
    verifyPlayer
} from "../services/auth.service.js";
import { createError } from "../utils/createError.js";
import { generateToken, signResetToken } from "../utils/jwt.util.js";

export const register = async (req, res) => {
    const { username, password} = req.body;

    // if (password != confirmPassword) createError(400, "Password is not match with confirm password");

    const foundUser = await findUserByEmail(username);

    if (foundUser) createError(409, `Already have player : ${username}`);

    const player = await createPlayer(username, password);
    res.status(201).json({
        message: 'Registered Successful',
        data: {
            id: player.id,
            player_id: player.player_id,
            username: player.username
        }
    });
}

export const login = async (req, res) => {
    const { username, password } = req.body;
    const player = await verifyPlayer(username, password);
    if (!player) createError(404, "Invalid credentials");

    const accessToken = generateToken({player_id: player.player_id, name : player.nick_name, role : player.role});
    res.status(200).json({
        message: "Login Successful",
        accessToken
    });
}

export const forgotPassword = async (req, res) => {
    const { username } = req.body;
    const player = await findUserByEmail(username);
    if (!player) createError(404, "User not found");

    const frontUrl = "http://localhost:5173/reset-password"; // Need change if front change
    const token = signResetToken(player.player_id);
    const link = `${frontUrl}/${token}`;

    res.json({ message: "Reset link generated", link });
}

export async function resetPassword(req, res) {
    const { token } = req.params;
    const { password } = req.body;
    try {
        const payload = verifyResetToken(token);
        const player_id = payload.player_id;
        const player = await updatePlayerPassword(player_id, password);
        res.json({
            message: "Password reset successful",
            player: { id: player.id, player_id: player.player_id, username: player.username },
        });
    } catch (err) {
        createError(400, "Invalid or expried token")
    }
}