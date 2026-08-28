// ============ CHAT SYSTEM ============
let chatSocket;
let roomId;
let playerName;

function initChat(socket, room, name) {
    chatSocket = socket;
    roomId = room;
    playerName = name;
    
    chatSocket.on('new-message', (data) => {
        displayMessage(data.sender, data.message, data.sender === playerName);
    });
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (message) {
        chatSocket.emit('send-message', {
            roomId: roomId,
            message: message,
            sender: playerName
        });
        
        displayMessage(playerName, message, true);
        input.value = '';
    }
}

function displayMessage(sender, message, isYou) {
    const chatMessages = document.getElementById('chatMessages');
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${isYou ? 'you' : 'opponent'}`;
    messageEl.innerHTML = `
        <div class="sender">${sender}</div>
        <div class="text">${message}</div>
    `;
    chatMessages.appendChild(messageEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Enter key to send
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('chatInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});