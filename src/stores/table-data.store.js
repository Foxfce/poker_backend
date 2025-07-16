export const tableData = new Map();


// -- this should be in socket.on("createPrivateTable")
// const table1 = new PokerTable('1234');
// tableData.set(table1.tableId, table1);

// tableData.set(tableId , {
//     password : null,
//     players : [null,null,null,null], // 4 Seat initially empty
// });

export const playersInGames = new Map(); 
// example of data Map : <userId, {tableId, socketId, disconnectionTimer}> 

// Use to handle disconnection recognize
// playersInGames.set(socket.user.id, {
//     tableId: tableId,
//     socketId: socket.id,
//     disconnectionTimer: null // Initially no timer
// });

export const quickJoinQueue = []; // Stores socket IDs of players waiting for quick join