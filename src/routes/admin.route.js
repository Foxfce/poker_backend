import express from 'express';
import {
    banUser
} from '../controllers/admin.controller.js';

const adminRoute = express.Router();

adminRoute.delete('/ban', banUser);


export default adminRoute;


