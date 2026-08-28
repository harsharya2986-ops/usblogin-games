// ============================================================
// ROCK PAPER SCISSORS - Complete Game with 5-Second Timer
// ============================================================

class RockPaperScissors {
    constructor() {
        this.playerScore = 0;
        this.aiScore = 0;
        this.isPlaying = false;
        this.timer = 5;
        this.timerInterval = null;
        
        // Game choices
        this.choices = {
            rock: {
                name: 'Rock',
                emoji: '🪨',
                beats: 'scissors'
            },
            paper: {
                name: 'Paper',
                emoji: '📄',
                beats: 'rock'
            },
            scissors: {
                name: 'Scissors',
                emoji: '✂️',
                beats: 'paper'
            }
        };
        
        // Romantic messages
        this.messages = {
            win: [
                '🎉 You Win! Rock crushes Scissors!',
                '🎉 You Win! Paper covers Rock!',
                '🎉 You Win! Scissors cuts Paper!',
                '✨ Victory is yours!',
                '💕 You got this!'
            ],
            lose: [
                '😅 Partner Wins! Better luck next time!',
                '💔 Partner takes this round!',
                '🌸 Partner wins this one!',
                '💫 So close! Try again!'
            ],
            tie: [
                '🤝 It\'s a Tie! Great minds think alike!',
                '💕 Perfect match!',
                '✨ Both chose the same!',
                '💗 You\'re in sync!'
            ]
        };
        
        this.init();
    }
    
    init() {
        this.createFloatingHearts();
        this.startTimer();
    }
    
    createFloatingHearts() {
        const container = document.getElementById('floatingHearts');
        const hearts = ['💕', '💗', '💖', '💘', '💝', '❤️', '💓'];
        
        for (let i = 0; i < 15; i++) {
            const heart = document.createElement('span');
            heart.className = 'floating-heart';
            heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
            heart.style.left = Math.random() * 100 + '%';
            heart.style.fontSize = Math.random() * 20 + 15 + 'px';
            heart.style.animationDuration = Math.random() * 10 + 8 + 's';
            heart.style.animationDelay = Math.random() * 10 + 's';
            container.appendChild(heart);
        }
    }
    
    startTimer() {
        this.timer = 5;
        this.updateTimerDisplay();
        
        this.timerInterval = setInterval(() => {
            this.timer--;
            this.updateTimerDisplay();
            
            if (this.timer <= 0) {
                // Time's up - auto choose random for player
                const choices = Object.keys(this.choices);
                const randomChoice = choices[Math.floor(Math.random() * choices.length)];
                this.makeChoice(randomChoice, true);
            }
        }, 1000);
    }
    
    resetTimer() {
        clearInterval(this.timerInterval);
        this.timer = 5;
        this.updateTimerDisplay();
        this.startTimer();
    }
    
    updateTimerDisplay() {
        const timerCircle = document.getElementById('timerCircle');
        timerCircle.textContent = this.timer;
        
        if (this.timer <= 2) {
            timerCircle.classList.add('warning');
        } else {
            timerCircle.classList.remove('warning');
        }
    }
    
    makeChoice(playerChoice, isTimeout = false) {
        if (this.isPlaying && !isTimeout) return;
        
        this.isPlaying = true;
        clearInterval(this.timerInterval);
        
        // AI random choice
        const choiceKeys = Object.keys(this.choices);
        const aiChoice = choiceKeys[Math.floor(Math.random() * choiceKeys.length)];
        
        // Get choice objects
        const player = this.choices[playerChoice];
        const ai = this.choices[aiChoice];
        
        // Display choices
        this.displayChoices(player, ai);
        
        // Determine winner
        let result;
        if (playerChoice === aiChoice) {
            result = 'tie';
        } else if (player.beats === aiChoice) {
            result = 'win';
        } else {
            result = 'lose';
        }
        
        // Update scores
        if (result === 'win') {
            this.playerScore++;
        } else if (result === 'lose') {
            this.aiScore++;
        }
        
        // Update display
        this.updateScoreDisplay();
        
        // Show result
        const message = this.getResultMessage(result, playerChoice, aiChoice);
        this.displayResult(message, result);
        
        // Highlight player's card
        this.highlightCard(playerChoice);
        
        // Reset after delay
        setTimeout(() => {
            this.isPlaying = false;
            this.removeHighlight();
            
            // Reset arena
            document.getElementById('arenaContent').innerHTML = `
                <div class="arena-message">💕 Choose your move!</div>
            `;
            
            // Clear result
            document.getElementById('resultMessage').textContent = '';
            
            // Restart timer
            this.startTimer();
        }, 2000);
    }
    
    displayChoices(player, ai) {
        const arenaContent = document.getElementById('arenaContent');
        arenaContent.innerHTML = `
            <div class="arena-choices">
                <div class="arena-choice">
                    <div class="arena-choice-label">You</div>
                    <div class="arena-choice-emoji">${player.emoji}</div>
                    <div class="arena-choice-name">${player.name}</div>
                </div>
                <div class="vs-text">VS</div>
                <div class="arena-choice">
                    <div class="arena-choice-label">Partner</div>
                    <div class="arena-choice-emoji">${ai.emoji}</div>
                    <div class="arena-choice-name">${ai.name}</div>
                </div>
            </div>
        `;
    }
    
    updateScoreDisplay() {
        const playerScoreEl = document.getElementById('playerScore');
        const aiScoreEl = document.getElementById('aiScore');
        
        playerScoreEl.textContent = this.playerScore;
        aiScoreEl.textContent = this.aiScore;
        
        // Pulse animation
        playerScoreEl.classList.remove('pulse');
        aiScoreEl.classList.remove('pulse');
        
        setTimeout(() => {
            playerScoreEl.classList.add('pulse');
            aiScoreEl.classList.add('pulse');
        }, 10);
    }
    
    displayResult(message, result) {
        const resultEl = document.getElementById('resultMessage');
        resultEl.textContent = message;
        
        // Color based on result
        if (result === 'win') {
            resultEl.style.color = '#4caf50';
        } else if (result === 'lose') {
            resultEl.style.color = '#e91e63';
        } else {
            resultEl.style.color = '#ff9800';
        }
        
        // Restart animation
        resultEl.style.animation = 'none';
        setTimeout(() => {
            resultEl.style.animation = 'fadeInUp 0.5s ease';
        }, 10);
    }
    
    highlightCard(choice) {
        const cardMap = {
            rock: 'cardRock',
            paper: 'cardPaper',
            scissors: 'cardScissors'
        };
        
        const card = document.getElementById(cardMap[choice]);
        if (card) {
            card.classList.add('selected');
        }
    }
    
    removeHighlight() {
        const cards = document.querySelectorAll('.choice-card');
        cards.forEach(card => card.classList.remove('selected'));
    }
    
    getResultMessage(result, playerChoice, aiChoice) {
        if (result === 'win') {
            return '🎉 You Win! ' + this.getWinMessage(playerChoice, aiChoice);
        } else if (result === 'lose') {
            return '💔 Partner Wins! ' + this.getLoseMessage(playerChoice, aiChoice);
        } else {
            return '🤝 It\'s a Tie! Both chose ' + this.choices[playerChoice].name;
        }
    }
    
    getWinMessage(playerChoice, aiChoice) {
        if (playerChoice === 'rock') return 'Rock crushes Scissors!';
        if (playerChoice === 'paper') return 'Paper covers Rock!';
        if (playerChoice === 'scissors') return 'Scissors cuts Paper!';
        return '';
    }
    
    getLoseMessage(playerChoice, aiChoice) {
        if (aiChoice === 'rock') return 'Rock crushes Scissors!';
        if (aiChoice === 'paper') return 'Paper covers Rock!';
        if (aiChoice === 'scissors') return 'Scissors cuts Paper!';
        return '';
    }
    
    resetGame() {
        this.playerScore = 0;
        this.aiScore = 0;
        this.isPlaying = false;
        
        // Reset scores
        document.getElementById('playerScore').textContent = '0';
        document.getElementById('aiScore').textContent = '0';
        
        // Reset arena
        document.getElementById('arenaContent').innerHTML = `
            <div class="arena-message">💕 Choose your move!</div>
        `;
        
        // Reset result
        document.getElementById('resultMessage').textContent = '';
        
        // Remove highlights
        this.removeHighlight();
        
        // Reset timer
        this.resetTimer();
    }
}

// Initialize game
const game = new RockPaperScissors();

// Global functions for HTML onclick
function makeChoice(choice) {
    game.makeChoice(choice);
}

function resetGame() {
    game.resetGame();
}