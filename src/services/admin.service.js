import prisma from "../config/prisma.client.js";

export const deleteUser = async (player_id) => {
    const result = await prisma.player.delete({ where: { player_id } });
    return result
}