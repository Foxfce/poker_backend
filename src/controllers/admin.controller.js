import { deleteUser } from "../services/admin.service.js";

export const banUser = async (req, res, next) => {
    const player_id = req.params.player_id;

    const result = await deleteUser(player_id)
    res.status(200).json({
        message: `Delete ${id} user data successful`,
        result
    })
}