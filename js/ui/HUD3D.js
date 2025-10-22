/**
 * ============================================
 * HUD 3D - 3D HUD elements
 * ============================================
 */

class HUD3D {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.elements = new Map();
        
        console.log('✅ HUD3D Initialized');
    }
    
    create3DText(text, position, options = {}) {
        // Simple 3D text using sprites
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 128;
        
        context.fillStyle = options.backgroundColor || 'rgba(0,0,0,0.7)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        context.font = options.font || '48px Arial';
        context.fillStyle = options.color || '#ffffff';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, canvas.width / 2, canvas.height / 2);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);
        
        sprite.position.copy(position);
        sprite.scale.set(options.scale || 2, 1, 1);
        
        this.scene.add(sprite);
        return sprite;
    }
    
    createFloatingText(text, position, duration = 2) {
        const sprite = this.create3DText(text, position, {
            color: '#ffd700',
            backgroundColor: 'transparent'
        });
        
        gsap.to(sprite.position, {
            y: sprite.position.y + 2,
            duration: duration,
            ease: 'power1.out',
            onComplete: () => {
                this.scene.remove(sprite);
                sprite.material.map.dispose();
                sprite.material.dispose();
            }
        });
        
        gsap.to(sprite.material, {
            opacity: 0,
            duration: duration,
            ease: 'power1.in'
        });
    }
    
    update(deltaTime) {
        // Update 3D HUD elements
    }
    
    dispose() {
        this.elements.forEach((element, id) => {
            this.scene.remove(element);
            if (element.material) element.material.dispose();
            if (element.geometry) element.geometry.dispose();
        });
        this.elements.clear();
    }
}
