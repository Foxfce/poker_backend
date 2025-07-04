import express from 'express';

const tableRouter = express.Router();

tableRouter.use("/table/:roomId",(req, res)=> {
    res.status(200).json({
        message : "table joined"
    });
})

export default tableRouter;