import express from 'express';

const authRoute = express.Router();

authRoute.post('/login',(req, res, next)=>res.status(200).json({message : "Login User"}));
authRoute.post('/register',(req, res, next)=>res.status(200).json({message : "Register User"}));

export default authRoute;