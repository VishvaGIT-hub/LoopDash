/**
 * ============================================
 * UI MANAGER - User interface controller
 * ============================================
 */

class UIManager {
    constructor() {
        this.screens = new Map();
        this.currentScreen = 'mainMenu';
        this.notifications = [];
        
        this.initScreens();
        this.initButtons();
        
        console.log('✅ UIManager Initialized');
    }
    
    initScreens() {
        this.screens.set('loader', document.getElementById('loader'));
        this.screens.set('mainMenu', document.getElementById('mainMenu'));
        this.screens.set('gameScreen', document.getElementById('gameScreen'));
        this.screens.set('gameOverModal', document.getElementById('gameOverModal'));
    }
    
    initButtons() {
        // Play button
        const playBtn = document.getElementById('playBtn');
        if (playBtn) {
            playBtn.addEventListener('click', () => {
                this.hideScreen('mainMenu');
                this.showScreen('gameScreen');
                if (window.gameManager) {
                    window.gameManager.startGame();
                }
            });
        }
        
        // Play again
        const playAgainBtn = document.getElementById('playAgainBtn');
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => {
                this.hideScreen('gameOverModal');
                if (window.gameManager) {
                    window.gameManager.restartGame();
                }
            });
        }
        
        // Home button
        const homeBtn = document.getElementById('homeBtn');
        if (homeBtn) {
            homeBtn.addEventListener('click', () => {
                this.hideScreen('gameOverModal');
                this.hideScreen('gameScreen');
                this.showScreen('mainMenu');
                if (window.gameManager) {
                    window.gameManager.returnToMenu();
                }
            });
        }
        
        // Pause button
        const pauseBtn = document.getElementById('pauseBtn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                if (window.gameManager) {
                    window.gameManager.togglePause();
                }
            });
        }
    }
    
    showScreen(screenId) {
        const screen = this.screens.get(screenId);
        if (screen) {
            screen.classList.add('active');
            screen.style.display = 'flex';
            this.currentScreen = screenId;
        }
    }
    
    hideScreen(screenId) {
        const screen = this.screens.get(screenId);
        if (screen) {
            screen.classList.remove('active');
            screen.style.display = 'none';
        }
    }
    
    updateHUD(data) {
        // Update score
        const scoreElement = document.getElementById('scoreValue');
        if (scoreElement) {
            scoreElement.textContent = Math.floor(data.score || 0);
        }
        
        // Update coins
        const coinsElement = document.getElementById('coinsValue');
        if (coinsElement) {
            coinsElement.textContent = data.coins || 0;
        }
        
        // Update distance
        const distanceElement = document.getElementById('distanceValue');
        if (distanceElement) {
            distanceElement.textContent = Math.floor(data.distance || 0);
        }
        
        // Update multiplier
        const multiplierElement = document.getElementById('multiplier');
        if (multiplierElement) {
            multiplierElement.textContent = `×${data.multiplier || 1}`;
        }
    }
    
    updateCombo(combo) {
        const comboDisplay = document.getElementById('comboDisplay');
        const comboNumber = document.getElementById('comboNumber');
        
        if (comboDisplay && comboNumber) {
            if (combo > 2) {
                comboDisplay.classList.remove('hidden');
                comboNumber.textContent = combo;
                
                setTimeout(() => {
                    comboDisplay.classList.add('hidden');
                }, 2000);
            }
        }
    }
    
    showGameOver(stats) {
        const modal = document.getElementById('gameOverModal');
        if (!modal) return;
        
        // Update stats
        document.getElementById('finalScore').textContent = Math.floor(stats.score);
        document.getElementById('finalCoins').textContent = stats.coins;
        document.getElementById('finalDistance').textContent = Math.floor(stats.distance) + 'm';
        
        // Check new record
        const newRecord = document.getElementById('newRecord');
        if (stats.isNewRecord && newRecord) {
            newRecord.classList.remove('hidden');
        } else if (newRecord) {
            newRecord.classList.add('hidden');
        }
        
        // Show modal
        modal.classList.add('active');
        modal.style.display = 'flex';
    }
    
    showNotification(options) {
        const container = document.getElementById('notificationContainer');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = 'toast';
        notification.innerHTML = `
            <div class="toast-header">
                <span class="toast-title">${options.title}</span>
                <button class="toast-close">×</button>
            </div>
            <div class="toast-body">${options.message}</div>
        `;
        
        container.appendChild(notification);
        
        // Auto remove
        setTimeout(() => {
            notification.classList.add('toast-exit');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
        
        // Close button
        notification.querySelector('.toast-close').addEventListener('click', () => {
            notification.classList.add('toast-exit');
            setTimeout(() => notification.remove(), 300);
        });
    }
    
    showAchievement(achievement) {
        const popup = document.getElementById('achievementPopup');
        if (!popup) return;
        
        popup.querySelector('#achievementIcon').textContent = achievement.icon;
        popup.querySelector('#achievementName').textContent = achievement.name;
        popup.querySelector('#achievementDesc').textContent = achievement.description;
        popup.querySelector('#achievementReward').textContent = `+${achievement.reward.coins}`;
        
        popup.classList.remove('hidden');
        popup.classList.add('animate-bounce-in');
        
        setTimeout(() => {
            popup.classList.add('hidden');
            popup.classList.remove('animate-bounce-in');
        }, 4000);
    }
    
    updateMenuStats(stats) {
        document.getElementById('highScore').textContent = Math.floor(stats.highScore || 0);
        document.getElementById('coinsAmount').textContent = stats.totalCoins || 0;
        document.getElementById('gemsAmount').textContent = stats.gems || 0;
        document.getElementById('playerLevel').textContent = stats.level || 1;
    }
}
