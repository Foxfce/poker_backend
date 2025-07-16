import dotenv from 'dotenv';
import app, { corsSetting } from './app.js'
import http from 'http';
import { Server } from 'socket.io'
import { attachUserDataToSocket, reConnectedHandler, registerSocketHandlers } from './handlers/socket.handler.js';
import { playersInGames, quickJoinQueue, tableData } from './stores/table-data.store.js';
import { clearTimeout } from 'timers';
import { generatedTableId } from './utils/id-generator.util.js';
import PokerTable from './stores/poker-table-class.store.js';

dotenv.config();

const PORT = process.env.PORT || 6969;


const waitForDisconnected = 15; // time in second for disconnecting player

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: corsSetting,
    },
    connectionStateRecovery: {
        maxDisconnectionDuration: waitForDisconnected *1000, // Keep disconnection  time
        skipMiddlewares : true,
    },
});

io.on('connection', (socket) => {

    // Check player recovering from disconnected (INPROGRESS)
    reConnectedHandler(io, socket);
    // Check player recovering from disconnected (INPROGRESS)

    registerSocketHandlers(io, socket);
    // console.log(socket.handshake.auth.token);

    // Check Member to create attach Data
    attachUserDataToSocket(io, socket);

    //To Create Guest Player
    socket.on('createGuestPlayer', () => {
        console.log(`user ${socket.id} has create guest data`);
        const guestData = {
            nick_name: `Guest${Math.floor(Math.random() * 10000)}`,
            player_id: socket.id.slice(5, 10),
            role: 'GUEST'
        };
        if (!socket.user) socket.user = {};

        socket.user.name = guestData.nick_name;
        socket.user.id = guestData.player_id;
        socket.user.role = guestData.role;

        socket.data.user = {}
        socket.data.user.name = guestData.nick_name;
        socket.data.user.id = guestData.player_id;
        socket.data.user.role = guestData.role;

        socket.emit('guestPlayerCreated', guestData);
    });

    socket.on('quickJoinTable', ({ nick_name, player_id, role, image = null }, callback) => {
        if (quickJoinQueue.some(player => player.player_id === player_id)) return callback({ success: false, message: 'You already In Queue' })
        quickJoinQueue.push({ id: socket.id, nick_name, player_id, role, image });
        console.log(`${nick_name} added to quick join queue. Current queue: ${quickJoinQueue.length}`);
        if (typeof callback === 'function') {
            callback({ success: true, message: `Added to quick join queue.` })
        }

        if (quickJoinQueue.length >= 4) {

            const tableId = generatedTableId();
            const playersForNewTable = quickJoinQueue.splice(0, 4); // Cut first 4 players store in variable

            // Logic link tableId <=> default game state here
            const newPokerTable = new PokerTable(tableId);
            tableData.set(tableId, newPokerTable);

            //Assigned player to newly created tableId
            playersForNewTable.forEach(player => {
                const playerSocket = io.sockets.sockets.get(player.id);
                if (playerSocket) {
                    const player_id = playerSocket.user.id;
                    const nick_name = playerSocket.user.name;
                    const role = playerSocket.user.role;
                    const image = playerSocket.user.image;

                    newPokerTable.addPlayer({ player_id, nick_name, role, image })

                    playerSocket.join(tableId);
                    playerSocket.tableId = tableId;
                    playerSocket.emit('quickJoinTableAssignedRoom', { tableId: tableId, message: 'You have been assigned to a quick join Table!', tableData: newPokerTable })

                    // set playerInGames for handle disconnection
                    playersInGames.set(playerSocket.user.id, { tableId: tableId, socketId: playerSocket.id, disconnectionTimer: null });
                }
            });

            // Updated room status to table : tableId
            // io.to(tableId).emit('stateUpdate')
            console.log(`Quick join room created: ${tableId}`);
        }

    });


    // Action join Private table
    socket.on('joinPrivateTable', async ({ tableId, password, userData }, callback) => {
        if (!tableData.has(tableId)) return callback({ success: false, message: `Table ${tableId} did not existed` })
        // Validation tableId with password logic

        // if successful
        socket.join(tableId);
        socket.currentTable = tableId;
        socket.user = { id: userData.player_id, name: userData.nick_name, image: userData?.profile_picture } // store userStore data here

        playersInGames.set(socket.user.id, {
            tableId: tableId,
            socketId: socket.id,
            disconnectionTimer: null // Initially no timer
        });

        if (callback) {
            callback({ success: true, message: `Joined table ${tableId}`, tableId: tableId });
        }

        // Announce to room tableId that player join & Send data to update playerStore
        io.to(tableId).emit(`playerJoinUpdate`, {
            id: socket.user.id,
            seatId: null,
            nick_name: socket.user.name,
            image: socket.user.image,
            pocket: 2000,
        });
    });

    socket.on('createPrivateTable', async ({ password }, callback) => {
        console.log(`Player ${socket.id} create table`);
        const tableId = generatedTableId();

        if (callback) callback({ success: true, message: `Created private table ${tableId}`, tableId: tableId })

    });

    socket.on('sendMessage', ({ name, message, player_id }) => {
        console.log('Recieved Message');
        console.log(`${name} said ${message}`);

        const tableId = socket.tableId;
        if (tableData.has(tableId)) {
            tableData.get(tableId).updateChatBox({ name, message, player_id });
            const chatData = tableData.get(tableId).chatState;
            io.to(tableId).emit('getMessage', {chatData : chatData});
            return;
        }
        io.to(socket.id).emit('getMessage', { chatData: null });
    });

    socket.on('getUpdatedState', async ({ tableId }, callback) => {
        console.log(`${socket.user.id} call for roomUpdate`);
        if (!tableData.has(tableId)) return callback({ success: false, message: `There is no tableData : ${tableId}` });
        const gameStateData = tableData.get(tableId);

        if (callback) return callback({ success: true, message: `Retrieved gameState successful`, gameStateData })
    });
})


server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
})