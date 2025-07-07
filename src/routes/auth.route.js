import express from 'express';

const authRoute = express.Router();

authRoute.post('/login',(req, res, next)=>res.status(200).json({message : "Login User"}));
authRoute.post('/register',(req, res, next)=>res.status(200).json({message : "Register User"}));
authRoute.post('/forgot-password',(req, res, next)=>res.status(200).json({message : "Forgot Password"}));
authRoute.post('/reset-password/:token',(req, res, next)=>res.status(200).json({message : "Reset Password"}));

export default authRoute;