import prisma from "../config/prisma.client.js"
import { updatePlayerPassword } from "../services/auth.service.js"
import {
  editPlayerProfile,
  findPlayerBy,
  getAllPlayer,
  getPlayer
} from "../services/user.service.js"
import { createError } from "../utils/createError.js"

export const getAllUserData = async (req, res, next) => {
  const result = await getAllPlayer()
  
  res.status(200).json({
    message: "Get all user data successful",
    result
  })
}

export const getUserProfile = async (req, res, next) => {
  const player_id = req.playerId;

  const player = await getPlayer(player_id);
  res.status(200).json({
    message: "Get user data successful",
    player
  })
}

export const getUserById =async (req, res, next) => {
  const playerId = req.params.playerId

  const result = await findPlayerBy('player_id',playerId)
  res.status(200).json({
    message: `Get ${playerId} user data successful`,
    result
  })
}

export const updateUserProfile = async (req, res, next) => {
  const player_id = req.playerId;
  const data = req.body  // edit nick_name , profile_picture, about

  const result = await editPlayerProfile(player_id,data);
  res.status(200).json({
    message: `Update user id:${id} profile successful`,
    result
  })
}

export const updateUserPassword = async (req, res, next) => {
  const player_id = req.playerId;
  const { oldPassword, newPassword } = req.body;

  if(!oldPassword || !newPassword) createError(400, "Empty password");

  // Perform password check here
  const findPassword = await prisma.player.findUnique({where: {player_id}, select : {password : true}});

  const isMatch = await bcrypt.compare(oldPassword, findPassword);
  if (!isMatch) {
    createError(500, 'Password is not matched');
  }

  const result = await updatePlayerPassword(player_id, newPassword);
  res.status(200).json({
    message: `Updated ${id} user password successful`,
    result
  });
}

export const updateUserEmail = (req, res, next) => {
  req.user = { id: 2 };
  const id = req.user.id;
  const { username } = req.body;

  const result = `prisma.user.update({where : {id : id}, data: {username : ${username}}})`
  res.status(200).json({
    message: `Updated ${id} user Email successful`,
    result
  });
}