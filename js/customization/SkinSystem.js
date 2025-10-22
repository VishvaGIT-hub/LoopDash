/**
 * ============================================
 * SKIN SYSTEM - Character skins
 * ============================================
 */

class SkinSystem {
    constructor() {
        this.skins = this.createSkins();
        this.selectedSkin = null;
        this.unlockedSkins = new Set();
        
        this.loadProgress();
        
        console.log('✅ SkinSystem Initialized');
    }
    
    createSkins() {
        return {
            classic: {
                id: 'classic',
                name: 'Classic',
                price: 0,
                color: null, // Use character default
                pattern: 'solid'
            },
            neon: {
                id: 'neon',
                name: 'Neon Glow',
                price: 200,
                color: 0x00ffff,
                pattern: 'glow',
                emissive: 0.8
            },
            rainbow: {
                id: 'rainbow',
                name: 'Rainbow',
                price: 500,
                color: null,
                pattern: 'rainbow',
                animated: true
            },
            gold: {
                id: 'gold',
                name: 'Golden',
                price: 1000,
                color: 0xffd700,
                pattern: 'metallic',
                metalness: 1,
                roughness: 0.2
            },
            diamond: {
                id: 'diamond',
                name: 'Diamond',
                price: 2000,
                color: 0xb9f2ff,
                pattern: 'crystal',
                transparent: true,
                opacity: 0.9
            }
        };
    }
    
    applySkin(mesh, skinId) {
        const skin = this.skins[skinId];
        if (!skin) return;
        
        if (skin.color !== null) {
            mesh.material.color.setHex(skin.color);
        }
        
        if (skin.emissive !== undefined) {
            mesh.material.emissive.copy(mesh.material.color);
            mesh.material.emissiveIntensity = skin.emissive;
        }
        
        if (skin.metalness !== undefined) {
            mesh.material.metalness = skin.metalness;
        }
        
        if (skin.roughness !== undefined) {
            mesh.material.roughness = skin.roughness;
        }
        
        if (skin.transparent !== undefined) {
            mesh.material.transparent = skin.transparent;
            mesh.material.opacity = skin.opacity || 1;
        }
    }
    
    updateAnimatedSkin(mesh, skinId, time) {
        const skin = this.skins[skinId];
        if (!skin || !skin.animated) return;
        
        if (skin.pattern === 'rainbow') {
            const hue = (time * 0.1) % 1;
            mesh.material.color.setHSL(hue, 1, 0.5);
        }
    }
    
    selectSkin(id) {
        if (this.unlockedSkins.has(id) || id === 'classic') {
            this.selectedSkin = id;
            this.saveProgress();
            return true;
        }
        return false;
    }
    
    unlockSkin(id) {
        const skin = this.skins[id];
        if (!skin || this.unlockedSkins.has(id)) return false;
        
        if (window.gameManager) {
            const canAfford = window.gameManager.spendCoins(skin.price);
            if (!canAfford) return false;
        }
        
        this.unlockedSkins.add(id);
        this.saveProgress();
        return true;
    }
    
    saveProgress() {
        localStorage.setItem('selectedSkin', this.selectedSkin || '');
        localStorage.setItem('unlockedSkins', 
            JSON.stringify(Array.from(this.unlockedSkins)));
    }
    
    loadProgress() {
        const selected = localStorage.getItem('selectedSkin');
        if (selected) this.selectedSkin = selected;
        
        const unlocked = localStorage.getItem('unlockedSkins');
        if (unlocked) {
            this.unlockedSkins = new Set(JSON.parse(unlocked));
        }
    }
}
