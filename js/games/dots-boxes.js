// ============================================================
// ROMANTIC DOTS AND BOXES - Play Until Board Full
// ============================================================

class DotsAndBoxes {
    constructor() {
        this.gridSize = 4;
        this.hLines = Array(4).fill(null).map(() => Array(3).fill(null));
        this.vLines = Array(3).fill(null).map(() => Array(4).fill(null));
        this.boxes = Array(3).fill(null).map(() => Array(3).fill(null));
        this.currentPlayer = 'pink';
        this.gameOver = false;
        this.playerScore = 0;
        this.aiScore = 0;
        this.isAIThinking = false;
        this.totalLines = 0;
        this.maxLines = 24;
        
        this.init();
    }
    
    init() {
        this.renderBoard();
        this.updateStatus();
    }
    
    handleBoardClick(e) {
        const line = e.target.closest('[data-line]');
        if (!line) return;
        
        if (this.gameOver || this.isAIThinking || this.currentPlayer !== 'pink') return;
        
        const type = line.dataset.line;
        const row = parseInt(line.dataset.row);
        const col = parseInt(line.dataset.col);
        
        this.executePlayerMove(type, row, col);
    }
    
    executePlayerMove(type, row, col) {
        // Validate move
        if (type === 'h' && (row < 0 || row > 3 || col < 0 || col > 2)) return;
        if (type === 'v' && (row < 0 || row > 2 || col < 0 || col > 3)) return;
        
        if (type === 'h' && this.hLines[row][col] !== null) return;
        if (type === 'v' && this.vLines[row][col] !== null) return;
        
        // Execute move
        this.executeMove(type, row, col);
        
        // Check if game over after player move
        if (this.gameOver) return;
        
        // AI turn if player didn't complete a box
        if (this.currentPlayer === 'gold') {
            this.isAIThinking = true;
            document.getElementById('statusBar').textContent = '💍 Partner is thinking...';
            
            setTimeout(() => {
                this.aiMove();
                this.isAIThinking = false;
            }, 600);
        }
    }
    
    executeMove(type, row, col) {
        let boxCompleted = false;
        
        // Draw line
        if (type === 'h') {
            this.hLines[row][col] = this.currentPlayer;
        } else {
            this.vLines[row][col] = this.currentPlayer;
        }
        
        this.totalLines++;
        
        // Check for completed boxes
        if (type === 'h') {
            // Check box above
            if (row > 0 && this.boxes[row - 1][col] === null && this.checkBoxComplete(row - 1, col)) {
                this.boxes[row - 1][col] = this.currentPlayer;
                this.incrementScore();
                boxCompleted = true;
            }
            // Check box below
            if (row < 3 && this.boxes[row][col] === null && this.checkBoxComplete(row, col)) {
                this.boxes[row][col] = this.currentPlayer;
                this.incrementScore();
                boxCompleted = true;
            }
        } else {
            // Check box left
            if (col > 0 && this.boxes[row][col - 1] === null && this.checkBoxComplete(row, col - 1)) {
                this.boxes[row][col - 1] = this.currentPlayer;
                this.incrementScore();
                boxCompleted = true;
            }
            // Check box right
            if (col < 3 && this.boxes[row][col] === null && this.checkBoxComplete(row, col)) {
                this.boxes[row][col] = this.currentPlayer;
                this.incrementScore();
                boxCompleted = true;
            }
        }
        
        this.updateScoreDisplay();
        
        // Check if board is full (game over)
        if (this.totalLines >= this.maxLines) {
            this.endGame();
            this.renderBoard();
            return;
        }
        
        // Switch player ONLY if no box completed
        if (!boxCompleted) {
            this.currentPlayer = this.currentPlayer === 'pink' ? 'gold' : 'pink';
        }
        // If box completed, same player continues
        
        this.renderBoard();
        this.updateStatus();
    }
    
    checkBoxComplete(row, col) {
        if (this.boxes[row][col] !== null) return false;
        
        return this.hLines[row][col] !== null &&
               this.hLines[row + 1][col] !== null &&
               this.vLines[row][col] !== null &&
               this.vLines[row][col + 1] !== null;
    }
    
    incrementScore() {
        if (this.currentPlayer === 'pink') {
            this.playerScore++;
        } else {
            this.aiScore++;
        }
    }
    
    aiMove() {
        if (this.gameOver || this.currentPlayer !== 'gold') return;
        
        let moveMade = false;
        
        // 1. Complete boxes with 3 lines
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                if (this.boxes[row][col] !== null) continue;
                
                const missingLines = this.getMissingLines(row, col);
                if (missingLines.length === 1) {
                    this.executeMove(missingLines[0].type, missingLines[0].row, missingLines[0].col);
                    moveMade = true;
                    
                    // If AI completed a box, it gets another turn
                    if (this.currentPlayer === 'gold' && !this.gameOver && this.totalLines < this.maxLines) {
                        setTimeout(() => {
                            this.aiMove();
                        }, 400);
                    }
                    return;
                }
            }
        }
        
        // 2. Safe moves
        const safeMoves = [];
        
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 3; col++) {
                if (this.hLines[row][col] === null && this.isSafeMove('h', row, col)) {
                    safeMoves.push({ type: 'h', row, col });
                }
            }
        }
        
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 4; col++) {
                if (this.vLines[row][col] === null && this.isSafeMove('v', row, col)) {
                    safeMoves.push({ type: 'v', row, col });
                }
            }
        }
        
        if (safeMoves.length > 0) {
            const move = safeMoves[Math.floor(Math.random() * safeMoves.length)];
            this.executeMove(move.type, move.row, move.col);
            moveMade = true;
        } else {
            // 3. Random move
            const allMoves = [];
            
            for (let row = 0; row < 4; row++) {
                for (let col = 0; col < 3; col++) {
                    if (this.hLines[row][col] === null) {
                        allMoves.push({ type: 'h', row, col });
                    }
                }
            }
            
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 4; col++) {
                    if (this.vLines[row][col] === null) {
                        allMoves.push({ type: 'v', row, col });
                    }
                }
            }
            
            if (allMoves.length > 0) {
                const move = allMoves[Math.floor(Math.random() * allMoves.length)];
                this.executeMove(move.type, move.row, move.col);
                moveMade = true;
            }
        }
        
        // If AI completed box and still its turn, continue
        if (moveMade && this.currentPlayer === 'gold' && !this.gameOver && this.totalLines < this.maxLines) {
            setTimeout(() => {
                this.aiMove();
            }, 400);
        }
    }
    
    getMissingLines(row, col) {
        const missing = [];
        
        if (this.hLines[row][col] === null) {
            missing.push({ type: 'h', row: row, col: col });
        }
        if (this.hLines[row + 1][col] === null) {
            missing.push({ type: 'h', row: row + 1, col: col });
        }
        if (this.vLines[row][col] === null) {
            missing.push({ type: 'v', row: row, col: col });
        }
        if (this.vLines[row][col + 1] === null) {
            missing.push({ type: 'v', row: row, col: col + 1 });
        }
        
        return missing;
    }
    
    isSafeMove(type, row, col) {
        if (type === 'h') {
            if (row > 0 && this.boxes[row - 1][col] === null) {
                const missing = this.getMissingLines(row - 1, col);
                if (missing.length === 2) {
                    if (missing.some(m => m.type === 'h' && m.row === row && m.col === col)) {
                        return false;
                    }
                }
            }
            if (row < 3 && this.boxes[row][col] === null) {
                const missing = this.getMissingLines(row, col);
                if (missing.length === 2) {
                    if (missing.some(m => m.type === 'h' && m.row === row && m.col === col)) {
                        return false;
                    }
                }
            }
        } else {
            if (col > 0 && this.boxes[row][col - 1] === null) {
                const missing = this.getMissingLines(row, col - 1);
                if (missing.length === 2) {
                    if (missing.some(m => m.type === 'v' && m.row === row && m.col === col)) {
                        return false;
                    }
                }
            }
            if (col < 3 && this.boxes[row][col] === null) {
                const missing = this.getMissingLines(row, col);
                if (missing.length === 2) {
                    if (missing.some(m => m.type === 'v' && m.row === row && m.col === col)) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
    updateScoreDisplay() {
        document.getElementById('playerScore').textContent = this.playerScore;
        document.getElementById('aiScore').textContent = this.aiScore;
    }
    
    updateStatus() {
        const statusBar = document.getElementById('statusBar');
        
        if (this.gameOver) return;
        
        if (this.currentPlayer === 'pink') {
            statusBar.textContent = '💕 Your turn! Click between dots';
        } else {
            statusBar.textContent = '💍 Partner is thinking...';
        }
    }
    
    endGame() {
        this.gameOver = true;
        
        if (this.playerScore > this.aiScore) {
            document.getElementById('statusBar').textContent = '🎉 You Win! Hearts United!';
        } else if (this.aiScore > this.playerScore) {
            document.getElementById('statusBar').textContent = '💍 Partner Wins! Hearts United!';
        } else {
            document.getElementById('statusBar').textContent = '🤝 Tie! Hearts United!';
        }
        
        this.showGameOver();
    }
    
    showGameOver() {
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.85); display: flex; align-items: center;
            justify-content: center; z-index: 100;
        `;
        
        const winnerEmoji = this.playerScore > this.aiScore ? '💕' : 
                           this.aiScore > this.playerScore ? '💍' : '🤝';
        const winnerText = this.playerScore > this.aiScore ? 'You Win!' :
                          this.aiScore > this.playerScore ? 'Partner Wins!' : 'It\'s a Tie!';
        
        overlay.innerHTML = `
            <div style="text-align: center; background: rgba(26, 26, 46, 0.95); padding: 2rem 3rem; border-radius: 2rem; border: 2px solid rgba(255, 107, 157, 0.5);">
                <div style="font-size: 4rem; margin-bottom: 1rem;">${winnerEmoji}</div>
                <div style="font-family: 'Dancing Script', cursive; font-size: 2rem; color: #ff6b9d; margin-bottom: 1rem;">Hearts United! Board Full!</div>
                <div style="color: white; font-size: 1.2rem; margin-bottom: 1rem;">${winnerText}</div>
                <div style="color: rgba(255,255,255,0.7); margin-bottom: 1.5rem;">💕 ${this.playerScore} - ${this.aiScore} 💍</div>
                <button onclick="game.closeOverlay(); game.resetBoard();" style="padding: 12px 24px; border-radius: 2rem; font-weight: 600; cursor: pointer; border: none; background: linear-gradient(135deg, #ff6b9d, #e84393); color: white;">🔄 Reset Board</button>
            </div>
        `;
        document.body.appendChild(overlay);
    }
    
    closeOverlay() {
        const overlay = document.querySelector('.overlay');
        if (overlay) overlay.remove();
    }
    
    renderBoard() {
        const boardEl = document.getElementById('board');
        boardEl.innerHTML = '';
        boardEl.style.cssText = `
            position: relative;
            width: 400px;
            height: 400px;
            margin: 0 auto;
        `;
        
        const spacing = 100;
        
        // Draw box icons
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                if (this.boxes[row][col]) {
                    const boxEl = document.createElement('div');
                    boxEl.style.cssText = `
                        position: absolute;
                        left: ${col * spacing + spacing / 2}px;
                        top: ${row * spacing + spacing / 2}px;
                        transform: translate(-50%, -50%);
                        font-size: 2.5rem;
                        z-index: 1;
                    `;
                    boxEl.textContent = this.boxes[row][col] === 'pink' ? '💕' : '💍';
                    boardEl.appendChild(boxEl);
                }
            }
        }
        
        // Draw horizontal lines
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 3; col++) {
                const line = document.createElement('div');
                const isDrawn = this.hLines[row][col] !== null;
                const color = this.hLines[row][col] === 'pink' ? '#ff6b9d' : 
                             this.hLines[row][col] === 'gold' ? '#fdcb6e' : 'transparent';
                
                line.setAttribute('data-line', 'h');
                line.setAttribute('data-row', row);
                line.setAttribute('data-col', col);
                
                line.style.cssText = `
                    position: absolute;
                    left: ${col * spacing + 5}px;
                    top: ${row * spacing}px;
                    width: ${spacing - 10}px;
                    height: 6px;
                    transform: translateY(-3px);
                    background: ${color};
                    border-radius: 3px;
                    z-index: 2;
                    cursor: ${isDrawn ? 'default' : 'pointer'};
                    transition: all 0.2s;
                `;
                
                if (!isDrawn) {
                    line.addEventListener('mouseenter', () => {
                        line.style.background = 'rgba(255, 107, 157, 0.4)';
                    });
                    line.addEventListener('mouseleave', () => {
                        line.style.background = 'transparent';
                    });
                    line.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.handleBoardClick(e);
                    });
                } else {
                    line.style.boxShadow = this.hLines[row][col] === 'pink' ? 
                        '0 0 10px rgba(255, 107, 157, 0.8)' : 
                        '0 0 10px rgba(253, 203, 110, 0.8)';
                }
                
                boardEl.appendChild(line);
            }
        }
        
        // Draw vertical lines
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 4; col++) {
                const line = document.createElement('div');
                const isDrawn = this.vLines[row][col] !== null;
                const color = this.vLines[row][col] === 'pink' ? '#ff6b9d' : 
                             this.vLines[row][col] === 'gold' ? '#fdcb6e' : 'transparent';
                
                line.setAttribute('data-line', 'v');
                line.setAttribute('data-row', row);
                line.setAttribute('data-col', col);
                
                line.style.cssText = `
                    position: absolute;
                    left: ${col * spacing}px;
                    top: ${row * spacing + 5}px;
                    width: 6px;
                    height: ${spacing - 10}px;
                    transform: translateX(-3px);
                    background: ${color};
                    border-radius: 3px;
                    z-index: 2;
                    cursor: ${isDrawn ? 'default' : 'pointer'};
                    transition: all 0.2s;
                `;
                
                if (!isDrawn) {
                    line.addEventListener('mouseenter', () => {
                        line.style.background = 'rgba(255, 107, 157, 0.4)';
                    });
                    line.addEventListener('mouseleave', () => {
                        line.style.background = 'transparent';
                    });
                    line.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.handleBoardClick(e);
                    });
                } else {
                    line.style.boxShadow = this.vLines[row][col] === 'pink' ? 
                        '0 0 10px rgba(255, 107, 157, 0.8)' : 
                        '0 0 10px rgba(253, 203, 110, 0.8)';
                }
                
                boardEl.appendChild(line);
            }
        }
        
        // Draw dots on top
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const dot = document.createElement('div');
                dot.style.cssText = `
                    position: absolute;
                    left: ${col * spacing}px;
                    top: ${row * spacing}px;
                    width: 14px;
                    height: 14px;
                    background: radial-gradient(circle at 40% 40%, #ffffff, #e0e0e0, #b0b0b0);
                    border-radius: 50%;
                    transform: translate(-50%, -50%);
                    box-shadow: 0 0 15px rgba(255, 255, 255, 0.6);
                    z-index: 3;
                    pointer-events: none;
                `;
                boardEl.appendChild(dot);
            }
        }
    }
    
    resetBoard() {
        this.hLines = Array(4).fill(null).map(() => Array(3).fill(null));
        this.vLines = Array(3).fill(null).map(() => Array(4).fill(null));
        this.boxes = Array(3).fill(null).map(() => Array(3).fill(null));
        this.currentPlayer = 'pink';
        this.gameOver = false;
        this.playerScore = 0;
        this.aiScore = 0;
        this.isAIThinking = false;
        this.totalLines = 0;
        
        this.closeOverlay();
        this.updateScoreDisplay();
        this.renderBoard();
        this.updateStatus();
    }
}

// Initialize game
const game = new DotsAndBoxes();