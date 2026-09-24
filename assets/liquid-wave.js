import * as THREE from './three.module.js';

/**
 * WebGL Liquid Mouse Ripple & Wave Background Engine
 * Implements GPU ping-pong discrete wave equation with realistic liquid refraction,
 * caustic specular reflection, and chromatic dispersion over the signature pastel gradient.
 */
export function initLiquidWave(canvasId = 'canvas') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: false,
            antialias: false,
            powerPreference: 'high-performance'
        });
    } catch (e) {
        console.warn('WebGL initialization failed for liquid background:', e);
        return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);

    // Wave simulation resolution
    const SIM_RES = 256;

    // Detect half-float or fallback to unsigned byte with biased encoding
    const gl = renderer.getContext();
    const hasHalfFloat = !!(gl.getExtension('OES_texture_half_float') || gl.getExtension('EXT_color_buffer_float'));
    const textureType = hasHalfFloat ? THREE.HalfFloatType : THREE.UnsignedByteType;

    const rtOptions = {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        type: textureType,
        depthBuffer: false,
        stencilBuffer: false
    };

    let rtCurrent = new THREE.WebGLRenderTarget(SIM_RES, SIM_RES, rtOptions);
    let rtPrevious = new THREE.WebGLRenderTarget(SIM_RES, SIM_RES, rtOptions);
    let rtTemp = new THREE.WebGLRenderTarget(SIM_RES, SIM_RES, rtOptions);

    const simCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const simScene = new THREE.Scene();

    const simUniforms = {
        uCurrent: { value: rtCurrent.texture },
        uPrev: { value: rtPrevious.texture },
        uTexel: { value: new THREE.Vector2(1 / SIM_RES, 1 / SIM_RES) },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uImpulse: { value: 0.0 },
        uRadius: { value: 0.045 },
        uDamping: { value: 0.985 }
    };

    const simMaterial = new THREE.ShaderMaterial({
        uniforms: simUniforms,
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform sampler2D uCurrent;
            uniform sampler2D uPrev;
            uniform vec2 uTexel;
            uniform vec2 uMouse;
            uniform float uImpulse;
            uniform float uRadius;
            uniform float uDamping;
            varying vec2 vUv;

            void main() {
                float l = texture2D(uCurrent, vUv - vec2(uTexel.x, 0.0)).r;
                float r = texture2D(uCurrent, vUv + vec2(uTexel.x, 0.0)).r;
                float t = texture2D(uCurrent, vUv + vec2(0.0, uTexel.y)).r;
                float b = texture2D(uCurrent, vUv - vec2(0.0, uTexel.y)).r;
                float prev = texture2D(uPrev, vUv).r;

                // 2D discrete wave propagation
                float val = (l + r + t + b) * 0.5 - prev;
                val *= uDamping;

                // Interactive mouse drop impulse
                if (uImpulse > 0.0001) {
                    float d = distance(vUv, uMouse);
                    val += smoothstep(uRadius, 0.0, d) * uImpulse;
                }

                gl_FragColor = vec4(val, 0.0, 0.0, 1.0);
            }
        `
    });

    const simQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), simMaterial);
    simScene.add(simQuad);

    // Display Scene (Draws gradient + wave refraction + specular glint)
    const displayScene = new THREE.Scene();
    const displayCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const displayUniforms = {
        uWaves: { value: rtCurrent.texture },
        uTexel: { value: new THREE.Vector2(1 / SIM_RES, 1 / SIM_RES) },
        uResolution: { value: new THREE.Vector2(width, height) }
    };

    const displayMaterial = new THREE.ShaderMaterial({
        uniforms: displayUniforms,
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform sampler2D uWaves;
            uniform vec2 uTexel;
            uniform vec2 uResolution;
            varying vec2 vUv;

            void main() {
                float l = texture2D(uWaves, vUv - vec2(uTexel.x, 0.0)).r;
                float r = texture2D(uWaves, vUv + vec2(uTexel.x, 0.0)).r;
                float t = texture2D(uWaves, vUv + vec2(0.0, uTexel.y)).r;
                float b = texture2D(uWaves, vUv - vec2(0.0, uTexel.y)).r;

                // Wave surface normal
                vec2 normal = vec2(r - l, t - b);

                // Optical liquid refraction offset
                vec2 refractUv = clamp(vUv + normal * 0.065, 0.0, 1.0);

                // Rasidul pastel gradient: Sky Blue (#e7f5fd) to Warm Peach (#fcebe0)
                vec3 topColor = vec3(0.906, 0.961, 0.992);
                vec3 bottomColor = vec3(0.988, 0.922, 0.878);
                vec3 color = mix(topColor, bottomColor, refractUv.y);

                // Liquid specular highlights (water gloss)
                vec3 lightDir = normalize(vec3(0.35, -0.6, 1.0));
                vec3 surfaceNorm = normalize(vec3(-normal * 4.0, 1.0));
                float spec = pow(max(0.0, dot(surfaceNorm, lightDir)), 22.0) * 0.42;
                color += spec;

                // Subtle chromatic dispersion on wave edges
                float waveMag = length(normal);
                color.r += waveMag * 0.14;
                color.b -= waveMag * 0.09;

                gl_FragColor = vec4(color, 1.0);
            }
        `
    });

    const displayQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), displayMaterial);
    displayScene.add(displayQuad);

    // Mouse & Touch Tracking
    const mousePos = new THREE.Vector2(0.5, 0.5);
    const targetMouse = new THREE.Vector2(0.5, 0.5);
    let impulse = 0.0;
    let mouseSpeed = 0.0;

    function onPointerMove(e) {
        const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
        const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

        const x = clientX / window.innerWidth;
        const y = 1.0 - (clientY / window.innerHeight);

        const dx = x - targetMouse.x;
        const dy = y - targetMouse.y;
        mouseSpeed = Math.sqrt(dx * dx + dy * dy);

        targetMouse.set(x, y);
        // Generous impulse on mouse movement
        impulse = Math.min(0.28, impulse + mouseSpeed * 4.5 + 0.04);
    }

    window.addEventListener('mousemove', onPointerMove, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', (e) => {
        onPointerMove(e);
        impulse = 0.35; // Click ripple pulse
    });

    function onResize() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        renderer.setSize(w, h);
        displayUniforms.uResolution.value.set(w, h);
    }
    window.addEventListener('resize', onResize);

    // Idle ambient ripple animation
    let idleTimer = 0;
    let lastTime = performance.now();

    function renderLoop(now) {
        requestAnimationFrame(renderLoop);
        const dt = (now - lastTime) * 0.001;
        lastTime = now;

        mousePos.lerp(targetMouse, 0.45);
        simUniforms.uMouse.value.copy(mousePos);
        simUniforms.uImpulse.value = impulse;

        idleTimer += dt;
        if (idleTimer > 2.2 && impulse < 0.002) {
            targetMouse.set(
                0.3 + Math.sin(now * 0.0012) * 0.35,
                0.4 + Math.cos(now * 0.0016) * 0.25
            );
            impulse = 0.1;
            idleTimer = 0;
        }

        // 1. Compute wave propagation step into rtTemp
        simUniforms.uCurrent.value = rtCurrent.texture;
        simUniforms.uPrev.value = rtPrevious.texture;
        renderer.setRenderTarget(rtTemp);
        renderer.render(simScene, simCamera);

        // Ping-pong buffer swap
        const oldPrev = rtPrevious;
        rtPrevious = rtCurrent;
        rtCurrent = rtTemp;
        rtTemp = oldPrev;

        impulse *= 0.88; // Damping

        // 2. Render final refracted liquid gradient to canvas
        displayUniforms.uWaves.value = rtCurrent.texture;
        renderer.setRenderTarget(null);
        renderer.render(displayScene, displayCamera);
    }

    requestAnimationFrame(renderLoop);
}
