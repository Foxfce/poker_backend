import cors from 'cors';
import express from 'express';
import errorMiddleware from './middlewares/error.middleware.js';
import notFoundMiddleware from './middlewares/not-found.middleware.js';
import tableRoute from './routes/table.route.js';
import authRoute from './routes/auth.route.js';
import lobbyRoute from './routes/lobby.route.js';
import userRoute from './routes/user.route.js';
import adminRoute from './routes/admin.route.js';

const app = express();

export const corsSetting = {
    origin: true,
    credentials: true,
}

app.use(express.json());
app.use(cors(corsSetting));


app.use("/api/auth",authRoute);
app.use("/api/lobby",lobbyRoute);
app.use("/api/table",tableRoute);
app.use("/api/user",userRoute);
app.use("/api/news",(req, res)=>(res.json({message : "news fetch article update news or event announcement"})));
app.use("/api/tournament",(req, res)=>(res.json({message : "tournament fetch paticipanted user"})));
app.use("/api/admin",adminRoute);

app.use(notFoundMiddleware);
app.use(errorMiddleware);



export default app;