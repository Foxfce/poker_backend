import prisma from "../config/prisma.client.js"
import { createError } from "../utils/createError.js"

export const getAllUserData = (req, res, next) => {
  const result = 'prisma.user.findMany())'
  res.status(200).json({
    message: "Get all user data successful",
    result
  })
}

export const getUserProfile = (req, res, next) => {
  const id = req.user.id;

  const result = 'prisma.user.findUniqe())'
  res.status(200).json({
    message: "Get all user data successful",
    result
  })
}

export const getUserByEmail = (req, res, next) => {
  // const email = req.user.email;
  const email = req.params.email

  const result = 'prisma.user.findUniqe({where : {email : email}})'
  res.status(200).json({
    message: `Get ${email} user data successful`,
    result
  })
}

export const getUserById = (req, res, next) => {
  // const email = req.user.email;
  const id = req.params.id

  const result = 'prisma.user.findUniqe({where : {id : +id}})'
  res.status(200).json({
    message: `Get ${id} user data successful`,
    result
  })
}

export const updateUserPassword = (req, res, next) => {
  req.user = {id:2};
  const id = req.user.id;
  const { oldPassword = null, newPassword = null } = req.body;

  // // Perform password check here
  // const findPassword = 'prisma.user.findUniqe({where: {id}})'
  // if (!(oldPassword === findPassword.password)) {
  //   createError(500, 'Password is not matched')
  // }

  const result = 'prisma.user.update({where : {id : id}, data: {password : newPassword}})'
  res.status(200).json({
    message: `Updated ${id} user password successful`,
    result
  });
}

export const updateUserEmail = (req, res, next) => {
  req.user = {id: 2};
  const id = req.user.id;
  const { email } = req.body;

  const result = `prisma.user.update({where : {id : id}, data: {email : ${email}}})`
  res.status(200).json({
    message: `Updated ${id} user Email successful`,
    result
  });
}


export const deleteUser = (req, res, next) => {
  const  id  = req.params.id;

  const result = 'prisma.user.delete({where : {id : id}})'
  res.status(200).json({
    message: `Delete ${id} user data successful`,
    result
  })
}