import express from 'express';
import {
    createTable,
    deleteTable,
    getAllTableId,
    joinTableById
} from '../controllers/table.controller.js';

const tableRoute = express.Router();

tableRoute.get("/", getAllTableId);
tableRoute.post("/", joinTableById);
tableRoute.post("/create",createTable);
tableRoute.delete('/:tableId',deleteTable);

export default tableRoute;