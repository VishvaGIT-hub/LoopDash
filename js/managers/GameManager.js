/**
 * ============================================
 * GAME MANAGER - Main game controller
 * ============================================
 */

class GameManager {
    constructor() {
        this.state = 'menu'; // menu, playing, paused, gameOver
        this.engine = null;
        this.player = null;
        
        // Game stats
        this.score = 0;
        this.coins = 0;
        this.distance = 0;
        this.gems = 0;
        this.level = 1;
        
        // Systems
        this.proceduralGenerator = null;
        this.particleSystem = null;
        this.comboSystem = null;
        this.missionSystem = null;
        this.achievementSystem = null;
        
        this.init();
    }
    
    init() {
        console.log('🎮 Initializing Game Manager...');
        
        // Create engine
        this.engine = new GameEngine();
        
        // Create systems
        this.proceduralGenerator = new ProceduralGenerator();
        this.particleSystem = new ParticleSystem3D(this.engine.renderer.scene);
        this.comboSystem = new ComboSystem();
        this.missionSystem = new MissionSystem();
        this.achievementSystem = new AchievementSystem();
        
        // Register systems
        this.engine.registerSystem(this.proceduralGenerator);
        this.engine.registerSystem(this.particleSystem);
        this.engine.registerSystem(this.comboSystem);
        
        // Load progress
        this.loadProgress();
        
        console.log('✅ Game Manager Initialized');
    }
    
    startGame() {
        this.state = 'playing';
        this.resetGameStats();
        
        // Create player
        this.player = new Player3D();
        this.engine.addEntity(this.player);
        
        // Create environment
        const environment = new Environment3D(this.engine.renderer.scene);
        
        // Set camera target
        this.engine.cameraController.setTarget(this.player.mesh);
        this.engine.cameraController.setMode('follow');
        
        // Reset systems
        this.proceduralGenerator.reset();
        this.comboSystem.reset();
        
        // Start engine
        this.engine.start();
        
        console.log('▶️ Game Started');
    }
    
    update(deltaTime) {
        if (this.state !== 'playing') return;
        
        // Update score
        this.score += (1 + this.comboSystem.getMultiplier() - 1) * deltaTime * 10;
        this.distance += this.player.speed * deltaTime;
        
        // Update missions
        this.missionSystem.updateProgress('run_distance', this.player.speed * deltaTime);
        
        // Check achievements
        const stats = this.getStats();
        this.achievementSystem.checkAchievements(stats);
        
        // Update UI
        if (window.uiManager) {
            window.uiManager.updateHUD({
                score: this.score,
                coins: this.coins,
                distance: this.distance,
                multiplier: this.comboSystem.getMultiplier()
            });
        }
        
        // Check collisions
        this.checkCollisions();
    }
    
    checkCollisions() {
        const playerBounds = this.player.getBounds();
        
        // Check obstacles
        this.engine.getEntitiesByTag('obstacle').forEach(obstacle => {
            if (obstacle.collidesWith(playerBounds)) {
                this.onObstacleHit(obstacle);
            }
        });
        
        // Check collectibles
        this.engine.getEntitiesByTag('collectible').forEach(collectible => {
            if (!collectible.collected && collectible.collidesWith(playerBounds)) {
                this.onCollectibleCollected(collectible);
            }
        });
        
        // Check powerups
        this.engine.getEntitiesByTag('powerup').forEach(powerup => {
            if (!powerup.collected && powerup.collidesWith(playerBounds)) {
                this.onPowerupCollected(powerup);
            }
        });
    }
    
    onObstacleHit(obstacle) {
        if (this.player.hit()) {
            this.gameOver();
        }
        this.comboSystem.breakCombo();
    }
    
    onCollectibleCollected(collectible) {
        if (collectible.collect()) {
            this.coins += collectible.value;
            this.score += collectible.value;
            this.comboSystem.addCombo();
            
            // Update missions
            this.missionSystem.updateProgress('collect_coins', collectible.value);
            
            // Particle effect
            this.particleSystem.createCoinBurst(collectible.mesh.position);
            
            // Update UI combo
            if (window.uiManager) {
                window.uiManager.updateCombo(this.comboSystem.getCombo());
            }
        }
    }
    
    onPowerupCollected(powerup) {
        const data = powerup.collect();
        if (data) {
            this.player.addPowerup(data.type, data.duration, null);
            this.particleSystem.createPowerupEffect(powerup.mesh.position);
            
            // Update missions
            this.missionSystem.updateProgress('collect_powerups', 1);
        }
    }
    
    gameOver() {
        this.state = 'gameOver';
        this.engine.pause();
        
        // Save stats
        const stats = this.getStats();
        const isNewRecord = this.score > this.getHighScore();
        
        if (isNewRecord) {
            this.saveHighScore(this.score);
        }
        
        this.saveProgress();
        
        // Show game over screen
        if (window.uiManager) {
            window.uiManager.showGameOver({
                ...stats,
                isNewRecord
            });
        }
        
        console.log('💀 Game Over - Score:', Math.floor(this.score));
    }
    
    restartGame() {
        this.engine.clearEntities();
        this.engine.resume();
        this.startGame();
    }
    
    togglePause() {
        if (this.state === 'playing') {
            this.state = 'paused';
            this.engine.pause();
        } else if (this.state === 'paused') {
            this.state = 'playing';
            this.engine.resume();
        }
    }
    
    returnToMenu() {
        this.state = 'menu';
        this.engine.stop();
        this.engine.clearEntities();
    }
    
    addCoins(amount) {
        this.coins += amount;
        this.saveProgress();
    }
    
    spendCoins(amount) {
        if (this.coins >= amount) {
            this.coins -= amount;
            this.saveProgress();
            return true;
        }
        return false;
    }
    
    addGems(amount) {
        this.gems += amount;
        this.saveProgress();
    }
    
    addXP(amount) {
        // Add to season system
    }
    
    getStats() {
        return {
            score: this.score,
            highScore: this.getHighScore(),
            coins: this.coins,
            totalCoins: this.getTotalCoins(),
            distance: this.distance,
            gems: this.gems,
            level: this.level,
            bestCombo: this.comboSystem.getBestCombo()
        };
    }
    
    getHighScore() {
        return parseInt(localStorage.getItem('highScore') || '0');
    }
    
    saveHighScore(score) {
        localStorage.setItem('highScore', Math.floor(score));
    }
    
    getTotalCoins() {
        return parseInt(localStorage.getItem('totalCoins') || '0');
    }
    
    resetGameStats() {
        this.score = 0;
        this.coins = 0;
        this.distance = 0;
    }
    
    saveProgress() {
        const totalCoins = this.getTotalCoins() + this.coins;
        localStorage.setItem('totalCoins', totalCoins);
        localStorage.setItem('gems', this.gems);
        localStorage.setItem('level', this.level);
    }
    
    loadProgress() {
        this.coins = 0;
        this.gems = parseInt(localStorage.getItem('gems') || '0');
        this.level = parseInt(localStorage.getItem('level') || '1');
    }
}
