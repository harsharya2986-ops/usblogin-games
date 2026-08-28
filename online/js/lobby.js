// ============ LOBBY SYSTEM ============
let lobbySocket;
let selectedGame = null;
let currentUser = null;

const onlineGames = [
    { id: 'dino-run', name: 'Dino Run', emoji: '🦖' },
    { id: 'ping-pong', name: 'Ping Pong', emoji: '🏓' },
    { id: 'rock-paper-scissors', name: 'RPS', emoji: '✂️' },
    { id: 'tic-tac-toe', name: 'Tic Tac Toe', emoji: '⭕' },
    { id: 'chess', name: 'Chess', emoji: '♟️' },
    { id: 'connect-four', name: 'Connect Four', emoji: '🔴' },
    { id: 'tic-tac-tumble', name: 'Tic Tac Tumble', emoji: '🎲' },
    { id: 'dots-boxes', name: 'Dots & Boxes', emoji: '📦' }
];

function initLobby() {
    // Check authentication
    const userData = localStorage.getItem('usblog_user');
    const token = localStorage.getItem('usblog_token');
    
    if (!userData || !token) {
        window.location.href = 'login.html';
        return;
    }
    
    currentUser = JSON.parse(userData);
    document.getElementById('userNameDisplay').textContent = currentUser.username;
    
    lobbySocket = io({
        auth: {
            token: token,
            username: currentUser.username
        }
    });
    
    lobbySocket.on('connect', () => {
        console.log('Connected to lobby');
    });
    
    lobbySocket.on('match-found', (data) => {
        hideStatus();
        window.location.href = `game-room.html?room=${data.roomId}&game=${selectedGame}`;
    });
    
    lobbySocket.on('team-created', (data) => {
        hideStatus();
        alert(`Team Code: ${data.teamCode}\nShare this with your partner!`);
        document.getElementById('teamCodeInput').value = data.teamCode;
    });
    
    lobbySocket.on('waiting-for-opponent', () => {
        showStatus('Waiting for opponent...');
    });
    
    lobbySocket.on('room-full', () => {
        hideStatus();
        alert('Room is full!');
    });
    
    lobbySocket.on('room-not-found', () => {
        hideStatus();
        alert('Room not found!');
    });
    
    lobbySocket.on('auth-error', () => {
        localStorage.removeItem('usblog_user');
        localStorage.removeItem('usblog_token');
        window.location.href = 'login.html';
    });
    
    populateGames();
}

function populateGames() {
    const gamesGrid = document.getElementById('gamesGrid');
    
    onlineGames.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.id = `game-${game.id}`;
        card.innerHTML = `
            <div class="game-emoji">${game.emoji}</div>
            <div class="game-name">${game.name}</div>
        `;
        card.onclick = () => selectGame(game.id);
        gamesGrid.appendChild(card);
    });
}

function selectGame(gameId) {
    selectedGame = gameId;
    
    document.querySelectorAll('.game-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    document.getElementById(`game-${gameId}`).classList.add('selected');
}

function findRandomMatch() {
    if (!selectedGame) {
        alert('Please select a game first!');
        return;
    }
    
    lobbySocket.emit('find-match', {
        gameType: selectedGame,
        username: currentUser.username
    });
    
    showStatus('Finding random opponent...');
}

function createTeam() {
    if (!selectedGame) {
        alert('Please select a game first!');
        return;
    }
    
    lobbySocket.emit('create-team', {
        gameType: selectedGame,
        username: currentUser.username
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
    
    lobbySocket.emit('join-team', {
        teamCode: teamCode,
        username: currentUser.username
    });
    
    showStatus('Joining team...');
}

function showStatus(message) {
    document.getElementById('statusOverlay').classList.add('show');
    document.getElementById('statusText').textContent = message;
}

function hideStatus() {
    document.getElementById('statusOverlay').classList.remove('show');
}

function logout() {
    localStorage.removeItem('usblog_user');
    localStorage.removeItem('usblog_token');
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', initLobby);