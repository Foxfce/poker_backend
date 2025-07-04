import prisma from "../config/prisma.client.js";
import { generatedTableId } from "../utils/id-generator.util.js";

export const getAllTableId = async (req, res, next) => {
  const listedTable = 'listed table with prisma';
  console.log('use prisma.table.findMany({where : { status : "vacant" }})');


  res.status(200).json({
    message: `Find all table avialable`,
    result: listedTable,
  });
}

export const joinTableById = async (req, res, next) => {
  const {tableId, password} = req.body;
  console.log('tableId : ',tableId,' with Password : ',password);

  res.status(200).json({
    message: `table joined ${tableId} with password ${password}`
  });
}

export const createTable = async (req, res, next) => {
  const {table_name,type,table_password} = req.body;
  let gentableId;
  let checkExistingId;
  do {
    gentableId = generatedTableId();
    console.log(gentableId);

    checkExistingId = 'prisma.table.findUniqe({where : {id : gentableId}})';

    if (checkExistingId) break;
  } while (true)

  const tableData = {
    id: gentableId,
    table_name: table_name,
    type: type,
    table_password: table_password
  }

  // const createResult = prisma.table.create()

  res.status(200).json({
    message: `table created at /${tableData.id}`,
    tableData
  });
}