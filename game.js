// ===================================
// LOOP DASH - Complete Game Logic
// ===================================

// Game Configuration
const CONFIG = {
    width: 1920,
    height: 1080,
    gravity: 1.2,
    playerSpeed: 8,
    obstacleSpeed: 10,
    fps: 60
};

// Game State
let gameState = {
    playing: false,
    score: 0,
    coins: 0,
    highScore: localStorage.getItem('highScore') || 0,
    totalCoins: parseInt(localStorage.getItem('totalCoins')) || 0,
    currentEnvironment: 0,
    environmentTimer: 0,
    selectedCharacter: localStorage.getItem('selectedCharacter') || 'default',
    unlockedCharacters: JSON.parse(localStorage.getItem('unlockedCharacters')) || ['default'],
    activePowerup: null,
    powerupTimer: 0
};

// Environments
const ENVIRONMENTS = [
    { name: '☀️ Day', colors: ['#87CEEB', '#87CEEB', '#90EE90'], particles: [] },
    { name: '🌙 Night', colors: ['#191970', '#000080', '#2F4F4F'], particles: ['star'] },
    { name: '🌧️ Rain', colors: ['#708090', '#778899', '#696969'], particles: ['rain'] },
    { name: '❄️ Snow', colors: ['#B0E0E6', '#ADD8E6', '#F0F8FF'], particles: ['snow'] },
    { name: '🌌 Space', colors: ['#0a0a2e', '#16213e', '#1a1a3e'], particles: ['star', 'planet'] }
];

// Characters
const CHARACTERS = [
    { id: 'default', name: '🏃 Runner', emoji: '🏃', price: 0, color: '#4facfe' },
    { id: 'cap', name: '🧢 Cap Boy', emoji: '🧢', price: 100, color: '#f093fb' },
    { id: 'hoodie', name: '👧 Hoodie Girl', emoji: '👧', price: 200, color: '#feca57' },
    { id: 'super', name: '🦸 Super Runner', emoji: '🦸', price: 500, color: '#ee5a6f' },
    { id: 'alien', name: '👽 Alien', emoji: '👽', price: 1000, color: '#1dd1a1' }
];

// Power-ups
const POWERUPS = [
    { id: 'magnet', emoji: '🧲', name: 'Magnet', duration: 5000, color: '#e74c3c' },
    { id: 'shield', emoji: '🛡️', name: 'Shield', duration: 0, color: '#3498db' },
    { id: 'double', emoji: '💎', name: '2x Coins', duration: 10000, color: '#f39c12' },
    { id: 'boost', emoji: '⚡', name: 'Boost', duration: 3000, color: '#9b59b6' }
];

// Canvas and Context
let canvas, ctx;
let particles = [];
let obstacles = [];
let coins = [];
let powerups = [];
let player;

// Player Class
class Player {
    constructor() {
        this.width = 60;
        this.height = 80;
        this.x = 200;
        this.y = CONFIG.height - 200;
        this.velocityY = 0;
        this.jumping = false;
        this.sliding = false;
        this.slideTimer = 0;
        this.character = CHARACTERS.find(c => c.id === gameState.selectedCharacter);
        this.trail = [];
        this.shielded = false;
    }

    jump() {
        if (!this.jumping && !this.sliding) {
            this.velocityY = -22;
            this.jumping = true;
            playSound('jump');
        }
    }

    slide() {
        if (!this.jumping && !this.sliding) {
            this.sliding = true;
            this.slideTimer = 30;
            playSound('slide');
        }
    }

    update() {
        // Gravity
        this.velocityY += CONFIG.gravity;
        this.y += this.velocityY;

        // Ground collision
        const groundY = CONFIG.height - 200;
        if (this.y >= groundY) {
            this.y = groundY;
            this.velocityY = 0;
            this.jumping = false;
        }

        // Sliding
        if (this.sliding) {
            this.slideTimer--;
            if (this.slideTimer <= 0) {
                this.sliding = false;
            }
        }

        // Trail effect
        this.trail.push({ x: this.x, y: this.y, alpha: 1 });
        if (this.trail.length > 10) this.trail.shift();
        this.trail.forEach(t => t.alpha -= 0.1);
    }

    draw() {
        // Draw trail
        this.trail.forEach(t => {
            if (t.alpha > 0) {
                ctx.globalAlpha = t.alpha * 0.5;
                ctx.fillStyle = this.character.color;
                ctx.fillRect(t.x, t.y, this.width, this.getHeight());
            }
        });
        ctx.globalAlpha = 1;

        // Draw shield
        if (this.shielded) {
            ctx.strokeStyle = '#3498db';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, this.y + this.getHeight()/2, 50, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Draw player
        ctx.fillStyle = this.character.color;
        ctx.fillRect(this.x, this.y, this.width, this.getHeight());
        
        // Draw character emoji
        ctx.font = '40px Arial';
        ctx.fillText(this.character.emoji, this.x + 10, this.y + 40);
    }

    getHeight() {
        return this.sliding ? this.height / 2 : this.height;
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.getHeight()
        };
    }
}

// Obstacle Class
class Obstacle {
    constructor(type) {
        this.type = type; // 'low', 'high', 'gap'
        this.x = CONFIG.width;
        this.width = 60;
        this.height = type === 'high' ? 100 : 60;
        this.y = type === 'high' ? CONFIG.height - 200 - this.height : CONFIG.height - 200 - this.height;
        this.passed = false;
    }

    update() {
        this.x -= CONFIG.obstacleSpeed;
        
        // Check if passed
        if (!this.passed && this.x + this.width < player.x) {
            this.passed = true;
            gameState.score += 5;
            playSound('pass');
        }
    }

    draw() {
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Add danger pattern
        ctx.fillStyle = '#e74c3c';
        for (let i = 0; i < this.width; i += 20) {
            ctx.fillRect(this.x + i, this.y, 10, this.height);
        }
    }

    isOffScreen() {
        return this.x + this.width < 0;
    }

    collidesWith(playerBounds) {
        return !(playerBounds.x + playerBounds.width < this.x ||
                playerBounds.x > this.x + this.width ||
                playerBounds.y + playerBounds.height < this.y ||
                playerBounds.y > this.y + this.height);
    }
}

// Coin Class
class Coin {
    constructor(x, y, pattern = 'single') {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.collected = false;
        this.value = gameState.activePowerup === 'double' ? 20 : 10;
        this.rotation = 0;
    }

    update() {
        this.x -= CONFIG.obstacleSpeed;
        this.rotation += 0.1;

        // Magnet effect
        if (gameState.activePowerup === 'magnet') {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 200) {
                this.x += dx * 0.1;
                this.y += dy * 0.1;
            }
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        ctx.rotate(this.rotation);
        ctx.font = '30px Arial';
        ctx.fillText('💰', -15, 10);
        ctx.restore();
    }

    isOffScreen() {
        return this.x + this.width < 0;
    }

    collidesWith(playerBounds) {
        return !(playerBounds.x + playerBounds.width < this.x ||
                playerBounds.x > this.x + this.width ||
                playerBounds.y + playerBounds.height < this.y ||
                playerBounds.y > this.y + this.height);
    }
}

// Powerup Class
class Powerup {
    constructor(type) {
        this.type = type;
        this.data = POWERUPS.find(p => p.id === type);
        this.x = CONFIG.width;
        this.y = CONFIG.height - 300 - Math.random() * 100;
        this.width = 40;
        this.height = 40;
        this.collected = false;
        this.float = 0;
    }

    update() {
        this.x -= CONFIG.obstacleSpeed;
        this.float += 0.1;
    }

    draw() {
        const offsetY = Math.sin(this.float) * 10;
        ctx.font = '40px Arial';
        ctx.fillText(this.data.emoji, this.x, this.y + offsetY);
        
        // Glow effect
        ctx.strokeStyle = this.data.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x + 20, this.y + offsetY - 10, 25, 0, Math.PI * 2);
        ctx.stroke();
    }

    isOffScreen() {
        return this.x + this.width < 0;
    }

    collidesWith(playerBounds) {
        return !(playerBounds.x + playerBounds.width < this.x ||
                playerBounds.x > this.x + this.width ||
                playerBounds.y + playerBounds.height < this.y ||
                playerBounds.y > this.y + this.height);
    }
}
// Particle System
class Particle {
    constructor(type) {
        this.type = type;
        this.x = Math.random() * CONFIG.width;
        this.y = type === 'rain' ? -10 : Math.random() * CONFIG.height;
        this.speed = type === 'rain' ? 15 : 2;
        this.size = Math.random() * 3 + 1;
    }

    update() {
        if (this.type === 'rain') {
            this.y += this.speed;
            if (this.y > CONFIG.height) this.y = -10;
        } else if (this.type === 'snow') {
            this.y += this.speed;
            this.x += Math.sin(this.y * 0.01) * 0.5;
            if (this.y > CONFIG.height) this.y = -10;
        } else if (this.type === 'star') {
            this.twinkle = Math.sin(Date.now() * 0.001 + this.x) * 0.5 + 0.5;
        }
    }

    draw() {
        if (this.type === 'star') {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.twinkle})`;
            ctx.fillRect(this.x, this.y, this.size, this.size);
        } else if (this.type === 'rain') {
            ctx.strokeStyle = 'rgba(174, 194, 224, 0.5)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x, this.y + 10);
            ctx.stroke();
        } else if (this.type === 'snow') {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// Sound Effects (Web Audio API)
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch(type) {
        case 'jump':
            oscillator.frequency.value = 400;
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
            break;
        case 'coin':
            oscillator.frequency.value = 800;
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
            break;
        case 'powerup':
            oscillator.frequency.value = 600;
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
            break;
        case 'crash':
            oscillator.type = 'sawtooth';
            oscillator.frequency.value = 100;
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
            break;
        case 'pass':
            oscillator.frequency.value = 300;
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.05);
            break;
        case 'slide':
            oscillator.frequency.value = 200;
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.15);
            break;
    }
}

// Initialize Game
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Set canvas size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Load saved data
    updateUI();
    createCharacterShop();
    
    // Input handlers
    document.addEventListener('keydown', handleKeyDown);
    document.getElementById('jumpBtn').addEventListener('click', () => player && player.jump());
    document.getElementById('slideBtn').addEventListener('click', () => player && player.slide());
    
    // Touch controls
    let touchStartY = 0;
    canvas.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    });
    
    canvas.addEventListener('touchend', (e) => {
        const touchEndY = e.changedTouches[0].clientY;
        const diff = touchStartY - touchEndY;
        
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                player && player.jump();
            } else {
                player && player.slide();
            }
        }
    });
}

function resizeCanvas() {
    const container = document.getElementById('gameScreen');
    const aspectRatio = CONFIG.width / CONFIG.height;
    
    let width = window.innerWidth;
    let height = width / aspectRatio;
    
    if (height > window.innerHeight - 100) {
        height = window.innerHeight - 100;
        width = height * aspectRatio;
    }
    
    canvas.width = CONFIG.width;
    canvas.height = CONFIG.height;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
}

function handleKeyDown(e) {
    if (!player) return;
    
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        player.jump();
    } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        player.slide();
    }
}

// Game Loop
function startGame() {
    // Reset game state
    gameState.playing = true;
    gameState.score = 0;
    gameState.coins = 0;
    gameState.currentEnvironment = 0;
    gameState.environmentTimer = 0;
    gameState.activePowerup = null;
    gameState.powerupTimer = 0;
    
    // Clear arrays
    obstacles = [];
    coins = [];
    powerups = [];
    particles = [];
    
    // Create player
    player = new Player();
    
    // Show game screen
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('shopMenu').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    
    // Start game loop
    gameLoop();
}

let lastTime = 0;
let obstacleTimer = 0;
let coinTimer = 0;
let powerupTimer = 0;

function gameLoop(timestamp = 0) {
    if (!gameState.playing) return;
    
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    // Clear canvas
    ctx.clearRect(0, 0, CONFIG.width, CONFIG.height);
    
    // Draw environment
    drawEnvironment();
    
    // Update environment timer (30 seconds)
    gameState.environmentTimer += deltaTime;
    if (gameState.environmentTimer > 30000) {
        gameState.currentEnvironment = (gameState.currentEnvironment + 1) % ENVIRONMENTS.length;
        gameState.environmentTimer = 0;
        createParticles();
        updateEnvironmentLabel();
    }
    
    // Update and draw particles
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    
    // Spawn obstacles
    obstacleTimer += deltaTime;
    if (obstacleTimer > 2000) {
        const type = Math.random() > 0.5 ? 'low' : 'high';
        obstacles.push(new Obstacle(type));
        obstacleTimer = 0;
    }
    
    // Spawn coins
    coinTimer += deltaTime;
    if (coinTimer > 1500) {
        const y = CONFIG.height - 250 - Math.random() * 150;
        coins.push(new Coin(CONFIG.width, y));
        coinTimer = 0;
    }
    
    // Spawn powerups
    powerupTimer += deltaTime;
    if (powerupTimer > 15000 && Math.random() > 0.7) {
        const types = ['magnet', 'shield', 'double', 'boost'];
        const type = types[Math.floor(Math.random() * types.length)];
        powerups.push(new Powerup(type));
        powerupTimer = 0;
    }
    
    // Update player
    player.update();
    
    // Update obstacles
    obstacles = obstacles.filter(o => !o.isOffScreen());
    obstacles.forEach(obstacle => {
        obstacle.update();
        obstacle.draw();
        
        // Collision detection
        if (obstacle.collidesWith(player.getBounds())) {
            if (player.shielded) {
                player.shielded = false;
                obstacles = obstacles.filter(o => o !== obstacle);
                playSound('powerup');
            } else {
                gameOver();
            }
        }
    });
    
    // Update coins
    coins = coins.filter(c => !c.isOffScreen() && !c.collected);
    coins.forEach(coin => {
        coin.update();
        coin.draw();
        
        if (coin.collidesWith(player.getBounds()) && !coin.collected) {
            coin.collected = true;
            gameState.coins += coin.value;
            gameState.score += coin.value;
            playSound('coin');
            coins = coins.filter(c => c !== coin);
        }
    });
    
    // Update powerups
    powerups = powerups.filter(p => !p.isOffScreen() && !p.collected);
    powerups.forEach(powerup => {
        powerup.update();
        powerup.draw();
        
        if (powerup.collidesWith(player.getBounds()) && !powerup.collected) {
            powerup.collected = true;
            activatePowerup(powerup.type);
            gameState.score += 20;
            playSound('powerup');
            powerups = powerups.filter(p => p !== powerup);
        }
    });
    
    // Update active powerup
    if (gameState.activePowerup) {
        const powerupData = POWERUPS.find(p => p.id === gameState.activePowerup);
        gameState.powerupTimer += deltaTime;
        
        if (powerupData.duration > 0 && gameState.powerupTimer >= powerupData.duration) {
            deactivatePowerup();
        }
    }
    
    // Draw player
    player.draw();
    
    // Draw ground
    ctx.fillStyle = '#34495e';
    ctx.fillRect(0, CONFIG.height - 150, CONFIG.width, 150);
    
    // Update score (time based)
    gameState.score += 0.1;
    
    // Update UI
    document.getElementById('currentScore').textContent = Math.floor(gameState.score);
    document.getElementById('runCoins').textContent = gameState.coins;
    
    requestAnimationFrame(gameLoop);
}

function drawEnvironment() {
    const env = ENVIRONMENTS[gameState.currentEnvironment];
    const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.height);
    gradient.addColorStop(0, env.colors[0]);
    gradient.addColorStop(0.5, env.colors[1]);
    gradient.addColorStop(1, env.colors[2]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
}

function createParticles() {
    particles = [];
    const env = ENVIRONMENTS[gameState.currentEnvironment];
    
    env.particles.forEach(type => {
        for (let i = 0; i < 50; i++) {
            particles.push(new Particle(type));
        }
    });
}

function updateEnvironmentLabel() {
    const env = ENVIRONMENTS[gameState.currentEnvironment];
    document.getElementById('environmentLabel').textContent = env.name;
}

function activatePowerup(type) {
    gameState.activePowerup = type;
    gameState.powerupTimer = 0;
    
    const powerupData = POWERUPS.find(p => p.id === type);
    const indicator = document.getElementById('powerupIndicator');
    indicator.textContent = `${powerupData.emoji} ${powerupData.name} Active!`;
    indicator.style.display = 'block';
    indicator.style.background = `rgba(${hexToRgb(powerupData.color)}, 0.9)`;
    
    if (type === 'shield') {
        player.shielded = true;
    } else if (type === 'boost') {
        CONFIG.obstacleSpeed = 15;
    }
}

function deactivatePowerup() {
    if (gameState.activePowerup === 'boost') {
        CONFIG.obstacleSpeed = 10;
    }
    
    gameState.activePowerup = null;
    document.getElementById('powerupIndicator').style.display = 'none';
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
        `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
        '255, 255, 255';
}

function gameOver() {
    gameState.playing = false;
    playSound('crash');
    
    // Add coins to total
    gameState.totalCoins += gameState.coins;
    localStorage.setItem('totalCoins', gameState.totalCoins);
    
    // Check high score
    const isNewHighScore = Math.floor(gameState.score) > gameState.highScore;
    if (isNewHighScore) {
        gameState.highScore = Math.floor(gameState.score);
        localStorage.setItem('highScore', gameState.highScore);
        document.getElementById('newHighScore').style.display = 'block';
    } else {
        document.getElementById('newHighScore').style.display = 'none';
    }
    
    // Show game over screen
    document.getElementById('finalScore').textContent = Math.floor(gameState.score);
    document.getElementById('finalCoins').textContent = gameState.coins;
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'block';
    
    updateUI();
}

function showMainMenu() {
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('shopMenu').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'none';
    document.getElementById('mainMenu').style.display = 'block';
    updateUI();
}

function showShop() {
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('shopMenu').style.display = 'block';
    createCharacterShop();
}

function createCharacterShop() {
    const container = document.getElementById('characterList');
    container.innerHTML = '';
    
    CHARACTERS.forEach(char => {
        const card = document.createElement('div');
        card.className = 'character-card';
        
        const isUnlocked = gameState.unlockedCharacters.includes(char.id);
        const isSelected = gameState.selectedCharacter === char.id;
        
        if (!isUnlocked) card.classList.add('locked');
        if (isSelected) card.classList.add('selected');
        
        card.innerHTML = `
            <div class="character-emoji">${char.emoji}</div>
            <div class="character-name">${char.name}</div>
            <div class="character-price">
                ${isUnlocked ? (isSelected ? '✅ Selected' : '👆 Select') : `💰 ${char.price}`}
            </div>
        `;
        
        card.addEventListener('click', () => {
            if (isUnlocked) {
                gameState.selectedCharacter = char.id;
                localStorage.setItem('selectedCharacter', char.id);
                createCharacterShop();
            } else {
                if (gameState.totalCoins >= char.price) {
                    gameState.totalCoins -= char.price;
                    gameState.unlockedCharacters.push(char.id);
                    localStorage.setItem('totalCoins', gameState.totalCoins);
                    localStorage.setItem('unlockedCharacters', JSON.stringify(gameState.unlockedCharacters));
                    playSound('powerup');
                    createCharacterShop();
                    updateUI();
                } else {
                    alert(`You need ${char.price - gameState.totalCoins} more coins!`);
                }
            }
        });
        
        container.appendChild(card);
    });
}

function updateUI() {
    document.getElementById('totalCoins').textContent = gameState.totalCoins;
    document.getElementById('highScore').textContent = gameState.highScore;
}

// Initialize on load
window.addEventListener('load', init);
