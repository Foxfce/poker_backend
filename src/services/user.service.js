import prisma from "../config/prisma.client.js";

export const getAllPlayer = async () => {
    const allPlayer = await prisma.player.findMany({
        select: {
            player_id: true,
            nick_name: true,
            role: true,
            profile_picture: true,
        }
    });
    return allPlayer;
}

export const getPlayer = async (player_id) => {
    const player = await prisma.player.findUnique({ where: { player_id }, omit: { password: true } });
    return player;
}

export const findPlayerBy = async (column, value) => {
    const player = await prisma.player.findUnique({ where: { [column]: value } });
    return player;
}

export const editPlayerProfile = async (player_id, data) => {
    const editedPlayer = await prisma.player.update({ where: { player_id : player_id }, data: data });
    return editedPlayer
}
