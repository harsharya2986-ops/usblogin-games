// ============================================================
// SUPER TIC TAC TOE - Free Choice Working Version
// Player can play ANYWHERE they want
// ============================================================

class SuperTicTacToe {
    constructor() {
        this.macroBoard = Array(9).fill(null); // Winner of each mini board
        this.miniBoards = Array(9).fill(null).map(() => Array(9).fill(null)); // 9 mini boards
        this.currentPlayer = 'pink'; // 'pink' = player, 'gold' = AI
        this.gameOver = false;
        this.winner = null;
        this.playerScore = 0;
        this.aiScore = 0;
        this.isAIThinking = false;
        
        this.init();
    }
    
    init() {
        this.renderBoard();
        this.updateStatus();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        document.getElementById('macroBoard').addEventListener('click', (e) => {
            const miniCell = e.target.closest('.mini-cell');
            if (miniCell && !this.gameOver && !this.isAIThinking && this.currentPlayer === 'pink') {
                const macroIndex = parseInt(miniCell.dataset.macro);
                const miniIndex = parseInt(miniCell.dataset.mini);
                this.handlePlayerMove(macroIndex, miniIndex);
            }
        });
    }
    
    handlePlayerMove(macroIndex, miniIndex) {
        // Simple validation - just check if cell is empty and board not won
        if (this.gameOver) return;
        if (this.miniBoards[macroIndex][miniIndex] !== null) return;
        if (this.macroBoard[macroIndex] !== null) return;
        
        // Execute player move
        this.executeMove(macroIndex, miniIndex);
        
        // Check if game ended
        if (this.gameOver) return;
        
        // AI turn
        if (this.currentPlayer === 'gold') {
            this.isAIThinking = true;
            document.getElementById('statusText').textContent = '🏹 Partner is thinking...';
            
            setTimeout(() => {
                this.handleAIMove();
                this.isAIThinking = false;
            }, 500);
        }
    }
    
    handleAIMove() {
        if (this.gameOver || this.currentPlayer !== 'gold') return;
        
        const move = this.getBestAIMove();
        if (move) {
            this.executeMove(move.macroIndex, move.miniIndex);
        }
    }
    
    executeMove(macroIndex, miniIndex) {
        // Place the mark
        this.miniBoards[macroIndex][miniIndex] = this.currentPlayer;
        
        // Check if mini board is won
        const miniWinner = this.checkMiniWinner(macroIndex);
        if (miniWinner) {
            this.macroBoard[macroIndex] = miniWinner;
        } else if (this.isMiniBoardFull(macroIndex)) {
            this.macroBoard[macroIndex] = 'tie';
        }
        
        // Check if macro board is won
        const macroWinner = this.checkMacroWinner();
        if (macroWinner) {
            this.endGame(macroWinner);
            this.renderBoard();
            return;
        }
        
        // Check if all boards are full (draw)
        if (this.macroBoard.every(board => board !== null)) {
            this.endGame('tie');
            this.renderBoard();
            return;
        }
        
        // Switch player
        this.currentPlayer = this.currentPlayer === 'pink' ? 'gold' : 'pink';
        
        // Update UI
        this.renderBoard();
        this.updateStatus();
    }
    
    checkMiniWinner(boardIndex) {
        const board = this.miniBoards[boardIndex];
        const patterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        
        for (const [a, b, c] of patterns) {
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        return null;
    }
    
    checkMacroWinner() {
        const patterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        
        for (const [a, b, c] of patterns) {
            if (this.macroBoard[a] && 
                this.macroBoard[a] === this.macroBoard[b] && 
                this.macroBoard[a] === this.macroBoard[c] &&
                this.macroBoard[a] !== 'tie') {
                return this.macroBoard[a];
            }
        }
        return null;
    }
    
    isMiniBoardFull(boardIndex) {
        return this.miniBoards[boardIndex].every(cell => cell !== null);
    }
    
    getAllAvailableMoves() {
        const moves = [];
        
        for (let macroIndex = 0; macroIndex < 9; macroIndex++) {
            // Skip won or full boards
            if (this.macroBoard[macroIndex] !== null) continue;
            
            for (let miniIndex = 0; miniIndex < 9; miniIndex++) {
                if (this.miniBoards[macroIndex][miniIndex] === null) {
                    moves.push({ macroIndex, miniIndex });
                }
            }
        }
        
        return moves;
    }
    
    getBestAIMove() {
        const allMoves = this.getAllAvailableMoves();
        if (allMoves.length === 0) return null;
        
        // Group moves by board
        const movesByBoard = {};
        for (const move of allMoves) {
            if (!movesByBoard[move.macroIndex]) {
                movesByBoard[move.macroIndex] = [];
            }
            movesByBoard[move.macroIndex].push(move.miniIndex);
        }
        
        const boardIndices = Object.keys(movesByBoard).map(Number);
        
        // 1. Win current mini board
        for (const boardIndex of boardIndices) {
            const winningMove = this.findWinningMove(boardIndex, 'gold');
            if (winningMove !== null && movesByBoard[boardIndex].includes(winningMove)) {
                return { macroIndex: boardIndex, miniIndex: winningMove };
            }
        }
        
        // 2. Block player from winning mini board
        for (const boardIndex of boardIndices) {
            const blockingMove = this.findWinningMove(boardIndex, 'pink');
            if (blockingMove !== null && movesByBoard[boardIndex].includes(blockingMove)) {
                return { macroIndex: boardIndex, miniIndex: blockingMove };
            }
        }
        
        // 3. Take center of any available board
        for (const boardIndex of boardIndices) {
            if (movesByBoard[boardIndex].includes(4)) {
                return { macroIndex: boardIndex, miniIndex: 4 };
            }
        }
        
        // 4. Take corners
        const corners = [0, 2, 6, 8];
        for (const boardIndex of boardIndices) {
            const availableCorners = corners.filter(c => movesByBoard[boardIndex].includes(c));
            if (availableCorners.length > 0) {
                return {
                    macroIndex: boardIndex,
                    miniIndex: availableCorners[Math.floor(Math.random() * availableCorners.length)]
                };
            }
        }
        
        // 5. Take edges
        const edges = [1, 3, 5, 7];
        for (const boardIndex of boardIndices) {
            const availableEdges = edges.filter(e => movesByBoard[boardIndex].includes(e));
            if (availableEdges.length > 0) {
                return {
                    macroIndex: boardIndex,
                    miniIndex: availableEdges[Math.floor(Math.random() * availableEdges.length)]
                };
            }
        }
        
        // 6. Random move
        const randomMove = allMoves[Math.floor(Math.random() * allMoves.length)];
        return randomMove;
    }
    
    findWinningMove(boardIndex, player) {
        const board = this.miniBoards[boardIndex];
        const patterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        
        for (const pattern of patterns) {
            const cells = pattern.map(i => board[i]);
            const playerCount = cells.filter(c => c === player).length;
            const emptyCount = cells.filter(c => c === null).length;
            
            if (playerCount === 2 && emptyCount === 1) {
                const emptyIndex = cells.indexOf(null);
                return pattern[emptyIndex];
            }
        }
        return null;
    }
    
    endGame(winner) {
        this.gameOver = true;
        this.winner = winner;
        
        if (winner === 'pink') {
            this.playerScore++;
            document.getElementById('playerScore').textContent = this.playerScore;
            document.getElementById('statusText').textContent = '🎉 You Win! Your love conquers all! 💕';
        } else if (winner === 'gold') {
            this.aiScore++;
            document.getElementById('aiScore').textContent = this.aiScore;
            document.getElementById('statusText').textContent = '🏹 Partner Wins! Struck by Cupid! 💘';
        } else if (winner === 'tie') {
            document.getElementById('statusText').textContent = '🤝 It\'s a Draw! Perfect match!';
        }
    }
    
    updateStatus() {
        const statusText = document.getElementById('statusText');
        
        if (this.gameOver) return;
        
        if (this.currentPlayer === 'pink') {
            statusText.textContent = '💕 Your turn! Play any empty cell';
        } else {
            statusText.textContent = '🏹 Partner is thinking...';
        }
    }
    
    renderBoard() {
        const macroBoard = document.getElementById('macroBoard');
        macroBoard.innerHTML = '';
        
        for (let macroIndex = 0; macroIndex < 9; macroIndex++) {
            const macroCell = document.createElement('div');
            macroCell.className = 'macro-cell';
            
            // Check if board is won
            if (this.macroBoard[macroIndex] === 'pink') {
                macroCell.classList.add('won-pink');
                macroCell.innerHTML = '<div class="macro-overlay">💕</div>';
            } else if (this.macroBoard[macroIndex] === 'gold') {
                macroCell.classList.add('won-gold');
                macroCell.innerHTML = '<div class="macro-overlay">🏹</div>';
            } else if (this.macroBoard[macroIndex] === 'tie') {
                macroCell.innerHTML = '<div class="macro-overlay">🤝</div>';
                macroCell.style.opacity = '0.5';
            } else {
                // Render mini board
                const miniBoard = document.createElement('div');
                miniBoard.className = 'mini-board';
                
                for (let miniIndex = 0; miniIndex < 9; miniIndex++) {
                    const miniCell = document.createElement('div');
                    miniCell.className = 'mini-cell';
                    miniCell.dataset.macro = macroIndex;
                    miniCell.dataset.mini = miniIndex;
                    
                    const value = this.miniBoards[macroIndex][miniIndex];
                    if (value === 'pink') {
                        miniCell.textContent = '💕';
                        miniCell.classList.add('pink');
                    } else if (value === 'gold') {
                        miniCell.textContent = '🏹';
                        miniCell.classList.add('gold');
                    }
                    
                    miniBoard.appendChild(miniCell);
                }
                
                macroCell.appendChild(miniBoard);
            }
            
            macroBoard.appendChild(macroCell);
        }
    }
    
    resetGame() {
        this.macroBoard = Array(9).fill(null);
        this.miniBoards = Array(9).fill(null).map(() => Array(9).fill(null));
        this.currentPlayer = 'pink';
        this.gameOver = false;
        this.winner = null;
        this.isAIThinking = false;
        
        this.renderBoard();
        this.updateStatus();
    }
}

// Initialize game
const game = new SuperTicTacToe();