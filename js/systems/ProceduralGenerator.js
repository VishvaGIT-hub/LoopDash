/**
 * ============================================
 * PROCEDURAL GENERATOR - Level generation
 * ============================================
 */

class ProceduralGenerator {
    constructor() {
        this.enabled = true;
        this.spawnDistance = 100;
        this.lastSpawnZ = 0;
        this.difficulty = 1;
        this.patternIndex = 0;
        
        // Spawn pools
        this.obstacleTypes = ['box', 'barrier', 'spike', 'moving'];
        this.collectibleTypes = ['coin', 'gem', 'star'];
        this.powerupTypes = ['magnet', 'shield', 'boost', 'double'];
        
        // Patterns
        this.patterns = this.createPatterns();
        
        // Spawn rates
        this.rates = {
            obstacle: 0.3,
            collectible: 0.5,
            powerup: 0.05
        };
        
        console.log('✅ ProceduralGenerator Initialized');
    }
    
    createPatterns() {
        return {
            straight: {
                obstacles: [
                    { type: 'box', x: 0, y: 1, z: 0 }
                ],
                collectibles: [
                    { type: 'coin', x: -2, y: 2, z: -5 },
                    { type: 'coin', x: 0, y: 2, z: -5 },
                    { type: 'coin', x: 2, y: 2, z: -5 }
                ]
            },
            zigzag: {
                obstacles: [
                    { type: 'box', x: -2, y: 1, z: 0 },
                    { type: 'box', x: 2, y: 1, z: -10 },
                    { type: 'box', x: -2, y: 1, z: -20 }
                ],
                collectibles: [
                    { type: 'coin', x: 2, y: 2, z: -5 },
                    { type: 'coin', x: -2, y: 2, z: -15 }
                ]
            },
            tunnel: {
                obstacles: [
                    { type: 'barrier', x: 0, y: 3, z: 0 }
                ],
                collectibles: [
                    { type: 'coin', x: -1, y: 1, z: -2 },
                    { type: 'coin', x: 0, y: 1, z: -2 },
                    { type: 'coin', x: 1, y: 1, z: -2 }
                ]
            },
            wall: {
                obstacles: [
                    { type: 'box', x: -3, y: 1, z: 0 },
                    { type: 'box', x: -1, y: 1, z: 0 },
                    { type: 'box', x: 1, y: 1, z: 0 },
                    { type: 'box', x: 3, y: 1, z: 0 }
                ],
                collectibles: [
                    { type: 'gem', x: 0, y: 3, z: 0 }
                ]
            },
            pyramid: {
                obstacles: [
                    { type: 'spike', x: 0, y: 0, z: 0 },
                    { type: 'spike', x: -2, y: 0, z: -5 },
                    { type: 'spike', x: 2, y: 0, z: -5 },
                    { type: 'spike', x: 0, y: 0, z: -10 }
                ],
                collectibles: [
                    { type: 'star', x: 0, y: 3, z: -5 }
                ]
            }
        };
    }
    
    update(deltaTime, playerPosition) {
        if (!this.enabled) return;
        
        // Check if we need to spawn
        if (playerPosition.z - this.lastSpawnZ < -this.spawnDistance) {
            this.spawnSegment(playerPosition);
            this.lastSpawnZ = playerPosition.z;
        }
    }
    
    spawnSegment(playerPosition) {
        const spawnZ = playerPosition.z - 150;
        
        // Choose pattern based on difficulty
        const patternKeys = Object.keys(this.patterns);
        const patternKey = patternKeys[this.patternIndex % patternKeys.length];
        const pattern = this.patterns[patternKey];
        
        this.patternIndex++;
        
        // Spawn obstacles from pattern
        if (pattern.obstacles && Math.random() < this.rates.obstacle * this.difficulty) {
            pattern.obstacles.forEach(obstacleData => {
                const position = new THREE.Vector3(
                    obstacleData.x,
                    obstacleData.y,
                    spawnZ + obstacleData.z
                );
                
                const obstacle = new Obstacle3D(obstacleData.type, position);
                window.gameManager.addEntity(obstacle);
            });
        }
        
        // Spawn collectibles from pattern
        if (pattern.collectibles && Math.random() < this.rates.collectible) {
            pattern.collectibles.forEach(collectibleData => {
                const position = new THREE.Vector3(
                    collectibleData.x,
                    collectibleData.y,
                    spawnZ + collectibleData.z
                );
                
                const collectible = new Collectible3D(collectibleData.type, position);
                window.gameManager.addEntity(collectible);
            });
        }
        
        // Random powerup spawn
        if (Math.random() < this.rates.powerup) {
            const type = this.powerupTypes[Math.floor(Math.random() * this.powerupTypes.length)];
            const x = (Math.random() - 0.5) * 6;
            const position = new THREE.Vector3(x, 2, spawnZ);
            
            const powerup = new PowerUp3D(type, position);
            window.gameManager.addEntity(powerup);
        }
        
        // Random single obstacles
        for (let i = 0; i < 3; i++) {
            if (Math.random() < 0.2 * this.difficulty) {
                const type = this.obstacleTypes[Math.floor(Math.random() * this.obstacleTypes.length)];
                const x = (Math.random() - 0.5) * 8;
                const z = spawnZ - Math.random() * 30;
                const position = new THREE.Vector3(x, 1, z);
                
                const obstacle = new Obstacle3D(type, position);
                window.gameManager.addEntity(obstacle);
            }
        }
        
        // Coin trails
        if (Math.random() < 0.3) {
            this.spawnCoinTrail(spawnZ);
        }
    }
    
    spawnCoinTrail(startZ) {
        const trailType = Math.floor(Math.random() * 3);
        const coinCount = 5 + Math.floor(Math.random() * 5);
        
        for (let i = 0; i < coinCount; i++) {
            let x, y, z;
            
            switch (trailType) {
                case 0: // Straight line
                    x = 0;
                    y = 2;
                    z = startZ - i * 3;
                    break;
                    
                case 1: // Wave
                    x = Math.sin(i * 0.5) * 3;
                    y = 2;
                    z = startZ - i * 3;
                    break;
                    
                case 2: // Spiral
                    x = Math.cos(i * 0.5) * 3;
                    y = 2 + Math.sin(i * 0.5) * 1;
                    z = startZ - i * 3;
                    break;
            }
            
            const position = new THREE.Vector3(x, y, z);
            const collectible = new Collectible3D('coin', position);
            window.gameManager.addEntity(collectible);
        }
    }
    
    setDifficulty(level) {
        this.difficulty = Math.min(level, 5);
        
        // Adjust spawn rates
        this.rates.obstacle = 0.3 + (this.difficulty * 0.1);
        this.rates.powerup = Math.max(0.05 - (this.difficulty * 0.01), 0.02);
        
        console.log(`⚙️ Difficulty set to: ${this.difficulty}`);
    }
    
    reset() {
        this.lastSpawnZ = 0;
        this.patternIndex = 0;
        this.difficulty = 1;
    }
}
