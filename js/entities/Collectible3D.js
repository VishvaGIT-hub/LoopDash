/**
 * ============================================
 * COLLECTIBLE 3D - Coins and items
 * ============================================
 */

class Collectible3D {
    constructor(type = 'coin', position = new THREE.Vector3(0, 2, -50)) {
        this.id = `collectible_${Date.now()}_${Math.random()}`;
        this.tag = 'collectible';
        this.active = true;
        this.collected = false;
        this.type = type; // coin, gem, star
        
        this.mesh = null;
        this.value = this.getValueByType(type);
        
        // Animation
        this.rotationSpeed = 2;
        this.floatSpeed = 2;
        this.floatAmount = 0.3;
        this.floatOffset = Math.random() * Math.PI * 2;
        this.time = 0;
        
        // Magnet
        this.magnetized = false;
        this.magnetTarget = null;
        this.magnetSpeed = 10;
        
        this.createMesh(type, position);
        
        console.log(`💰 Collectible Created: ${type}`);
    }
    
    getValueByType(type) {
        switch (type) {
            case 'coin': return 10;
            case 'gem': return 50;
            case 'star': return 100;
            default: return 10;
        }
    }
    
    createMesh(type, position) {
        let geometry, material;
        
        switch (type) {
            case 'coin':
                geometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16);
                material = new THREE.MeshStandardMaterial({
                    color: 0xffd700,
                    metalness: 0.9,
                    roughness: 0.1,
                    emissive: 0xffd700,
                    emissiveIntensity: 0.3
                });
                break;
                
            case 'gem':
                geometry = new THREE.OctahedronGeometry(0.4);
                material = new THREE.MeshStandardMaterial({
                    color: 0x00f2fe,
                    metalness: 1,
                    roughness: 0,
                    emissive: 0x00f2fe,
                    emissiveIntensity: 0.5,
                    transparent: true,
                    opacity: 0.9
                });
                break;
                
            case 'star':
                geometry = this.createStarGeometry();
                material = new THREE.MeshStandardMaterial({
                    color: 0xffff00,
                    metalness: 0.8,
                    roughness: 0.2,
                    emissive: 0xffff00,
                    emissiveIntensity: 0.6
                });
                break;
        }
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);
        this.mesh.castShadow = false;
        this.mesh.receiveShadow = false;
        
        // Add glow
        const glowGeometry = geometry.clone();
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: material.color,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.scale.multiplyScalar(1.2);
        this.mesh.add(glow);
    }
    
    createStarGeometry() {
        const shape = new THREE.Shape();
        const outerRadius = 0.5;
        const innerRadius = 0.2;
        const points = 5;
        
        for (let i = 0; i < points * 2; i++) {
            const angle = (i * Math.PI) / points;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) {
                shape.moveTo(x, y);
            } else {
                shape.lineTo(x, y);
            }
        }
        
        const extrudeSettings = {
            depth: 0.1,
            bevelEnabled: true,
            bevelThickness: 0.05,
            bevelSize: 0.05,
            bevelSegments: 3
        };
        
        return new THREE.ExtrudeGeometry(shape, extrudeSettings);
    }
    
    update(deltaTime, playerPosition) {
        if (!this.active || this.collected) return;
        
        this.time += deltaTime;
        
        // Rotation
        this.mesh.rotation.y += this.rotationSpeed * deltaTime;
        
        // Floating animation
        const floatY = Math.sin(this.time * this.floatSpeed + this.floatOffset) * this.floatAmount;
        this.mesh.position.y += floatY * deltaTime;
        
        // Magnet effect
        if (this.magnetized && this.magnetTarget) {
            const direction = new THREE.Vector3()
                .subVectors(this.magnetTarget, this.mesh.position)
                .normalize();
            
            this.mesh.position.add(direction.multiplyScalar(this.magnetSpeed * deltaTime));
        }
        
        // Pulse effect
        const scale = 1 + Math.sin(this.time * 3) * 0.1;
        this.mesh.scale.setScalar(scale);
    }
    
    collect() {
        if (this.collected) return false;
        
        this.collected = true;
        this.active = false;
        
        // Collection animation
        gsap.to(this.mesh.position, {
            y: this.mesh.position.y + 2,
            duration: 0.3,
            ease: 'power2.out'
        });
        
        gsap.to(this.mesh.scale, {
            x: 0,
            y: 0,
            z: 0,
            duration: 0.3,
            ease: 'power2.in'
        });
        
        console.log(`💰 Collected ${this.type}: +${this.value}`);
        return true;
    }
    
    enableMagnet(target) {
        this.magnetized = true;
        this.magnetTarget = target;
    }
    
    disableMagnet() {
        this.magnetized = false;
        this.magnetTarget = null;
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
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
    }
}
