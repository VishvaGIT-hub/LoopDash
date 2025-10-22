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
                    emissiveIntensity: 
