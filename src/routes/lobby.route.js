import express from 'express';

const lobbyRoute = express.Router();

lobbyRoute.get('/',(req, res, next)=>res.status(200).json({message : "Fetch all avialable game room"}));
lobbyRoute.get('/public',(req, res, next)=>res.status(200).json({message : "Fetch all avialable Public table game room"}));
lobbyRoute.get('/private',(req, res, next)=>res.status(200).json({message : "Fetch all avialable Private table game room"}));
lobbyRoute.post('/private/:tableId',(req, res, next)=>res.status(200).json({message : "Fetch specific ID Private game room with password provide"}));

export default lobbyRoute;