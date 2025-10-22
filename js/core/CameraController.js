/**
 * ============================================
 * CAMERA CONTROLLER - Advanced camera system
 * ============================================
 */

class CameraController {
    constructor(camera) {
        this.camera = camera;
        
        // Camera modes
        this.mode = 'follow'; // follow, fixed, orbit, firstPerson
        
        // Follow settings
        this.target = null;
        this.followOffset = new THREE.Vector3(0, 5, 10);
        this.lookAtOffset = new THREE.Vector3(0, 0, -5);
        this.followSpeed = 5;
        this.smoothness = 0.1;
        
        // Shake effect
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.shakeTime = 0;
        this.shakeOffset = new THREE.Vector3();
        
        // Zoom
        this.defaultFOV = 75;
        this.targetFOV = 75;
        this.fovSpeed = 5;
        
        // Rotation
        this.rotation = { x: 0, y: 0 };
        this.rotationSpeed = 2;
        
        console.log('✅ CameraController Initialized');
    }
    
    setMode(mode) {
        this.mode = mode;
    }
    
    setTarget(target) {
        this.target = target;
    }
    
    setFollowOffset(x, y, z) {
        this.followOffset.set(x, y, z);
    }
    
    update(deltaTime) {
        switch (this.mode) {
            case 'follow':
                this.updateFollow(deltaTime);
                break;
            case 'orbit':
                this.updateOrbit(deltaTime);
                break;
            case 'firstPerson':
                this.updateFirstPerson(deltaTime);
                break;
        }
        
        // Update shake
        if (this.shakeTime > 0) {
            this.updateShake(deltaTime);
        }
        
        // Update FOV
        if (Math.abs(this.camera.fov - this.targetFOV) > 0.1) {
            this.camera.fov += (this.targetFOV - this.camera.fov) * this.fovSpeed * deltaTime;
            this.camera.updateProjectionMatrix();
        }
    }
    
    updateFollow(deltaTime) {
        if (!this.target) return;
        
        // Calculate desired position
        const targetPos = this.target.position || this.target;
        const desiredPosition = new THREE.Vector3(
            targetPos.x + this.followOffset.x,
            targetPos.y + this.followOffset.y,
            targetPos.z + this.followOffset.z
        );
        
        // Smooth camera movement
        this.camera.position.lerp(desiredPosition, this.smoothness);
        
        // Look at target with offset
        const lookAtPos = new THREE.Vector3(
            targetPos.x + this.lookAtOffset.x,
            targetPos.y + this.lookAtOffset.y,
            targetPos.z + this.lookAtOffset.z
        );
        this.camera.lookAt(lookAtPos);
    }
    
    updateOrbit(deltaTime) {
        if (!this.target) return;
        
        const targetPos = this.target.position || this.target;
        const radius = this.followOffset.length();
        
        // Calculate orbit position
        const x = targetPos.x + Math.cos(this.rotation.y) * radius;
        const z = targetPos.z + Math.sin(this.rotation.y) * radius;
        const y = targetPos.y + this.followOffset.y;
        
        this.camera.position.set(x, y, z);
        this.camera.lookAt(targetPos);
    }
    
    updateFirstPerson(deltaTime) {
        if (!this.target) return;
        
        const targetPos = this.target.position || this.target;
        
        // Camera at player head position
        this.camera.position.copy(targetPos);
        this.camera.position.y += 1.6; // Eye height
        
        // Apply rotation
        this.camera.rotation.y = this.rotation.y;
        this.camera.rotation.x = this.rotation.x;
    }
    
    shake(intensity, duration) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
        this.shakeTime = 0;
    }
    
    updateShake(deltaTime) {
        this.shakeTime += deltaTime;
        
        if (this.shakeTime < this.shakeDuration) {
            const progress = this.shakeTime / this.shakeDuration;
            const currentIntensity = this.shakeIntensity * (1 - progress);
            
            this.shakeOffset.set(
                (Math.random() - 0.5) * currentIntensity,
                (Math.random() - 0.5) * currentIntensity,
                (Math.random() - 0.5) * currentIntensity
            );
            
            this.camera.position.add(this.shakeOffset);
        } else {
            this.shakeTime = 0;
            this.shakeOffset.set(0, 0, 0);
        }
    }
    
    rotate(deltaX, deltaY) {
        this.rotation.x += deltaY * this.rotationSpeed * 0.01;
        this.rotation.y += deltaX * this.rotationSpeed * 0.01;
        
        // Clamp vertical rotation
        this.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.rotation.x));
    }
    
    zoom(delta) {
        this.targetFOV = THREE.MathUtils.clamp(
            this.targetFOV + delta,
            30,
            120
        );
    }
    
    resetFOV() {
        this.targetFOV = this.defaultFOV;
    }
    
    updateAspect(aspect) {
        this.camera.aspect = aspect;
        this.camera.updateProjectionMatrix();
    }
    
    setPosition(x, y, z) {
        this.camera.position.set(x, y, z);
    }
    
    lookAt(x, y, z) {
        this.camera.lookAt(x, y, z);
    }
}
