export default class PokerTable {
    constructor(tableId, password = null) {
        this.tableId = tableId;
        this.password = password;
        this.players = [null, null, null, null]; // update playerId here for ref seatId is this.seatState[index+1] 
        this.gameState = {
            tableId: this.tableId,
            password: this.password,
            round: null, // no value, become 1 when start
            card_revealed: 3,
            current_pot: 1,
            current_bet: 50,
            player: [], // don't allow null store as seatId (1-4)
            call_player: [], // when call action perform move player to this as seatId(1-4)
            allIn_player: [], // when all in action put player as seatId(1-4), to prevent callback to bet again
            fold_player: [], // when call action fold move player to this as seatId(1-4)
            blinds_seatId: 1, // increment by 1 for next gamestart
            player_turn: null, // store as player_id
            winner: null,
        };
        this.potState = 0; // example pot info participant as seatId dump player 
        this.sidePotState = []; // When all-in action appear add pot data to this got participant 
        this.playerState = new Map(); // store player state for eaiser update when done update to players
        this.seatState = [null, null, null, null]; // 4 seats initially empty
        this.community_card = [null, null, null, null, null];
        this.player1 = [null, null];
        this.player2 = [null, null];
        this.player3 = [null, null];
        this.player4 = [null, null];
        this.player1_rank = null;
        this.player2_rank = null;
        this.player3_rank = null;
        this.player4_rank = null;
        this.chatState = [];
    }

    // --- Player state structure
    // id: player_id,
    // seatId: null,
    // name: nick_name,
    // role: role,
    // image: image,
    // pocket: null,

    // ----Side Pot state structure
    // pot_number: 2,
    // price: 2000,
    // participant: [1, 4],


    // Add player to first empty slot, returns players index or -1 if full
    // This function is for join room logic
    addPlayer({ player_id, nick_name, role, image }) {
        const initialData = {
            id: player_id,
            seatId: null,
            name: nick_name,
            role: role,
            image: image,
            pocket: null,
        }

        const playersIndex = this.players.findIndex(p => p === null);
        if (playersIndex === -1) return -1;

        this.players[playersIndex] = initialData

        return;
    }


    addPlayerToSeat(seatNumber, player_id) {
        if (!seatNumber && !player_id) return false;
        if (this.seatState[seatNumber - 1]) return false;
        this.seatState[seatNumber - 1] = player_id

        const index = this.players.findIndex(player => player.id === player_id);
        this.players[index].seatId = seatNumber;
        return true
    }

    // Remove player from table
    removePlayer(playerId) {
        const seatIndex = this.players.findIndex(p => p === playerId);
        if (seatIndex !== -1) {
            this.players[seatIndex] = null;
            this.playerState.delete(playerId);
            return true;
        }
        return false;
    }

    // Update pot amount
    updatePot(amount) {
        this.potState.potAmount += amount;
    }

    setRound() {
        const round = this.gameState.round
        if (!round) return this.gameState.round = 1;
        if (round === 4) return this.gameState.round = null;
        this.gameState.round += 1
    }

    setNextPlayerTurrn() {
        const currentPlayer = this.gameState.player_turn;
        if (!currentPlayer) return this.gameState.player_turn = this.seatState[this.blinds_seatId]
        const currentSeatIndex = this.seatState.findIndex(player => player === currentPlayer);
        if (currentSeatIndex + 1 >= 4) return this.gameState.player_turn = this.seatState[0];
        return this.gameState.player_turn = this.seatState[currentSeatIndex + 1];
    }

    updateChatBox({ message, name, player_id }) {
        console.log(this.chatState);
        this.chatState = [...(this.chatState), { message, name, player_id }];
    }

    // Get current state snapshot (for broadcasting or UI)
    getState() {
        return {
            tableId: this.tableId,
            password: this.password,
            players: this.players,
            gateState: this.gateState,
            potState: this.potState,
            playerState: Array.from(this.playerState.entries()),
        };
    }
}