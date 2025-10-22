/**
 * ============================================
 * POWERUP 3D - Power-up items
 * ============================================
 */

class PowerUp3D {
    constructor(type = 'magnet', position = new THREE.Vector3(0, 2, -50)) {
        this.id = `powerup_${Date.now()}_${Math.random()}`;
        this.tag = 'powerup';
        this.active = true;
        this.collected = false;
        this.type = type; // magnet, shield, boost, double
        
        this.mesh = null;
        this.duration = this.getDurationByType(type);
        
        // Animation
        this.rotationSpeed = 3;
        this.floatSpeed = 2;
        this.floatAmount = 0.5;
        this.time = 0;
        
        this.createMesh(type, position);
        
        console.log(`⚡ PowerUp Created: ${type}`);
    }
    
    getDurationByType(type) {
        switch (type) {
            case 'magnet': return 5;
            case 'shield': return 0; // One-time use
            case 'boost': return 3;
            case 'double': return 10;
            default: return 5;
        }
    }
    
    getColorByType(type) {
        switch (type) {
            case 'magnet': return 0xe74c3c;
            case 'shield': return 0x3498db;
            case 'boost': return 0x9b59b6;
            case 'double': return 0xf39c12;
            default: return 0xffffff;
        }
    }
    
    getIconByType(type) {
        switch (type) {
            case 'magnet': return '🧲';
            case 'shield': return '🛡️';
            case 'boost': return '⚡';
            case 'double': return '💎';
            default: return '⭐';
        }
    }
    
    createMesh(type, position) {
        // Create container
        const container = new THREE.Group();
        
        // Base shape
        const geometry = new THREE.IcosahedronGeometry(0.5, 0);
        const color = this.getColorByType(type);
        const material = new THREE.MeshStandardMaterial({
            color: color,
            metalness: 0.8,
            roughness: 0.2,
            emissive: color,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.9
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        container.add(mesh);
        
        // Outer ring
        const ringGeometry = new THREE.TorusGeometry(0.7, 0.05, 8, 16);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.6
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        container.add(ring);
        
        // Particles
        const particleCount = 20;
        const particleGeometry = new THREE.BufferGeometry();
        const particlePositions = [];
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const radius = 1 + Math.random() * 0.5;
            particlePositions.push(
                Math.cos(angle) * radius,
                (Math.random() - 0.5) * 2,
                Math.sin(angle) * radius
            );
        }
        
        particleGeometry.setAttribute('position',
            new THREE.Float32BufferAttribute(particlePositions, 3)
        );
        
        const particleMaterial = new THREE.PointsMaterial({
            color: color,
            size: 0.1,
            transparent: true,
            opacity: 0.8
        });
        
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        container.add(particles);
        
        container.position.copy(position);
        this.mesh = container;
        
        // Store references
        this.mesh.userData.core = mesh;
        this.mesh.userData.ring = ring;
        this.mesh.userData.particles = particles;
    }
    
    update(deltaTime, playerPosition) {
        if (!this.active || this.collected) return;
        
        this.time += deltaTime;
        
        // Rotation
        if (this.mesh.userData.core) {
            this.mesh.userData.core.rotation.y += this.rotationSpeed * deltaTime;
            this.mesh.userData.core.rotation.x += this.rotationSpeed * 0.5 * deltaTime;
        }
        
        // Ring rotation
        if (this.mesh.userData.ring) {
            this.mesh.userData.ring.rotation.z += deltaTime * 2;
        }
        
        // Floating
        const floatY = Math.sin(this.time * this.floatSpeed) * this.floatAmount;
        this.mesh.position.y = 2 + floatY;
        
        // Particles rotation
        if (this.mesh.userData.particles) {
            this.mesh.userData.particles.rotation.y += deltaTime;
        }
        
        // Pulse
        const scale = 1 + Math.sin(this.time * 4) * 0.15;
        if (this.mesh.userData.core) {
            this.mesh.userData.core.scale.setScalar(scale);
        }
    }
    
    collect() {
        if (this.collected) return false;
        
        this.collected = true;
        this.active = false;
        
        // Collection animation
        gsap.to(this.mesh.scale, {
            x: 2,
            y: 2,
            z: 2,
            duration: 0.2,
            ease: 'power2.out',
            onComplete: () => {
                gsap.to(this.mesh.scale, {
                    x: 0,
                    y: 0,
                    z: 0,
                    duration: 0.2,
                    ease: 'power2.in'
                });
            }
        });
        
        console.log(`⚡ PowerUp Collected: ${this.type}`);
        return {
            type: this.type,
            duration: this.duration,
            icon: this.getIconByType(this.type)
        };
    }
    
    isOffScreen(playerPosition) {
        return this.mesh.position.z > playerPosition.z + 20;
    }
    
    getBounds() {
        return new THREE.Box3().setFromObject(this.mesh);
    }
    
    collidesWith(bounds) {
        const thisBounds = this.getBounds();
        return thisBounds.intersectsBox(bounds);
    }
    
    dispose() {
        if (this.mesh) {
            this.mesh.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
        }
    }
}
