// ============================================================
// ROMANTIC PING PONG - Final Working Version
// ============================================================

class RomanticPingPong {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.W = 800;
        this.H = 500;
        this.canvas.width = this.W;
        this.canvas.height = this.H;
        
        // Game state
        this.state = 'idle'; // idle, countdown, playing, paused, gameover
        this.playerScore = 0;
        this.aiScore = 0;
        this.winner = null;
        this.countdownValue = 3;
        this.countdownTimer = 0;
        
        // Player paddle - MOVEMENT SPEED INCREASED
        this.player = {
            x: 30,
            y: this.H / 2 - 60,
            width: 15,
            height: 120,
            color: '#ff6b9d',
            glowColor: 'rgba(255, 107, 157, 0.5)',
            moveSpeed: 8, // Keyboard movement speed
            velocity: 0
        };
        
        // AI paddle
        this.ai = {
            x: this.W - 45,
            y: this.H / 2 - 60,
            width: 15,
            height: 120,
            color: '#74b9ff',
            glowColor: 'rgba(116, 185, 255, 0.5)',
            moveSpeed: 6,
            targetY: this.H / 2 - 60
        };
        
        // Ball
        this.ball = {
            x: this.W / 2,
            y: this.H / 2,
            radius: 12,
            vx: 0,
            vy: 0,
            speed: 7,
            baseSpeed: 7,
            color: '#ffffff',
            glowColor: 'rgba(255, 255, 255, 0.8)'
        };
        
        this.particles = [];
        this.keys = {};
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateScoreDisplay();
        this.gameLoop();
    }
    
    setupEventListeners() {
        // Button events
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pauseGame());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        
        // Mouse movement - DIRECT POSITION CONTROL
        const canvasWrapper = document.getElementById('canvasWrapper');
        
        canvasWrapper.addEventListener('mousemove', (e) => {
            const rect = canvasWrapper.getBoundingClientRect();
            const scaleY = this.H / rect.height;
            const mouseY = (e.clientY - rect.top) * scaleY;
            
            // Direct position set - paddle follows mouse exactly
            this.player.y = mouseY - this.player.height / 2;
            
            // Clamp to canvas bounds
            this.clampPlayerPosition();
        });
        
        // Touch movement
        canvasWrapper.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = canvasWrapper.getBoundingClientRect();
            const scaleY = this.H / rect.height;
            const touchY = (e.touches[0].clientY - rect.top) * scaleY;
            
            this.player.y = touchY - this.player.height / 2;
            this.clampPlayerPosition();
        }, { passive: false });
        
        canvasWrapper.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const rect = canvasWrapper.getBoundingClientRect();
            const scaleY = this.H / rect.height;
            const touchY = (e.touches[0].clientY - rect.top) * scaleY;
            
            this.player.y = touchY - this.player.height / 2;
            this.clampPlayerPosition();
        }, { passive: false });
        
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            this.keys[e.code] = true;
            
            if (e.code === 'Space' && this.state === 'idle') {
                e.preventDefault();
                this.startGame();
            }
            if (e.code === 'Space' && this.state === 'gameover') {
                e.preventDefault();
                this.resetGame();
                this.startGame();
            }
            if (e.code === 'KeyP' && this.state === 'playing') {
                this.pauseGame();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
            this.keys[e.code] = false;
        });
    }
    
    clampPlayerPosition() {
        if (this.player.y < 0) {
            this.player.y = 0;
        }
        if (this.player.y > this.H - this.player.height) {
            this.player.y = this.H - this.player.height;
        }
    }
    
    startGame() {
        if (this.state === 'playing' || this.state === 'countdown') return;
        
        this.playerScore = 0;
        this.aiScore = 0;
        this.winner = null;
        this.updateScoreDisplay();
        
        this.resetPositions();
        this.resetBall();
        
        this.state = 'countdown';
        this.countdownValue = 3;
        this.countdownTimer = 0;
        
        document.getElementById('startBtn').textContent = '💕 Playing...';
    }
    
    pauseGame() {
        if (this.state === 'playing') {
            this.state = 'paused';
            document.getElementById('pauseBtn').textContent = '▶️ Resume';
        } else if (this.state === 'paused') {
            this.state = 'playing';
            document.getElementById('pauseBtn').textContent = '⏸️ Pause';
        }
    }
    
    resetGame() {
        this.state = 'idle';
        this.playerScore = 0;
        this.aiScore = 0;
        this.winner = null;
        this.resetPositions();
        this.resetBall();
        this.updateScoreDisplay();
        document.getElementById('pauseBtn').textContent = '⏸️ Pause';
        document.getElementById('startBtn').textContent = '💕 Start';
    }
    
    resetPositions() {
        this.player.y = this.H / 2 - this.player.height / 2;
        this.ai.y = this.H / 2 - this.ai.height / 2;
        this.ai.targetY = this.ai.y;
    }
    
    resetBall() {
        this.ball.x = this.W / 2;
        this.ball.y = this.H / 2;
        this.ball.speed = this.ball.baseSpeed;
        this.ball.vx = 0;
        this.ball.vy = 0;
    }
    
    serveBall() {
        // Random angle between -25 and 25 degrees
        const angle = (Math.random() * 50 - 25) * Math.PI / 180;
        const direction = Math.random() > 0.5 ? 1 : -1;
        
        this.ball.vx = direction * this.ball.speed * Math.cos(angle);
        this.ball.vy = this.ball.speed * Math.sin(angle);
    }
    
    updateCountdown() {
        if (this.state !== 'countdown') return;
        
        this.countdownTimer++;
        
        // 60 frames = 1 second
        if (this.countdownTimer >= 60) {
            this.countdownTimer = 0;
            this.countdownValue--;
            
            if (this.countdownValue <= 0) {
                this.state = 'playing';
                this.serveBall();
            }
        }
    }
    
    updatePlayerMovement() {
        if (this.state !== 'playing' && this.state !== 'countdown') return;
        
        let moveDirection = 0;
        
        // Check keyboard keys
        if (this.keys['w'] || this.keys['W'] || this.keys['ArrowUp']) {
            moveDirection = -1;
        }
        if (this.keys['s'] || this.keys['S'] || this.keys['ArrowDown']) {
            moveDirection = 1;
        }
        
        // Apply keyboard movement with high speed
        if (moveDirection !== 0) {
            this.player.y += moveDirection * this.player.moveSpeed;
        }
        
        // Clamp position
        this.clampPlayerPosition();
    }
    
    updateAIMovement() {
        if (this.state !== 'playing' && this.state !== 'countdown') return;
        
        // Predict ball position
        if (this.ball.vx > 0) {
            // Ball moving towards AI
            const timeToReach = (this.ai.x - this.ball.x) / this.ball.vx;
            const predictedY = this.ball.y + this.ball.vy * timeToReach;
            
            // Add some error for realism
            const error = Math.sin(Date.now() * 0.001) * 20;
            this.ai.targetY = predictedY - this.ai.height / 2 + error;
        } else {
            // Ball moving away - return to center
            this.ai.targetY = this.H / 2 - this.ai.height / 2;
        }
        
        // Clamp target
        if (this.ai.targetY < 0) this.ai.targetY = 0;
        if (this.ai.targetY > this.H - this.ai.height) this.ai.targetY = this.H - this.ai.height;
        
        // Move AI towards target
        const diff = this.ai.targetY - this.ai.y;
        
        if (Math.abs(diff) > this.ai.moveSpeed) {
            this.ai.y += Math.sign(diff) * this.ai.moveSpeed;
        } else {
            this.ai.y += diff * 0.3;
        }
        
        // Clamp AI position
        if (this.ai.y < 0) this.ai.y = 0;
        if (this.ai.y > this.H - this.ai.height) this.ai.y = this.H - this.ai.height;
    }
    
    updateBallMovement() {
        if (this.state !== 'playing') return;
        
        // Move ball
        this.ball.x += this.ball.vx;
        this.ball.y += this.ball.vy;
        
        // Top wall collision
        if (this.ball.y - this.ball.radius <= 0) {
            this.ball.y = this.ball.radius;
            this.ball.vy = Math.abs(this.ball.vy); // Ensure downward
            this.createParticles(this.ball.x, 0, '#ffffff', 8);
        }
        
        // Bottom wall collision
        if (this.ball.y + this.ball.radius >= this.H) {
            this.ball.y = this.H - this.ball.radius;
            this.ball.vy = -Math.abs(this.ball.vy); // Ensure upward
            this.createParticles(this.ball.x, this.H, '#ffffff', 8);
        }
        
        // Player paddle collision (left side)
        if (this.ball.vx < 0 &&
            this.ball.x - this.ball.radius <= this.player.x + this.player.width &&
            this.ball.x + this.ball.radius >= this.player.x &&
            this.ball.y + this.ball.radius >= this.player.y &&
            this.ball.y - this.ball.radius <= this.player.y + this.player.height) {
            
            // Calculate deflection angle
            const relativeIntersect = (this.player.y + this.player.height / 2) - this.ball.y;
            const normalizedIntersect = relativeIntersect / (this.player.height / 2);
            const bounceAngle = normalizedIntersect * (Math.PI / 3); // Max 60 degrees
            
            // Increase speed
            this.ball.speed = Math.min(18, this.ball.speed * 1.08);
            
            // Set new velocity
            this.ball.vx = Math.abs(this.ball.speed * Math.cos(bounceAngle));
            this.ball.vy = -this.ball.speed * Math.sin(bounceAngle);
            
            // Position ball outside paddle
            this.ball.x = this.player.x + this.player.width + this.ball.radius;
            
            this.createParticles(this.ball.x, this.ball.y, '#ff6b9d', 15);
        }
        
        // AI paddle collision (right side)
        if (this.ball.vx > 0 &&
            this.ball.x + this.ball.radius >= this.ai.x &&
            this.ball.x - this.ball.radius <= this.ai.x + this.ai.width &&
            this.ball.y + this.ball.radius >= this.ai.y &&
            this.ball.y - this.ball.radius <= this.ai.y + this.ai.height) {
            
            // Calculate deflection angle
            const relativeIntersect = (this.ai.y + this.ai.height / 2) - this.ball.y;
            const normalizedIntersect = relativeIntersect / (this.ai.height / 2);
            const bounceAngle = normalizedIntersect * (Math.PI / 3);
            
            // Increase speed
            this.ball.speed = Math.min(18, this.ball.speed * 1.08);
            
            // Set new velocity
            this.ball.vx = -Math.abs(this.ball.speed * Math.cos(bounceAngle));
            this.ball.vy = -this.ball.speed * Math.sin(bounceAngle);
            
            // Position ball outside paddle
            this.ball.x = this.ai.x - this.ball.radius;
            
            this.createParticles(this.ball.x, this.ball.y, '#74b9ff', 15);
        }
        
        // Scoring
        if (this.ball.x < -30) {
            // AI scores
            this.aiScore++;
            this.updateScoreDisplay();
            this.createParticles(0, this.ball.y, '#74b9ff', 25);
            
            if (this.aiScore >= 11) {
                this.state = 'gameover';
                this.winner = 'ai';
                document.getElementById('startBtn').textContent = '💕 Rematch';
            } else {
                this.resetBall();
                this.state = 'countdown';
                this.countdownValue = 3;
                this.countdownTimer = 0;
            }
        }
        
        if (this.ball.x > this.W + 30) {
            // Player scores
            this.playerScore++;
            this.updateScoreDisplay();
            this.createParticles(this.W, this.ball.y, '#ff6b9d', 25);
            
            if (this.playerScore >= 11) {
                this.state = 'gameover';
                this.winner = 'player';
                document.getElementById('startBtn').textContent = '💕 Rematch';
            } else {
                this.resetBall();
                this.state = 'countdown';
                this.countdownValue = 3;
                this.countdownTimer = 0;
            }
        }
    }
    
    createParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 30,
                maxLife: 30,
                color: color,
                size: Math.random() * 4 + 2
            });
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1;
            p.life--;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    updateScoreDisplay() {
        document.getElementById('playerScore').textContent = this.playerScore;
        document.getElementById('aiScore').textContent = this.aiScore;
    }
    
    update() {
        this.updateCountdown();
        this.updatePlayerMovement();
        this.updateAIMovement();
        this.updateBallMovement();
        this.updateParticles();
    }
    
    render() {
        // Clear
        this.ctx.clearRect(0, 0, this.W, this.H);
        
        // Background
        const bgGradient = this.ctx.createLinearGradient(0, 0, this.W, this.H);
        bgGradient.addColorStop(0, '#1a1a2e');
        bgGradient.addColorStop(0.5, '#16213e');
        bgGradient.addColorStop(1, '#0f3460');
        this.ctx.fillStyle = bgGradient;
        this.ctx.fillRect(0, 0, this.W, this.H);
        
        // Center line
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.lineWidth = 4;
        this.ctx.setLineDash([15, 15]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.W / 2, 0);
        this.ctx.lineTo(this.W / 2, this.H);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Center circle
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(this.W / 2, this.H / 2, 60, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Draw paddles
        this.drawPaddle(this.player, '💕');
        this.drawPaddle(this.ai, '💙');
        
        // Draw ball
        this.drawBall();
        
        // Draw particles
        this.drawParticles();
        
        // Draw canvas scores
        this.drawScores();
        
        // Overlays
        if (this.state === 'idle') {
            this.drawIdle();
        } else if (this.state === 'countdown') {
            this.drawCountdown();
        } else if (this.state === 'paused') {
            this.drawPaused();
        } else if (this.state === 'gameover') {
            this.drawGameOver();
        }
    }
    
    drawPaddle(paddle, emoji) {
        this.ctx.save();
        this.ctx.shadowColor = paddle.glowColor;
        this.ctx.shadowBlur = 30;
        
        // Paddle body
        this.ctx.fillStyle = paddle.color;
        this.ctx.beginPath();
        this.ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 10);
        this.ctx.fill();
        
        // Emoji
        this.ctx.shadowBlur = 0;
        this.ctx.font = '25px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(emoji, paddle.x + paddle.width / 2, paddle.y + paddle.height / 2 + 8);
        this.ctx.restore();
    }
    
    drawBall() {
        this.ctx.save();
        this.ctx.shadowColor = '#ffffff';
        this.ctx.shadowBlur = 20;
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Small heart inside ball
        this.ctx.shadowBlur = 0;
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('💕', this.ball.x, this.ball.y + 4);
        this.ctx.restore();
    }
    
    drawParticles() {
        for (let p of this.particles) {
            const alpha = p.life / p.maxLife;
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = alpha;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.globalAlpha = 1;
    }
    
    drawScores() {
        this.ctx.save();
        
        // Player score
        this.ctx.fillStyle = '#ff6b9d';
        this.ctx.shadowColor = 'rgba(255, 107, 157, 0.6)';
        this.ctx.shadowBlur = 15;
        this.ctx.font = 'bold 55px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.playerScore.toString(), this.W / 4, 70);
        
        // AI score
        this.ctx.fillStyle = '#74b9ff';
        this.ctx.shadowColor = 'rgba(116, 185, 255, 0.6)';
        this.ctx.fillText(this.aiScore.toString(), (this.W * 3) / 4, 70);
        
        this.ctx.restore();
    }
    
    drawIdle() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        this.ctx.fillRect(0, 0, this.W, this.H);
        
        this.ctx.fillStyle = '#ff6b9d';
        this.ctx.font = 'bold 45px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('💕 Romantic Ping Pong', this.W / 2, this.H / 2 - 30);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '22px Arial';
        this.ctx.fillText('Play with your partner!', this.W / 2, this.H / 2 + 20);
        
        this.ctx.font = '16px Arial';
        this.ctx.fillText('Press Start or Spacebar', this.W / 2, this.H / 2 + 60);
    }
    
    drawCountdown() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.W, this.H);
        
        this.ctx.fillStyle = '#ff6b9d';
        this.ctx.shadowColor = 'rgba(255, 107, 157, 0.8)';
        this.ctx.shadowBlur = 40;
        this.ctx.font = 'bold 100px Arial';
        this.ctx.textAlign = 'center';
        
        if (this.countdownValue > 0) {
            this.ctx.fillText(this.countdownValue.toString(), this.W / 2, this.H / 2 + 30);
        }
        this.ctx.shadowBlur = 0;
    }
    
    drawPaused() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.ctx.fillRect(0, 0, this.W, this.H);
        
        this.ctx.fillStyle = '#fdcb6e';
        this.ctx.font = 'bold 50px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('⏸️ Paused', this.W / 2, this.H / 2);
    }
    
    drawGameOver() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        this.ctx.fillRect(0, 0, this.W, this.H);
        
        if (this.winner === 'player') {
            this.ctx.fillStyle = '#ff6b9d';
            this.ctx.font = 'bold 50px Arial';
            this.ctx.fillText('🎉 You Win!', this.W / 2, this.H / 2 - 40);
        } else {
            this.ctx.fillStyle = '#74b9ff';
            this.ctx.font = 'bold 50px Arial';
            this.ctx.fillText('💙 Partner Wins!', this.W / 2, this.H / 2 - 40);
        }
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 30px Arial';
        this.ctx.fillText(`${this.playerScore} - ${this.aiScore}`, this.W / 2, this.H / 2 + 10);
        
        this.ctx.font = '18px Arial';
        this.ctx.fillText('Press Space or Click Rematch', this.W / 2, this.H / 2 + 50);
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Add roundRect to Canvas prototype
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
        if (width < 2 * radius) radius = width / 2;
        if (height < 2 * radius) radius = height / 2;
        
        this.moveTo(x + radius, y);
        this.lineTo(x + width - radius, y);
        this.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.lineTo(x + width, y + height - radius);
        this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.lineTo(x + radius, y + height);
        this.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.lineTo(x, y + radius);
        this.quadraticCurveTo(x, y, x + radius, y);
        return this;
    };
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new RomanticPingPong();
});