/**
 * ============================================
 * PARTICLE SYSTEM 3D - Visual effects
 * ============================================
 */

class ParticleSystem3D {
    constructor(scene) {
        this.enabled = true;
        this.scene = scene;
        this.emitters = new Map();
        
        console.log('✅ ParticleSystem3D Initialized');
    }
    
    createExplosion(position, color = 0xff6b6b, particleCount = 50) {
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            const geometry = new THREE.SphereGeometry(0.1, 4, 4);
            const material = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 1
            });
            
            const particle = new THREE.Mesh(geometry, material);
            particle.position.copy(position);
            
            // Random velocity
            const speed = 5 + Math.random() * 10;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            particle.userData.velocity = new THREE.Vector3(
                Math.sin(phi) * Math.cos(theta) * speed,
                Math.sin(phi) * Math.sin(theta) * speed,
                Math.cos(phi) * speed
            );
            
            particle.userData.life = 1;
            particle.userData.decay = 0.5 + Math.random() * 0.5;
            
            particles.push(particle);
            this.scene.add(particle);
        }
        
        const id = `explosion_${Date.now()}`;
        this.emitters.set(id, {
            particles: particles,
            type: 'explosion'
        });
        
        return id;
    }
    
    createCoinBurst(position, count = 10) {
        const particles = [];
        
        for (let i = 0; i < count; i++) {
            const geometry = new THREE.CircleGeometry(0.2, 16);
            const material = new THREE.MeshBasicMaterial({
                color: 0xffd700,
                transparent: true,
                opacity: 1,
                side: THREE.DoubleSide
            });
            
            const particle = new THREE.Mesh(geometry, material);
            particle.position.copy(position);
            
            const angle = (i / count) * Math.PI * 2;
            const speed = 3 + Math.random() * 2;
            
            particle.userData.velocity = new THREE.Vector3(
                Math.cos(angle) * speed,
                3 + Math.random() * 2,
                Math.sin(angle) * speed
            );
            
            particle.userData.life = 1;
            particle.userData.decay = 0.6;
            particle.userData.rotationSpeed = (Math.random() - 0.5) * 10;
            
            particles.push(particle);
            this.scene.add(particle);
        }
        
        const id = `coinburst_${Date.now()}`;
        this.emitters.set(id, {
            particles: particles,
            type: 'coinburst'
        });
        
        return id;
    }
    
    createTrail(position, color = 0x00f2fe) {
        const geometry = new THREE.SphereGeometry(0.15, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.8
        });
        
        const particle = new THREE.Mesh(geometry, material);
        particle.position.copy(position);
        
        particle.userData.life = 0.5;
        particle.userData.decay = 2;
        particle.userData.velocity = new THREE.Vector3(0, 0, 0);
        
        this.scene.add(particle);
        
        const id = `trail_${Date.now()}_${Math.random()}`;
        this.emitters.set(id, {
            particles: [particle],
            type: 'trail'
        });
        
        return id;
    }
    
    createPowerupEffect(position, color = 0x00f2fe) {
        const particles = [];
        const ringCount = 3;
        const particlesPerRing = 12;
        
        for (let r = 0; r < ringCount; r++) {
            for (let i = 0; i < particlesPerRing; i++) {
                const geometry = new THREE.SphereGeometry(0.1, 8, 8);
                const material = new THREE.MeshBasicMaterial({
                    color: color,
                    transparent: true,
                    opacity: 1
                });
                
                const particle = new THREE.Mesh(geometry, material);
                particle.position.copy(position);
                
                const angle = (i / particlesPerRing) * Math.PI * 2;
                const radius = 0.5 + r * 0.3;
                
                particle.userData.angle = angle;
                particle.userData.radius = radius;
                particle.userData.speed = 2 + r * 0.5;
                particle.userData.life = 1;
                particle.userData.decay = 0.4;
                particle.userData.height = position.y;
                
                particles.push(particle);
                this.scene.add(particle);
            }
        }
        
        const id = `powerup_${Date.now()}`;
        this.emitters.set(id, {
            particles: particles,
            type: 'powerup',
            time: 0
        });
        
        return id;
    }
    
    update(deltaTime) {
        if (!this.enabled) return;
        
        const toRemove = [];
        
        this.emitters.forEach((emitter, id) => {
            let allDead = true;
            
            emitter.particles.forEach(particle => {
                if (particle.userData.life <= 0) return;
                
                allDead = false;
                
                // Update based on type
                switch (emitter.type) {
                    case 'explosion':
                    case 'coinburst':
                        this.updateExplosionParticle(particle, deltaTime);
                        break;
                        
                    case 'trail':
                        this.updateTrailParticle(particle, deltaTime);
                        break;
                        
                    case 'powerup':
                        this.updatePowerupParticle(particle, emitter, deltaTime);
                        break;
                }
                
                // Update life
                particle.userData.life -= particle.userData.decay * deltaTime;
                particle.material.opacity = particle.userData.life;
                
                // Scale down
                const scale = particle.userData.life;
                particle.scale.setScalar(scale);
            });
            
            if (allDead) {
                toRemove.push(id);
            }
        });
        
        // Clean up dead emitters
        toRemove.forEach(id => this.removeEmitter(id));
    }
    
    updateExplosionParticle(particle, deltaTime) {
        // Apply velocity
        particle.position.add(
            particle.userData.velocity.clone().multiplyScalar(deltaTime)
        );
        
        // Apply gravity
        particle.userData.velocity.y -= 9.8 * deltaTime;
        
        // Rotation
        if (particle.userData.rotationSpeed) {
            particle.rotation.z += particle.userData.rotationSpeed * deltaTime;
        }
    }
    
    updateTrailParticle(particle, deltaTime) {
        // Fade out in place
        particle.scale.multiplyScalar(0.95);
    }
    
    updatePowerupParticle(particle, emitter, deltaTime) {
        emitter.time += deltaTime;
        
        const angle = particle.userData.angle + emitter.time * particle.userData.speed;
        const radius = particle.userData.radius + emitter.time * 2;
        
        particle.position.x = Math.cos(angle) * radius;
        particle.position.z = Math.sin(angle) * radius;
        particle.position.y = particle.userData.height + Math.sin(emitter.time * 3) * 0.5;
    }
    
    removeEmitter(id) {
        const emitter = this.emitters.get(id);
        if (emitter) {
            emitter.particles.forEach(particle => {
                particle.geometry.dispose();
                particle.material.dispose();
                this.scene.remove(particle);
            });
            this.emitters.delete(id);
        }
    }
    
    clearAll() {
        this.emitters.forEach((emitter, id) => {
            this.removeEmitter(id);
        });
    }
    
    dispose() {
        this.clearAll();
        console.log('🗑️ ParticleSystem3D Disposed');
    }
}
