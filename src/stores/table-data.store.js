export const tableData = new Map();

export const cardDeck = [
  'As', 'Ks', 'Qs', 'Js', 'Ts', '9s', '8s', '7s', '6s', '5s', '4s', '3s', '2s',
  'Ah', 'Kh', 'Qh', 'Jh', 'Th', '9h', '8h', '7h', '6h', '5h', '4h', '3h', '2h',
  'Ad', 'Kd', 'Qd', 'Jd', 'Td', '9d', '8d', '7d', '6d', '5d', '4d', '3d', '2d',
  'Ac', 'Kc', 'Qc', 'Jc', 'Tc', '9c', '8c', '7c', '6c', '5c', '4c', '3c', '2c'
]


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