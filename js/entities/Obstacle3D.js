/**
 * ============================================
 * OBSTACLE 3D - Game obstacles
 * ============================================
 */

class Obstacle3D {
    constructor(type = 'box', position = new THREE.Vector3(0, 0, -50)) {
        this.id = `obstacle_${Date.now()}_${Math.random()}`;
        this.tag = 'obstacle';
        this.active = true;
        this.type = type; // box, barrier, gap, moving
        
        this.mesh = null;
        this.body = null;
        this.passed = false;
        
        // Movement
        this.movePattern = null;
        this.moveSpeed = 0;
        this.moveTime = 0;
        
        this.createObstacle(type, position);
        
        console.log(`🚧 Obstacle Created: ${type}`);
    }
    
    createObstacle(type, position) {
        switch (type) {
            case 'box':
                this.createBox(position);
                break;
            case 'barrier':
                this.createBarrier(position);
                break;
            case 'spike':
                this.createSpike(position);
                break;
            case 'moving':
                this.createMoving(position);
                break;
            default:
                this.createBox(position);
        }
    }
    
    createBox(position) {
        const geometry = new THREE.BoxGeometry(2, 2, 1);
        const material = new THREE.MeshStandardMaterial({
            color: 0xff6b6b,
            metalness: 0.3,
            roughness: 0.7
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);
        this.mesh.castShadow = true;
        
        // Add warning stripes
        const stripeGeometry = new THREE.PlaneGeometry(2, 2);
        const stripeMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.5
        });
        const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
        stripe.rotation.y = Math.PI / 2;
        stripe.position.x = 1;
        this.mesh.add(stripe);
        
        // Physics
        const shape = new CANNON.Box(new CANNON.Vec3(1, 1, 0.5));
        this.body = new CANNON.Body({
            mass: 0,
            position: new CANNON.Vec3(position.x, position.y, position.z)
        });
        this.body.addShape(shape);
    }
    
    createBarrier(position) {
        const geometry = new THREE.BoxGeometry(5, 1, 1);
        const material = new THREE.MeshStandardMaterial({
            color: 0xff4444,
            metalness: 0.5,
            roughness: 0.5
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);
        this.mesh.position.y = 2;
        this.mesh.castShadow = true;
        
        // Physics
        const shape = new CANNON.Box(new CANNON.Vec3(2.5, 0.5, 0.5));
        this.body = new CANNON.Body({
            mass: 0,
            position: new CANNON.Vec3(position.x, position.y + 2, position.z)
        });
        this.body.addShape(shape);
    }
    
    createSpike(position) {
        const geometry = new THREE.ConeGeometry(0.5, 2, 4);
        const material = new THREE.MeshStandardMaterial({
            color: 0x8b0000,
            metalness: 0.8,
            roughness: 0.2
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);
        this.mesh.position.y = 1;
        this.mesh.castShadow = true;
        
        // Physics
        const shape = new CANNON.Cylinder(0, 0.5, 2, 4);
        this.body = new CANNON.Body({
            mass: 0,
            position: new CANNON.Vec3(position.x, position.y + 1, position.z)
        });
        this.body.addShape(shape);
    }
    
    createMoving(position) {
        this.createBox(position);
        this.movePattern = 'horizontal';
        this.moveSpeed = 3;
    }
    
    update(deltaTime, playerPosition) {
        if (!this.active) return;
        
        // Moving obstacle
        if (this.movePattern) {
            this.updateMovement(deltaTime);
        }
        
        // Check if passed player
        if (!this.passed && this.mesh.position.z > playerPosition.z + 5) {
            this.passed = true;
        }
        
        // Sync mesh with physics
        if (this.body) {
            this.mesh.position.copy(this.body.position);
            this.mesh.quaternion.copy(this.body.quaternion);
        }
        
        // Rotation animation
        this.mesh.rotation.y += deltaTime * 0.5;
    }
    
    updateMovement(deltaTime) {
        this.moveTime += deltaTime;
        
        switch (this.movePattern) {
            case 'horizontal':
                const offsetX = Math.sin(this.moveTime * this.moveSpeed) * 3;
                this.mesh.position.x = offsetX;
                this.body.position.x = offsetX;
                break;
                
            case 'vertical':
                const offsetY = Math.sin(this.moveTime * this.moveSpeed) * 2 + 2;
                this.mesh.position.y = offsetY;
                this.body.position.y = offsetY;
                break;
        }
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
    
    destroy() {
        this.active = false;
        
        // Destruction animation
        gsap.to(this.mesh.scale, {
            x: 0,
            y: 0,
            z: 0,
            duration: 0.3,
            ease: 'power2.in'
        });
    }
    
    dispose() {
        if (this.mesh) {
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
    }
}
