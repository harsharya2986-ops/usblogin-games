// ============================================================
// TIC TAC TOE - Single Layer with Pro AI
// ============================================================

class TicTacToe {
    constructor() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'pink'; // 'pink' (player) or 'lavender' (AI)
        this.gameOver = false;
        this.winner = null;
        this.winningCells = [];
        this.playerScore = 0;
        this.aiScore = 0;
        this.isAIThinking = false;
        
        this.winningPaths = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontal
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Vertical
            [0, 4, 8], [2, 4, 6]              // Diagonal
        ];
        
        this.init();
    }
    
    init() {
        this.createFloatingHearts();
        this.renderBoard();
        this.updateStatus();
        this.setupEventListeners();
    }
    
    createFloatingHearts() {
        const container = document.getElementById('floatingHearts');
        const hearts = ['💕', '💗', '💖', '💘', '💝'];
        
        for (let i = 0; i < 12; i++) {
            const heart = document.createElement('span');
            heart.className = 'floating-heart';
            heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
            heart.style.left = Math.random() * 100 + '%';
            heart.style.fontSize = Math.random() * 18 + 12 + 'px';
            heart.style.animationDuration = Math.random() * 12 + 8 + 's';
            heart.style.animationDelay = Math.random() * 10 + 's';
            container.appendChild(heart);
        }
    }
    
    setupEventListeners() {
        document.getElementById('board').addEventListener('click', (e) => {
            const cell = e.target.closest('.cell');
            if (cell && !this.gameOver && !this.isAIThinking && this.currentPlayer === 'pink') {
                const index = parseInt(cell.dataset.index);
                this.makeMove(index);
            }
        });
    }
    
    makeMove(index) {
        if (this.gameOver) return;
        if (this.board[index] !== null) return;
        
        // Place mark
        this.board[index] = this.currentPlayer;
        
        // Check win
        const winResult = this.checkWin();
        if (winResult) {
            this.winningCells = winResult;
            this.gameOver = true;
            this.winner = this.currentPlayer;
            
            if (this.winner === 'pink') {
                this.playerScore++;
                document.getElementById('playerScore').textContent = this.playerScore;
                document.getElementById('statusBar').textContent = '🎉 You Win! Your love conquers all! 💕';
            } else {
                this.aiScore++;
                document.getElementById('aiScore').textContent = this.aiScore;
                document.getElementById('statusBar').textContent = '💍 Partner Wins! Struck by love! 💘';
            }
            
            this.renderBoard();
            this.showWinOverlay();
            return;
        }
        
        // Check draw
        if (this.board.every(cell => cell !== null)) {
            this.gameOver = true;
            document.getElementById('statusBar').textContent = '🤝 It\'s a Draw! Perfect match!';
            this.renderBoard();
            return;
        }
        
        // Switch player
        this.currentPlayer = this.currentPlayer === 'pink' ? 'lavender' : 'pink';
        this.renderBoard();
        this.updateStatus();
        
        // AI turn
        if (this.currentPlayer === 'lavender') {
            this.isAIThinking = true;
            setTimeout(() => {
                this.aiMove();
                this.isAIThinking = false;
            }, 600);
        }
    }
    
    checkWin() {
        for (const path of this.winningPaths) {
            const [a, b, c] = path;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                return path;
            }
        }
        return null;
    }
    
    aiMove() {
        if (this.gameOver || this.currentPlayer !== 'lavender') return;
        
        const move = this.getBestAIMove();
        if (move !== null) {
            this.makeMove(move);
        }
    }
    
    getBestAIMove() {
        // 1. Win if possible
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === null) {
                this.board[i] = 'lavender';
                if (this.checkWin()) {
                    this.board[i] = null;
                    return i;
                }
                this.board[i] = null;
            }
        }
        
        // 2. Block player from winning
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === null) {
                this.board[i] = 'pink';
                if (this.checkWin()) {
                    this.board[i] = null;
                    return i;
                }
                this.board[i] = null;
            }
        }
        
        // 3. Take center
        if (this.board[4] === null) {
            return 4;
        }
        
        // 4. Take corners
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(c => this.board[c] === null);
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }
        
        // 5. Take edges
        const edges = [1, 3, 5, 7];
        const availableEdges = edges.filter(e => this.board[e] === null);
        if (availableEdges.length > 0) {
            return availableEdges[Math.floor(Math.random() * availableEdges.length)];
        }
        
        return null;
    }
    
    updateStatus() {
        const statusBar = document.getElementById('statusBar');
        
        if (this.gameOver) return;
        
        if (this.currentPlayer === 'pink') {
            statusBar.textContent = '💕 Your turn! Place your heart';
        } else {
            statusBar.textContent = '💍 Partner is thinking...';
        }
    }
    
    renderBoard() {
        const boardEl = document.getElementById('board');
        boardEl.innerHTML = '';
        
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.index = i;
            
            const value = this.board[i];
            if (value === 'pink') {
                cell.textContent = '💕';
                cell.classList.add('pink', 'filled');
            } else if (value === 'lavender') {
                cell.textContent = '💍';
                cell.classList.add('lavender', 'filled');
            }
            
            // Highlight winning cells
            if (this.winningCells.includes(i)) {
                cell.classList.add('win');
            }
            
            boardEl.appendChild(cell);
        }
    }
    
    showWinOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        overlay.innerHTML = `
            <div class="overlay-content">
                <div class="overlay-emoji">${this.winner === 'pink' ? '💕' : '💍'}</div>
                <div class="overlay-title">${this.winner === 'pink' ? 'Love Conquers All!' : 'Struck by Love!'}</div>
                <div style="color: white; font-size: 1.2rem; margin-bottom: 1.5rem;">
                    ${this.winner === 'pink' ? 'You Win!' : 'Partner Wins!'} Three in a row!
                </div>
                <button class="btn btn-reset" onclick="game.closeOverlay(); game.resetGame();">
                    💕 Play Again
                </button>
            </div>
        `;
        document.body.appendChild(overlay);
    }
    
    closeOverlay() {
        const overlay = document.querySelector('.overlay');
        if (overlay) {
            overlay.remove();
        }
    }
    
    resetGame() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'pink';
        this.gameOver = false;
        this.winner = null;
        this.winningCells = [];
        this.isAIThinking = false;
        
        this.closeOverlay();
        this.renderBoard();
        this.updateStatus();
    }
}

// Initialize game
const game = new TicTacToe();