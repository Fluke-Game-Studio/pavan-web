import React, { Suspense, useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, PerspectiveCamera, Stars } from '@react-three/drei';
import { motion, useScroll, useTransform } from 'framer-motion';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';

// ─── Sound Effect Manager ────────────────────────────────────────────────────
const useSoundEffects = () => {
    const audioCtxRef = useRef(null);

    const getCtx = () => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }
        return audioCtxRef.current;
    };

    const playWhoosh = () => {
        try {
            const ctx = getCtx();
            const bufferSize = ctx.sampleRate * 0.5;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
            }
            const source = ctx.createBufferSource();
            source.buffer = buffer;

            // Band-pass filter for whoosh character
            const bpf = ctx.createBiquadFilter();
            bpf.type = 'bandpass';
            bpf.frequency.setValueAtTime(600, ctx.currentTime);
            bpf.frequency.exponentialRampToValueAtTime(2800, ctx.currentTime + 0.3);
            bpf.Q.value = 1.5;

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);

            source.connect(bpf);
            bpf.connect(gain);
            gain.connect(ctx.destination);
            source.start();
        } catch (e) { /* silent fail */ }
    };

    const playImpact = () => {
        try {
            const ctx = getCtx();

            // Low thud
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(100, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.3);

            // Noise burst for crack
            const bufferSize = ctx.sampleRate * 0.15;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
            }
            const noiseSource = ctx.createBufferSource();
            noiseSource.buffer = buffer;

            const gainOsc = ctx.createGain();
            gainOsc.gain.setValueAtTime(0.6, ctx.currentTime);
            gainOsc.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

            const gainNoise = ctx.createGain();
            gainNoise.gain.setValueAtTime(0.8, ctx.currentTime);
            gainNoise.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

            osc.connect(gainOsc);
            gainOsc.connect(ctx.destination);
            noiseSource.connect(gainNoise);
            gainNoise.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.35);
            noiseSource.start();
        } catch (e) { /* silent fail */ }
    };

    const playReturn = () => {
        try {
            const ctx = getCtx();
            // Rising whoosh for return
            const bufferSize = ctx.sampleRate * 0.4;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(i / bufferSize, 0.5) * Math.pow(1 - i / bufferSize, 1.5);
            }
            const source = ctx.createBufferSource();
            source.buffer = buffer;

            const bpf = ctx.createBiquadFilter();
            bpf.type = 'bandpass';
            bpf.frequency.setValueAtTime(300, ctx.currentTime);
            bpf.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.3);
            bpf.Q.value = 2;

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);

            source.connect(bpf);
            bpf.connect(gain);
            gain.connect(ctx.destination);
            source.start();
        } catch (e) { /* silent fail */ }
    };

    return { playWhoosh, playImpact, playReturn };
};

// ─── Dynamic Star Field Component (Custom Shaders) ──────────────────────────
const STAR_COUNT = 1200;

function DynamicStarField({ currentPosition, throwState, throwProgress }) {
    const pointsRef = useRef();
    const positions = useMemo(() => {
        const pos = new Float32Array(STAR_COUNT * 3);
        for (let i = 0; i < STAR_COUNT; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 100;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 100;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 50 - 25;
        }
        return pos;
    }, []);

    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        // Random sizes and twinkles
        const sizes = new Float32Array(STAR_COUNT);
        const offsets = new Float32Array(STAR_COUNT);
        for (let i = 0; i < STAR_COUNT; i++) {
            sizes[i] = Math.random() * 2.5 + 0.5;
            offsets[i] = Math.random() * 100;
        }
        geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geo.setAttribute('offset', new THREE.BufferAttribute(offsets, 1));
        return geo;
    }, [positions]);

    const material = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uWarp: { value: 0 },
            uColor: { value: new THREE.Color(0xffffff) }
        },
        vertexShader: `
            uniform float uTime;
            uniform float uWarp;
            attribute float size;
            attribute float offset;
            varying float vGlow;
            
            void main() {
                vGlow = 0.6 + 0.4 * sin(uTime * 2.0 + offset);
                
                vec3 pos = position;
                
                // Parallax shift is handled by group position
                
                // Warp effect: stretch along Z as uWarp increases
                if (uWarp > 0.0) {
                    pos.z += uWarp * 10.0;
                }
                
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = size * (300.0 / -mvPosition.z) * (1.0 + uWarp * 0.5);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying float vGlow;
            uniform vec3 uColor;
            
            void main() {
                float dist = length(gl_PointCoord - vec2(0.5));
                if (dist > 0.5) discard;
                float strength = (1.0 - dist * 2.0);
                gl_FragColor = vec4(uColor, strength * vGlow);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    }), []);

    useFrame((state) => {
        if (!pointsRef.current) return;
        material.uniforms.uTime.value = state.clock.getElapsedTime();

        let targetWarp = 0;
        if (throwState === 'throwing') {
            targetWarp = Math.sin(throwProgress * Math.PI) * 1.5;
        } else if (throwState === 'returning') {
            targetWarp = Math.sin((1 - throwProgress) * Math.PI) * 1.2;
        }

        material.uniforms.uWarp.value = THREE.MathUtils.lerp(material.uniforms.uWarp.value, targetWarp, 0.1);

        // Deep parallax
        pointsRef.current.position.x = -currentPosition.x * 0.08;
        pointsRef.current.position.y = -currentPosition.y * 0.08;
    });

    return <points ref={pointsRef} geometry={geometry} material={material} />;
}

// ─── Particle Trail Component (Three.js) ────────────────────────────────────
const MAX_TRAIL = 60;

function GadaTrail({ gadaPosition, throwState, isMoving }) {
    const pointsRef = useRef();
    const positions = useRef(new Float32Array(MAX_TRAIL * 3));
    const opacities = useRef(new Float32Array(MAX_TRAIL));
    const trailPoints = useRef([]);
    const frameCount = useRef(0);

    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MAX_TRAIL * 3), 3));
        geo.setAttribute('opacity', new THREE.BufferAttribute(new Float32Array(MAX_TRAIL), 1));
        return geo;
    }, []);

    const material = useMemo(() => new THREE.ShaderMaterial({
        uniforms: { color: { value: new THREE.Color(0xFFD700) } },
        vertexShader: `
            attribute float opacity;
            varying float vOpacity;
            void main() {
                vOpacity = opacity;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = max(1.0, 8.0 * vOpacity);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying float vOpacity;
            uniform vec3 color;
            void main() {
                vec2 uv = gl_PointCoord - vec2(0.5);
                float dist = length(uv);
                if (dist > 0.5) discard;
                float alpha = (1.0 - dist * 2.0) * vOpacity;
                gl_FragColor = vec4(color, alpha);
            }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    }), []);

    useFrame(() => {
        frameCount.current++;

        const isActive = throwState === 'throwing' || throwState === 'returning' || isMoving;

        // Only add point every other frame for performance
        if (isActive && frameCount.current % 2 === 0) {
            trailPoints.current.push({
                x: gadaPosition.current.x,
                y: gadaPosition.current.y,
                z: gadaPosition.current.z,
                life: 1.0
            });
        }

        // Decay + remove old trail points
        trailPoints.current = trailPoints.current
            .map(p => ({ ...p, life: p.life - 0.04 }))
            .filter(p => p.life > 0);

        // Keep max trail length
        if (trailPoints.current.length > MAX_TRAIL) {
            trailPoints.current = trailPoints.current.slice(-MAX_TRAIL);
        }

        // Update geometry buffers
        const posArr = new Float32Array(MAX_TRAIL * 3);
        const opArr = new Float32Array(MAX_TRAIL);
        trailPoints.current.forEach((p, i) => {
            posArr[i * 3] = p.x;
            posArr[i * 3 + 1] = p.y;
            posArr[i * 3 + 2] = p.z;
            opArr[i] = p.life;
        });

        if (pointsRef.current) {
            pointsRef.current.geometry.attributes.position.array = posArr;
            pointsRef.current.geometry.attributes.position.needsUpdate = true;
            pointsRef.current.geometry.attributes.opacity.array = opArr;
            pointsRef.current.geometry.attributes.opacity.needsUpdate = true;
            pointsRef.current.geometry.setDrawRange(0, trailPoints.current.length);
        }
    });

    return <points ref={pointsRef} geometry={geometry} material={material} />;
}


// ─── Gada Model Component ────────────────────────────────────────────────────

function GadaModel({ url, currentPosition, isMoving, glowIntensity, throwState, throwProgress, manualRotation, throwStartPosition, showGrid, gadaWorldPosition, initialXOffset = 0, scrollShift = 0, scrollYProgress }) {
    const { scene: rawScene } = useGLTF(url);
    const scene = useMemo(() => {
        const cloned = SkeletonUtils.clone(rawScene);
        cloned.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material = child.material.clone();
            }
        });
        return cloned;
    }, [rawScene]);
    const modelRef = useRef();
    const xRotAccum = useRef(0); // accumulated local X spin angle
    const prevThrowState = useRef(throwState);

    useEffect(() => {
        if (throwState === 'idle' && prevThrowState.current === 'returning') {
            // Normalize rotation to range [-PI, PI] to prevent high-speed winding/unwinding
            const PI2 = Math.PI * 2;
            let normalized = ((xRotAccum.current % PI2) + PI2) % PI2;
            if (normalized > Math.PI) normalized -= PI2;
            xRotAccum.current = normalized;
        }
        prevThrowState.current = throwState;
    }, [throwState]);

    useEffect(() => {
        if (scene) {
            scene.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = false;
                    child.receiveShadow = false;
                }
            });
        }
    }, [scene]);

    useEffect(() => {
        if (showGrid) {
            const axisHelper = new THREE.AxesHelper(5);
            axisHelper.name = 'gadaAxisHelper';
            modelRef.current.add(axisHelper);
        }
    }, [scene, showGrid]);

    // Emissive intensity override removed to respect original material

    useFrame((state) => {
        // scrollShift can be a raw number or a Framer Motion MotionValue
        const shiftVal = typeof scrollShift === 'number' ? scrollShift : scrollShift.get();
        const totalXOffset = initialXOffset + shiftVal;

        const scrollVal = scrollYProgress ? scrollYProgress.get() : 0;
        const scrollT = THREE.MathUtils.smoothstep(scrollVal, 0.1, 0.4);

        if (throwState === 'returning' && throwProgress < 0.2) {
            const shakeIntensity = (0.2 - throwProgress) * 5;
            state.camera.position.x = (Math.random() - 0.5) * shakeIntensity * 0.5;
            state.camera.position.y = (Math.random() - 0.5) * shakeIntensity * 0.5;
        } else {
            state.camera.position.x += (0 - state.camera.position.x) * 0.05;
            state.camera.position.y += (0 - state.camera.position.y) * 0.05;
        }

        if (modelRef.current) {
            // Helper: apply tiltZ + local X spin via quaternion (no gimbal issues)
            const applyLocalXSpin = (tiltZ) => {
                const qZ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), tiltZ);
                const qX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), xRotAccum.current);
                modelRef.current.quaternion.copy(qZ).multiply(qX);
            };

            if (throwState === 'throwing' || throwState === 'returning') {
                const t = throwProgress;
                if (throwState === 'throwing') {
                    const easedT = 1 - Math.pow(1 - t, 3);
                    const driftAmount = Math.sin(easedT * Math.PI) * 2;
                    modelRef.current.position.x = throwStartPosition.x + totalXOffset + driftAmount * (throwStartPosition.x > 0 ? 1 : -1);
                    modelRef.current.position.y = throwStartPosition.y + Math.sin(easedT * Math.PI) * 3;
                    modelRef.current.position.z = -easedT * 15;
                    if (!manualRotation) {
                        xRotAccum.current -= Math.PI * 3 * 0.035; // spin forward on local X
                        const tiltZ = -(modelRef.current.position.x / 6);
                        applyLocalXSpin(tiltZ);
                    }
                } else if (throwState === 'returning') {
                    const easedT = t * t * t;
                    const returnT = 1 - easedT;
                    const driftAmount = Math.sin((1 - returnT) * Math.PI) * 2;
                    const throwEndX = throwStartPosition.x + totalXOffset + driftAmount * (throwStartPosition.x > 0 ? 1 : -1);
                    modelRef.current.position.x = throwEndX + (currentPosition.x + totalXOffset - throwEndX) * easedT;
                    modelRef.current.position.y = throwStartPosition.y + (currentPosition.y - throwStartPosition.y) * easedT + Math.sin(returnT * Math.PI) * 2;
                    modelRef.current.position.z = -returnT * 15;
                    if (!manualRotation) {
                        xRotAccum.current -= Math.PI * 3 * 0.04; // continue same-direction spin
                        const tiltZ = -(modelRef.current.position.x / 6); // track actual position, no snap
                        applyLocalXSpin(tiltZ);
                    }
                }
            } else {
                // Pure mouse follow — always stay at the cursor
                const targetX = currentPosition.x + totalXOffset;
                const targetY = currentPosition.y;
                const targetZ = currentPosition.z;

                modelRef.current.position.x += (targetX - modelRef.current.position.x) * 0.18;
                modelRef.current.position.y += (targetY - modelRef.current.position.y) * 0.18;
                modelRef.current.position.z += (targetZ - modelRef.current.position.z) * 0.1;

                // Reset scale to default
                modelRef.current.scale.setScalar(1.0);

                if (manualRotation) {
                    modelRef.current.rotation.x = manualRotation.x;
                    modelRef.current.rotation.y = manualRotation.y;
                    modelRef.current.rotation.z = manualRotation.z;
                } else {
                    xRotAccum.current += (0 - xRotAccum.current) * 0.1;
                    const tiltZ = -(currentPosition.x / 6);
                    const qZ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), tiltZ);
                    const qX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), xRotAccum.current);
                    modelRef.current.quaternion.slerp(qZ.multiply(qX), 0.1);
                }
            }

            // Export live position for trail
            if (gadaWorldPosition) {
                gadaWorldPosition.current.x = modelRef.current.position.x;
                gadaWorldPosition.current.y = modelRef.current.position.y;
                gadaWorldPosition.current.z = modelRef.current.position.z;
            }
        }
    });

    return (
        <group ref={modelRef}>
            <primitive object={scene} scale={2.5} />

            {showGrid && (
                <group>
                    <Html position={[5.2, 0, 0]} center style={{ color: 'red', font: 'bold 12px sans-serif', pointerEvents: 'none' }}>X</Html>
                    <Html position={[0, 5.2, 0]} center style={{ color: 'green', font: 'bold 12px sans-serif', pointerEvents: 'none' }}>Y</Html>
                    <Html position={[0, 0, 5.2]} center style={{ color: 'blue', font: 'bold 12px sans-serif', pointerEvents: 'none' }}>Z</Html>
                </group>
            )}

            <pointLight position={[0, 3, 0]} intensity={2} color="#FFD700" distance={4} decay={2} />
            <pointLight position={[0, 3.5, 0]} intensity={1.5} color="#FFEB3B" distance={3} decay={2} />
        </group>
    );
}


// ─── Cinematic Top Message Overlay ──────────────────────────────────────────
function GadaTopMessage({ opacity }) {
    return (
        <motion.div className="gada-top-message" style={{ opacity }}>
            <div className="gada-top-message__glow" />
            <span className="gada-top-message__label">Interactive Archive</span>
            <h3 className="gada-top-message__title">MACE OF THE PRIMAL WARRIOR</h3>
        </motion.div>
    );
}

// ─── Gada Right Content Overlay ──────────────────────────────────────────
const GadaRightContent = ({ visible }) => {
    return (
        <motion.div
            className="gada-right-content"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : 50 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
            <div className="gada-right-content__inner">
                <span className="pavan-eyebrow" style={{ color: '#FFD700' }}>Sacred Weapon</span>
                <h2 className="pavan-info-section__title">The Sacred Gada</h2>
                <p className="pavan-info-section__subtitle">Weapon of the Divine</p>
                <div className="pavan-info-section__body">
                    <p>
                        The mace isn’t merely about precision — it’s about sheer, overwhelming power, much like
                        Hanuman himself. In the game, the Gada bounces across the battlefield relentlessly
                        targeting enemies within the player’s field of view. Its unpredictable motion mirrors
                        Hanuman’s own ferocity, ensuring no foe escapes its crushing impact.
                    </p>
                </div>
                <span className="pavan-info-section__tag" style={{ borderColor: '#FFD70055', color: '#FFD700', background: '#FFD70010' }}>
                    WIP — Prototype Phase
                </span>

                <div className="gada-specs">
                    <div className="gada-spec-item">
                        <span className="gada-spec-label">Power Level</span>
                        <div className="gada-spec-bar"><motion.div className="gada-spec-fill" initial={{ width: 0 }} animate={{ width: visible ? '85%' : 0 }} /></div>
                    </div>
                    <div className="gada-spec-item">
                        <span className="gada-spec-label">Divine Weight</span>
                        <div className="gada-spec-bar"><motion.div className="gada-spec-fill" initial={{ width: 0 }} animate={{ width: visible ? '100%' : 0 }} /></div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};


// ─── Main InteractiveGada Component ─────────────────────────────────────────
const InteractiveGada = ({ modelPath = '/gada.glb', initialXOffset = 0, scrollShift = 0 }) => {
    const containerRef = useRef();
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // Reactive opacity for UI elements based on scroll
    const uiOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

    const [glowIntensity, setGlowIntensity] = useState(0.3);
    const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0, z: 0 });
    const [isMoving, setIsMoving] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [throwState, setThrowState] = useState('idle');
    const [throwProgress, setThrowProgress] = useState(0);
    const [debugMode, setDebugMode] = useState(false);
    const [showGrid, setShowGrid] = useState(false);
    const [manualRotation, setManualRotation] = useState({ x: 0, y: 0, z: 0 });
    const [throwStartPosition, setThrowStartPosition] = useState({ x: 0, y: 0 });
    const canvasRef = useRef();
    const throwAnimationRef = useRef(null);
    const gadaWorldPosition = useRef({ x: 0, y: 0, z: 0 });
    const prevThrowStateRef = useRef('idle');
    const { playWhoosh, playImpact, playReturn } = useSoundEffects();

    // Global mouse tracking — so Gada follows cursor even when scrolled
    useEffect(() => {
        const onGlobalMove = (event) => {
            if (!canvasRef.current) return;
            const rect = canvasRef.current.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const ndcX = (x / rect.width) * 2 - 1;
            const ndcY = -(y / rect.height) * 2 + 1;
            const fov = 50 * (Math.PI / 180);
            const cameraDistance = 8;
            const halfHeight = Math.tan(fov / 2) * cameraDistance;
            const aspect = rect.width / rect.height;
            const halfWidth = halfHeight * aspect;
            setCurrentPosition({ x: ndcX * halfWidth, y: ndcY * halfHeight, z: 0 });
            setIsMoving(true);
            setGlowIntensity(1.2);
        };
        window.addEventListener('mousemove', onGlobalMove);
        return () => window.removeEventListener('mousemove', onGlobalMove);
    }, []);

    // Sound trigger on state transitions
    useEffect(() => {
        const prev = prevThrowStateRef.current;
        prevThrowStateRef.current = throwState;

        if (throwState === 'throwing' && prev === 'idle') {
            playWhoosh();
        } else if (throwState === 'returning' && prev === 'throwing') {
            // playImpact removed
            setTimeout(() => playReturn(), 50);
        }
    }, [throwState]);

    // Throwing animation loop
    useEffect(() => {
        if (throwState === 'throwing') {
            let progress = 0;
            const animate = () => {
                progress += 0.035;
                setThrowProgress(progress);
                if (progress >= 1) {
                    setThrowState('returning');
                    setThrowProgress(0);
                } else {
                    throwAnimationRef.current = requestAnimationFrame(animate);
                }
            };
            throwAnimationRef.current = requestAnimationFrame(animate);
        } else if (throwState === 'returning') {
            let progress = 0;
            const animate = () => {
                progress += 0.04;
                setThrowProgress(progress);
                if (progress >= 1) {
                    setThrowState('idle');
                    setThrowProgress(0);
                    setGlowIntensity(0.3);
                } else {
                    throwAnimationRef.current = requestAnimationFrame(animate);
                }
            };
            throwAnimationRef.current = requestAnimationFrame(animate);
        }
        return () => {
            if (throwAnimationRef.current) cancelAnimationFrame(throwAnimationRef.current);
        };
    }, [throwState]);

    const handleMouseMove = (event) => {
        if (!canvasRef.current || throwState !== 'idle') return;
        // Always use the sticky canvas rect so coords are viewport-relative
        const rect = canvasRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const ndcX = (x / rect.width) * 2 - 1;
        const ndcY = -(y / rect.height) * 2 + 1;
        const fov = 50 * (Math.PI / 180);
        const cameraDistance = 8;
        const halfHeight = Math.tan(fov / 2) * cameraDistance;
        const aspect = rect.width / rect.height;
        const halfWidth = halfHeight * aspect;
        const worldX = ndcX * halfWidth;
        const worldY = ndcY * halfHeight;
        setCurrentPosition({ x: worldX, y: worldY, z: 0 });
        setIsMoving(true);
        setGlowIntensity(1.2);
    };

    const handleClick = () => {
        if (throwState === 'idle') {
            setThrowStartPosition({ x: currentPosition.x, y: currentPosition.y });
            setThrowState('throwing');
            setThrowProgress(0);
            setGlowIntensity(2.0);
        }
    };

    const handleMouseEnter = () => {
        setIsHovering(true);
        setGlowIntensity(0.8);
    };

    const handleMouseLeave = () => {
        setIsHovering(false);
        setIsMoving(false);
        // Drift gada to the left side instead of snapping to center
        setCurrentPosition({ x: -4, y: 0, z: 0 });
        setGlowIntensity(0.3);
    };

    return (
        <div
            className="interactive-gada-sticky"
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            ref={(el) => { containerRef.current = el; canvasRef.current = el; }}
        >
            <Canvas
                shadows={false}
                dpr={[1, 1.5]}
                performance={{ min: 0.5 }}
                gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
                style={{ background: 'transparent', cursor: 'pointer' }}
                frameloop="always"
            >
                <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />

                {/* Debug Helpers */}
                {showGrid && (
                    <>
                        <axesHelper args={[5]} />
                        <gridHelper args={[10, 10]} />
                    </>
                )}

                {/* Cinematic Star Field */}
                <DynamicStarField
                    currentPosition={currentPosition}
                    throwState={throwState}
                    throwProgress={throwProgress}
                />

                {/* Lighting */}
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} intensity={1.2} color="#FFD700" />
                <pointLight position={[-3, 2, -3]} intensity={0.6} color="#E8383A" />
                <pointLight position={[2, -2, 2]} intensity={0.5} color="#FFA500" />
                <spotLight position={[0, 3, 3]} angle={0.4} penumbra={1} intensity={1.5} color="#FFD700" />

                {/* Particle Trail */}
                <GadaTrail
                    gadaPosition={gadaWorldPosition}
                    throwState={throwState}
                    isMoving={isMoving}
                />

                {/* Gada Model */}
                <Suspense fallback={null}>
                    <GadaModel
                        url={modelPath}
                        currentPosition={currentPosition}
                        isMoving={isMoving}
                        glowIntensity={glowIntensity}
                        throwState={throwState}
                        throwProgress={throwProgress}
                        manualRotation={null}
                        throwStartPosition={throwStartPosition}
                        showGrid={showGrid}
                        gadaWorldPosition={gadaWorldPosition}
                        initialXOffset={initialXOffset}
                        scrollShift={scrollShift}
                        scrollYProgress={scrollYProgress}
                    />
                </Suspense>
            </Canvas>

            {/* Cinematic Top Message */}
            <GadaTopMessage opacity={1} />

            {/* Bottom Hint */}
            <div className="gada-hint">
                Hover to Control • Click to Throw
            </div>

        </div>
    );
};

useGLTF.preload('/gada.glb');
export default InteractiveGada;
