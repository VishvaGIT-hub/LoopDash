/**
 * ============================================
 * TRAIL SYSTEM - Player trail effects
 * ============================================
 */

class TrailSystem {
    constructor(scene) {
        this.enabled = true;
        this.scene = scene;
        this.trails = new Map();
        this.maxTrailLength = 50;
        
        console.log('✅ TrailSystem Initialized');
    }
    
    createTrail(id, color = 0x00f2fe) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.maxTrailLength * 3);
        const colors = new Float32Array(this.maxTrailLength * 3);
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const material = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            linewidth: 2
        });
        
        const line = new THREE.Line(geometry, material);
        this.scene.add(line);
        
        this.trails.set(id, {
            line: line,
            positions: [],
            color: new THREE.Color(color),
            maxLength: this.maxTrailLength
        });
        
        return line;
    }
    
    updateTrail(id, position) {
        const trail = this.trails.get(id);
        if (!trail) return;
        
        // Add new position
        trail.positions.push(position.clone());
        
        // Limit length
        if (trail.positions.length > trail.maxLength) {
            trail.positions.shift();
        }
        
        // Update geometry
        const positions = trail.line.geometry.attributes.position.array;
        const colors = trail.line.geometry.attributes.color.array;
        
        for (let i = 0; i < trail.positions.length; i++) {
            const pos = trail.positions[i];
            positions[i * 3] = pos.x;
            positions[i * 3 + 1] = pos.y;
            positions[i * 3 + 2] = pos.z;
            
            // Fade color based on age
            const alpha = i / trail.positions.length;
            colors[i * 3] = trail.color.r * alpha;
            colors[i * 3 + 1] = trail.color.g * alpha;
            colors[i * 3 + 2] = trail.color.b * alpha;
        }
        
        trail.line.geometry.attributes.position.needsUpdate = true;
        trail.line.geometry.attributes.color.needsUpdate = true;
        trail.line.geometry.setDrawRange(0, trail.positions.length);
    }
    
    clearTrail(id) {
        const trail = this.trails.get(id);
        if (trail) {
            trail.positions = [];
            trail.line.geometry.setDrawRange(0, 0);
        }
    }
    
    removeTrail(id) {
        const trail = this.trails.get(id);
        if (trail) {
            trail.line.geometry.dispose();
            trail.line.material.dispose();
            this.scene.remove(trail.line);
            this.trails.delete(id);
        }
    }
    
    update(deltaTime) {
        // Trails are updated via updateTrail calls
    }
    
    dispose() {
        this.trails.forEach((trail, id) => {
            this.removeTrail(id);
        });
        console.log('🗑️ TrailSystem Disposed');
    }
}
