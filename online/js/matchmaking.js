// ============ MATCHMAKING SYSTEM ============
let socket;
let playerName = 'Player';
let selectedGame = null;

const onlineGames = [
    { id: 'dino-run', name: 'Dino Run', emoji: '🦖', desc: 'Run together online!' },
    { id: 'ping-pong', name: 'Ping Pong', emoji: '🏓', desc: 'Play ping pong online!' },
    { id: 'tic-tac-toe', name: 'Tic Tac Toe', emoji: '⭕', desc: 'Strategic online battle!' },
    { id: 'connect-four', name: 'Connect Four', emoji: '🔴', desc: 'Connect four online!' },
    { id: 'chess', name: 'Chess', emoji: '♟️', desc: 'Online chess match!' },
    { id: 'rock-paper-scissors', name: 'Rock Paper Scissors', emoji: '✂️', desc: 'Quick online game!' },
    { id: 'dots-boxes', name: 'Dots and Boxes', emoji: '📦', desc: 'Connect dots online!' },
    { id: 'tic-tac-tumble', name: 'Tic Tac Tumble', emoji: '🎲', desc: '3D tic tac toe online!' }
];

// Initialize socket connection
function initSocket() {
    socket = io();
    
    socket.on('connect', () => {
        console.log('Connected to server');
    });
    
    socket.on('waiting-for-opponent', () => {
        showStatus('Finding opponent...');
    });
    
    socket.on('match-found', (data) => {
        hideStatus();
        window.location.href = `game-room.html?room=${data.roomId}&game=${selectedGame}&name=${playerName}`;
    });
    
    socket.on('team-created', (data) => {
        hideStatus();
        alert(`Team Code: ${data.teamCode}\nShare this with your partner!`);
        document.getElementById('teamCodeInput').value = data.teamCode;
    });
    
    socket.on('room-full', () => {
        hideStatus();
        alert('Room is full!');
    });
    
    socket.on('room-not-found', () => {
        hideStatus();
        alert('Room not found!');
    });
}

// Populate games list
function populateGames() {
    const gamesList = document.getElementById('gamesList');
    
    onlineGames.forEach(game => {
        const card = document.createElement('div');
        card.className = 'online-game-card';
        card.innerHTML = `
            <div class="game-icon">${game.emoji}</div>
            <div class="game-details">
                <h3>${game.name}</h3>
                <p>${game.desc}</p>
            </div>
            <button class="btn-play-online" onclick="selectGame('${game.id}')">Play</button>
        `;
        gamesList.appendChild(card);
    });
}

function selectGame(gameId) {
    selectedGame = gameId;
    playerName = document.getElementById('playerNameInput').value || 'Player';
    
    // Highlight selected
    document.querySelectorAll('.online-game-card').forEach(card => {
        card.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    });
    
    findRandomMatch();
}

function findRandomMatch() {
    if (!selectedGame) {
        alert('Please select a game first!');
        return;
    }
    
    playerName = document.getElementById('playerNameInput').value || 'Player';
    
    socket.emit('find-match', {
        gameType: selectedGame,
        playerName: playerName
    });
    
    showStatus('Finding opponent...');
}

function createTeam() {
    if (!selectedGame) {
        alert('Please select a game first!');
        return;
    }
    
    playerName = document.getElementById('playerNameInput').value || 'Player';
    
    socket.emit('create-team', {
        gameType: selectedGame,
        playerName: playerName
    });
    
    showStatus('Creating team...');
}

function joinTeam() {
    if (!selectedGame) {
        alert('Please select a game first!');
        return;
    }
    
    const teamCode = document.getElementById('teamCodeInput').value.toUpperCase();
    if (teamCode.length !== 6) {
        alert('Please enter a valid 6-character team code');
        return;
    }
    
    playerName = document.getElementById('playerNameInput').value || 'Player';
    
    socket.emit('join-team', {
        teamCode: teamCode,
        playerName: playerName
    });
    
    showStatus('Joining team...');
}

function showStatus(message) {
    document.getElementById('statusMessage').classList.add('show');
    document.getElementById('statusText').textContent = message;
}

function hideStatus() {
    document.getElementById('statusMessage').classList.remove('show');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    populateGames();
    initSocket();
});