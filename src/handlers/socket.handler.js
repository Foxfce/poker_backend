import { playersInGames, tableData } from "../stores/table-data.store.js";

export const registerSocketHandlers = (io, socket)=>{
    // console.log('Player has connected :', socket.id);

    // Operation

    socket.on('disconnect',async (reason) =>{
        console.log(`Socket ${socket.id} disconnected. Reason: ${reason}`);

        const userId = socket?.data.user.id;
        const tableId = socket?.tableId;

        if(userId && tableId && playersInGames.has(userId)){
            console.log(`Starting 10-second timer for user ${userId} in room ${tableId}.`);
            const playerInfo = playersInGames.get(userId);

            const disconnectionTimer = setTimeout(async () => {
                // This run when player hasn't connect for 10s
                console.log(`User ${userId} (socket ${socket.id}) truly disconnected from room ${tableId} after timeout.`);
                playersInGames.delete(userId); // Remove 

                //Operation to tell player to remove player from game state they are in

                 const socketsInRoom = await io.in(tableId).fetchSockets();
                    const currentOccupancy = socketsInRoom.length;
                    io.to(tableId).emit('playerTrulyDisconnected', {
                        userId: userId,
                        message: `${socket?.data.user.name || 'A player'} has left the game.`,
                        tableId: tableId,
                        occupancy: currentOccupancy
                    });
                
            }, 10 * 1000); // 10s time out

            playerInfo.disconnectionTimer = disconnectionTimer;
            playersInGames.set(userId, playerInfo);// Update Player with timer ID

        }else{
            console.log(`User ${userId} intentionally disconnected from room ${tableId}.`);
            playersInGames.delete(userId);
            const socketInRoom = await io.in(tableId).fetchSockets();
            const currentOccupancy = socketInRoom.length;
            io.to(tableId).emit(`playerTrulyDisconnected`,{
                userId : userId,
                message: `${socket?.data.user.name || 'A player'} has left the game.`,
                tableId : tableId,
                occupancy : currentOccupancy
            });
        }
    });

    socket.on('leaveTable', async ({tableId}) =>{
        const userId = socket?.data.user.id;
        if(userId && playersInGames.has(userId)){
            clearTimeout(playersInGames.get(userId).disconnectionTimer);
            playersInGames.delete(userId);
   
            socket.leave(tableId);
            console.log(`User ${userId} manually left room ${tableId}.`);
            
            const socketsInRoom = await io.in(tableId).fetchSockets();
            const currentOccupancy = socketsInRoom.length;
            if(currentOccupancy <= 0){
                tableData.delete(tableId);
                return;
            }

            const players = tableData.get(tableId).players.filter(player => player.id === userId ? null: player)
            tableData.get(tableId).players = players
            io.to(tableId).emit('sendUpdateState',{tableData : tableData.get(tableId)});
            
            io.to(tableId).emit(`playerTrulyDisconnected`,{
                userId : userId,
                message: `${socket?.data.user.name || 'A player'} has left the game.`,
                tableId : tableId,
                occupancy : currentOccupancy
            });
        }

    });
};

export const attachUserDataToSocket = (io, socket)=>{
    if (socket.handshake.auth.token) {
        if(!socket.user){
            socket.user={}
        };
        socket.user.name = socket.handshake.auth.nick_name;
        socket.user.id = socket.handshake.auth.player_id;
        socket.user.role = socket.handshake.auth.role;
        socket.user.image = socket.handshake.auth.image;

        socket.data.user={}
        socket.data.user.name = socket.handshake.auth.nick_name;
        socket.data.user.id = socket.handshake.auth.player_id;
        socket.data.user.role = socket.handshake.auth.role;
        socket.data.user.image = socket.handshake.auth.image;
        return
    }
}

export const reConnectedHandler = (io, socket) => {
if (socket.recovered) {
        console.log(`Socket ${socket.id} (recovered from old ID ${socket.handshake.query.sid}) reconnected to room${socket?.rooms.values().next().value}`);
        const userId = socket?.data.user.id;
        const userName = socket?.data.user.name;
        
        if (playersInGames.has(userId)) {
            const playerInfo = playersInGames.get(userId);
            clearTimeout(playerInfo.disconnectionTimer);
            playerInfo.socketId = socket.id; // Update to new socket ID
            
            io.to(playerInfo.tableId).emit('playerReconnected', { userId: userId, message: `${userName || 'Player'} has reconnected!` }); // Annouced back to player reconnected
        }
    } else {
        // New connection and has to join tableID and re-enter password
        console.log(`New connection : ${socket.id}`);
        if (socket.data.user) {
            userId = socket.data.user.id;
            userName = socket.data.user.name || 'Authenticated Player';
            console.log(`New authenticated connection: ${userName} (${userId})`);
            socket.user = socket.data.user;
        } else {
            const clientGuestId = socket.handshake.auth?.player_id;
            const clientGuestName = socket.handshake.auth?.nick_name;
            
            if (clientGuestId) {
                const userId = clientGuestId;
                const userName = clientGuestName || `Guest_${userId.substring(0, 5)}`;
                
                console.log(`New guest connection. ID: ${userId}, Name: ${userName}`);
                
                socket.user = {};
                socket.data.user = {};
                
                socket.guestId = userId
                socket.data.id = userId;
                socket.data.name = userName;
                socket.user = { id: userId, name: userName, role: 'GUEST' };
                //Update PlayerInGames
                if (playersInGames.has(userId)) {
                    const playerInfo = playersInGames.get(userId);
                    
                    if (playerInfo.disconnectionTimer) {
                        
                        clearTimeout(playerInfo.disconnectionTimer);
                        playerInfo.socketId = socket.id;
                        
                        playersInGames.set(userId, playerInfo);
                        
                        const tableId = playerInfo.tableId;
                        socket.join(tableId);
                        socket.tableId = tableId;
                        io.to(tableId).emit('playerReconnected', {
                            user: {
                                player_id: userId,
                                nick_name: userName,
                                image: null,
                                role: 'GUEST'
                            },
                            message: `${userName} has rejoined room ${tableId}!`
                        });
                    } else {
                        // GuestID exist but game end
                        console.log(`Guest ${userName} (${userId}) connected but not in active game.`);
                        // Need to explicit 'joinPrivateTable'
                        socket.emit('reDirectedBack', { message: 'Please join room again' });
                    }
                } else {
                    // This is new guest or guest who previous game is end
                    console.log(`Guest ${userName} (${userId}) is a new guest or previous game ended.`);
                    socket.emit('reDirectedBack', { message: 'Please join room again' });
                }
            } else {
                //  No guestId and no authenticated user found , just new connection
                console.log(`New unauthenticated/unknown connection: ${socket.id}. Directing to lobby.`);
                socket.emit('playerTrulyDisconnected', { message: 'Please join room again' });
                socket.emit('reDirectedBack');
            }
        }
    }
}



// const MAX_USERS_PER_ROOM = 4; // Our room capacity limit

// io.on('connection', (socket) => {
//     console.log(`User connected: ${socket.id}`);

//     // Listen for a custom event from the client asking to join a room
//     socket.on('joinRoom', async (roomName, callback) => {
//         // 1. Check how many people are currently in the room
//         const socketsInRoom = await io.in(roomName).fetchSockets();
//         const currentOccupancy = socketsInRoom.length;

//         console.log(`Room "${roomName}" current occupancy: ${currentOccupancy}`);

//         // 2. Limit user joining to 4
//         if (currentOccupancy >= MAX_USERS_PER_ROOM) {
//             console.log(`Room "${roomName}" is full. User ${socket.id} cannot join.`);
//             if (callback) {
//                 callback({ success: false, message: 'Room is full' });
//             }
//             return; // Prevent joining the room
//         }

//         // If not full, allow the user to join
//         socket.join(roomName);
//         console.log(`User ${socket.id} joined room "${roomName}". New occupancy: ${currentOccupancy + 1}`);

//         // You might want to update all clients in the room about the new count
//         io.to(roomName).emit('roomUpdate', {
//             roomName: roomName,
//             occupancy: currentOccupancy + 1,
//             userJoined: socket.id
//         });

//         if (callback) {
//             callback({ success: true, message: `Joined room ${roomName}` });
//         }
//     });

//     socket.on('leaveRoom', (roomName) => {
//         socket.leave(roomName);
//         console.log(`User ${socket.id} left room "${roomName}".`);

//         // Update other clients in the room about the new count (after a small delay to ensure leave is processed)
//         setTimeout(async () => {
//             const socketsInRoom = await io.in(roomName).fetchSockets();
//             const currentOccupancy = socketsInRoom.length;
//             io.to(roomName).emit('roomUpdate', {
//                 roomName: roomName,
//                 occupancy: currentOccupancy,
//                 userLeft: socket.id
//             });
//             if (currentOccupancy === 0) {
//                 console.log(`Room "${roomName}" is now empty.`);
//                 // You might want to emit an event to the server to clean up empty rooms if needed
//                 // io.emit('roomEmpty', roomName);
//             }
//         }, 50); // Small delay
//     });

//     socket.on('disconnect', async () => {
//         console.log(`User disconnected: ${socket.id}`);
//         // When a socket disconnects, it automatically leaves all rooms.
//         // You can get the rooms it was in using `socket.rooms` in the 'disconnecting' event,
//         // then update the other clients in those rooms about the reduced count.

//         // The 'disconnecting' event is better for this as `socket.rooms` is still populated
//         // with the rooms the socket was in *before* disconnecting.
//         // If you need to send to a room *from* the disconnecting socket, you need to do it here.
//         // For example:
//         // socket.on('disconnecting', () => {
//         //     for (const room of socket.rooms) {
//         //         if (room !== socket.id) { // Exclude the socket's own private room
//         //             // This is where you could emit a 'userLeft' message
//         //             // io.to(room).emit('userLeft', socket.id);
//         //         }
//         //     }
//         // });
//         // However, for updating occupancy, fetching sockets after disconnect is simpler.

//         // Fetch all rooms the disconnected socket *was* in
//         const disconnectedRooms = Array.from(socket.rooms); // Convert Set to Array
//         for (const roomName of disconnectedRooms) {
//             if (roomName !== socket.id) { // Exclude the socket's own ID room
//                 const socketsInRoom = await io.in(roomName).fetchSockets();
//                 const currentOccupancy = socketsInRoom.length;
//                 io.to(roomName).emit('roomUpdate', {
//                     roomName: roomName,
//                     occupancy: currentOccupancy,
//                     userLeft: socket.id
//                 });
//                 if (currentOccupancy === 0) {
//                     console.log(`Room "${roomName}" is now empty.`);
//                 }
//             }
//         }
//     });
// });


// // ... (previous setup for express, http, io, MAX_USERS_PER_ROOM) ...

// // A simple in-memory store for room passwords (in a real app, use a database)
// const roomPasswords = {
//     'mySecretGame': 'supersecurepass',
//     'privateChat': '1234'
//     // ... more rooms
// };

// io.on('connection', (socket) => {
//     console.log(`User connected: ${socket.id}`);

//     socket.on('joinRoomWithPassword', async ({ tableId, password }, callback) => {
//         // 1. Validate inputs
//         if (!tableId || !password) {
//             if (callback) callback({ success: false, message: 'Room ID and password are required.' });
//             return;
//         }

//         // 2. Check if room exists and password is correct
//         const storedPassword = roomPasswords[tableId];
//         if (!storedPassword || storedPassword !== password) {
//             if (callback) callback({ success: false, message: 'Invalid room ID or password.' });
//             return;
//         }

//         // 3. Check room occupancy
//         const socketsInRoom = await io.in(tableId).fetchSockets();
//         const currentOccupancy = socketsInRoom.length;

//         if (currentOccupancy >= MAX_USERS_PER_ROOM) {
//             if (callback) callback({ success: false, message: 'Room is full.' });
//             return;
//         }

//         // 4. All checks passed: allow join
//         socket.join(tableId);
//         socket.currentRoom = tableId; // Store the room ID on the socket for easier management
//         console.log(`User ${socket.id} joined room "${tableId}".`);

//         // 5. Send success ACK to the client, including data for navigation
//         if (callback) {
//             callback({
//                 success: true,
//                 message: `Successfully joined room ${tableId}`,
//                 tableId: tableId // Send the room ID back for client-side routing
//             });
//         }

//         // 6. Notify others in the room (optional but good practice)
//         io.to(tableId).emit('roomUpdate', {
//             tableId: tableId,
//             occupancy: currentOccupancy + 1,
//             userJoined: socket.id
//         });
//     });

//     socket.on('disconnect', async () => {
//         console.log(`User disconnected: ${socket.id}`);
//         // If you stored the current room, you can use it here
//         const tableId = socket.currentRoom;
//         if (tableId) {
//             // Give a small delay to ensure the socket is fully removed from the room by Socket.IO
//             setTimeout(async () => {
//                 const socketsInRoom = await io.in(tableId).fetchSockets();
//                 const currentOccupancy = socketsInRoom.length;
//                 io.to(tableId).emit('roomUpdate', {
//                     tableId: tableId,
//                     occupancy: currentOccupancy,
//                     userLeft: socket.id
//                 });
//                 if (currentOccupancy === 0) {
//                     console.log(`Room "${tableId}" is now empty.`);
//                     // You might want to remove the password from `roomPasswords` if room is truly ephemeral
//                 }
//             }, 50);
//         }
//     });
// });