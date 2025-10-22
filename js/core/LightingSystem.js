/**
 * ============================================
 * LIGHTING SYSTEM - Dynamic lighting control
 * ============================================
 */

class LightingSystem {
    constructor(scene) {
        this.scene = scene;
        this.lights = new Map();
        
        // Create default lights
        this.createDefaultLights();
        
        // Time of day
        this.timeOfDay = 12; // 0-24 hours
        this.dayNightCycle = false;
        this.cycleSpeed = 0.1; // Hours per second
        
        console.log('✅ LightingSystem Initialized');
    }
    
    createDefaultLights() {
        // Ambient light
        const ambient = new THREE.AmbientLight(0xffffff, 0.4);
        this.addLight('ambient', ambient);
        
        // Directional light (sun)
        const directional = new THREE.DirectionalLight(0xffffff, 0.8);
        directional.position.set(10, 20, 10);
        directional.castShadow = true;
        
        // Shadow settings
        directional.shadow.mapSize.width = 2048;
        directional.shadow.mapSize.height = 2048;
        directional.shadow.camera.near = 0.5;
        directional.shadow.camera.far = 500;
        directional.shadow.camera.left = -50;
        directional.shadow.camera.right = 50;
        directional.shadow.camera.top = 50;
        directional.shadow.camera.bottom = -50;
        
        this.addLight('sun', directional);
        
        // Hemisphere light (sky)
        const hemisphere = new THREE.HemisphereLight(0x87CEEB, 0x362222, 0.3);
        this.addLight('sky', hemisphere);
    }
    
    addLight(id, light) {
        this.lights.set(id, light);
        this.scene.add(light);
        return light;
    }
    
    removeLight(id) {
        const light = this.lights.get(id);
        if (light) {
            this.scene.remove(light);
            this.lights.delete(id);
        }
    }
    
    getLight(id) {
        return this.lights.get(id);
    }
    
    setAmbientIntensity(intensity) {
        const ambient = this.lights.get('ambient');
        if (ambient) {
            ambient.intensity = intensity;
        }
    }
    
    setSunIntensity(intensity) {
        const sun = this.lights.get('sun');
        if (sun) {
            sun.intensity = intensity;
        }
    }
    
    setSunPosition(x, y, z) {
        const sun = this.lights.get('sun');
        if (sun) {
            sun.position.set(x, y, z);
        }
    }
    
    setSunColor(color) {
        const sun = this.lights.get('sun');
        if (sun) {
            sun.color.set(color);
        }
    }
    
    enableDayNightCycle(enabled = true) {
        this.dayNightCycle = enabled;
    }
    
    setTimeOfDay(hours) {
        this.timeOfDay = hours % 24;
        this.updateDayNightLighting();
    }
    
    update(deltaTime) {
        if (this.dayNightCycle) {
            this.timeOfDay += this.cycleSpeed * deltaTime;
            if (this.timeOfDay >= 24) {
                this.timeOfDay -= 24;
            }
            this.updateDayNightLighting();
        }
    }
    
    updateDayNightLighting() {
        const sun = this.lights.get('sun');
        const sky = this.lights.get('sky');
        
        if (!sun || !sky) return;
        
        // Calculate sun position based on time
        const angle = (this.timeOfDay / 24) * Math.PI * 2;
        const x = Math.cos(angle) * 50;
        const y = Math.sin(angle) * 50;
        sun.position.set(x, y, 10);
        
        // Calculate lighting intensity
        let intensity = 0;
        if (this.timeOfDay >= 6 && this.timeOfDay <= 18) {
            // Daytime
            const dayProgress = (this.timeOfDay - 6) / 12;
            intensity = Math.sin(dayProgress * Math.PI) * 0.8 + 0.2;
        } else {
            // Nighttime
            intensity = 0.1;
        }
        
        sun.intensity = intensity;
        
        // Update sun color based on time
        if (this.timeOfDay >= 5 && this.timeOfDay < 7) {
            // Sunrise - orange
            sun.color.setHex(0xFFA500);
        } else if (this.timeOfDay >= 7 && this.timeOfDay < 17) {
            // Day - white
            sun.color.setHex(0xFFFFFF);
        } else if (this.timeOfDay >= 17 && this.timeOfDay < 19) {
            // Sunset - red/orange
            sun.color.setHex(0xFF6347);
        } else {
            // Night - blue
            sun.color.setHex(0x4169E1);
        }
        
        // Update sky light
        if (this.timeOfDay >= 6 && this.timeOfDay <= 18) {
            sky.intensity = 0.3;
        } else {
            sky.intensity = 0.1;
        }
    }
    
    createSpotlight(id, color, intensity, position, target) {
        const spotlight = new THREE.SpotLight(color, intensity);
        spotlight.position.copy(position);
        if (target) {
            spotlight.target.position.copy(target);
        }
        spotlight.castShadow = true;
        this.addLight(id, spotlight);
        return spotlight;
    }
    
    createPointLight(id, color, intensity, position, distance = 0) {
        const pointLight = new THREE.PointLight(color, intensity, distance);
        pointLight.position.copy(position);
        pointLight.castShadow = true;
        this.addLight(id, pointLight);
        return pointLight;
    }
    
    dispose() {
        this.lights.forEach((light, id) => {
            this.scene.remove(light);
        });
        this.lights.clear();
        console.log('🗑️ LightingSystem Disposed');
    }
}
