/**
 * ============================================
 * LOOP DASH ULTRA 3D - CORE ENGINE
 * ============================================
 * Main game engine managing the game loop
 */

class GameEngine {
    constructor() {
        this.isRunning = false;
        this.isPaused = false;
        this.currentTime = 0;
        this.deltaTime = 0;
        this.lastTime = 0;
        this.fps = 60;
        this.frameCount = 0;
        this.actualFPS = 0;
        
        // Engine modules
        this.renderer = null;
        this.physics = null;
        this.sceneManager = null;
        this.cameraController = null;
        this.lightingSystem = null;
        
        // Game systems
        this.systems = [];
        this.entities = [];
        
        // Performance monitoring
        this.performanceStats = {
            renderTime: 0,
            physicsTime: 0,
            updateTime: 0,
            totalTime: 0
        };
        
        this.init();
    }
    
    init() {
        console.log('🎮 Initializing Game Engine...');
        
        // Initialize renderer
        this.renderer = new Renderer3D();
        
        // Initialize physics
        this.physics = new PhysicsWorld();
        
        // Initialize scene manager
        this.sceneManager = new SceneManager(this.renderer.scene);
        
        // Initialize camera controller
        this.cameraController = new CameraController(this.renderer.camera);
        
        // Initialize lighting
        this.lightingSystem = new LightingSystem(this.renderer.scene);
        
        console.log('✅ Game Engine Initialized');
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastTime = performance.now();
        this.gameLoop();
        
        console.log('▶️ Game Engine Started');
    }
    
    pause() {
        this.isPaused = true;
        console.log('⏸️ Game Engine Paused');
    }
    
    resume() {
        this.isPaused = false;
        this.lastTime = performance.now();
        console.log('▶️ Game Engine Resumed');
    }
    
    stop() {
        this.isRunning = false;
        this.isPaused = false;
        console.log('⏹️ Game Engine Stopped');
    }
    
    gameLoop(currentTime = 0) {
        if (!this.isRunning) return;
        
        // Calculate delta time
        this.currentTime = currentTime;
        this.deltaTime = Math.min((this.currentTime - this.lastTime) / 1000, 0.1);
        this.lastTime = this.currentTime;
        
        // FPS calculation
        this.frameCount++;
        if (this.currentTime % 1000 < this.deltaTime * 1000) {
            this.actualFPS = this.frameCount;
            this.frameCount = 0;
        }
        
        // Skip update if paused
        if (!this.isPaused) {
            const startTime = performance.now();
            
            // Update physics
            const physicsStart = performance.now();
            this.physics.step(this.deltaTime);
            this.performanceStats.physicsTime = performance.now() - physicsStart;
            
            // Update all systems
            const updateStart = performance.now();
            this.update(this.deltaTime);
            this.performanceStats.updateTime = performance.now() - updateStart;
            
            // Render scene
            const renderStart = performance.now();
            this.render();
            this.performanceStats.renderTime = performance.now() - renderStart;
            
            this.performanceStats.totalTime = performance.now() - startTime;
        }
        
        // Request next frame
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTime) {
        // Update camera
        this.cameraController.update(deltaTime);
        
        // Update all registered systems
        this.systems.forEach(system => {
            if (system.enabled && system.update) {
                system.update(deltaTime);
            }
        });
        
        // Update all entities
        this.entities.forEach(entity => {
            if (entity.active && entity.update) {
                entity.update(deltaTime);
            }
        });
        
        // Update scene manager
        this.sceneManager.update(deltaTime);
    }
    
    render() {
        this.renderer.render();
    }
    
    registerSystem(system) {
        if (!this.systems.includes(system)) {
            this.systems.push(system);
            console.log(`✅ System registered: ${system.constructor.name}`);
        }
    }
    
    unregisterSystem(system) {
        const index = this.systems.indexOf(system);
        if (index > -1) {
            this.systems.splice(index, 1);
            console.log(`❌ System unregistered: ${system.constructor.name}`);
        }
    }
    
    addEntity(entity) {
        if (!this.entities.includes(entity)) {
            this.entities.push(entity);
            
            // Add to scene if it has a mesh
            if (entity.mesh) {
                this.renderer.scene.add(entity.mesh);
            }
            
            // Add to physics if it has a body
            if (entity.body) {
                this.physics.addBody(entity.body);
            }
        }
    }
    
    removeEntity(entity) {
        const index = this.entities.indexOf(entity);
        if (index > -1) {
            this.entities.splice(index, 1);
            
            // Remove from scene
            if (entity.mesh) {
                this.renderer.scene.remove(entity.mesh);
            }
            
            // Remove from physics
            if (entity.body) {
                this.physics.removeBody(entity.body);
            }
        }
    }
    
    clearEntities() {
        [...this.entities].forEach(entity => {
            this.removeEntity(entity);
        });
        this.entities = [];
    }
    
    getEntityById(id) {
        return this.entities.find(entity => entity.id === id);
    }
    
    getEntitiesByTag(tag) {
        return this.entities.filter(entity => entity.tag === tag);
    }
    
    getPerformanceStats() {
        return {
            fps: this.actualFPS,
            ...this.performanceStats,
            entityCount: this.entities.length,
            systemCount: this.systems.length
        };
    }
    
    resize(width, height) {
        this.renderer.resize(width, height);
        this.cameraController.updateAspect(width / height);
    }
    
    destroy() {
        this.stop();
        this.clearEntities();
        this.systems = [];
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        if (this.physics) {
            this.physics.destroy();
        }
        
        console.log('🗑️ Game Engine Destroyed');
    }
}
