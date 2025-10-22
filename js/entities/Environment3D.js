/**
 * ============================================
 * ENVIRONMENT 3D - Background environment
 * ============================================
 */

class Environment3D {
    constructor(scene) {
        this.scene = scene;
        this.currentTheme = 'day';
        this.elements = [];
        
        // Ground
        this.ground = null;
        this.groundTexture = null;
        
        // Buildings/Props
        this.props = [];
        this.propPool = [];
        
        // Skybox
        this.skybox = null;
        
        this.init();
        
        console.log('✅ Environment3D Created');
    }
    
    init() {
        this.createGround();
        this.createSkybox();
        this.createProps();
    }
    
    createGround() {
        const geometry = new THREE.PlaneGeometry(100, 2000);
        const material = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.8,
            metalness: 0.2
        });
        
        this.ground = new THREE.Mesh(geometry, material);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.receiveShadow = true;
        this.scene.add(this.ground);
        
        // Add grid pattern
        const gridHelper = new THREE.GridHelper(100, 100, 0x00f2fe, 0x444444);
        gridHelper.position.y = 0.01;
        this.scene.add(gridHelper);
    }
    
    createSkybox() {
        const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
        const skyMaterial = new THREE.MeshBasicMaterial({
            color: 0x87CEEB,
            side: THREE.BackSide
        });
        
        this.skybox = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(this.skybox);
    }
    
    createProps() {
        // Create building pool
        for (let i = 0; i < 20; i++) {
            const building = this.createBuilding();
            building.visible = false;
            this.propPool.push(building);
            this.scene.add(building);
        }
    }
    
    createBuilding() {
        const height = 5 + Math.random() * 20;
        const geometry = new THREE.BoxGeometry(3, height, 3);
        const material = new THREE.MeshStandardMaterial({
            color: new THREE.Color().setHSL(Math.random(), 0.5, 0.5),
            roughness: 0.7,
            metalness: 0.3
        });
        
        const building = new THREE.Mesh(geometry, material);
        building.castShadow = true;
        building.receiveShadow = true;
        
        return building;
    }
    
    spawnProp(playerZ) {
        const prop = this.propPool.find(p => !p.visible);
        if (!prop) return;
        
        const side = Math.random() > 0.5 ? 1 : -1;
        prop.position.set(
            side * (8 + Math.random() * 5),
            prop.geometry.parameters.height / 2,
            playerZ - 50 - Math.random() * 50
        );
        prop.visible = true;
        this.props.push(prop);
    }
    
    update(playerPosition) {
        // Update props
        this.props = this.props.filter(prop => {
            if (prop.position.z > playerPosition.z + 20) {
                prop.visible = false;
                return false;
            }
            return true;
        });
        
        // Spawn new props
        if (Math.random() < 0.1) {
            this.spawnProp(playerPosition.z);
        }
    }
    
    changeTheme(theme) {
        this.currentTheme = theme;
        
        switch (theme) {
            case 'day':
                this.skybox.material.color.setHex(0x87CEEB);
                this.ground.material.color.setHex(0x333333);
                break;
            case 'night':
                this.skybox.material.color.setHex(0x000033);
                this.ground.material.color.setHex(0x111111);
                break;
            case 'sunset':
                this.skybox.material.color.setHex(0xFF6347);
                this.ground.material.color.setHex(0x2a2a2a);
                break;
            case 'space':
                this.skybox.material.color.setHex(0x000000);
                this.ground.material.color.setHex(0x0a0a2e);
                break;
        }
        
        console.log(`🌍 Theme changed to: ${theme}`);
    }
    
    dispose() {
        this.elements.forEach(element => {
            if (element.geometry) element.geometry.dispose();
            if (element.material) element.material.dispose();
            this.scene.remove(element);
        });
        
        this.propPool.forEach(prop => {
            if (prop.geometry) prop.geometry.dispose();
            if (prop.material) prop.material.dispose();
            this.scene.remove(prop);
        });
        
        console.log('🗑️ Environment3D Disposed');
    }
}
