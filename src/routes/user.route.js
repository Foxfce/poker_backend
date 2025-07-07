import express from 'express';
import {
  getUserByEmail,
  getAllUserData,
  deleteUser,
  updateUserPassword,
  updateUserEmail,
  getUserProfile,
  getUserById
} from '../controllers/user.controller.js';

const userRoute = express.Router();

userRoute.get('/all', getAllUserData);
userRoute.get('/me', getUserProfile);
userRoute.get('/get/:email', getUserByEmail);
userRoute.get('/get/:id', getUserById);
userRoute.patch('/password',updateUserPassword);
userRoute.patch('/email',updateUserEmail);
userRoute.delete('/:id', deleteUser);

export default userRoute;