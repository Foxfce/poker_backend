export const registerSocketHandlers = (io, socket)=>{
    console.log('Player has connected :', socket.id);

    // Operation

    socket.on('disconnect', () =>{
        console.log('Player disconnected :', socket.id);
    });
};



const MAX_USERS_PER_ROOM = 4; // Our room capacity limit

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Listen for a custom event from the client asking to join a room
    socket.on('joinRoom', async (roomName, callback) => {
        // 1. Check how many people are currently in the room
        const socketsInRoom = await io.in(roomName).fetchSockets();
        const currentOccupancy = socketsInRoom.length;

        console.log(`Room "${roomName}" current occupancy: ${currentOccupancy}`);

        // 2. Limit user joining to 4
        if (currentOccupancy >= MAX_USERS_PER_ROOM) {
            console.log(`Room "${roomName}" is full. User ${socket.id} cannot join.`);
            if (callback) {
                callback({ success: false, message: 'Room is full' });
            }
            return; // Prevent joining the room
        }

        // If not full, allow the user to join
        socket.join(roomName);
        console.log(`User ${socket.id} joined room "${roomName}". New occupancy: ${currentOccupancy + 1}`);

        // You might want to update all clients in the room about the new count
        io.to(roomName).emit('roomUpdate', {
            roomName: roomName,
            occupancy: currentOccupancy + 1,
            userJoined: socket.id
        });

        if (callback) {
            callback({ success: true, message: `Joined room ${roomName}` });
        }
    });

    socket.on('leaveRoom', (roomName) => {
        socket.leave(roomName);
        console.log(`User ${socket.id} left room "${roomName}".`);

        // Update other clients in the room about the new count (after a small delay to ensure leave is processed)
        setTimeout(async () => {
            const socketsInRoom = await io.in(roomName).fetchSockets();
            const currentOccupancy = socketsInRoom.length;
            io.to(roomName).emit('roomUpdate', {
                roomName: roomName,
                occupancy: currentOccupancy,
                userLeft: socket.id
            });
            if (currentOccupancy === 0) {
                console.log(`Room "${roomName}" is now empty.`);
                // You might want to emit an event to the server to clean up empty rooms if needed
                // io.emit('roomEmpty', roomName);
            }
        }, 50); // Small delay
    });

    socket.on('disconnect', async () => {
        console.log(`User disconnected: ${socket.id}`);
        // When a socket disconnects, it automatically leaves all rooms.
        // You can get the rooms it was in using `socket.rooms` in the 'disconnecting' event,
        // then update the other clients in those rooms about the reduced count.

        // The 'disconnecting' event is better for this as `socket.rooms` is still populated
        // with the rooms the socket was in *before* disconnecting.
        // If you need to send to a room *from* the disconnecting socket, you need to do it here.
        // For example:
        // socket.on('disconnecting', () => {
        //     for (const room of socket.rooms) {
        //         if (room !== socket.id) { // Exclude the socket's own private room
        //             // This is where you could emit a 'userLeft' message
        //             // io.to(room).emit('userLeft', socket.id);
        //         }
        //     }
        // });
        // However, for updating occupancy, fetching sockets after disconnect is simpler.

        // Fetch all rooms the disconnected socket *was* in
        const disconnectedRooms = Array.from(socket.rooms); // Convert Set to Array
        for (const roomName of disconnectedRooms) {
            if (roomName !== socket.id) { // Exclude the socket's own ID room
                const socketsInRoom = await io.in(roomName).fetchSockets();
                const currentOccupancy = socketsInRoom.length;
                io.to(roomName).emit('roomUpdate', {
                    roomName: roomName,
                    occupancy: currentOccupancy,
                    userLeft: socket.id
                });
                if (currentOccupancy === 0) {
                    console.log(`Room "${roomName}" is now empty.`);
                }
            }
        }
    });
});


// ... (previous setup for express, http, io, MAX_USERS_PER_ROOM) ...

// A simple in-memory store for room passwords (in a real app, use a database)
const roomPasswords = {
    'mySecretGame': 'supersecurepass',
    'privateChat': '1234'
    // ... more rooms
};

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('joinRoomWithPassword', async ({ roomId, password }, callback) => {
        // 1. Validate inputs
        if (!roomId || !password) {
            if (callback) callback({ success: false, message: 'Room ID and password are required.' });
            return;
        }

        // 2. Check if room exists and password is correct
        const storedPassword = roomPasswords[roomId];
        if (!storedPassword || storedPassword !== password) {
            if (callback) callback({ success: false, message: 'Invalid room ID or password.' });
            return;
        }

        // 3. Check room occupancy
        const socketsInRoom = await io.in(roomId).fetchSockets();
        const currentOccupancy = socketsInRoom.length;

        if (currentOccupancy >= MAX_USERS_PER_ROOM) {
            if (callback) callback({ success: false, message: 'Room is full.' });
            return;
        }

        // 4. All checks passed: allow join
        socket.join(roomId);
        socket.currentRoom = roomId; // Store the room ID on the socket for easier management
        console.log(`User ${socket.id} joined room "${roomId}".`);

        // 5. Send success ACK to the client, including data for navigation
        if (callback) {
            callback({
                success: true,
                message: `Successfully joined room ${roomId}`,
                roomId: roomId // Send the room ID back for client-side routing
            });
        }

        // 6. Notify others in the room (optional but good practice)
        io.to(roomId).emit('roomUpdate', {
            roomId: roomId,
            occupancy: currentOccupancy + 1,
            userJoined: socket.id
        });
    });

    socket.on('disconnect', async () => {
        console.log(`User disconnected: ${socket.id}`);
        // If you stored the current room, you can use it here
        const roomId = socket.currentRoom;
        if (roomId) {
            // Give a small delay to ensure the socket is fully removed from the room by Socket.IO
            setTimeout(async () => {
                const socketsInRoom = await io.in(roomId).fetchSockets();
                const currentOccupancy = socketsInRoom.length;
                io.to(roomId).emit('roomUpdate', {
                    roomId: roomId,
                    occupancy: currentOccupancy,
                    userLeft: socket.id
                });
                if (currentOccupancy === 0) {
                    console.log(`Room "${roomId}" is now empty.`);
                    // You might want to remove the password from `roomPasswords` if room is truly ephemeral
                }
            }, 50);
        }
    });
});



// =================== Logic accidentally disconnected but can still re connect===========================
const io = require('socket.io')(http, {
    connectionStateRecovery: {
        // Keep disconnected sessions for 10 seconds (10000 milliseconds)
        maxDisconnectionDuration: 10 * 1000,
        // You might want to skip middlewares for a recovered connection
        // if your middleware checks for things that might have changed (e.g., auth token)
        skipMiddlewares: true,
    }
});

// A simple map to track active players and their room for this example
const playersInGames = new Map(); // Map: <userId, { roomId, socketId, disconnectionTimer }>

io.on('connection', (socket) => {
    // Check if this is a recovered session
    if (socket.recovered) {
        console.log(`Socket ${socket.id} (recovered from old ID ${socket.handshake.query.sid}) reconnected to room ${socket.rooms.values().next().value}`);
        // If you attached user info to socket.data or socket.user during initial connection
        // it will be available here automatically: socket.user.id
        const userId = socket.user.id; // Assuming you set socket.user in auth middleware

        // Update your application's player state with the new socket.id
        if (playersInGames.has(userId)) {
            const playerInfo = playersInGames.get(userId);
            clearTimeout(playerInfo.disconnectionTimer); // Cancel any pending disconnection timer
            playerInfo.socketId = socket.id; // Update to the new socket ID
            playersInGames.set(userId, playerInfo);
            io.to(playerInfo.roomId).emit('playerReconnected', { userId: userId, message: `${userId} has reconnected!` });
            // The client is automatically re-joined to its previous rooms by Socket.IO
        }
    } else {
        // This is a brand new connection or an unrecoverable old one
        console.log(`New connection: ${socket.id}`);
        // Your existing joinRoomWithPassword logic will apply here
        // Upon successful join, store user ID and socket ID
        // e.g., socket.user = { id: 'some_user_id' };
    }

    
    socket.on('joinRoomWithPassword', async ({ roomId, password }, callback) => {
        // ... (your existing validation logic) ...

        // If successful:
        socket.join(roomId);
        socket.currentRoom = roomId;
        socket.user = { id: 'user_' + socket.id.substring(0, 5), name: 'Player ' + socket.id.substring(0, 5) }; // Example user
        
        playersInGames.set(socket.user.id, {
            roomId: roomId,
            socketId: socket.id,
            disconnectionTimer: null // No timer active initially
        });

        if (callback) {
            callback({ success: true, message: `Joined room ${roomId}`, roomId: roomId });
        }
        io.to(roomId).emit('roomUpdate', {
            roomId: roomId,
            occupancy: (await io.in(roomId).fetchSockets()).length,
            userJoined: socket.user.id,
            userName: socket.user.name
        });
    });

    socket.on('disconnect', async (reason) => {
        console.log(`Socket ${socket.id} disconnected. Reason: ${reason}`);

        const userId = socket.user?.id; // Get the user ID associated with this socket
        const roomId = socket.currentRoom; // Get the room ID

        if (userId && roomId && playersInGames.has(userId)) {
            // Start a timer for this user's potential "true" disconnection
            const playerInfo = playersInGames.get(userId);

            // Only start a timer if it's not an explicit client-side disconnect
            // (e.g., if the user intentionally closes the game/leaves gracefully)
            if (reason !== 'io client disconnect') {
                console.log(`Starting 10-second timer for user ${userId} in room ${roomId}.`);
                const disconnectionTimer = setTimeout(async () => {
                    // This code runs if the user hasn't reconnected within 10 seconds
                    console.log(`User ${userId} (socket ${socket.id}) truly disconnected from room ${roomId} after timeout.`);
                    playersInGames.delete(userId); // Remove from active players

                    // Remove them from the room (though Socket.IO will do this automatically eventually)
                    // You might want to also remove their data from game state
                    
                    // Notify other players that this user is truly gone
                    const socketsInRoom = await io.in(roomId).fetchSockets();
                    const currentOccupancy = socketsInRoom.length;
                    io.to(roomId).emit('playerTrulyDisconnected', {
                        userId: userId,
                        message: `${socket.user?.name || 'A player'} has left the game.`,
                        roomId: roomId,
                        occupancy: currentOccupancy
                    });
                }, 10 * 1000); // 10 seconds timeout

                playerInfo.disconnectionTimer = disconnectionTimer;
                playersInGames.set(userId, playerInfo); // Update the map with the timer ID
            } else {
                 // User intentionally disconnected (e.g., clicked "leave game")
                console.log(`User ${userId} intentionally disconnected from room ${roomId}.`);
                playersInGames.delete(userId);
                 const socketsInRoom = await io.in(roomId).fetchSockets();
                    const currentOccupancy = socketsInRoom.length;
                 io.to(roomId).emit('playerTrulyDisconnected', {
                        userId: userId,
                        message: `${socket.user?.name || 'A player'} has left the game.`,
                        roomId: roomId,
                        occupancy: currentOccupancy
                    });
            }
        }
    });

    // You might also need a 'leaveRoom' event if users can leave gracefully
    socket.on('leaveRoom', async (roomId) => {
        const userId = socket.user?.id;
        if (userId && playersInGames.has(userId)) {
            clearTimeout(playersInGames.get(userId).disconnectionTimer); // Clear any pending timer
            playersInGames.delete(userId);
            socket.leave(roomId);
            console.log(`User ${userId} manually left room ${roomId}.`);

            const socketsInRoom = await io.in(roomId).fetchSockets();
            const currentOccupancy = socketsInRoom.length;
            io.to(roomId).emit('playerTrulyDisconnected', {
                userId: userId,
                message: `${socket.user?.name || 'A player'} has left the game.`,
                roomId: roomId,
                occupancy: currentOccupancy
            });
        }
    });
});