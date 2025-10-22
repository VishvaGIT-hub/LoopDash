/**
 * ============================================
 * RENDERER 3D - Three.js Rendering System
 * ============================================
 */

class Renderer3D {
    constructor(canvasId = 'gameCanvas') {
        this.canvas = document.getElementById(canvasId);
        
        if (!this.canvas) {
            console.error('Canvas not found:', canvasId);
            return;
        }
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance'
        });
        
        // Renderer settings
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0f);
        this.scene.fog = new THREE.Fog(0x0a0a0f, 50, 200);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(0, 0, 0);
        
        // Stats
        this.renderCalls = 0;
        this.triangles = 0;
        
        console.log('✅ Renderer3D Initialized');
    }
    
    render() {
        this.renderer.render(this.scene, this.camera);
        
        // Update stats
        this.renderCalls++;
        this.triangles = this.renderer.info.render.triangles;
    }
    
    resize(width, height) {
        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }
    
    setBackgroundColor(color) {
        this.scene.background = new THREE.Color(color);
    }
    
    setFog(color, near, far) {
        this.scene.fog = new THREE.Fog(color, near, far);
    }
    
    enableShadows(enabled = true) {
        this.renderer.shadowMap.enabled = enabled;
    }
    
    getStats() {
        return {
            renderCalls: this.renderCalls,
            triangles: this.triangles,
            geometries: this.renderer.info.memory.geometries,
            textures: this.renderer.info.memory.textures
        };
    }
    
    dispose() {
        this.renderer.dispose();
        this.scene.traverse((object) => {
            if (object.geometry) {
                object.geometry.dispose();
            }
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
        console.log('🗑️ Renderer3D Disposed');
    }
}
