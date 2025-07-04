import { customAlphabet } from "nanoid";

export const generatedTableId = () =>{
  const nanoId = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',5);
  const tableId = nanoId();

  return tableId;
}
