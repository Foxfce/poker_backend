import { customAlphabet } from "nanoid";

export const generatedTableId = () => {
  const nanoId = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 5);
  const tableId = nanoId();

  return tableId;
}

export const generatePlayerId = () => {
  const nanoId = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 5);
  const player_id = nanoId();

  return player_id;
}
