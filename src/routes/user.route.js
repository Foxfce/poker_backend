import express from 'express';
import {
  getAllUserData,
  updateUserPassword,
  updateUserEmail,
  getUserProfile,
  getUserById,
  updateUserProfile
} from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const userRoute = express.Router();

userRoute.get('/all', getAllUserData);
userRoute.get('/me', authMiddleware, getUserProfile);
userRoute.post('/me', authMiddleware, updateUserProfile);
userRoute.get('/get/:playerId', getUserById);
userRoute.patch('/password', authMiddleware, updateUserPassword);
userRoute.patch('/email', updateUserEmail);

export default userRoute;