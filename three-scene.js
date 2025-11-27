// Three.js Scene for Hero Section
class ThreeScene {
    constructor() {
        this.container = document.getElementById('hero-canvas');
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = null;
        this.mouseX = 0;
        this.mouseY = 0;
        this.time = 0;
        
        this.isInitialized = false;
        this.animationId = null;
    }
    
    init() {
        if (this.isInitialized) return;
        
        this.setupScene();
        this.createParticles();
        this.createLights();
        this.setupEventListeners();
        this.animate();
        
        this.isInitialized = true;
    }
    
    setupScene() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x667eea, 1, 100);
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 30;
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.container,
            alpha: true,
            antialias: window.innerWidth < 768 ? false : true // Disable antialiasing on mobile for performance
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);
        
        // Enable shadows for better visuals
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    
    createParticles() {
        const particleCount = window.innerWidth < 768 ? 100 : 300; // Fewer particles on mobile
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        const color1 = new THREE.Color(0x667eea);
        const color2 = new THREE.Color(0x764ba2);
        const color3 = new THREE.Color(0x4facfe);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Positions
            positions[i3] = (Math.random() - 0.5) * 100;
            positions[i3 + 1] = (Math.random() - 0.5) * 100;
            positions[i3 + 2] = (Math.random() - 0.5) * 50;
            
            // Colors - mix between gradient colors
            const mixedColor = color1.clone();
            const rand = Math.random();
            if (rand < 0.33) {
                mixedColor.copy(color1);
            } else if (rand < 0.66) {
                mixedColor.copy(color2);
            } else {
                mixedColor.copy(color3);
            }
            
            colors[i3] = mixedColor.r;
            colors[i3 + 1] = mixedColor.g;
            colors[i3 + 2] = mixedColor.b;
            
            // Sizes
            sizes[i] = Math.random() * 3 + 1;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // Particle material with custom shader
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                pixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
            },
            vertexShader: `
                uniform float time;
                uniform float pixelRatio;
                attribute float size;
                attribute vec3 color;
                varying vec3 vColor;
                varying float vAlpha;
                
                void main() {
                    vColor = color;
                    
                    vec3 pos = position;
                    
                    // Wave motion
                    pos.x += sin(time * 0.5 + position.y * 0.01) * 2.0;
                    pos.y += cos(time * 0.3 + position.x * 0.01) * 2.0;
                    pos.z += sin(time * 0.4 + position.x * 0.01 + position.y * 0.01) * 1.0;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                    
                    // Size based on distance
                    gl_PointSize = size * pixelRatio * (300.0 / -mvPosition.z);
                    
                    // Alpha based on distance
                    vAlpha = (30.0 + mvPosition.z) / 60.0;
                    vAlpha = clamp(vAlpha, 0.1, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vAlpha;
                
                void main() {
                    // Circular particle shape
                    vec2 center = gl_PointCoord - 0.5;
                    float dist = length(center);
                    
                    if (dist > 0.5) discard;
                    
                    // Soft edges
                    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
                    alpha *= vAlpha;
                    
                    // Add glow effect
                    float glow = 1.0 - smoothstep(0.0, 0.3, dist);
                    vec3 color = vColor + vec3(0.2) * glow;
                    
                    gl_FragColor = vec4(color, alpha * 0.8);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
        
        // Add floating geometric shapes
        this.createFloatingShapes();
    }
    
    createFloatingShapes() {
        const shapeCount = window.innerWidth < 768 ? 3 : 8;
        this.shapes = [];
        
        for (let i = 0; i < shapeCount; i++) {
            let geometry, material;
            const shapeType = Math.floor(Math.random() * 3);
            
            // Different geometric shapes
            switch (shapeType) {
                case 0:
                    geometry = new THREE.SphereGeometry(Math.random() * 2 + 0.5, 16, 16);
                    break;
                case 1:
                    geometry = new THREE.BoxGeometry(
                        Math.random() * 3 + 1,
                        Math.random() * 3 + 1,
                        Math.random() * 3 + 1
                    );
                    break;
                case 2:
                    geometry = new THREE.ConeGeometry(Math.random() * 2 + 0.5, Math.random() * 4 + 2, 8);
                    break;
            }
            
            material = new THREE.MeshLambertMaterial({
                color: new THREE.Color().setHSL(Math.random() * 0.2 + 0.65, 0.7, 0.6),
                transparent: true,
                opacity: 0.3
            });
            
            const shape = new THREE.Mesh(geometry, material);
            
            // Random position
            shape.position.x = (Math.random() - 0.5) * 80;
            shape.position.y = (Math.random() - 0.5) * 60;
            shape.position.z = (Math.random() - 0.5) * 40;
            
            // Random rotation
            shape.rotation.x = Math.random() * Math.PI;
            shape.rotation.y = Math.random() * Math.PI;
            shape.rotation.z = Math.random() * Math.PI;
            
            // Store initial position for animation
            shape.userData = {
                initialX: shape.position.x,
                initialY: shape.position.y,
                initialZ: shape.position.z,
                rotationSpeed: {
                    x: (Math.random() - 0.5) * 0.02,
                    y: (Math.random() - 0.5) * 0.02,
                    z: (Math.random() - 0.5) * 0.02
                }
            };
            
            this.shapes.push(shape);
            this.scene.add(shape);
        }
    }
    
    createLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x4facfe, 0.3);
        this.scene.add(ambientLight);
        
        // Directional light
        const directionalLight = new THREE.DirectionalLight(0x667eea, 1);
        directionalLight.position.set(10, 10, 20);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        this.scene.add(directionalLight);
        
        // Point lights for dynamic lighting
        const light1 = new THREE.PointLight(0x764ba2, 0.5, 50);
        light1.position.set(-20, 20, 10);
        this.scene.add(light1);
        
        const light2 = new THREE.PointLight(0x4facfe, 0.5, 50);
        light2.position.set(20, -20, 10);
        this.scene.add(light2);
        
        this.pointLights = [light1, light2];
    }
    
    setupEventListeners() {
        // Mouse movement
        document.addEventListener('mousemove', (event) => {
            this.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        });
        
        // Touch events for mobile
        document.addEventListener('touchmove', (event) => {
            if (event.touches.length > 0) {
                this.mouseX = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
                this.mouseY = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
            }
        });
        
        // Resize
        window.addEventListener('resize', () => this.handleResize());
    }
    
    handleResize() {
        if (!this.camera || !this.renderer) return;
        
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
    
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        this.time += 0.016; // Approximate 60fps
        
        // Update particle system
        if (this.particles && this.particles.material.uniforms) {
            this.particles.material.uniforms.time.value = this.time;
            
            // Rotate particle system based on mouse
            this.particles.rotation.x += (this.mouseY * 0.1 - this.particles.rotation.x) * 0.05;
            this.particles.rotation.y += (this.mouseX * 0.1 - this.particles.rotation.y) * 0.05;
        }
        
        // Update floating shapes
        if (this.shapes) {
            this.shapes.forEach((shape, index) => {
                // Rotation
                shape.rotation.x += shape.userData.rotationSpeed.x;
                shape.rotation.y += shape.userData.rotationSpeed.y;
                shape.rotation.z += shape.userData.rotationSpeed.z;
                
                // Floating motion
                shape.position.x = shape.userData.initialX + Math.sin(this.time * 0.5 + index) * 3;
                shape.position.y = shape.userData.initialY + Math.cos(this.time * 0.3 + index) * 2;
                shape.position.z = shape.userData.initialZ + Math.sin(this.time * 0.4 + index * 0.5) * 1;
                
                // Mouse influence
                shape.position.x += this.mouseX * 2;
                shape.position.y += this.mouseY * 2;
            });
        }
        
        // Update point lights
        if (this.pointLights) {
            this.pointLights[0].position.x = Math.sin(this.time * 0.7) * 30;
            this.pointLights[0].position.z = Math.cos(this.time * 0.7) * 20;
            
            this.pointLights[1].position.x = Math.cos(this.time * 0.5) * 25;
            this.pointLights[1].position.z = Math.sin(this.time * 0.5) * 25;
        }
        
        // Camera movement based on mouse (subtle)
        this.camera.position.x += (this.mouseX * 5 - this.camera.position.x) * 0.02;
        this.camera.position.y += (this.mouseY * 3 - this.camera.position.y) * 0.02;
        this.camera.lookAt(0, 0, 0);
        
        // Render
        this.renderer.render(this.scene, this.camera);
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        // Clean up geometry and materials
        if (this.particles) {
            this.particles.geometry.dispose();
            this.particles.material.dispose();
        }
        
        if (this.shapes) {
            this.shapes.forEach(shape => {
                shape.geometry.dispose();
                shape.material.dispose();
            });
        }
    }
}

// Export for global access
window.ThreeScene = ThreeScene;