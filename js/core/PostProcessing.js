/**
 * ============================================
 * POST PROCESSING - Visual effects
 * ============================================
 */

class PostProcessing {
    constructor(renderer, scene, camera) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        
        this.enabled = false;
        this.effects = new Map();
        
        console.log('✅ PostProcessing Initialized');
    }
    
    enable() {
        this.enabled = true;
    }
    
    disable() {
        this.enabled = false;
    }
    
    addEffect(id, effect) {
        this.effects.set(id, effect);
    }
    
    removeEffect(id) {
        this.effects.delete(id);
    }
    
    render() {
        if (!this.enabled) {
            this.renderer.render(this.scene, this.camera);
            return;
        }
        
        // Apply effects
        this.effects.forEach((effect, id) => {
            if (effect.enabled && effect.render) {
                effect.render();
            }
        });
    }
    
    dispose() {
        this.effects.clear();
        console.log('🗑️ PostProcessing Disposed');
    }
}
