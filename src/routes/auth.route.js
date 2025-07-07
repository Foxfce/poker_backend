import express from 'express';
import {
    forgotPassword,
    login,
    register,
    resetPassword
} from '../controllers/auth.controller.js';

const authRoute = express.Router();

authRoute.post('/login', login);
authRoute.post('/register', register);
authRoute.post('/forgot-password', forgotPassword);
authRoute.post('/reset-password/:token', resetPassword);

export default authRoute;