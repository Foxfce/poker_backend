import express from 'express';
import {
  getUserByEmail,
  getAllUserData,
  deleteUser,
  updateUserPassword,
  updateUserEmail,
  getUserProfile
} from '../controllers/user.controller.js';

const userRoute = express.Router();

userRoute.get('/all', getAllUserData);
userRoute.get('/', getUserProfile);
userRoute.get('/:email', getUserByEmail);
userRoute.patch('/password',updateUserPassword);
userRoute.patch('/email',updateUserEmail);
userRoute.delete('/:id', deleteUser);

export default userRoute;