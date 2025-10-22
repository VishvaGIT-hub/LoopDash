/**
 * ============================================
 * DIFFICULTY AI - Adaptive difficulty system
 * ============================================
 */

class DifficultyAI {
    constructor() {
        this.enabled = true;
        this.currentLevel = 1;
        this.maxLevel = 10;
        
        // Player performance tracking
        this.performance = {
            deaths: 0,
            perfectRuns: 0,
            averageScore: 0,
            averageDistance: 0,
            comboCount: 0
        };
        
        // Difficulty parameters
        this.params = {
            obstacleFrequency: 1,
            obstacleSpeed: 1,
            powerupFrequency: 1,
            coinValue: 1
        };
        
        this.updateInterval = 30; // seconds
        this.updateTimer = 0;
        
        console.log('✅ DifficultyAI Initialized');
    }
    
    update(deltaTime, gameStats) {
        if (!this.enabled) return;
        
        this.updateTimer += deltaTime;
        
        if (this.updateTimer >= this.updateInterval) {
            this.adjustDifficulty(gameStats);
            this.updateTimer = 0;
        }
    }
    
    adjustDifficulty(gameStats) {
        // Calculate performance score
        const performanceScore = this.calculatePerformance(gameStats);
        
        // Adjust difficulty based on performance
        if (performanceScore > 0.8) {
            this.increaseDifficulty();
        } else if (performanceScore < 0.3) {
            this.decreaseDifficulty();
        }
        
        console.log(`🎯 Difficulty adjusted: Level ${this.currentLevel}, Performance: ${(performanceScore * 100).toFixed(0)}%`);
    }
    
    calculatePerformance(gameStats) {
        let score = 0;
        
        // Factor in deaths (fewer is better)
        const deathPenalty = Math.max(0, 1 - (this.performance.deaths / 10));
        score += deathPenalty * 0.3;
        
        // Factor in score
        if (gameStats.score > this.performance.averageScore) {
            score += 0.3;
        }
        
        // Factor in combos
        if (gameStats.bestCombo > 5) {
            score += 0.2;
        }
        
        // Factor in distance
        if (gameStats.distance > this.performance.averageDistance) {
            score += 0.2;
        }
        
        return Math.min(score, 1);
    }
    
    increaseDifficulty() {
        if (this.currentLevel >= this.maxLevel) return;
        
        this.currentLevel++;
        this.updateParameters();
        
        console.log('⬆️ Difficulty increased');
    }
    
    decreaseDifficulty() {
        if (this.currentLevel <= 1) return;
        
        this.currentLevel--;
        this.updateParameters();
        
        console.log('⬇️ Difficulty decreased');
    }
    
    updateParameters() {
        const level = this.currentLevel;
        
        this.params.obstacleFrequency = 1 + (level * 0.15);
        this.params.obstacleSpeed = 1 + (level * 0.1);
        this.params.powerupFrequency = Math.max(0.5, 1 - (level * 0.05));
        this.params.coinValue = 1;
    }
    
    recordDeath() {
        this.performance.deaths++;
    }
    
    recordRun(stats) {
        // Update averages
        const totalRuns = this.performance.deaths + this.performance.perfectRuns;
        
        this.performance.averageScore = 
            (this.performance.averageScore * totalRuns + stats.score) / (totalRuns + 1);
        
        this.performance.averageDistance = 
            (this.performance.averageDistance * totalRuns + stats.distance) / (totalRuns + 1);
        
        if (stats.bestCombo > this.performance.comboCount) {
            this.performance.comboCount = stats.bestCombo;
        }
    }
    
    getParameters() {
        return this.params;
    }
    
    getDifficulty() {
        return this.currentLevel;
    }
    
    setDifficulty(level) {
        this.currentLevel = Math.max(1, Math.min(level, this.maxLevel));
        this.updateParameters();
    }
    
    reset() {
        this.currentLevel = 1;
        this.updateTimer = 0;
        this.updateParameters();
    }
}
