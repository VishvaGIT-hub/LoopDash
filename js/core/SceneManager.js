/**
 * ============================================
 * SCENE MANAGER - Manages 3D scene objects
 * ============================================
 */

class SceneManager {
    constructor(scene) {
        this.scene = scene;
        this.objects = new Map();
        this.groups = new Map();
        this.objectPool = new Map();
        
        console.log('✅ SceneManager Initialized');
    }
    
    add(object, id = null) {
        if (id) {
            this.objects.set(id, object);
        }
        this.scene.add(object);
        return object;
    }
    
    remove(object) {
        if (typeof object === 'string') {
            const obj = this.objects.get(object);
            if (obj) {
                this.scene.remove(obj);
                this.objects.delete(object);
            }
        } else {
            this.scene.remove(object);
            
            // Remove from map if exists
            for (let [key, value] of this.objects) {
                if (value === object) {
                    this.objects.delete(key);
                    break;
                }
            }
        }
    }
    
    get(id) {
        return this.objects.get(id);
    }
    
    createGroup(groupId) {
        const group = new THREE.Group();
        this.groups.set(groupId, group);
        this.scene.add(group);
        return group;
    }
    
    getGroup(groupId) {
        return this.groups.get(groupId);
    }
    
    addToGroup(groupId, object) {
        const group = this.groups.get(groupId);
        if (group) {
            group.add(object);
        }
    }
    
    removeGroup(groupId) {
        const group = this.groups.get(groupId);
        if (group) {
            this.scene.remove(group);
            this.groups.delete(groupId);
        }
    }
    
    clear() {
        // Remove all objects
        this.objects.forEach((object, id) => {
            this.scene.remove(object);
        });
        this.objects.clear();
        
        // Remove all groups
        this.groups.forEach((group, id) => {
            this.scene.remove(group);
        });
        this.groups.clear();
    }
    
    createObjectPool(type, count, createFunc) {
        const pool = [];
        for (let i = 0; i < count; i++) {
            const obj = createFunc();
            obj.visible = false;
            pool.push(obj);
        }
        this.objectPool.set(type, pool);
        return pool;
    }
    
    getFromPool(type) {
        const pool = this.objectPool.get(type);
        if (pool) {
            const obj = pool.find(o => !o.visible);
            if (obj) {
                obj.visible = true;
                return obj;
            }
        }
        return null;
    }
    
    returnToPool(type, object) {
        object.visible = false;
        object.position.set(0, -1000, 0); // Move off screen
    }
    
    update(deltaTime) {
        // Update any animated objects
        this.objects.forEach((object, id) => {
            if (object.userData.update) {
                object.userData.update(deltaTime);
            }
        });
    }
    
    dispose() {
        this.clear();
        this.objectPool.clear();
        console.log('🗑️ SceneManager Disposed');
    }
}
