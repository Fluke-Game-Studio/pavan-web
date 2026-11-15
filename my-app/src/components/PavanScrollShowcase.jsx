import React, { useCallback, useRef, Suspense, useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import { TbRotate360, TbZoomInArea } from 'react-icons/tb';
import * as THREE from 'three';
import SciChartMap from './scichart/SciChartMap';
import './PavanScrollShowcase.css';

// ─── Section Data ─────────────────────────────────────────────────────────────
const SECTIONS = [
    {
        id: 'gada',
        tabLabel: '01 Gada',
        eyebrow: 'Sacred Weapon',
        title: 'Sacred Gada',
        subtitle: 'Weapon of the Divine',
        description:
            "Forged from the first breath of the Wind God, the Gada does not merely strike. It descends. When the battle turns desperate, it tears across the field and hunts every foe who dares to stand within the warrior's sight. No path is ever the same twice, for its wrath moves as Hanuman does: wild, relentless, and without mercy.",
        glow: '#FFD700',
        tag: 'WIP: Prototype Phase',
        modelUrl: '/gada.glb',
        scale: 2.5,
        position: [0, -0.6, 0], // Adjusted to be closer to pedestal
        specs: [
            { label: 'Power Level', value: 90 },
            { label: 'Divine Weight', value: 100 },
            { label: 'Range', value: 75 },
        ],
    },
    {
        id: 'hanuman',
        tabLabel: '02 Hanuman',
        eyebrow: 'Hero Character',
        title: 'Lord Hanuman',
        subtitle: 'The Primal Warrior',
        description:
            "Son of the Wind, servant of Rama, the warrior who once crossed an ocean in a single leap and set Lanka ablaze. His fists break armies. His Flight rides the storm of his father, his Divine Leap splits the sky, his Healing Touch raises the fallen, and his Mighty Roar shakes the heavens. His strength has no limit, yet it kneels to devotion alone.",
        glow: '#FF6B35',
        tag: 'WIP: Character Design',
        modelUrl: '/hanuman.glb',
        scale: 2.9, // seated pose: larger than the old standing model so it fills the view
        position: [0, -1.5, 0], // Adjusted to be closer to pedestal
        specs: [
            { label: 'Strength', value: 95 },
            { label: 'Agility', value: 88 },
            { label: 'Devotion', value: 100 },
        ],
    },
    {
        id: 'world',
        tabLabel: '03 World',
        eyebrow: 'Exploration',
        title: 'An Unknown World',
        subtitle: '3D LiDAR Topology Map',
        description: "No map remembers this land. Rivers of silver light wind through valleys older than memory, and the air hums with a quiet that feels almost like a welcome. It is gentle here, and breathtaking, but beauty is only the mask of something wild. Beneath the stillness, the ground shifts and the shadows watch. Only the Wind's son dares to walk it.",
        glow: '#A855F7',
        tag: 'Prototype Build',
        modelUrl: null,
        scale: 1.8,
        position: [0, -0.2, 0], 
        specs: [],
    },
];

const VIEWER_HINTS = [
    { key: 'zoom', label: 'Scroll to zoom in and out', Icon: TbZoomInArea },
    { key: 'rotate', label: 'Click and drag to rotate', Icon: TbRotate360 },
];

// Small, muted bronze badge: a hint, not a call to action
const HINT_ICON_STYLE = {
    width: 30,
    height: 30,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    color: 'rgba(255, 245, 220, 0.85)',
    fontSize: 16,
    border: '1px solid rgba(255, 204, 122, 0.16)',
    background: 'linear-gradient(145deg, #1a1108, #4a2a0f 65%, #a37a33)',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.4)',
};

// ─── Spinning 3D model inside the archive ─────────────────────────────────────
// Prepared (cloned / posed / measured) models, so returning to a tab is instant
const PREPARED_MODELS = new Map();

// `onShown` fires once the model has mounted and had a couple of frames to render,
// letting the parent drop its loading spinner at the right moment.
function ModelViewer({ item, mousePos, onShown }) {
    const { scene: rawScene, animations } = useGLTF(item.modelUrl || '/gada.glb'); // Fallback or handle null below
    // `center` = horizontal (x, z) centre of the posed model in unscaled units. The
    // viewer orbits the camera around the origin, so an off-centre pivot makes the
    // model swing around instead of turning in place.
    const { scene, center } = useMemo(() => {
        if (!item.modelUrl) return { scene: null, center: [0, 0] };
        const cached = PREPARED_MODELS.get(item.id);
        if (cached && cached.raw === rawScene) return cached.value;
        const cloned = SkeletonUtils.clone(rawScene);
        cloned.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material = child.material.clone();
            }
        });
        let centerXZ = [0, 0];
        // Hanuman ships with an authored pose clip; hold it on its last keyframe
        // instead of showing the rig's default T-pose
        if (item.id === 'hanuman') {
            if (animations && animations.length) {
                const mixer = new THREE.AnimationMixer(cloned);
                mixer.clipAction(animations[0]).play();
                mixer.setTime(animations[0].duration);
            }
            // Measure the posed (skinned) bounds, then offset by their centre
            cloned.updateMatrixWorld(true);
            cloned.traverse((child) => {
                if (child.isSkinnedMesh) child.skeleton.update();
            });
            const box = new THREE.Box3().setFromObject(cloned, true);
            if (!box.isEmpty()) {
                const c = box.getCenter(new THREE.Vector3());
                centerXZ = [c.x, c.z];
            }
        }
        const value = { scene: cloned, center: centerXZ };
        PREPARED_MODELS.set(item.id, { raw: rawScene, value });
        return value;
    }, [rawScene, animations, item.modelUrl, item.id]);
    const groupRef = useRef();

    // Counted in useFrame (not a timer) so it only advances while the canvas is
    // really rendering: the first frames are where the GPU texture upload happens
    const shownFramesRef = useRef(0);
    useEffect(() => {
        shownFramesRef.current = 0;
    }, [item.id]);
    useFrame(() => {
        if (!onShown || shownFramesRef.current >= 3) return;
        shownFramesRef.current += 1;
        if (shownFramesRef.current === 3) onShown();
    });

    // Emissive overrides removed to respect original material

    useFrame((state, delta) => {
        if (groupRef.current) {
            // Subtle mouse tilt - Disbled for Hanuman ji as requested
            if (item.id !== 'hanuman') {
                const targetX = mousePos.y * 0.15;
                const targetZ = -mousePos.x * 0.15;
                groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetX, 0.1);
                groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetZ, 0.1);
            } else {
                // Reset rotation for Hanuman if it was tilted previously
                groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 0.1);
                groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, 0.1);
            }
        }
    });

    if (!scene) return null;

    return (
        <group ref={groupRef} position={item.position}>
            {/* Offset puts the model's visual centre on the origin the camera orbits */}
            <group position={[-center[0] * item.scale, 0, -center[1] * item.scale]}>
                <primitive object={scene} scale={item.scale} />
            </group>
            <pointLight position={[0, 2, 1]} intensity={3} color={item.glow} distance={6} decay={2} />
        </group>
    );
}

// ─── Holographic Platform Redesign ──────────────────────────────────────────
function HolographicPlatform({ color }) {
    const ring1Ref = useRef();
    const ring2Ref = useRef();
    const ring3Ref = useRef();

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        
        // Rotating concentric rings
        if (ring1Ref.current) ring1Ref.current.rotation.z = t * 0.4;
        if (ring2Ref.current) ring2Ref.current.rotation.z = -t * 0.25;
        if (ring3Ref.current) ring3Ref.current.rotation.z = t * 0.15;
    });

    return (
        <group position={[0, -1.5, 0]}>
            {/* Base Glowing Disc */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[2.5, 32]} />
                <meshBasicMaterial color={color} transparent opacity={0.05} />
            </mesh>

            {/* Concentric Data Rings */}
            <mesh ref={ring1Ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                <ringGeometry args={[2.1, 2.15, 64]} />
                <meshBasicMaterial color={color} transparent opacity={0.5} />
            </mesh>
            <mesh ref={ring2Ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
                <ringGeometry args={[1.7, 1.75, 48]} />
                <meshBasicMaterial color={color} transparent opacity={0.3} />
            </mesh>
            <mesh ref={ring3Ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.11, 0]}>
                <ringGeometry args={[1.3, 1.35, 32]} />
                <meshBasicMaterial color={color} transparent opacity={0.2} />
            </mesh>

            {/* Inner Core Pulsing Disc */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
                <circleGeometry args={[0.9, 32]} />
                <meshBasicMaterial color={color} transparent opacity={0.6} >
                    {/* Pulsing shader-like effect via prop if we had more time, simple opacity for now */}
                </meshBasicMaterial>
            </mesh>

            {/* Vertical Light Columns (Subtle) */}
            <pointLight position={[0, 1, 0]} intensity={1.5} color={color} distance={4} decay={2} />
        </group>
    );
}

// ─── Particle Burst Effect (Red Spark Explosion) ────────────────────────────
function ParticleBurst({ triggerKey }) {
    const pointsRef = useRef();
    const particles = useRef([]);
    const [visible, setVisible] = useState(false);

    // Using the hero section accent red
    const HERO_RED = '#E8383A';

    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        // 120 particles for a strong blast
        geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(120 * 3), 3));
        geo.setAttribute('opacity', new THREE.BufferAttribute(new Float32Array(120), 1));
        return geo;
    }, []);

    const material = useMemo(() => new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color(HERO_RED) } },
        vertexShader: `
            attribute float opacity;
            varying float vOpacity;
            void main() {
                vOpacity = opacity;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                // Make particles much larger
                gl_PointSize = max(4.0, 30.0 * vOpacity);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying float vOpacity;
            uniform vec3 uColor;
            void main() {
                vec2 uv = gl_PointCoord - vec2(0.5);
                float dist = length(uv);
                if (dist > 0.5) discard;
                // Additive glow falloff
                float alpha = vOpacity * pow(1.0 - dist * 2.0, 1.5);
                gl_FragColor = vec4(uColor, alpha);
            }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    }), []);

    useEffect(() => {
        // Trigger explosion on tab change
        setVisible(true);
        particles.current = Array.from({ length: 120 }).map(() => {
            // Blast outwards in a sphere
            const u = Math.random();
            const v = Math.random();
            const theta = 2 * Math.PI * u;
            const phi = Math.acos(2 * v - 1);

            const dx = Math.sin(phi) * Math.cos(theta);
            const dy = Math.sin(phi) * Math.sin(theta);
            const dz = Math.cos(phi);

            // Fast blast speed
            const velocity = Math.random() * 4 + 2;

            return {
                x: 0,
                y: -0.5, // start slightly below center
                z: 0,
                vx: dx * velocity,
                vy: dy * velocity + 1.0, // bias upwards slightly
                vz: dz * velocity,
                life: 1.0,
                decay: Math.random() * 0.03 + 0.02
            };
        });
    }, [triggerKey]);

    useFrame(() => {
        if (!visible || !pointsRef.current) return;

        let stillAlive = false;
        const posArr = pointsRef.current.geometry.attributes.position.array;
        const opArr = pointsRef.current.geometry.attributes.opacity.array;

        particles.current.forEach((p, i) => {
            if (p.life > 0) {
                stillAlive = true;
                // Move fast, slight friction and gravity
                p.x += p.vx * 0.08;
                p.y += p.vy * 0.08 - 0.02; // gravity
                p.z += p.vz * 0.08;

                // Slow down over time
                p.vx *= 0.95;
                p.vy *= 0.95;
                p.vz *= 0.95;

                p.life -= p.decay;

                posArr[i * 3] = p.x;
                posArr[i * 3 + 1] = p.y;
                posArr[i * 3 + 2] = p.z;
                opArr[i] = Math.max(0, p.life);
            } else {
                opArr[i] = 0;
            }
        });

        pointsRef.current.geometry.attributes.position.needsUpdate = true;
        pointsRef.current.geometry.attributes.opacity.needsUpdate = true;

        if (!stillAlive) setVisible(false);
    });

    if (!visible) return null;
    return <points ref={pointsRef} geometry={geometry} material={material} />;
}


// ─── Spec bar ─────────────────────────────────────────────────────────────────
function SpecBar({ label, value, glow }) {
    return (
        <div className="pss-spec-item">
            <div className="pss-spec-header">
                <span className="pss-spec-label">{label}</span>
                <span className="pss-spec-value" style={{ color: glow }}>{value}%</span>
            </div>
            <div className="pss-spec-track">
                <motion.div
                    className="pss-spec-fill"
                    style={{ background: `linear-gradient(90deg, ${glow}88, ${glow})` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                />
            </div>
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────
// `active` = this panel is the one on screen. When false the WebGL canvas stops
// rendering so it doesn't compete with the hero / other panels for the GPU.
const PavanScrollShowcase = ({ activeIndex: controlledIndex, onIndexChange, active = true } = {}) => {
    const [internalIndex, setInternalIndex] = useState(0);
    const activeIndex = controlledIndex !== undefined ? controlledIndex : internalIndex;
    // The map is very heavy (hundreds of thousands of points + a surface mesh),
    // so it is only created the first time its tab is opened, then kept alive
    const [mapMounted, setMapMounted] = useState(false);
    useEffect(() => {
        if (SECTIONS[activeIndex]?.id === 'world') setMapMounted(true);
    }, [activeIndex]);
    const setActiveIndex = (i) => {
        setInternalIndex(i);
        if (onIndexChange) onIndexChange(i);
    };
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [hintHover, setHintHover] = useState(null); // which hint icon is hovered
    const activeItem = SECTIONS[activeIndex];

    // Switching models blocks the page for a moment (clone + GPU texture upload), so a
    // spinner can't appear mid-switch. Instead: show the spinner first, let it paint,
    // and only then swap the displayed model (`shownIndex` lags `activeIndex`).
    const isModelTab = (i) => SECTIONS[i]?.id !== 'world';
    const [shownIndex, setShownIndex] = useState(() => (isModelTab(activeIndex) ? activeIndex : 0));
    const [modelLoading, setModelLoading] = useState(true);
    const loadStartRef = useRef(performance.now());
    const shownItem = SECTIONS[shownIndex];

    useEffect(() => {
        if (!isModelTab(activeIndex) || activeIndex === shownIndex) return undefined;
        loadStartRef.current = performance.now();
        setModelLoading(true);
        const t = setTimeout(() => setShownIndex(activeIndex), 180);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeIndex]);

    // Model is mounted and rendered: fade the spinner out (kept up at least 500ms so it never flashes)
    const handleModelShown = useCallback(() => {
        const wait = Math.max(0, 500 - (performance.now() - loadStartRef.current));
        setTimeout(() => setModelLoading(false), wait);
    }, []);

    return (
        <section className="pss-section">
            <div className="pss-section__header container">
                <span className="pavan-eyebrow ">The Universe of Pavan</span>
                <h2 className="pss-section__title">Weapons. Warriors. Worlds.</h2>
            </div>

            <div className="pss-container container">
                {/* ── Vertical Tabs Navigation ── */}
                <div className="pss-tabs pss-tabs--vertical">
                    <div className="pss-tabs-track" />
                    {SECTIONS.map((item, i) => (
                        <button
                            key={item.id}
                            className={`pss-tab pss-tab--v ${i === activeIndex ? 'pss-tab--active' : ''}`}
                            onClick={() => setActiveIndex(i)}
                            style={{ '--tab-glow': item.glow }}
                        >
                            {i === activeIndex && (
                                <motion.div
                                    layoutId="activeTabIndicator"
                                    className="pss-tab-active-bar"
                                    style={{ background: item.glow }}
                                />
                            )}
                            <span className="pss-tab-number">0{i + 1}</span>
                            <span className="pss-tab-name">{item.id}</span>
                        </button>
                    ))}
                </div>

                <div className="pss-content-area" style={{ '--active-glow': activeItem.glow }}>
                    {/* ── Background Atmospheric Glow ── */}
                    <motion.div
                        className="pss-bg-atmosphere"
                        animate={{ background: `radial-gradient(circle at 70% 50%, ${activeItem.glow}15, transparent 60%)` }}
                    />

                    {/* ── Left: Text Details (Animated) ── */}
                    <div className="pss-content-text">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeItem.id}
                                className="pss-text-inner"
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }}
                                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <span className="pss-eyebrow" style={{ color: activeItem.glow }}>
                                    {activeItem.eyebrow}
                                </span>
                                <h2 className="pss-title">{activeItem.title}</h2>
                                <p className="pss-subtitle">{activeItem.subtitle}</p>
                                <p className="pss-description">{activeItem.description}</p>

                                <div className="pss-specs">
                                    {activeItem.specs.map((s) => (
                                        <SpecBar key={s.label} label={s.label} value={s.value} glow={activeItem.glow} />
                                    ))}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* ── Right: Standard Model Box with Particles ── */}
                    <div
                        className="pss-content-viewbox"
                        // The viewer owns the mouse wheel (zoom), so the page must not flip panels
                        data-wheel-lock
                        onMouseMove={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setMousePos({
                                x: (e.clientX - rect.left) / rect.width * 2 - 1,
                                y: -((e.clientY - rect.top) / rect.height * 2 - 1)
                            });
                        }}
                    >
                        {/* Interaction hint on all three tabs: always visible and muted;
                            hovering an icon brightens it and shows its hint as text */}
                        <div
                            style={{
                                position: 'absolute',
                                left: '50%',
                                bottom: 14,
                                transform: 'translateX(-50%)',
                                display: 'flex',
                                gap: 10,
                                zIndex: 30,
                            }}
                        >
                            {VIEWER_HINTS.map(({ key, label, Icon }) => (
                                <div
                                    key={key}
                                    style={{ position: 'relative' }}
                                    onPointerEnter={() => setHintHover(key)}
                                    onPointerLeave={() => setHintHover(null)}
                                >
                                    <div
                                        style={{
                                            position: 'absolute',
                                            bottom: 'calc(100% + 8px)',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            whiteSpace: 'nowrap',
                                            padding: '5px 10px',
                                            borderRadius: 999,
                                            fontSize: 11,
                                            letterSpacing: '0.06em',
                                            color: '#fff5dc',
                                            background: 'rgba(20, 12, 6, 0.85)',
                                            border: '1px solid rgba(255, 204, 122, 0.22)',
                                            pointerEvents: 'none',
                                            opacity: hintHover === key ? 1 : 0,
                                            transition: 'opacity 0.2s ease',
                                        }}
                                    >
                                        {label}
                                    </div>
                                    <div
                                        style={{
                                            ...HINT_ICON_STYLE,
                                            opacity: hintHover === key ? 1 : 0.6,
                                            cursor: 'help',
                                            transition: 'opacity 0.2s ease',
                                        }}
                                        aria-label={label}
                                    >
                                        <Icon />
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Render both but toggle visibility to prevent WebGL context loss from unmounting */}
                        <div data-wheel-lock style={{ position: 'absolute', inset: 0, opacity: activeItem.id === 'world' ? 1 : 0, pointerEvents: activeItem.id === 'world' ? 'auto' : 'none', zIndex: activeItem.id === 'world' ? 10 : 1, transition: 'opacity 0.6s ease' }}>
                            {mapMounted && <SciChartMap />}
                        </div>
                        <div style={{ position: 'absolute', inset: 0, opacity: activeItem.id !== 'world' ? 1 : 0, pointerEvents: activeItem.id !== 'world' ? 'auto' : 'none', zIndex: activeItem.id !== 'world' ? 10 : 1, transition: 'opacity 0.6s ease' }}>
                            {/* Always mounted so it can fade; shown from the moment a tab is picked
                                until the new model has rendered its first frames */}
                            <div
                                className="pss-loader pss-loader--overlay pss-loader--fade"
                                style={{
                                    color: activeItem.glow,
                                    opacity: modelLoading && activeItem.id !== 'world' ? 1 : 0,
                                }}
                                aria-hidden={!modelLoading}
                            >
                                <span className="pss-loader__ring" />
                                <span className="pss-loader__text">Summoning…</span>
                            </div>
                            <Canvas
                                camera={{ position: [0, 0, 7], fov: 40 }}
                                dpr={[1, 1.5]}
                                frameloop={active && activeItem.id !== 'world' ? 'always' : 'never'}
                                gl={{ alpha: true, antialias: true }}
                                style={{ width: '100%', height: '100%', background: 'transparent' }}
                            >
                                <ambientLight intensity={0.6} />
                                <directionalLight position={[5, 10, 5]} intensity={1.5} color="#fff" />

                                {/* Red Spark Explosion */}
                                <ParticleBurst triggerKey={activeIndex} />

                                <OrbitControls
                                    enableZoom
                                    minDistance={4}
                                    maxDistance={11}
                                    enablePan={false}
                                    autoRotate
                                    autoRotateSpeed={2}
                                    minPolarAngle={Math.PI / 2.5}
                                    maxPolarAngle={Math.PI / 1.5}
                                />
                                {/* Platform stays on screen while a model loads; only the model
                                    itself suspends and shows the spinner */}
                                <HolographicPlatform color={activeItem.glow} />
                                <AnimatePresence mode="wait">
                                    <motion.group
                                        key={shownItem.id}
                                        initial={{ scale: 0.6, opacity: 0, y: 1 }}
                                        animate={{ scale: 1, opacity: 1, y: 0 }}
                                        exit={{ scale: 0.6, opacity: 0, y: 1 }}
                                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                    >
                                        <Suspense fallback={null}>
                                            <ModelViewer item={shownItem} mousePos={mousePos} onShown={handleModelShown} />
                                        </Suspense>
                                    </motion.group>
                                </AnimatePresence>
                            </Canvas>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PavanScrollShowcase;

useGLTF.preload('/gada.glb');
useGLTF.preload('/hanuman.glb');
