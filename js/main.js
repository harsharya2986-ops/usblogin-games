// Main JavaScript for UsBlog Games - Complete Working Version
document.addEventListener('DOMContentLoaded', function() {
    console.log('UsBlog Games initialized');
    
    // Initialize socket connection
    let socket = null;
    try {
        socket = io();
        console.log('Socket connected');
    } catch(e) {
        console.log('Socket will connect on game pages only');
    }
    
    // Game data
    const games = [
        {
            id: 'dino-run',
            name: 'Dino Run',
            emoji: '🦖',
            description: 'Run and jump with your partner in this exciting adventure!',
            badge: 'Popular',
            color: '#4CAF50'
        },
        {
            id: 'ping-pong',
            name: 'Retro Ping Pong',
            emoji: '🏓',
            description: 'Classic table tennis with a romantic twist!',
            badge: 'Classic',
            color: '#FF5722'
        },
        {
            id: 'rock-paper-scissors',
            name: 'Rock Paper Scissors',
            emoji: '✂️',
            description: 'Classic game of choice and luck!',
            badge: 'Quick Play',
            color: '#9C27B0'
        },
        {
            id: 'tic-tac-toe',
            name: 'Super Tic Tac Toe',
            emoji: '⭕',
            description: 'Strategic tic tac toe with a twist!',
            badge: 'Strategy',
            color: '#2196F3'
        },
        {
            id: 'chess',
            name: 'Chess',
            emoji: '♟️',
            description: 'Battle of minds with your loved one!',
            badge: 'Classic',
            color: '#795548'
        },
        {
            id: 'connect-four',
            name: 'Connect Four',
            emoji: '🔴',
            description: 'Connect four in a row to win!',
            badge: 'Fun',
            color: '#E91E63'
        },
        {
            id: 'tic-tac-tumble',
            name: 'Tic Tac Tumble',
            emoji: '🎲',
            description: 'Exciting 3D tic tac toe!',
            badge: 'New',
            color: '#FF9800'
        },
        {
            id: 'dots-boxes',
            name: 'Dots and Boxes',
            emoji: '📦',
            description: 'Connect dots to make boxes!',
            badge: 'Puzzle',
            color: '#607D8B'
        }
    ];
    
    // Populate games grid
    const gamesGrid = document.getElementById('gamesGrid');
    if (gamesGrid) {
        games.forEach(game => {
            const gameCard = document.createElement('div');
            gameCard.className = 'game-card';
            gameCard.style.animation = 'fadeInUp 0.5s ease forwards';
            gameCard.innerHTML = `
                <div class="game-thumbnail" style="background: linear-gradient(135deg, ${game.color}22, ${game.color}44); height: 200px; display: flex; align-items: center; justify-content: center; font-size: 80px;">
                    ${game.emoji}
                    <span class="game-badge">${game.badge}</span>
                </div>
                <div class="game-info">
                    <h3>${game.name}</h3>
                    <p>${game.description}</p>
                    <div class="game-actions">
                        <button class="btn-play computer-btn" onclick="startGame('${game.id}', 'computer')">
                            🤖 vs Computer
                        </button>
                        <button class="btn-play online-btn" onclick="startGame('${game.id}', 'online')">
                            🌐 Online
                        </button>
                    </div>
                </div>
            `;
            gamesGrid.appendChild(gameCard);
        });
    }
    
    // Mode tabs functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
    
    // Add floating hearts animation
    createFloatingHearts();
});

// Global function to start games
window.startGame = function(gameId, mode) {
    console.log(`Starting ${gameId} in ${mode} mode`);
    
    if (mode === 'computer') {
        // Navigate directly to game page
        window.location.href = `games/${gameId}.html?mode=computer`;
    } else if (mode === 'online') {
        // Show matchmaking modal
        showMatchmakingModal(gameId);
    }
};

// Matchmaking modal
function showMatchmakingModal(gameId) {
    const modalHtml = `
        <div class="modal-overlay" id="matchmakingModal">
            <div class="modal-content">
                <button class="modal-close" onclick="closeModal()">×</button>
                <h2>🎮 Find Your Partner</h2>
                <p>Choose how you want to connect</p>
                <div class="match-options">
                    <button class="match-btn" onclick="findRandomMatch('${gameId}')">
                        <span class="match-icon">🎲</span>
                        Random Match
                    </button>
                    <div class="divider">OR</div>
                    <button class="match-btn" onclick="showCreateTeam('${gameId}')">
                        <span class="match-icon">✨</span>
                        Create Team Code
                    </button>
                    <div class="divider">OR</div>
                    <div class="team-join">
                        <input type="text" id="teamCodeInput" placeholder="Enter Team Code" maxlength="6">
                        <button class="match-btn" onclick="joinTeam('${gameId}')">
                            <span class="match-icon">🔑</span>
                            Join Team
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function closeModal() {
    const modal = document.getElementById('matchmakingModal');
    if (modal) {
        modal.remove();
    }
}

function findRandomMatch(gameId) {
    closeModal();
    showLoading('Finding random opponent...');
    
    // Simulate finding match after 2 seconds
    setTimeout(() => {
        closeLoading();
        const roomId = Math.random().toString(36).substring(7);
        window.location.href = `games/${gameId}.html?mode=online&room=${roomId}`;
    }, 2000);
}

function showCreateTeam(gameId) {
    closeModal();
    const teamCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const modalHtml = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <button class="modal-close" onclick="closeModal()">×</button>
                <h2>✨ Your Team Code</h2>
                <p>Share this code with your partner</p>
                <div class="team-code-display">${teamCode}</div>
                <button class="copy-btn" onclick="copyTeamCode('${teamCode}')">
                    📋 Copy Code
                </button>
                <button class="waiting-btn" onclick="waitForPartner('${gameId}', '${teamCode}')">
                    ⏳ Wait for Partner
                </button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function copyTeamCode(code) {
    navigator.clipboard.writeText(code).then(() => {
        alert('Team code copied to clipboard!');
    });
}

function waitForPartner(gameId, teamCode) {
    closeModal();
    showLoading(`Waiting for partner... Code: ${teamCode}`);
    
    // Simulate partner joining after 3 seconds
    setTimeout(() => {
        closeLoading();
        window.location.href = `games/${gameId}.html?mode=online&room=${teamCode}`;
    }, 3000);
}

function joinTeam(gameId) {
    const code = document.getElementById('teamCodeInput').value;
    if (code && code.length === 6) {
        closeModal();
        showLoading('Joining team...');
        
        setTimeout(() => {
            closeLoading();
            window.location.href = `games/${gameId}.html?mode=online&room=${code}`;
        }, 1000);
    } else {
        alert('Please enter a valid 6-character team code');
    }
}

function showLoading(message) {
    const loadingHtml = `
        <div class="modal-overlay" id="loadingModal">
            <div class="modal-content">
                <div class="spinner"></div>
                <p>${message}</p>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', loadingHtml);
}

function closeLoading() {
    const loading = document.getElementById('loadingModal');
    if (loading) {
        loading.remove();
    }
}

function createFloatingHearts() {
    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) return;
    
    const hearts = ['❤️', '💕', '💖', '💗', '💝'];
    
    setInterval(() => {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.innerHTML = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.animationDuration = Math.random() * 3 + 3 + 's';
        heart.style.fontSize = Math.random() * 20 + 20 + 'px';
        heroSection.appendChild(heart);
        
        setTimeout(() => {
            heart.remove();
        }, 6000);
    }, 2000);
}