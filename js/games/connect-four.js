// ============================================================
// ROMANTIC CONNECT FOUR - Complete Game Engine
// ============================================================

class RomanticConnectFour {
    constructor() {
        this.rows = 6;
        this.cols = 7;
        this.board = Array(this.rows).fill(null).map(() => Array(this.cols).fill(null));
        this.currentPlayer = 'pink'; // 'pink' (player) or 'gold' (AI)
        this.gameOver = false;
        this.winner = null;
        this.winningCells = [];
        this.playerScore = 0;
        this.aiScore = 0;
        this.isDropping = false;
        this.isAIThinking = false;
        
        this.init();
    }
    
    init() {
        this.createBackgroundHearts();
        this.renderBoard();
        this.updateStatus();
        this.setupEventListeners();
    }
    
    createBackgroundHearts() {
        const container = document.getElementById('bgHearts');
        const hearts = ['💕', '💗', '💖', '💘', '💝'];
        
        for (let i = 0; i < 15; i++) {
            const heart = document.createElement('span');
            heart.className = 'bg-heart';
            heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
            heart.style.left = Math.random() * 100 + '%';
            heart.style.fontSize = Math.random() * 20 + 12 + 'px';
            heart.style.animationDuration = Math.random() * 12 + 8 + 's';
            heart.style.animationDelay = Math.random() * 10 + 's';
            container.appendChild(heart);
        }
    }
    
    setupEventListeners() {
        document.getElementById('board').addEventListener('click', (e) => {
            const column = e.target.closest('.column');
            if (column && !this.gameOver && !this.isDropping && !this.isAIThinking && this.currentPlayer === 'pink') {
                const colIndex = parseInt(column.dataset.col);
                this.dropToken(colIndex);
            }
        });
    }
    
    dropToken(colIndex) {
        if (this.isDropping || this.gameOver) return;
        
        const rowIndex = this.findLowestEmptyRow(colIndex);
        if (rowIndex === -1) return;
        
        this.isDropping = true;
        
        // Place token
        this.board[rowIndex][colIndex] = this.currentPlayer;
        
        // Check win
        const winResult = this.checkWin(rowIndex, colIndex);
        
        if (winResult) {
            this.winningCells = winResult;
            this.gameOver = true;
            this.winner = this.currentPlayer;
            
            if (this.winner === 'pink') {
                this.playerScore++;
                document.getElementById('playerScore').textContent = this.playerScore;
                document.getElementById('statusBar').textContent = '💕 Bound by Love! You Win! Four in a row!';
            } else {
                this.aiScore++;
                document.getElementById('aiScore').textContent = this.aiScore;
                document.getElementById('statusBar').textContent = '💍 Bound by Love! Partner Wins! Four in a row!';
            }
            
            this.renderBoard();
            this.showWinOverlay();
            this.isDropping = false;
            return;
        }
        
        // Check draw
        if (this.isBoardFull()) {
            this.gameOver = true;
            document.getElementById('statusBar').textContent = '🤝 It\'s a Draw! Perfectly balanced love!';
            this.renderBoard();
            this.isDropping = false;
            return;
        }
        
        // Switch player
        this.currentPlayer = this.currentPlayer === 'pink' ? 'gold' : 'pink';
        this.renderBoard();
        this.updateStatus();
        
        // AI turn
        if (this.currentPlayer === 'gold') {
            this.isAIThinking = true;
            setTimeout(() => {
                this.aiMove();
                this.isAIThinking = false;
            }, 800);
        }
        
        this.isDropping = false;
    }
    
    findLowestEmptyRow(colIndex) {
        for (let row = this.rows - 1; row >= 0; row--) {
            if (this.board[row][colIndex] === null) {
                return row;
            }
        }
        return -1;
    }
    
    checkWin(row, col) {
        const player = this.board[row][col];
        if (!player) return null;
        
        const directions = [
            [[0, 1], [0, -1]],   // Horizontal
            [[1, 0], [-1, 0]],   // Vertical
            [[1, 1], [-1, -1]],  // Diagonal down-right
            [[1, -1], [-1, 1]]   // Diagonal down-left
        ];
        
        for (const [dir1, dir2] of directions) {
            const cells = [{ row, col }];
            
            // Check direction 1
            let r = row + dir1[0];
            let c = col + dir1[1];
            while (r >= 0 && r < this.rows && c >= 0 && c < this.cols && this.board[r][c] === player) {
                cells.push({ row: r, col: c });
                r += dir1[0];
                c += dir1[1];
            }
            
            // Check direction 2
            r = row + dir2[0];
            c = col + dir2[1];
            while (r >= 0 && r < this.rows && c >= 0 && c < this.cols && this.board[r][c] === player) {
                cells.push({ row: r, col: c });
                r += dir2[0];
                c += dir2[1];
            }
            
            if (cells.length >= 4) {
                return cells;
            }
        }
        
        return null;
    }
    
    isBoardFull() {
        for (let col = 0; col < this.cols; col++) {
            if (this.board[0][col] === null) {
                return false;
            }
        }
        return true;
    }
    
    aiMove() {
        if (this.gameOver || this.currentPlayer !== 'gold') return;
        
        const move = this.getBestAIMove();
        if (move !== null) {
            this.dropToken(move);
        }
    }
    
    getBestAIMove() {
        // 1. Win if possible
        for (let col = 0; col < this.cols; col++) {
            const row = this.findLowestEmptyRow(col);
            if (row === -1) continue;
            
            this.board[row][col] = 'gold';
            const winResult = this.checkWin(row, col);
            this.board[row][col] = null;
            
            if (winResult) return col;
        }
        
        // 2. Block player from winning
        for (let col = 0; col < this.cols; col++) {
            const row = this.findLowestEmptyRow(col);
            if (row === -1) continue;
            
            this.board[row][col] = 'pink';
            const winResult = this.checkWin(row, col);
            this.board[row][col] = null;
            
            if (winResult) return col;
        }
        
        // 3. Prefer center column
        const centerCol = 3;
        if (this.findLowestEmptyRow(centerCol) !== -1) {
            return centerCol;
        }
        
        // 4. Prefer columns near center
        const preferredCols = [2, 4, 1, 5, 0, 6];
        for (const col of preferredCols) {
            if (this.findLowestEmptyRow(col) !== -1) {
                return col;
            }
        }
        
        // 5. Random available column
        const availableCols = [];
        for (let col = 0; col < this.cols; col++) {
            if (this.findLowestEmptyRow(col) !== -1) {
                availableCols.push(col);
            }
        }
        
        if (availableCols.length > 0) {
            return availableCols[Math.floor(Math.random() * availableCols.length)];
        }
        
        return null;
    }
    
    updateStatus() {
        const statusBar = document.getElementById('statusBar');
        
        if (this.gameOver) return;
        
        if (this.currentPlayer === 'pink') {
            statusBar.textContent = '💕 Your turn! Drop a heart';
        } else {
            statusBar.textContent = '💍 Partner is thinking...';
        }
    }
    
    renderBoard() {
        const boardEl = document.getElementById('board');
        boardEl.innerHTML = '';
        
        for (let col = 0; col < this.cols; col++) {
            const column = document.createElement('div');
            column.className = 'column';
            column.dataset.col = col;
            
            // Check if column is full
            if (this.findLowestEmptyRow(col) === -1) {
                column.classList.add('full');
            }
            
            // Preview token
            const preview = document.createElement('div');
            preview.className = 'preview-token';
            preview.textContent = this.currentPlayer === 'pink' ? '💕' : '💍';
            column.appendChild(preview);
            
            // Cells
            for (let row = 0; row < this.rows; row++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                
                const value = this.board[row][col];
                if (value === 'pink') {
                    cell.classList.add('pink');
                } else if (value === 'gold') {
                    cell.classList.add('gold');
                }
                
                // Check if this cell is a winning cell
                if (this.winningCells.some(wc => wc.row === row && wc.col === col)) {
                    cell.classList.add('win');
                }
                
                column.appendChild(cell);
            }
            
            boardEl.appendChild(column);
        }
    }
    
    showWinOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        overlay.innerHTML = `
            <div class="overlay-content">
                <div class="overlay-emoji">${this.winner === 'pink' ? '💕' : '💍'}</div>
                <div class="overlay-title">Bound by Love!</div>
                <div style="color: white; font-size: 1.2rem; margin-bottom: 1.5rem;">
                    ${this.winner === 'pink' ? 'You Win!' : 'Partner Wins!'} Four in a row!
                </div>
                <button class="btn btn-reset" onclick="game.closeOverlay(); game.resetMatch();">
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
    
    resetMatch() {
        this.board = Array(this.rows).fill(null).map(() => Array(this.cols).fill(null));
        this.currentPlayer = 'pink';
        this.gameOver = false;
        this.winner = null;
        this.winningCells = [];
        this.isDropping = false;
        this.isAIThinking = false;
        
        this.closeOverlay();
        this.renderBoard();
        this.updateStatus();
    }
}

// Initialize game
const game = new RomanticConnectFour();