/**
 * ============================================
 * WEATHER SYSTEM - Dynamic weather effects
 * ============================================
 */

class WeatherSystem {
    constructor(scene) {
        this.enabled = true;
        this.scene = scene;
        this.currentWeather = 'clear';
        this.particles = null;
        this.particleCount = 1000;
        
        console.log('✅ WeatherSystem Initialized');
    }
    
    setWeather(type) {
        this.currentWeather = type;
        this.clearParticles();
        
        switch (type) {
            case 'rain':
                this.createRain();
                break;
            case 'snow':
                this.createSnow();
                break;
            case 'storm':
                this.createStorm();
                break;
            case 'clear':
            default:
                break;
        }
        
        console.log(`🌦️ Weather changed to: ${type}`);
    }
    
    createRain() {
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const velocities = [];
        
        for (let i = 0; i < this.particleCount; i++) {
            positions.push(
                (Math.random() - 0.5) * 100,
                Math.random() * 50,
                (Math.random() - 0.5) * 100
            );
            velocities.push(0, -20 - Math.random() * 10, 0);
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));
        
        const material = new THREE.PointsMaterial({
            color: 0xaaaaaa,
            size: 0.1,
            transparent: true,
            opacity: 0.6
        });
        
        this.particles = new THREE.Points(geometry, material);
        this.particles.userData.type = 'rain';
        this.scene.add(this.particles);
    }
    
    createSnow() {
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const velocities = [];
        
        for (let i = 0; i < this.particleCount; i++) {
            positions.push(
                (Math.random() - 0.5) * 100,
                Math.random() * 50,
                (Math.random() - 0.5) * 100
            );
            velocities.push(
                (Math.random() - 0.5) * 2,
                -2 - Math.random() * 3,
                (Math.random() - 0.5) * 2
            );
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));
        
        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.2,
            transparent: true,
            opacity: 0.8
        });
        
        this.particles = new THREE.Points(geometry, material);
        this.particles.userData.type = 'snow';
        this.scene.add(this.particles);
    }
    
    createStorm() {
        this.createRain();
        
        // Add lightning effect (simulated with random flashes)
        this.particles.userData.lightning = {
            timer: 0,
            interval: 2 + Math.random() * 3,
            flashing: false
        };
    }
    
    update(deltaTime, playerPosition) {
        if (!this.enabled || !this.particles) return;
        
        const positions = this.particles.geometry.attributes.position.array;
        const velocities = this.particles.geometry.attributes.velocity.array;
        
        for (let i = 0; i < this.particleCount; i++) {
            const i3 = i * 3;
            
            // Update position
            positions[i3] += velocities[i3] * deltaTime;
            positions[i3 + 1] += velocities[i3 + 1] * deltaTime;
            positions[i3 + 2] += velocities[i3 + 2] * deltaTime;
            
            // Reset if below ground
            if (positions[i3 + 1] < 0) {
                positions[i3] = (Math.random() - 0.5) * 100;
                positions[i3 + 1] = 50;
                positions[i3 + 2] = (Math.random() - 0.5) * 100;
            }
            
            // Follow player
            if (playerPosition) {
                positions[i3 + 2] = playerPosition.z + (Math.random() - 0.5) * 100;
            }
        }
        
        this.particles.geometry.attributes.position.needsUpdate = true;
        
        // Lightning effect for storm
        if (this.particles.userData.lightning) {
            const lightning = this.particles.userData.lightning;
            lightning.timer += deltaTime;
            
            if (lightning.timer >= lightning.interval && !lightning.flashing) {
                lightning.flashing = true;
                this.triggerLightning();
                lightning.timer = 0;
                lightning.interval = 2 + Math.random() * 3;
                
                setTimeout(() => {
                    lightning.flashing = false;
                }, 100);
            }
        }
    }
    
    triggerLightning() {
        // Flash screen effect
        if (window.gameManager && window.gameManager.renderer) {
            const scene = window.gameManager.renderer.scene;
            const originalBg = scene.background.clone();
            scene.background = new THREE.Color(0xffffff);
            
            setTimeout(() => {
                scene.background = originalBg;
            }, 50);
        }
    }
    
    clearParticles() {
        if (this.particles) {
            this.particles.geometry.dispose();
            this.particles.material.dispose();
            this.scene.remove(this.particles);
            this.particles = null;
        }
    }
    
    dispose() {
        this.clearParticles();
        console.log('🗑️ WeatherSystem Disposed');
    }
}
