// ============ ONLINE TIC TAC TOE ============
class OnlineTicTacToe {
    constructor(socket, roomId, playerName, players) {
        this.socket = socket;
        this.roomId = roomId;
        this.playerName = playerName;
        this.players = players;
        this.board = Array(9).fill(null);
        this.myTurn = false;
        this.mySymbol = 'X';
        this.opponentSymbol = 'O';
        this.gameOver = false;
        
        this.init();
    }
    
    init() {
        // Determine who goes first (player 1 in room)
        const isFirstPlayer = this.players[0].name === this.playerName;
        this.mySymbol = isFirstPlayer ? 'X' : 'O';
        this.opponentSymbol = isFirstPlayer ? 'O' : 'X';
        this.myTurn = isFirstPlayer;
        
        this.renderBoard();
        this.setupListeners();
        this.updateStatus();
    }
    
    setupListeners() {
        this.socket.on('opponent-move', (data) => {
            if (data.type === 'tic-tac-toe-move') {
                this.makeOpponentMove(data.index);
            }
        });
    }
    
    makeMove(index) {
        if (!this.myTurn || this.gameOver || this.board[index]) return;
        
        this.board[index] = this.mySymbol;
        this.myTurn = false;
        
        this.socket.emit('game-move', {
            roomId: this.roomId,
            move: {
                type: 'tic-tac-toe-move',
                index: index,
                symbol: this.mySymbol
            }
        });
        
        this.renderBoard();
        this.checkWin();
        this.updateStatus();
    }
    
    makeOpponentMove(index) {
        this.board[index] = this.opponentSymbol;
        this.myTurn = true;
        this.renderBoard();
        this.checkWin();
        this.updateStatus();
    }
    
    checkWin() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        
        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                this.gameOver = true;
                return this.board[a];
            }
        }
        
        if (this.board.every(cell => cell !== null)) {
            this.gameOver = true;
            return 'tie';
        }
        
        return null;
    }
    
    updateStatus() {
        const statusEl = document.getElementById('roomTitle');
        if (this.gameOver) {
            statusEl.textContent = 'Game Over!';
        } else if (this.myTurn) {
            statusEl.textContent = '💕 Your turn!';
        } else {
            statusEl.textContent = '💙 Opponent\'s turn...';
        }
    }
    
    renderBoard() {
        const gameArea = document.getElementById('gameArea');
        gameArea.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(3, 100px); gap: 10px;">
                ${this.board.map((cell, index) => `
                    <div onclick="game.makeMove(${index})" style="
                        width: 100px;
                        height: 100px;
                        background: rgba(255,255,255,0.1);
                        border-radius: 15px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 2.5rem;
                        cursor: pointer;
                        color: ${cell === 'X' ? '#ff6b9d' : '#74b9ff'};
                    ">${cell === 'X' ? '💕' : cell === 'O' ? '💙' : ''}</div>
                `).join('')}
            </div>
        `;
    }
}

// Initialize when socket is ready
let game;
socket.on('connect', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room');
    const playerName = urlParams.get('name');
    
    // Get players from room
    socket.emit('join-room', { roomId, playerName });
    
    socket.on('room-players', (players) => {
        game = new OnlineTicTacToe(socket, roomId, playerName, players);
        initChat(socket, roomId, playerName);
    });
});