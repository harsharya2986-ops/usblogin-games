const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// ============ USER DATABASE (In-memory for demo) ============
const users = new Map(); // username -> { username, password, token }
const tokens = new Map(); // token -> username

// ============ AUTHENTICATION ============
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

io.on('connection', (socket) => {
    console.log('New connection:', socket.id);
    
    // ============ AUTH HANDLERS ============
    socket.on('register', (data) => {
        const { username, password } = data;
        
        if (users.has(username)) {
            socket.emit('register-response', {
                success: false,
                message: 'Username already exists!'
            });
            return;
        }
        
        if (username.length < 3 || username.length > 20) {
            socket.emit('register-response', {
                success: false,
                message: 'Username must be 3-20 characters'
            });
            return;
        }
        
        if (password.length < 6) {
            socket.emit('register-response', {
                success: false,
                message: 'Password must be at least 6 characters'
            });
            return;
        }
        
        const hashedPassword = hashPassword(password);
        users.set(username, {
            username: username,
            password: hashedPassword,
            token: null
        });
        
        socket.emit('register-response', {
            success: true,
            message: 'Registration successful!'
        });
    });
    
    socket.on('login', (data) => {
        const { username, password } = data;
        
        if (!users.has(username)) {
            socket.emit('auth-response', {
                success: false,
                message: 'User not found!'
            });
            return;
        }
        
        const user = users.get(username);
        const hashedPassword = hashPassword(password);
        
        if (user.password !== hashedPassword) {
            socket.emit('auth-response', {
                success: false,
                message: 'Incorrect password!'
            });
            return;
        }
        
        // Generate token
        const token = crypto.randomBytes(32).toString('hex');
        user.token = token;
        tokens.set(token, username);
        
        socket.emit('auth-response', {
            success: true,
            user: { username: username },
            token: token
        });
    });
    
    // ============ MATCHMAKING ============
    const waitingPlayers = new Map(); // gameType -> player info
    
    socket.on('find-match', (data) => {
        const { gameType, username } = data;
        
        if (waitingPlayers.has(gameType)) {
            const opponent = waitingPlayers.get(gameType);
            waitingPlayers.delete(gameType);
            
            const roomId = `${gameType}-${Date.now()}`;
            
            socket.join(roomId);
            io.sockets.sockets.get(opponent.socketId)?.join(roomId);
            
            io.to(roomId).emit('match-found', {
                roomId: roomId,
                players: [
                    { username: opponent.username, socketId: opponent.socketId },
                    { username: username, socketId: socket.id }
                ]
            });
        } else {
            waitingPlayers.set(gameType, {
                username: username,
                socketId: socket.id
            });
            socket.emit('waiting-for-opponent');
        }
    });
    
    socket.on('create-team', (data) => {
        const { gameType, username } = data;
        const teamCode = generateTeamCode();
        
        socket.join(teamCode);
        
        socket.emit('team-created', { teamCode });
    });
    
    socket.on('join-team', (data) => {
        const { teamCode, username } = data;
        const room = io.sockets.adapter.rooms.get(teamCode);
        
        if (room && room.size > 0) {
            socket.join(teamCode);
            io.to(teamCode).emit('match-found', {
                roomId: teamCode,
                players: [
                    { username: 'Host', socketId: [...room][0] },
                    { username: username, socketId: socket.id }
                ]
            });
        } else {
            socket.emit('room-not-found');
        }
    });
    
    // ============ GAME & CHAT ============
    socket.on('game-move', (data) => {
        socket.to(data.roomId).emit('opponent-move', data.move);
    });
    
    socket.on('send-message', (data) => {
        io.to(data.roomId).emit('new-message', {
            sender: data.sender,
            message: data.message,
            timestamp: Date.now()
        });
    });
});

function generateTeamCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});