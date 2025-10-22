/**
 * ============================================
 * ACCESSORY SYSTEM - Character accessories
 * ============================================
 */

class AccessorySystem {
    constructor() {
        this.accessories = this.createAccessories();
        this.equipped = new Set();
        this.unlocked = new Set();
        
        this.loadProgress();
        
        console.log('✅ AccessorySystem Initialized');
    }
    
    createAccessories() {
        return {
            hat_cap: {
                id: 'hat_cap',
                name: 'Baseball Cap',
                type: 'hat',
                price: 100,
                emoji: '🧢'
            },
            hat_crown: {
                id: 'hat_crown',
                name: 'Crown',
                type: 'hat',
                price: 500,
                emoji: '👑'
            },
            glasses_sun: {
                id: 'glasses_sun',
                name: 'Sunglasses',
                type: 'glasses',
                price: 150,
                emoji: '🕶️'
            },
            trail_fire: {
                id: 'trail_fire',
                name: 'Fire Trail',
                type: 'trail',
                price: 300,
                color: 0xff6b6b
            },
            trail_rainbow: {
                id: 'trail_rainbow',
                name: 'Rainbow Trail',
                type: 'trail',
                price: 500,
                color: null,
                animated: true
            }
        };
    }
    
    equipAccessory(id) {
        const accessory = this.accessories[id];
        if (!accessory || !this.unlocked.has(id)) return false;
        
        // Unequip same type
        this.equipped.forEach(equippedId => {
            const equipped = this.accessories[equippedId];
            if (equipped.type === accessory.type) {
                this.equipped.delete(equippedId);
            }
        });
        
        this.equipped.add(id);
        this.saveProgress();
        return true;
    }
    
    unlockAccessory(id) {
        const accessory = this.accessories[id];
        if (!accessory || this.unlocked.has(id)) return false;
        
        if (window.gameManager) {
            const canAfford = window.gameManager.spendCoins(accessory.price);
            if (!canAfford) return false;
        }
        
        this.unlocked.add(id);
        this.saveProgress();
        return true;
    }
    
    getEquipped() {
        return Array.from(this.equipped).map(id => this.accessories[id]);
    }
    
    saveProgress() {
        localStorage.setItem('equippedAccessories', 
            JSON.stringify(Array.from(this.equipped)));
        localStorage.setItem('unlockedAccessories', 
            JSON.stringify(Array.from(this.unlocked)));
    }
    
    loadProgress() {
        const equipped = localStorage.getItem('equippedAccessories');
        if (equipped) this.equipped = new Set(JSON.parse(equipped));
        
        const unlocked = localStorage.getItem('unlockedAccessories');
        if (unlocked) this.unlocked = new Set(JSON.parse(unlocked));
    }
}
