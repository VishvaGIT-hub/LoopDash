/**
 * ============================================
 * MATERIAL EDITOR - Material customization
 * ============================================
 */

class MaterialEditor {
    constructor() {
        this.materials = new Map();
        
        console.log('✅ MaterialEditor Initialized');
    }
    
    createMaterial(id, options = {}) {
        const material = new THREE.MeshStandardMaterial({
            color: options.color || 0xffffff,
            metalness: options.metalness || 0.5,
            roughness: options.roughness || 0.5,
            emissive: options.emissive || 0x000000,
            emissiveIntensity: options.emissiveIntensity || 0,
            transparent: options.transparent || false,
            opacity: options.opacity || 1,
            side: options.side || THREE.FrontSide
        });
        
        this.materials.set(id, material);
        return material;
    }
    
    getMaterial(id) {
        return this.materials.get(id);
    }
    
    updateMaterial(id, options) {
        const material = this.materials.get(id);
        if (!material) return;
        
        Object.keys(options).forEach(key => {
            if (key === 'color' || key === 'emissive') {
                material[key].setHex(options[key]);
            } else {
                material[key] = options[key];
            }
        });
        
        material.needsUpdate = true;
    }
    
    dispose() {
        this.materials.forEach(material => material.dispose());
        this.materials.clear();
    }
}
