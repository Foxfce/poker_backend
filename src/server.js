import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3069;

app.use(express.json());
app.use(cors());

app.use("/api/auth",(req, res)=>(res.json({message : "for login register logout"})));
app.use("/api/lobby",(req, res)=>(res.json({message : "Hello"})));
app.use("/api/user",(req, res)=>(res.json({message : "user"})));
app.use("/api/news",(req, res)=>(res.json({message : "news"})));
app.use("/api/tournament",(req, res)=>(res.json({message : "tournament"})));
app.use("/api/admin",(req, res)=>(res.json({message : "GM room"})));

app.listen(PORT,()=>{
    console.log(`Server running at http://localhost:${PORT}`);
})