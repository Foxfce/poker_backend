import express from 'express';

const lobbyRouter = express.Router();

lobbyRouter.get('/lobby/:lobbyId',(req, res, next)=>res.status(200).json({message : "get lobby id by params"}));
lobbyRouter.post('/lobby/:lobbyId',(req, res, next)=>res.status(200).json({message : "comment on lobby"}));

export default lobbyRouter;