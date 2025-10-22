/**
 * ============================================
 * PHYSICS WORLD - Cannon.js Physics Engine
 * ============================================
 */

class PhysicsWorld {
    constructor() {
        // Create Cannon.js world
        this.world = new CANNON.World();
        
        // Gravity
        this.world.gravity.set(0, -30, 0);
        
        // Solver settings
        this.world.solver.iterations = 10;
        this.world.solver.tolerance = 0.001;
        
        // Broadphase
        this.world.broadphase = new CANNON.NaiveBroadphase();
        
        // Default material
        this.defaultMaterial = new CANNON.Material('default');
        
        // Contact material
        const contactMaterial = new CANNON.ContactMaterial(
            this.defaultMaterial,
            this.defaultMaterial,
            {
                friction: 0.3,
                restitution: 0.3
            }
        );
        this.world.addContactMaterial(contactMaterial);
        
        // Ground plane
        this.createGround();
        
        // Performance settings
        this.world.allowSleep = true;
        this.world.sleepSpeedLimit = 0.1;
        this.world.sleepTimeLimit = 1;
        
        console.log('✅ PhysicsWorld Initialized');
    }
    
    createGround() {
        const groundShape = new CANNON.Plane();
        this.groundBody = new CANNON.Body({
            mass: 0,
            material: this.defaultMaterial
        });
        this.groundBody.addShape(groundShape);
        this.groundBody.quaternion.setFromAxisAngle(
            new CANNON.Vec3(1, 0, 0),
            -Math.PI / 2
        );
        this.world.addBody(this.groundBody);
    }
    
    step(deltaTime) {
        const timeStep = Math.min(deltaTime, 1/30); // Max 30 FPS physics
        this.world.step(timeStep);
    }
    
    addBody(body) {
        if (body instanceof CANNON.Body) {
            this.world.addBody(body);
        }
    }
    
    removeBody(body) {
        if (body instanceof CANNON.Body) {
            this.world.removeBody(body);
        }
    }
    
    setGravity(x, y, z) {
        this.world.gravity.set(x, y, z);
    }
    
    raycast(from, to) {
        const rayFrom = new CANNON.Vec3(from.x, from.y, from.z);
        const rayTo = new CANNON.Vec3(to.x, to.y, to.z);
        const result = new CANNON.RaycastResult();
        
        this.world.rayTest(rayFrom, rayTo, result);
        
        return result.hasHit ? {
            body: result.body,
            point: result.hitPointWorld,
            normal: result.hitNormalWorld,
            distance: result.distance
        } : null;
    }
    
    createBox(width, height, depth, mass = 1) {
        const shape = new CANNON.Box(new CANNON.Vec3(width/2, height/2, depth/2));
        const body = new CANNON.Body({
            mass: mass,
            material: this.defaultMaterial
        });
        body.addShape(shape);
        return body;
    }
    
    createSphere(radius, mass = 1) {
        const shape = new CANNON.Sphere(radius);
        const body = new CANNON.Body({
            mass: mass,
            material: this.defaultMaterial
        });
        body.addShape(shape);
        return body;
    }
    
    createCylinder(radiusTop, radiusBottom, height, segments = 8, mass = 1) {
        const shape = new CANNON.Cylinder(radiusTop, radiusBottom, height, segments);
        const body = new CANNON.Body({
            mass: mass,
            material: this.defaultMaterial
        });
        body.addShape(shape);
        return body;
    }
    
    destroy() {
        this.world.bodies.forEach(body => {
            this.world.removeBody(body);
        });
        console.log('🗑️ PhysicsWorld Destroyed');
    }
}
