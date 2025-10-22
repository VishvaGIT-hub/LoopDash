/**
 * ============================================
 * PLAYER 3D - Main player character
 * ============================================
 */

class Player3D {
    constructor() {
        this.id = 'player';
        this.tag = 'player';
        this.active = true;
        
        // State
        this.state = 'running'; // running, jumping, sliding, dead
        this.speed = 0;
        this.maxSpeed = 20;
        this.acceleration = 2;
        
        // Actions
        this.isJumping = false;
        this.isSliding = false;
        this.canDoubleJump = true;
        this.jumpCount = 0;
        this.maxJumps = 2;
        
        // Physics
        this.jumpForce = 18;
        this.slideTimer = 0;
        this.slideDuration = 0.5;
        this.invulnerable = false;
        this.invulnerableTimer = 0;
        
        // Visual
        this.mesh = null;
        this.body = null;
        this.trail = [];
        this.maxTrailLength = 20;
        
        // Stats
        this.stats = {
            speed: 85,
            jump: 90,
            luck: 75,
            magnetRange: 5
        };
        
        // Power-ups
        this.activePowerups = new Map();
        
        this.createMesh();
        this.createPhysicsBody();
        
        console.log('✅ Player3D Created');
    }
    
    createMesh() {
        // Create player geometry
        const geometry = new THREE.BoxGeometry(1, 2, 1);
        
        // Create gradient material
        const material = new THREE.MeshStandardMaterial({
            color: 0x00f2fe,
            metalness: 0.5,
            roughness: 0.2,
            emissive: 0x00f2fe,
            emissiveIntensity: 0.2
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.position.set(0, 1, 0);
        
        // Add glow effect
        const glowGeometry = new THREE.BoxGeometry(1.2, 2.2, 1.2);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00f2fe,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.mesh.add(glow);
    }
    
    createPhysicsBody() {
        const shape = new CANNON.Box(new CANNON.Vec3(0.5, 1, 0.5));
        this.body = new CANNON.Body({
            mass: 1,
            position: new CANNON.Vec3(0, 1, 0),
            linearDamping: 0.3,
            angularDamping: 1.0
        });
        this.body.addShape(shape);
        
        // Lock rotation
        this.body.fixedRotation = true;
        this.body.updateMassProperties();
    }
    
    update(deltaTime) {
        if (!this.active || this.state === 'dead') return;
        
        // Update speed
        this.speed = Math.min(this.speed + this.acceleration * deltaTime, this.maxSpeed);
        
        // Move forward
        this.body.position.z -= this.speed * deltaTime;
        
        // Sync mesh with physics body
        this.mesh.position.copy(this.body.position);
        this.mesh.quaternion.copy(this.body.quaternion);
        
        // Check ground
        this.checkGround();
        
        // Update slide
        if (this.isSliding) {
            this.slideTimer += deltaTime;
            if (this.slideTimer >= this.slideDuration) {
                this.stopSlide();
            }
        }
        
        // Update invulnerability
        if (this.invulnerable) {
            this.invulnerableTimer -= deltaTime;
            if (this.invulnerableTimer <= 0) {
                this.invulnerable = false;
                this.mesh.material.opacity = 1;
            } else {
                // Flashing effect
                this.mesh.material.opacity = Math.sin(this.invulnerableTimer * 20) * 0.5 + 0.5;
            }
        }
        
        // Update trail
        this.updateTrail();
        
        // Update power-ups
        this.updatePowerups(deltaTime);
    }
    
    jump() {
        if (this.jumpCount < this.maxJumps && !this.isSliding) {
            this.body.velocity.y = this.jumpForce;
            this.isJumping = true;
            this.jumpCount++;
            
            // Visual feedback
            this.mesh.scale.y = 0.8;
            gsap.to(this.mesh.scale, {
                y: 1,
                duration: 0.2,
                ease: 'power2.out'
            });
            
            console.log('🦘 Player Jump');
            return true;
        }
        return false;
    }
    
    slide() {
        if (!this.isJumping && !this.isSliding) {
            this.isSliding = true;
            this.slideTimer = 0;
            
            // Shrink player
            this.mesh.scale.y = 0.5;
            this.mesh.position.y -= 0.5;
            
            console.log('⬇️ Player Slide');
            return true;
        }
        return false;
    }
    
    stopSlide() {
        this.isSliding = false;
        
        // Return to normal size
        gsap.to(this.mesh.scale, {
            y: 1,
            duration: 0.2,
            ease: 'power2.out'
        });
        gsap.to(this.mesh.position, {
            y: this.body.position.y,
            duration: 0.2,
            ease: 'power2.out'
        });
    }
    
    checkGround() {
        if (this.body.position.y <= 1.1) {
            this.isJumping = false;
            this.jumpCount = 0;
            this.canDoubleJump = true;
        }
    }
    
    updateTrail() {
        // Add current position to trail
        this.trail.push({
            position: this.mesh.position.clone(),
            alpha: 1
        });
        
        // Remove old trail points
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
        
        // Fade trail
        this.trail.forEach((point, index) => {
            point.alpha -= 0.05;
        });
        
        // Remove invisible trail points
        this.trail = this.trail.filter(point => point.alpha > 0);
    }
    
    updatePowerups(deltaTime) {
        this.activePowerups.forEach((powerup, id) => {
            powerup.timer -= deltaTime;
            if (powerup.timer <= 0) {
                this.removePowerup(id);
            }
        });
    }
    
    addPowerup(id, duration, effect) {
        this.activePowerups.set(id, {
            timer: duration,
            effect: effect
        });
        
        if (effect) {
            effect.activate(this);
        }
        
        console.log(`⚡ Powerup activated: ${id}`);
    }
    
    removePowerup(id) {
        const powerup = this.activePowerups.get(id);
        if (powerup && powerup.effect) {
            powerup.effect.deactivate(this);
        }
        this.activePowerups.delete(id);
        console.log(`⚡ Powerup removed: ${id}`);
    }
    
    hasPowerup(id) {
        return this.activePowerups.has(id);
    }
    
    makeInvulnerable(duration) {
        this.invulnerable = true;
        this.invulnerableTimer = duration;
    }
    
    hit() {
        if (this.invulnerable) return false;
        
        this.state = 'dead';
        this.active = false;
        
        // Death animation
        gsap.to(this.mesh.rotation, {
            x: Math.PI * 2,
            duration: 1,
            ease: 'power2.out'
        });
        
        gsap.to(this.mesh.position, {
            y: -5,
            duration: 1,
            ease: 'power2.in'
        });
        
        console.log('💀 Player Dead');
        return true;
    }
    
    reset() {
        this.state = 'running';
        this.active = true;
        this.speed = 0;
        this.isJumping = false;
        this.isSliding = false;
        this.jumpCount = 0;
        
