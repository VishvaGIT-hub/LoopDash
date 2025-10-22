/**
 * ============================================
 * VEHICLE 3D - Special vehicle power-up
 * ============================================
 */

class Vehicle3D {
    constructor(type = 'hoverboard') {
        this.id = `vehicle_${Date.now()}`;
        this.tag = 'vehicle';
        this.active = false;
        this.type = type;
        
        this.mesh = null;
        this.duration = 10;
        this.timer = 0;
        
        this.createMesh(type);
        
        console.log(`🛹 Vehicle Created: ${type}`);
    }
    
    createMesh(type) {
        const group = new THREE.Group();
        
        // Board
        const boardGeometry = new THREE.BoxGeometry(1, 0.1, 1.5);
        const boardMaterial = new THREE.MeshStandardMaterial({
            color: 0x00f2fe,
            metalness: 0.8,
            roughness: 0.2
        });
        const board = new THREE.Mesh(boardGeometry, boardMaterial);
        group.add(board);
        
        // Glow underneath
        const glowGeometry = new THREE.CircleGeometry(0.6, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00f2fe,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.rotation.x = -Math.PI / 2;
        glow.position.y = -0.1;
        group.add(glow);
        
        this.mesh = group;
        this.mesh.position.y = -0.5;
    }
    
    activate() {
        this.active = true;
        this.timer = this.duration;
        this.mesh.visible = true;
    }
    
    deactivate() {
        this.active = false;
        this.mesh.visible = false;
    }
    
    update(deltaTime) {
        if (!this.active) return;
        
        this.timer -= deltaTime;
        if (this.timer <= 0) {
            this.deactivate();
        }
        
        // Hover animation
        this.mesh.position.y = -0.5 + Math.sin(Date.now() * 0.005) * 0.1;
        this.mesh.rotation.z = Math.sin(Date.now() * 0.003) * 0.05;
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
