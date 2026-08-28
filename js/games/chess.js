// ============================================================
// ROMANTIC FAIRYTALE CHESS - Complete Game Engine
// ============================================================

class FairytaleChess {
    constructor() {
        this.board = [];
        this.currentTurn = 'rose'; // 'rose' (player) or 'amethyst' (AI)
        this.selectedPiece = null;
        this.validMoves = [];
        this.gameOver = false;
        this.chronicle = [];
        this.flipped = false;
        this.isAIThinking = false;
        
        this.pieces = {
            rose: {
                king: '🤴',
                queen: '👸',
                rook: '🏰',
                bishop: '🕊️',
                knight: '🦄',
                pawn: '❤️'
            },
            amethyst: {
                king: '🧝',
                queen: '🧚',
                rook: '🏯',
                bishop: '🏹',
                knight: '🐉',
                pawn: '💜'
            }
        };
        
        this.init();
    }
    
    init() {
        this.initializeBoard();
        this.renderBoard();
        this.updateStatus();
        this.setupEventListeners();
    }
    
    initializeBoard() {
        this.board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        const backRow = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
        
        // Set up pieces
        for (let col = 0; col < 8; col++) {
            // Rose pieces (bottom)
            this.board[7][col] = { type: backRow[col], side: 'rose' };
            this.board[6][col] = { type: 'pawn', side: 'rose' };
            
            // Amethyst pieces (top)
            this.board[0][col] = { type: backRow[col], side: 'amethyst' };
            this.board[1][col] = { type: 'pawn', side: 'amethyst' };
        }
    }
    
    setupEventListeners() {
        document.getElementById('chessBoard').addEventListener('click', (e) => {
            const square = e.target.closest('.square');
            if (square && !this.gameOver && !this.isAIThinking && this.currentTurn === 'rose') {
                const row = parseInt(square.dataset.row);
                const col = parseInt(square.dataset.col);
                this.handleClick(row, col);
            }
        });
    }
    
    handleClick(row, col) {
        // If a piece is selected
        if (this.selectedPiece) {
            // Check if clicking on a valid move
            const isValidMove = this.validMoves.some(move => move.row === row && move.col === col);
            
            if (isValidMove) {
                this.makeMove(row, col);
                return;
            }
            
            // Check if clicking on own piece
            const clickedPiece = this.board[row][col];
            if (clickedPiece && clickedPiece.side === 'rose') {
                this.selectPiece(row, col);
                return;
            }
            
            // Deselect
            this.deselectPiece();
            return;
        }
        
        // Select piece
        const piece = this.board[row][col];
        if (piece && piece.side === 'rose') {
            this.selectPiece(row, col);
        }
    }
    
    selectPiece(row, col) {
        this.selectedPiece = { row, col };
        this.validMoves = this.getValidMoves(row, col);
        this.renderBoard();
    }
    
    deselectPiece() {
        this.selectedPiece = null;
        this.validMoves = [];
        this.renderBoard();
    }
    
    makeMove(toRow, toCol) {
        const fromRow = this.selectedPiece.row;
        const fromCol = this.selectedPiece.col;
        const piece = this.board[fromRow][fromCol];
        const capturedPiece = this.board[toRow][toCol];
        
        // Record move
        const moveText = `${this.getPieceName(piece)} ${this.getSquareName(fromRow, fromCol)} → ${this.getSquareName(toRow, toCol)}${capturedPiece ? ' ✨' : ''}`;
        this.chronicle.push(moveText);
        
        // Move piece
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        
        // Check for pawn promotion
        if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
            piece.type = 'queen';
        }
        
        // Check for checkmate
        if (this.isCheckmate('amethyst')) {
            this.gameOver = true;
            this.updateStatus();
            this.renderBoard();
            return;
        }
        
        // Switch turn
        this.currentTurn = 'amethyst';
        this.selectedPiece = null;
        this.validMoves = [];
        this.renderBoard();
        this.updateStatus();
        
        // AI turn
        this.isAIThinking = true;
        setTimeout(() => {
            this.aiMove();
            this.isAIThinking = false;
        }, 800);
    }
    
    aiMove() {
        if (this.gameOver || this.currentTurn !== 'amethyst') return;
        
        const move = this.getBestAIMove();
        if (move) {
            const piece = this.board[move.fromRow][move.fromCol];
            const capturedPiece = this.board[move.toRow][move.toCol];
            
            const moveText = `${this.getPieceName(piece)} ${this.getSquareName(move.fromRow, move.fromCol)} → ${this.getSquareName(move.toRow, move.toCol)}${capturedPiece ? ' ✨' : ''}`;
            this.chronicle.push(moveText);
            
            this.board[move.toRow][move.toCol] = piece;
            this.board[move.fromRow][move.fromCol] = null;
            
            if (piece.type === 'pawn' && (move.toRow === 0 || move.toRow === 7)) {
                piece.type = 'queen';
            }
            
            if (this.isCheckmate('rose')) {
                this.gameOver = true;
                this.updateStatus();
                this.renderBoard();
                return;
            }
            
            this.currentTurn = 'rose';
            this.renderBoard();
            this.updateStatus();
        }
    }
    
    getBestAIMove() {
        const allMoves = this.getAllMovesForSide('amethyst');
        if (allMoves.length === 0) return null;
        
        // Score each move
        let bestMove = null;
        let bestScore = -Infinity;
        
        for (const move of allMoves) {
            let score = 0;
            
            // Prefer captures
            const capturedPiece = this.board[move.toRow][move.toCol];
            if (capturedPiece) {
                score += this.getPieceValue(capturedPiece.type) * 10;
            }
            
            // Prefer center control
            const centerDist = Math.abs(move.toRow - 3.5) + Math.abs(move.toCol - 3.5);
            score += (7 - centerDist);
            
            // Prefer protecting king
            const piece = this.board[move.fromRow][move.fromCol];
            if (piece.type === 'king' && this.isInCheck('amethyst')) {
                score += 50;
            }
            
            // Random factor
            score += Math.random() * 5;
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        
        return bestMove;
    }
    
    getAllMovesForSide(side) {
        const moves = [];
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.side === side) {
                    const pieceMoves = this.getValidMoves(row, col);
                    for (const move of pieceMoves) {
                        moves.push({ fromRow: row, fromCol: col, toRow: move.row, toCol: move.col });
                    }
                }
            }
        }
        
        return moves;
    }
    
    getValidMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];
        
        const moves = [];
        
        switch (piece.type) {
            case 'pawn':
                this.getPawnMoves(row, col, piece.side, moves);
                break;
            case 'knight':
                this.getKnightMoves(row, col, piece.side, moves);
                break;
            case 'bishop':
                this.getBishopMoves(row, col, piece.side, moves);
                break;
            case 'rook':
                this.getRookMoves(row, col, piece.side, moves);
                break;
            case 'queen':
                this.getBishopMoves(row, col, piece.side, moves);
                this.getRookMoves(row, col, piece.side, moves);
                break;
            case 'king':
                this.getKingMoves(row, col, piece.side, moves);
                break;
        }
        
        // Filter moves that would leave king in check
        return moves.filter(move => {
            // Simulate move
            const originalPiece = this.board[move.row][move.col];
            this.board[move.row][move.col] = piece;
            this.board[row][col] = null;
            
            const inCheck = this.isInCheck(piece.side);
            
            // Undo move
            this.board[row][col] = piece;
            this.board[move.row][move.col] = originalPiece;
            
            return !inCheck;
        });
    }
    
    getPawnMoves(row, col, side, moves) {
        const direction = side === 'rose' ? -1 : 1;
        const startRow = side === 'rose' ? 6 : 1;
        
        // Forward
        const newRow = row + direction;
        if (newRow >= 0 && newRow < 8 && !this.board[newRow][col]) {
            moves.push({ row: newRow, col });
            
            // Double move from start
            if (row === startRow) {
                const doubleRow = row + 2 * direction;
                if (!this.board[doubleRow][col]) {
                    moves.push({ row: doubleRow, col });
                }
            }
        }
        
        // Captures
        for (const colOffset of [-1, 1]) {
            const newCol = col + colOffset;
            const captureRow = row + direction;
            
            if (newCol >= 0 && newCol < 8 && captureRow >= 0 && captureRow < 8) {
                const target = this.board[captureRow][newCol];
                if (target && target.side !== side) {
                    moves.push({ row: captureRow, col: newCol });
                }
            }
        }
    }
    
    getKnightMoves(row, col, side, moves) {
        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        
        for (const [rowOffset, colOffset] of knightMoves) {
            const newRow = row + rowOffset;
            const newCol = col + colOffset;
            
            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const target = this.board[newRow][newCol];
                if (!target || target.side !== side) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }
    }
    
    getBishopMoves(row, col, side, moves) {
        const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
        
        for (const [rowDir, colDir] of directions) {
            let newRow = row + rowDir;
            let newCol = col + colDir;
            
            while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const target = this.board[newRow][newCol];
                
                if (!target) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (target.side !== side) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
                
                newRow += rowDir;
                newCol += colDir;
            }
        }
    }
    
    getRookMoves(row, col, side, moves) {
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        
        for (const [rowDir, colDir] of directions) {
            let newRow = row + rowDir;
            let newCol = col + colDir;
            
            while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const target = this.board[newRow][newCol];
                
                if (!target) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (target.side !== side) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
                
                newRow += rowDir;
                newCol += colDir;
            }
        }
    }
    
    getKingMoves(row, col, side, moves) {
        const kingMoves = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];
        
        for (const [rowOffset, colOffset] of kingMoves) {
            const newRow = row + rowOffset;
            const newCol = col + colOffset;
            
            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const target = this.board[newRow][newCol];
                if (!target || target.side !== side) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }
    }
    
    isInCheck(side) {
        // Find king
        let kingRow = -1;
        let kingCol = -1;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.type === 'king' && piece.side === side) {
                    kingRow = row;
                    kingCol = col;
                    break;
                }
            }
        }
        
        if (kingRow === -1) return false;
        
        // Check if any enemy piece can attack king
        const enemySide = side === 'rose' ? 'amethyst' : 'rose';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.side === enemySide) {
                    const attackMoves = this.getRawMoves(row, col);
                    if (attackMoves.some(move => move.row === kingRow && move.col === kingCol)) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    getRawMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];
        
        const moves = [];
        
        switch (piece.type) {
            case 'pawn':
                this.getPawnMoves(row, col, piece.side, moves);
                break;
            case 'knight':
                this.getKnightMoves(row, col, piece.side, moves);
                break;
            case 'bishop':
                this.getBishopMoves(row, col, piece.side, moves);
                break;
            case 'rook':
                this.getRookMoves(row, col, piece.side, moves);
                break;
            case 'queen':
                this.getBishopMoves(row, col, piece.side, moves);
                this.getRookMoves(row, col, piece.side, moves);
                break;
            case 'king':
                this.getKingMoves(row, col, piece.side, moves);
                break;
        }
        
        return moves;
    }
    
    isCheckmate(side) {
        if (!this.isInCheck(side)) return false;
        
        // Check if any move can get out of check
        const allMoves = this.getAllMovesForSide(side);
        return allMoves.length === 0;
    }
    
    getPieceName(piece) {
        const names = {
            king: 'King',
            queen: 'Queen',
            rook: 'Castle',
            bishop: 'Dove',
            knight: 'Unicorn',
            pawn: 'Rosebud'
        };
        return names[piece.type] || piece.type;
    }
    
    getSquareName(row, col) {
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        return files[col] + (8 - row);
    }
    
    getPieceValue(type) {
        const values = {
            pawn: 1,
            knight: 3,
            bishop: 3,
            rook: 5,
            queen: 9,
            king: 100
        };
        return values[type] || 0;
    }
    
    getPieceSymbol(piece) {
        return this.pieces[piece.side][piece.type];
    }
    
    updateStatus() {
        const statusBar = document.getElementById('statusBar');
        
        if (this.gameOver) {
            if (this.currentTurn === 'rose') {
                statusBar.textContent = '💜 Checkmate! Amethyst Love Conquers All';
            } else {
                statusBar.textContent = '🌹 Checkmate! Rose Gold Love Conquers All';
            }
        } else if (this.isInCheck(this.currentTurn)) {
            statusBar.textContent = this.currentTurn === 'rose' ? '⚠️ Rose Gold in Check!' : '⚠️ Amethyst in Check!';
        } else {
            statusBar.textContent = this.currentTurn === 'rose' ? '🌹 Rose Gold Turn to Woo' : '💜 Amethyst Turn to Woo';
        }
    }
    
    renderBoard() {
        const boardEl = document.getElementById('chessBoard');
        boardEl.innerHTML = '';
        
        const displayBoard = this.flipped ? 
            this.board.map(row => [...row].reverse()) : 
            this.board;
        
        for (let displayRow = 0; displayRow < 8; displayRow++) {
            for (let displayCol = 0; displayCol < 8; displayCol++) {
                const actualRow = this.flipped ? displayRow : displayRow;
                const actualCol = this.flipped ? 7 - displayCol : displayCol;
                
                const square = document.createElement('div');
                square.className = 'square';
                square.classList.add((actualRow + actualCol) % 2 === 0 ? 'light' : 'dark');
                square.dataset.row = actualRow;
                square.dataset.col = actualCol;
                
                const piece = this.board[actualRow][actualCol];
                if (piece) {
                    square.textContent = this.getPieceSymbol(piece);
                    square.classList.add('piece');
                    square.classList.add(piece.side);
                }
                
                // Highlight selected piece
                if (this.selectedPiece && 
                    this.selectedPiece.row === actualRow && 
                    this.selectedPiece.col === actualCol) {
                    square.classList.add('selected');
                }
                
                // Highlight valid moves
                const isValidMove = this.validMoves.some(move => move.row === actualRow && move.col === actualCol);
                if (isValidMove) {
                    if (this.board[actualRow][actualCol]) {
                        square.classList.add('valid-capture');
                    } else {
                        square.classList.add('valid-move');
                    }
                }
                
                boardEl.appendChild(square);
            }
        }
        
        // Update chronicle
        this.updateChronicle();
    }
    
    updateChronicle() {
        const chronicleList = document.getElementById('chronicleList');
        chronicleList.innerHTML = '';
        
        const recentMoves = this.chronicle.slice(-20);
        for (const move of recentMoves) {
            const entry = document.createElement('div');
            entry.className = 'chronicle-entry';
            entry.textContent = move;
            chronicleList.appendChild(entry);
        }
        
        chronicleList.scrollTop = chronicleList.scrollHeight;
    }
    
    flipBoard() {
        this.flipped = !this.flipped;
        this.renderBoard();
    }
    
    resetMatch() {
        this.initializeBoard();
        this.currentTurn = 'rose';
        this.selectedPiece = null;
        this.validMoves = [];
        this.gameOver = false;
        this.chronicle = [];
        this.isAIThinking = false;
        this.flipped = false;
        
        this.renderBoard();
        this.updateStatus();
    }
}

// Initialize game
const game = new FairytaleChess();