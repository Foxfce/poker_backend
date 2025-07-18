import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.client.js';
import { generatePlayerId } from '../utils/id-generator.util.js';

export const createPlayer = async (username, password) => {
    let player_id
    do {
        player_id = generatePlayerId();
        const isIdExist = await prisma.player.findUnique({
            where: {
                player_id: player_id,
            },
        })

        if (!isIdExist) break;
    } while (true);
    const hash = bcrypt.hashSync(password, 10);

    const result = await prisma.player.create({
        data: {
            username,
            password: hash,
            player_id: player_id,
            role: 'MEMBER'
        },
    });

    return result;
}

export const createGuestPlayer = async () => {
    let player_id
    do {
        player_id = generatePlayerId();

        const isIdExist = await prisma.player.findUnique({
            where: {
                player_id: player_id,
            },
        })

        if (!isIdExist) break;
    } while (true);

    const result = await prisma.player.create({
        data: {
            player_id: player_id,
            role: 'GUEST',
        },
    });

    return result;
}

export const verifyPlayer = async (username, password) => {
    const player = await prisma.player.findUnique({ where: { username } });
    if (!player) return null;
    const isMatch = await bcrypt.compare(password, player.password);
    return isMatch ? player : null;
}

export const updatePlayerPassword = async (player_id, newPassword) => {
    const hash = bcrypt.hashSync(newPassword, 10);
    const player = await prisma.player.update({
        where: {
            player_id: player_id
        },
        data: {
            password: hash,
        },
    });
    return player;
}

export const findUserByEmail = async (username) => {
    const player = await prisma.player.findUnique({ where: { username } });
    return player;
}

