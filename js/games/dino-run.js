// ============================================================
// ROMANTIC DINO RUN - Complete Game Engine with Collision System
// ============================================================

class RomanticDinoGame {
    constructor() {
        // Canvas setup
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.W = 850;
        this.H = 400;
        this.canvas.width = this.W;
        this.canvas.height = this.H;
        
        // Constants
        this.GROUND_Y = 320;
        this.GRAVITY = 0.65;
        this.JUMP_FORCE = -12.5;
        this.BASE_SPEED = 5.5;
        this.MAX_SPEED = 12;
        this.HEART_BONUS = 100;
        
        // Game state
        this.gameState = 'idle'; // idle, running, paused, gameover
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('romanticDinoHighScore')) || 0;
        this.speed = this.BASE_SPEED;
        this.frameCount = 0;
        this.spawnTimer = 0;
        this.heartSpawnTimer = 0;
        
        // Game objects
        this.obstacles = [];
        this.hearts = [];
        this.particles = [];
        this.clouds = [];
        this.stars = [];
        this.groundDecor = [];
        
        // Player dinosaur
        this.player = {
            x: 110,
            y: this.GROUND_Y - 50,
            width: 42,
            height: 50,
            vy: 0,
            jumping: false,
            color: '#f472b6',
            legFrame: 0,
            isAlive: true,
            deathAnimation: 0,
            invincible: false,
            invincibleTimer: 0
        };
        
        // AI Partner dinosaur
        this.partner = {
            x: 620,
            y: this.GROUND_Y - 50,
            width: 42,
            height: 50,
            vy: 0,
            jumping: false,
            color: '#60a5fa',
            legFrame: 0,
            score: 0,
            jumpCooldown: 0,
            isAlive: true,
            deathAnimation: 0,
            invincible: false,
            invincibleTimer: 0,
            respawnTimer: 0
        };
        
        // Game over details
        this.gameOverMessage = '';
        this.gameOverSubMessage = '';
        this.winner = '';
        
        this.init();
    }
    
    init() {
        this.createBackground();
        this.setupEventListeners();
        this.updateScoreDisplay();
        this.createBgHearts();
        this.gameLoop();
    }
    
    createBackground() {
        // Stars
        for (let i = 0; i < 45; i++) {
            this.stars.push({
                x: Math.random() * this.W,
                y: Math.random() * (this.GROUND_Y - 60),
                size: Math.random() * 2 + 0.5,
                phase: Math.random() * Math.PI * 2
            });
        }
        
        // Heart-shaped clouds
        for (let i = 0; i < 6; i++) {
            this.clouds.push({
                x: Math.random() * this.W,
                y: Math.random() * 130 + 20,
                w: Math.random() * 70 + 40,
                speed: Math.random() * 0.4 + 0.2,
                opacity: Math.random() * 0.25 + 0.15
            });
        }
        
        // Ground decorations
        for (let i = 0; i < 14; i++) {
            this.groundDecor.push({
                x: Math.random() * this.W,
                size: Math.random() * 10 + 6,
                type: Math.random() > 0.5 ? 'flower' : 'grass'
            });
        }
    }
    
    setupEventListeners() {
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pauseGame());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        
        this.canvas.addEventListener('click', () => this.playerJump());
        
        document.getElementById('canvasWrap').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.playerJump();
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                e.preventDefault();
                this.playerJump();
            }
            if (e.key === 'p' || e.key === 'P') {
                this.pauseGame();
            }
        });
    }
    
    createBgHearts() {
        const container = document.getElementById('bgHearts');
        const emojis = ['💕', '💗', '💖', '💘', '🌸'];
        
        for (let i = 0; i < 12; i++) {
            const span = document.createElement('span');
            span.className = 'bg-heart';
            span.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            span.style.left = Math.random() * 100 + '%';
            span.style.fontSize = Math.random() * 20 + 16 + 'px';
            span.style.animationDuration = Math.random() * 12 + 8 + 's';
            span.style.animationDelay = Math.random() * 10 + 's';
            container.appendChild(span);
        }
    }
    
    startGame() {
        this.gameState = 'running';
        this.score = 0;
        this.speed = this.BASE_SPEED;
        this.frameCount = 0;
        this.obstacles = [];
        this.hearts = [];
        this.particles = [];
        this.spawnTimer = 0;
        this.heartSpawnTimer = 0;
        
        // Reset player
        this.player.y = this.GROUND_Y - this.player.height;
        this.player.vy = 0;
        this.player.jumping = false;
        this.player.isAlive = true;
        this.player.deathAnimation = 0;
        this.player.invincible = false;
        this.player.invincibleTimer = 0;
        
        // Reset partner
        this.partner.y = this.GROUND_Y - this.partner.height;
        this.partner.vy = 0;
        this.partner.jumping = false;
        this.partner.score = 0;
        this.partner.jumpCooldown = 0;
        this.partner.isAlive = true;
        this.partner.deathAnimation = 0;
        this.partner.invincible = false;
        this.partner.invincibleTimer = 0;
        this.partner.respawnTimer = 0;
        
        this.gameOverMessage = '';
        this.gameOverSubMessage = '';
        this.winner = '';
        
        document.getElementById('startBtn').textContent = '💕 Playing...';
        this.updateScoreDisplay();
    }
    
    pauseGame() {
        if (this.gameState === 'running') {
            this.gameState = 'paused';
            document.getElementById('pauseBtn').textContent = '▶️ Resume';
        } else if (this.gameState === 'paused') {
            this.gameState = 'running';
            document.getElementById('pauseBtn').textContent = '⏸️ Pause';
        }
    }
    
    resetGame() {
        this.gameState = 'idle';
        document.getElementById('startBtn').textContent = '💕 Start Game';
        document.getElementById('pauseBtn').textContent = '⏸️ Pause';
        this.score = 0;
        this.partner.score = 0;
        this.obstacles = [];
        this.hearts = [];
        this.particles = [];
        
        this.player.y = this.GROUND_Y - this.player.height;
        this.partner.y = this.GROUND_Y - this.partner.height;
        this.player.vy = 0;
        this.partner.vy = 0;
        this.player.jumping = false;
        this.partner.jumping = false;
        this.player.isAlive = true;
        this.partner.isAlive = true;
        this.player.deathAnimation = 0;
        this.partner.deathAnimation = 0;
        
        this.gameOverMessage = '';
        this.gameOverSubMessage = '';
        this.winner = '';
        
        this.updateScoreDisplay();
    }
    
    playerJump() {
        if (this.gameState === 'idle') {
            this.startGame();
            return;
        }
        if (this.gameState === 'gameover') {
            this.resetGame();
            this.startGame();
            return;
        }
        if (this.gameState !== 'running') return;
        if (!this.player.isAlive) return;
        
        if (!this.player.jumping) {
            this.player.vy = this.JUMP_FORCE;
            this.player.jumping = true;
            this.spawnParticles(
                this.player.x + this.player.width / 2,
                this.player.y + this.player.height,
                this.player.color,
                6
            );
        }
    }
    
    spawnParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 5,
                vy: Math.random() * -4 - 1,
                life: 28 + Math.random() * 12,
                maxLife: 40,
                color: color,
                size: Math.random() * 3 + 2
            });
        }
    }
    
    spawnDeathParticles(x, y, color) {
        for (let i = 0; i < 30; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10 - 3,
                life: 40 + Math.random() * 20,
                maxLife: 60,
                color: color,
                size: Math.random() * 4 + 3
            });
        }
    }
    
    spawnObstacle() {
        const type = Math.random() > 0.55 ? 'cactus' : 'rock';
        let w = type === 'cactus' ? 22 + Math.random() * 10 : 28 + Math.random() * 14;
        let h = type === 'cactus' ? 38 + Math.random() * 25 : 18 + Math.random() * 14;
        
        this.obstacles.push({
            x: this.W + 40,
            y: this.GROUND_Y - h,
            width: w,
            height: h,
            type: type
        });
    }
    
    spawnHeart() {
        this.hearts.push({
            x: this.W + 40,
            y: Math.random() * 130 + 70,
            width: 24,
            height: 24,
            phase: Math.random() * Math.PI * 2
        });
    }
    
    update() {
        if (this.gameState !== 'running') return;
        
        this.frameCount++;
        this.speed = Math.min(this.MAX_SPEED, this.BASE_SPEED + this.frameCount * 0.0015);
        
        // Update player
        if (this.player.isAlive) {
            this.score += this.speed * 0.1;
            
            if (this.player.jumping) {
                this.player.vy += this.GRAVITY;
                this.player.y += this.player.vy;
                
                if (this.player.y >= this.GROUND_Y - this.player.height) {
                    this.player.y = this.GROUND_Y - this.player.height;
                    this.player.jumping = false;
                    this.player.vy = 0;
                }
            }
            
            if (this.frameCount % 8 === 0) {
                this.player.legFrame = (this.player.legFrame + 1) % 2;
            }
            
            // Invincibility timer
            if (this.player.invincible) {
                this.player.invincibleTimer--;
                if (this.player.invincibleTimer <= 0) {
                    this.player.invincible = false;
                }
            }
        } else {
            // Death animation
            this.player.deathAnimation++;
            this.player.y += 2; // Fall down
        }
        
        // Update partner
        if (this.partner.isAlive) {
            this.updatePartner();
        } else {
            // Partner respawn logic
            this.partner.respawnTimer--;
            this.partner.deathAnimation++;
            
            if (this.partner.respawnTimer <= 0) {
                // Respawn partner
                this.partner.isAlive = true;
                this.partner.deathAnimation = 0;
                this.partner.y = this.GROUND_Y - this.partner.height;
                this.partner.vy = 0;
                this.partner.jumping = false;
                this.partner.invincible = true;
                this.partner.invincibleTimer = 90; // 1.5 seconds invincibility
                this.spawnParticles(
                    this.partner.x + this.partner.width / 2,
                    this.partner.y + this.partner.height,
                    this.partner.color,
                    15
                );
            }
        }
        
        // Spawn obstacles
        this.spawnTimer++;
        const spawnThreshold = Math.max(50, 90 - this.speed * 3);
        if (this.spawnTimer >= spawnThreshold) {
            this.spawnObstacle();
            this.spawnTimer = 0;
        }
        
        // Spawn hearts
        this.heartSpawnTimer++;
        if (this.heartSpawnTimer >= 140) {
            this.spawnHeart();
            this.heartSpawnTimer = 0;
        }
        
        // Move obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            this.obstacles[i].x -= this.speed;
            if (this.obstacles[i].x + this.obstacles[i].width < 0) {
                this.obstacles.splice(i, 1);
            }
        }
        
        // Move hearts
        for (let i = this.hearts.length - 1; i >= 0; i--) {
            this.hearts[i].x -= this.speed * 0.85;
            this.hearts[i].y += Math.sin(this.hearts[i].x * 0.03 + this.hearts[i].phase) * 0.6;
            if (this.hearts[i].x < -30) {
                this.hearts.splice(i, 1);
            }
        }
        
        // Move clouds
        for (let c of this.clouds) {
            c.x -= c.speed;
            if (c.x < -100) {
                c.x = this.W + 80;
                c.y = Math.random() * 130 + 20;
            }
        }
        
        // Move ground decor
        for (let d of this.groundDecor) {
            d.x -= this.speed * 0.5;
            if (d.x < -20) {
                d.x = this.W + 20;
                d.type = Math.random() > 0.5 ? 'flower' : 'grass';
            }
        }
        
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.15;
            p.life--;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        // Check collisions
        this.checkCollisions();
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = Math.floor(this.score);
            localStorage.setItem('romanticDinoHighScore', this.highScore);
        }
        
        this.updateScoreDisplay();
    }
    
    updatePartner() {
        // Partner physics
        if (this.partner.jumping) {
            this.partner.vy += this.GRAVITY;
            this.partner.y += this.partner.vy;
            
            if (this.partner.y >= this.GROUND_Y - this.partner.height) {
                this.partner.y = this.GROUND_Y - this.partner.height;
                this.partner.jumping = false;
                this.partner.vy = 0;
            }
        }
        
        if (this.frameCount % 8 === 0) {
            this.partner.legFrame = (this.partner.legFrame + 1) % 2;
        }
        
        if (this.partner.jumpCooldown > 0) {
            this.partner.jumpCooldown--;
        }
        
        // Invincibility timer
        if (this.partner.invincible) {
            this.partner.invincibleTimer--;
            if (this.partner.invincibleTimer <= 0) {
                this.partner.invincible = false;
            }
        }
        
        // AI - Find nearest obstacle
        let nearestObs = null;
        let nearestDist = Infinity;
        
        for (let obs of this.obstacles) {
            const d = obs.x - this.partner.x;
            if (d > 0 && d < nearestDist) {
                nearestDist = d;
                nearestObs = obs;
            }
        }
        
        // Jump over obstacles
        if (nearestObs && nearestDist < 120 && !this.partner.jumping && this.partner.jumpCooldown === 0) {
            this.partner.vy = this.JUMP_FORCE;
            this.partner.jumping = true;
            this.partner.jumpCooldown = 22;
            this.spawnParticles(
                this.partner.x + this.partner.width / 2,
                this.partner.y + this.partner.height,
                this.partner.color,
                6
            );
        }
        
        // Collect hearts
        for (let h of this.hearts) {
            const d = h.x - this.partner.x;
            if (d > 0 && d < 70 && !this.partner.jumping && this.partner.jumpCooldown === 0 && h.y < this.partner.y) {
                this.partner.vy = this.JUMP_FORCE;
                this.partner.jumping = true;
                this.partner.jumpCooldown = 18;
                this.spawnParticles(
                    this.partner.x + this.partner.width / 2,
                    this.partner.y + this.partner.height,
                    this.partner.color,
                    6
                );
                break;
            }
        }
    }
    
    checkCollisions() {
        // Player vs obstacles
        if (this.player.isAlive) {
            for (let i = this.obstacles.length - 1; i >= 0; i--) {
                if (this.rectCollide(this.player, this.obstacles[i])) {
                    if (!this.player.invincible) {
                        // Player dies
                        this.playerDie();
                        this.obstacles.splice(i, 1);
                        break;
                    } else {
                        // Invincible - just destroy obstacle
                        this.spawnParticles(
                            this.obstacles[i].x + this.obstacles[i].width / 2,
                            this.obstacles[i].y + this.obstacles[i].height / 2,
                            '#f472b6',
                            10
                        );
                        this.obstacles.splice(i, 1);
                    }
                }
            }
        }
        
        // Partner vs obstacles
        if (this.partner.isAlive) {
            for (let i = this.obstacles.length - 1; i >= 0; i--) {
                if (this.rectCollide(this.partner, this.obstacles[i])) {
                    if (!this.partner.invincible) {
                        // Partner dies
                        this.partnerDie();
                        this.obstacles.splice(i, 1);
                        break;
                    } else {
                        // Invincible - just destroy obstacle
                        this.spawnParticles(
                            this.obstacles[i].x + this.obstacles[i].width / 2,
                            this.obstacles[i].y + this.obstacles[i].height / 2,
                            '#60a5fa',
                            10
                        );
                        this.obstacles.splice(i, 1);
                    }
                }
            }
        }
        
        // Player vs hearts
        if (this.player.isAlive) {
            for (let i = this.hearts.length - 1; i >= 0; i--) {
                if (this.rectCollide(this.player, this.hearts[i])) {
                    this.score += this.HEART_BONUS;
                    this.spawnParticles(this.hearts[i].x + 12, this.hearts[i].y + 12, '#ec4899', 12);
                    this.hearts.splice(i, 1);
                }
            }
        }
        
        // Partner vs hearts
        if (this.partner.isAlive) {
            for (let i = this.hearts.length - 1; i >= 0; i--) {
                if (this.rectCollide(this.partner, this.hearts[i])) {
                    this.partner.score += this.HEART_BONUS;
                    this.spawnParticles(this.hearts[i].x + 12, this.hearts[i].y + 12, '#93c5fd', 10);
                    this.hearts.splice(i, 1);
                }
            }
        }
        
        // Check if both are dead
        if (!this.player.isAlive && !this.partner.isAlive) {
            this.endGame();
        }
    }
    
    playerDie() {
        this.player.isAlive = false;
        this.player.deathAnimation = 0;
        this.spawnDeathParticles(
            this.player.x + this.player.width / 2,
            this.player.y + this.player.height / 2,
            '#f472b6'
        );
        
        // Check if partner is still alive
        if (this.partner.isAlive) {
            this.gameOverMessage = '💔 You Hit an Obstacle!';
            this.gameOverSubMessage = 'Your partner is still running...';
            this.winner = 'partner';
        }
    }
    
    partnerDie() {
        this.partner.isAlive = false;
        this.partner.deathAnimation = 0;
        this.partner.respawnTimer = 120; // Respawn after 2 seconds
        this.spawnDeathParticles(
            this.partner.x + this.partner.width / 2,
            this.partner.y + this.partner.height / 2,
            '#60a5fa'
        );
        
        // Check if player is still alive
        if (this.player.isAlive) {
            this.gameOverMessage = '💙 Partner Hit an Obstacle!';
            this.gameOverSubMessage = 'Your partner will respawn soon...';
            this.winner = 'player';
        }
    }
    
    endGame() {
        if (this.gameState === 'running') {
            this.gameState = 'gameover';
            
            // Determine winner
            if (this.score > this.partner.score) {
                this.gameOverMessage = '🎉 You Win!';
                this.gameOverSubMessage = `Your Score: ${Math.floor(this.score)} vs Partner: ${Math.floor(this.partner.score)}`;
                this.winner = 'player';
            } else if (this.partner.score > this.score) {
                this.gameOverMessage = '💙 Partner Wins!';
                this.gameOverSubMessage = `Partner: ${Math.floor(this.partner.score)} vs Your Score: ${Math.floor(this.score)}`;
                this.winner = 'partner';
            } else {
                this.gameOverMessage = '🤝 It\'s a Tie!';
                this.gameOverSubMessage = `Both scored: ${Math.floor(this.score)}`;
                this.winner = 'tie';
            }
            
            document.getElementById('startBtn').textContent = '💕 Play Again';
        }
    }
    
    rectCollide(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }
    
    updateScoreDisplay() {
        document.getElementById('playerScore').textContent = Math.floor(this.score);
        document.getElementById('aiScore').textContent = Math.floor(this.partner.score);
        document.getElementById('highScore').textContent = this.highScore;
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.W, this.H);
        
        // Draw sky
        const skyGrad = this.ctx.createLinearGradient(0, 0, 0, this.GROUND_Y);
        skyGrad.addColorStop(0, '#0a0a1a');
        skyGrad.addColorStop(0.35, '#1a1a3e');
        skyGrad.addColorStop(0.7, '#4a2d6b');
        skyGrad.addColorStop(0.9, '#e8a87c');
        skyGrad.addColorStop(1, '#f4c4a8');
        this.ctx.fillStyle = skyGrad;
        this.ctx.fillRect(0, 0, this.W, this.GROUND_Y);
        
        // Draw stars
        for (let s of this.stars) {
            const tw = Math.sin(Date.now() * 0.002 + s.phase) * 0.5 + 0.5;
            this.ctx.fillStyle = `rgba(255,255,255,${tw})`;
            this.ctx.beginPath();
            this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Draw heart clouds
        for (let c of this.clouds) {
            this.drawHeartCloud(c);
        }
        
        // Draw ground
        const groundGrad = this.ctx.createLinearGradient(0, this.GROUND_Y, 0, this.H);
        groundGrad.addColorStop(0, '#2d3436');
        groundGrad.addColorStop(0.5, '#1e272e');
        groundGrad.addColorStop(1, '#0f1216');
        this.ctx.fillStyle = groundGrad;
        this.ctx.fillRect(0, this.GROUND_Y, this.W, this.H - this.GROUND_Y);
        
        this.ctx.strokeStyle = '#e8a87c';
        this.ctx.lineWidth = 2.5;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.GROUND_Y);
        this.ctx.lineTo(this.W, this.GROUND_Y);
        this.ctx.stroke();
        
        // Draw ground decor
        for (let d of this.groundDecor) {
            if (d.type === 'flower') {
                this.ctx.font = `${d.size}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.fillText('🌸', d.x, this.GROUND_Y + 12);
            } else {
                this.ctx.strokeStyle = '#5b8c5a';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(d.x, this.GROUND_Y);
                this.ctx.lineTo(d.x - 2, this.GROUND_Y - d.size);
                this.ctx.moveTo(d.x, this.GROUND_Y);
                this.ctx.lineTo(d.x + 3, this.GROUND_Y - d.size * 0.8);
                this.ctx.stroke();
            }
        }
        
        // Draw obstacles
        for (let obs of this.obstacles) {
            if (obs.type === 'cactus') {
                this.ctx.fillStyle = '#4CAF50';
                this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
                this.ctx.fillRect(obs.x - 7, obs.y + 12, 10, 18);
                this.ctx.fillRect(obs.x + obs.width - 3, obs.y + 16, 10, 14);
            } else {
                this.ctx.fillStyle = '#795548';
                this.ctx.beginPath();
                this.ctx.arc(obs.x + obs.width / 2, obs.y + obs.height, obs.width / 2, Math.PI, 0);
                this.ctx.fill();
                this.ctx.fillStyle = '#8d6e63';
                this.ctx.beginPath();
                this.ctx.arc(obs.x + obs.width / 2, obs.y + 4, obs.width * 0.3, Math.PI, 2 * Math.PI);
                this.ctx.fill();
            }
        }
        
        // Draw hearts
        for (let h of this.hearts) {
            const bob = Math.sin(Date.now() * 0.004 + h.phase) * 4;
            this.ctx.font = '24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('💗', h.x + 12, h.y + 12 + bob);
        }
        
        // Draw particles
        for (let p of this.particles) {
            const alpha = p.life / p.maxLife;
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = alpha;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.globalAlpha = 1;
        
        // Draw connection line (only if both alive)
        if (this.player.isAlive && this.partner.isAlive) {
            this.drawConnection();
        }
        
        // Draw dinos
        if (this.player.isAlive || this.player.deathAnimation > 0) {
            this.drawDino(this.player, '🌸');
        }
        
        if (this.partner.isAlive || this.partner.deathAnimation > 0) {
            this.drawDino(this.partner, '🎀');
        }
        
        // Draw invincibility effect
        if (this.player.invincible) {
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(
                this.player.x - 3,
                this.player.y - 3,
                this.player.width + 6,
                this.player.height + 6
            );
        }
        
        if (this.partner.invincible) {
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(
                this.partner.x - 3,
                this.partner.y - 3,
                this.partner.width + 6,
                this.partner.height + 6
            );
        }
        
        // Draw overlays
        if (this.gameState === 'idle') {
            this.drawIdleOverlay();
        } else if (this.gameState === 'paused') {
            this.drawPauseOverlay();
        } else if (this.gameState === 'gameover') {
            this.drawGameOverOverlay();
        }
    }
    
    drawIdleOverlay() {
        this.ctx.fillStyle = 'rgba(0,0,0,0.65)';
        this.ctx.fillRect(0, 0, this.W, this.H);
        this.ctx.fillStyle = '#f9a8d4';
        this.ctx.font = 'bold 40px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('💕 Romantic Dino Run', this.W / 2, 170);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px Arial';
        this.ctx.fillText('Run together with your partner', this.W / 2, 215);
        this.ctx.font = '16px Arial';
        this.ctx.fillText('Press Start or click the canvas', this.W / 2, 250);
    }
    
    drawPauseOverlay() {
        this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
        this.ctx.fillRect(0, 0, this.W, this.H);
        this.ctx.fillStyle = '#fcd34d';
        this.ctx.font = 'bold 42px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('⏸️ Paused', this.W / 2, 200);
    }
    
    drawGameOverOverlay() {
        this.ctx.fillStyle = 'rgba(0,0,0,0.75)';
        this.ctx.fillRect(0, 0, this.W, this.H);
        
        // Winner emoji
        let emoji = '💕';
        if (this.winner === 'player') emoji = '🎉';
        else if (this.winner === 'partner') emoji = '💙';
        else if (this.winner === 'tie') emoji = '🤝';
        
        this.ctx.fillStyle = '#f9a8d4';
        this.ctx.font = 'bold 40px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${emoji} ${this.gameOverMessage}`, this.W / 2, 160);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(this.gameOverSubMessage, this.W / 2, 210);
        
        this.ctx.font = '18px Arial';
        this.ctx.fillStyle = '#fcd34d';
        this.ctx.fillText('Click or Press Space to Play Again', this.W / 2, 250);
    }
    
    drawHeartCloud(c) {
        const x = c.x;
        const y = c.y;
        const s = c.w * 0.35;
        this.ctx.fillStyle = `rgba(255,255,255,${c.opacity})`;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y + s * 0.3);
        this.ctx.bezierCurveTo(x, y, x - s * 0.5, y - s * 0.3, x - s * 0.25, y - s * 0.6);
        this.ctx.bezierCurveTo(x, y - s * 0.9, x + s * 0.5, y - s * 0.7, x + s * 0.25, y - s * 0.3);
        this.ctx.bezierCurveTo(x + s * 0.5, y - s * 0.1, x + s * 0.6, y + s * 0.2, x, y + s * 0.6);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    drawConnection() {
        const x1 = this.player.x + this.player.width / 2;
        const y1 = this.player.y + this.player.height / 2;
        const x2 = this.partner.x + this.partner.width / 2;
        const y2 = this.partner.y + this.partner.height / 2;
        
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(244,114,182,0.45)';
        this.ctx.lineWidth = 2;
        this.ctx.shadowColor = '#ec4899';
        this.ctx.shadowBlur = 12;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
        this.ctx.restore();
        
        for (let i = 0; i < 3; i++) {
            const t = (this.frameCount * 0.02 + i * 0.33) % 1;
            const hx = x1 + (x2 - x1) * t;
            const hy = y1 + (y2 - y1) * t - 10;
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('💗', hx, hy);
        }
    }
    
    drawDino(d, emoji) {
        // Blink effect when invincible
        if (d.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
            this.ctx.globalAlpha = 0.5;
        }
        
        // Body
        this.ctx.fillStyle = d.color;
        this.ctx.fillRect(d.x, d.y, d.width, d.height);
        
        // Belly
        this.ctx.fillStyle = 'rgba(255,255,255,0.25)';
        this.ctx.fillRect(d.x + 10, d.y + 20, d.width - 20, d.height - 25);
        
        // Eye (closed if dead)
        if (d.isAlive) {
            this.ctx.fillStyle = 'white';
            this.ctx.beginPath();
            this.ctx.arc(d.x + d.width - 15, d.y + 14, 7, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.fillStyle = '#1a1a1a';
            this.ctx.beginPath();
            this.ctx.arc(d.x + d.width - 13, d.y + 15, 3.5, 0, Math.PI * 2);
            this.ctx.fill();
        } else {
            // X eyes for dead
            this.ctx.strokeStyle = '#1a1a1a';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(d.x + d.width - 20, d.y + 10);
            this.ctx.lineTo(d.x + d.width - 10, d.y + 20);
            this.ctx.moveTo(d.x + d.width - 10, d.y + 10);
            this.ctx.lineTo(d.x + d.width - 20, d.y + 20);
            this.ctx.stroke();
        }
        
        // Legs
        this.ctx.fillStyle = d.color;
        const lo = d.legFrame === 0 ? 0 : 6;
        this.ctx.fillRect(d.x + 10, d.y + d.height - 4, 10, 18 + lo);
        this.ctx.fillRect(d.x + d.width - 20, d.y + d.height - 4, 10, 18 - lo);
        
        // Tail
        this.ctx.fillStyle = d.color;
        this.ctx.beginPath();
        this.ctx.moveTo(d.x, d.y + 30);
        this.ctx.lineTo(d.x - 16, d.y + 18);
        this.ctx.lineTo(d.x, d.y + 22);
        this.ctx.fill();
        
        // Accessory emoji
        if (d.isAlive) {
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(emoji, d.x + d.width / 2, d.y + d.height / 2 + 6);
        }
        
        this.ctx.globalAlpha = 1;
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new RomanticDinoGame();
});