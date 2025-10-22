/**
 * ============================================
 * ACHIEVEMENT SYSTEM - Achievement tracking
 * ============================================
 */

class AchievementSystem {
    constructor() {
        this.enabled = true;
        this.achievements = this.createAchievements();
        this.unlockedAchievements = new Set();
        
        this.loadProgress();
        
        console.log('✅ AchievementSystem Initialized');
    }
    
    createAchievements() {
        return [
            {
                id: 'first_run',
                name: 'First Steps',
                description: 'Complete your first run',
                icon: '🏃',
                reward: { coins: 50 },
                condition: (stats) => stats.totalRuns >= 1
            },
            {
                id: 'score_1000',
                name: 'Novice Runner',
                description: 'Score 1,000 points',
                icon: '🌟',
                reward: { coins: 100 },
                condition: (stats) => stats.highScore >= 1000
            },
            {
                id: 'score_10000',
                name: 'Expert Runner',
                description: 'Score 10,000 points',
                icon: '⭐',
                reward: { coins: 500 },
                condition: (stats) => stats.highScore >= 10000
            },
            {
                id: 'coins_1000',
                name: 'Coin Collector',
                description: 'Collect 1,000 total coins',
                icon: '💰',
                reward: { coins: 200 },
                condition: (stats) => stats.totalCoins >= 1000
            },
            {
                id: 'distance_10k',
                name: 'Long Distance',
                description: 'Run 10,000 meters total',
                icon: '📏',
                reward: { coins: 300 },
                condition: (stats) => stats.totalDistance >= 10000
            },
            {
                id: 'combo_50',
                name: 'Combo King',
                description: 'Achieve a 50 combo',
                icon: '🔥',
                reward: { coins: 500 },
                condition: (stats) => stats.bestCombo >= 50
            }
        ];
    }
    
    checkAchievements(stats) {
        let newUnlocks = [];
        
        this.achievements.forEach(achievement => {
            if (!this.unlockedAchievements.has(achievement.id)) {
                if (achievement.condition(stats)) {
                    this.unlockAchievement(achievement);
                    newUnlocks.push(achievement);
                }
            }
        });
        
        return newUnlocks;
    }
    
    unlockAchievement(achievement) {
        this.unlockedAchievements.add(achievement.id);
        
        console.log(`🏆 Achievement unlocked: ${achievement.name}`);
        
        // Award rewards
        if (window.gameManager && achievement.reward) {
            if (achievement.reward.coins) {
                window.gameManager.addCoins(achievement.reward.coins);
            }
        }
        
        // Show notification
        if (window.uiManager) {
            window.uiManager.showAchievement(achievement);
        }
        
        this.saveProgress();
    }
    
    getAchievements() {
        return this.achievements.map(a => ({
            ...a,
            unlocked: this.unlockedAchievements.has(a.id)
        }));
    }
    
    getUnlockedCount() {
        return this.unlockedAchievements.size;
    }
    
    getTotalCount() {
        return this.achievements.length;
    }
    
    getProgress() {
        return {
            unlocked: this.unlockedAchievements.size,
            total: this.achievements.length,
            percentage: (this.unlockedAchievements.size / this.achievements.length) * 100
        };
    }
    
    saveProgress() {
        localStorage.setItem('achievements', 
            JSON.stringify(Array.from(this.unlockedAchievements)));
    }
    
    loadProgress() {
        const saved = localStorage.getItem('achievements');
        if (saved) {
            this.unlockedAchievements = new Set(JSON.parse(saved));
        }
    }
    
    reset() {
        this.unlockedAchievements.clear();
        this.saveProgress();
    }
}
