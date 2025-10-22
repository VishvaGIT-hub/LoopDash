/**
 * ============================================
 * COMBO SYSTEM - Combo tracking and bonuses
 * ============================================
 */

class ComboSystem {
    constructor() {
        this.enabled = true;
        this.combo = 0;
        this.bestCombo = 0;
        this.multiplier = 1;
        this.comboTimer = 0;
        this.comboTimeout = 3; // seconds
        
        // Thresholds for combo levels
        this.levels = [
            { min: 0, name: 'None', multiplier: 1, color: '#ffffff' },
            { min: 5, name: 'Good', multiplier: 1.5, color: '#00f2fe' },
            { min: 10, name: 'Great', multiplier: 2, color: '#f093fb' },
            { min: 20, name: 'Amazing', multiplier: 2.5, color: '#ffd700' },
            { min: 30, name: 'Incredible', multiplier: 3, color: '#ff6b6b' }
        ];
        
        console.log('✅ ComboSystem Initialized');
    }
    
    update(deltaTime) {
        if (!this.enabled || this.combo === 0) return;
        
        this.comboTimer += deltaTime;
        
        if (this.comboTimer >= this.comboTimeout) {
            this.breakCombo();
        }
    }
    
    addCombo(amount = 1) {
        this.combo += amount;
        this.comboTimer = 0;
        
        if (this.combo > this.bestCombo) {
            this.bestCombo = this.combo;
        }
        
        this.updateMultiplier();
        
        return this.combo;
    }
    
    updateMultiplier() {
        for (let i = this.levels.length - 1; i >= 0; i--) {
            if (this.combo >= this.levels[i].min) {
                this.multiplier = this.levels[i].multiplier;
                break;
            }
        }
    }
    
    breakCombo() {
        if (this.combo > 0) {
            console.log(`💥 Combo broken at ${this.combo}`);
        }
        
        this.combo = 0;
        this.multiplier = 1;
        this.comboTimer = 0;
    }
    
    getCombo() {
        return this.combo;
    }
    
    getMultiplier() {
        return this.multiplier;
    }
    
    getBestCombo() {
        return this.bestCombo;
    }
    
    getLevel() {
        for (let i = this.levels.length - 1; i >= 0; i--) {
            if (this.combo >= this.levels[i].min) {
                return this.levels[i];
            }
        }
        return this.levels[0];
    }
    
    reset() {
        this.combo = 0;
        this.multiplier = 1;
        this.comboTimer = 0;
    }
    
    resetBest() {
        this.bestCombo = 0;
    }
}
