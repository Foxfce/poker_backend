import dotenv from 'dotenv';
import app, { corsSetting } from './app.js'
import http from 'http';
import { Server } from 'socket.io'
import { attachUserDataToSocket, reConnectedHandler, registerSocketHandlers } from './handlers/socket.handler.js';
import { playersInGames, quickJoinQueue, tableData } from './stores/table-data.store.js';
import { clearInterval, clearTimeout } from 'timers';
import { generatedTableId } from './utils/id-generator.util.js';
import PokerTable from './stores/poker-table-class.store.js';

dotenv.config();

const PORT = process.env.PORT || 3069;


const waitForDisconnected = 15; // time in second for disconnecting player

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: corsSetting,
    },
    connectionStateRecovery: {
        maxDisconnectionDuration: waitForDisconnected * 1000, // Keep disconnection  time
        skipMiddlewares: true,
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
            const newPokerTable = new PokerTable(tableId, null);
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
            io.to(tableId).emit('getMessage', { chatData: chatData });
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

    socket.on('joinSeat', async ({ tableId, player_id, seatNumber }, callback) => {
        console.log(`${socket.user.id} sit on seat ${seatNumber}`);
        if (!tableData.has(tableId)) return callback({ success: false, message: `There is no tableData : ${tableId}` });
        const tableState = tableData.get(tableId);
        const result = tableState.addPlayerToSeat(seatNumber, player_id);
        callback({ success: result, message: result ? `Player ${player_id} has been seated` : `Seat ${seatNumber} already taken` });

        if (result) io.to(tableId).emit('sendUpdateState', { tableId: tableId, tableData: tableState });
    });

    socket.on('gameStart', async ({ player_id, tableId }) => {
        console.log(`${socket?.user.id} is starting the game ${socket?.tableId}`);
        const tableState = tableData.get(tableId);

        const playerOnSeat = () => (tableState.seatState.filter(player => player != null)).length;

        if (playerOnSeat() >= 2) {
            io.to(tableId).emit('setTimerStartGame', { timer: 10 })

            socket.once('cancelGameStart', async ({ player_id, tableId }) => {
                console.log(`player ${socket?.user.id} is leaving table`);
                if (playerOnSeat() < 2) {
                    console.log(`Canceling game at table ${tableId}`);
                    io.to(tableId).emit('cancelGameStart') // sending to cancel timer on front end
                    clearInterval(startInterval);
                }
            });

            let timeElapsed = 8; // 8 second interval checking if player in sitout and has less than 2 player        
            
            const startInterval = setInterval(() => { 
                timeElapsed += 1; // increment by 1

                // Check current player on seat
                if (playerOnSeat() < 2) {
                    socket.off('cancelGameStart');

                    io.to(tableId).emit('cancelGameStart');
                    clearInterval(startInterval);
                    return;
                }
                
                if(timeElapsed >= 8){
                    if (playerOnSeat() >= 2) {
                        socket.off('cancelGameStart');
                        
                        // Set up the gameState
                        tableState.setRound();
                        tableState.drawCard();


                        io.to(tableId).emit('sendUpdateState', { tableId: tableId, tableData: tableState });              
                        clearInterval(startInterval);
                        return;
                    }else{
                        socket.off('cancelGameStart');

                        io.to(tableId).emit('cancelGameStart');
                        clearInterval(startInterval);
                        return;
                    }
                }
            }, 1000);            
        }
    });

})


server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
})