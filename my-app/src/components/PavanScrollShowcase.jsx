import React, { useRef, Suspense, useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import * as THREE from 'three';
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
            "The mace isn't merely about precision — it's about sheer, overwhelming power. In the game, the Gada bounces across the battlefield relentlessly targeting enemies within the player's field of view. Its unpredictable motion mirrors Hanuman's own ferocity.",
        glow: '#FFD700',
        tag: 'WIP — Prototype Phase',
        modelUrl: '/gada.glb',
        scale: 2.5,
        position: [0, -0.2, 0], // Sat lower to be on pedestal
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
            'A dynamic and powerful hero blending immense strength, agility, and devotion. His abilities include devastating melee attacks, divine movement via Flight and Divine Leap, and support powers like Healing Touch and Mighty Roar.',
        glow: '#FF6B35',
        tag: 'WIP — Character Design',
        modelUrl: '/hanuman.glb',
        scale: 1.4,
        position: [0, -1.8, 0], // Sat lower to be "just on top" of pedestal
        specs: [
            { label: 'Strength', value: 95 },
            { label: 'Agility', value: 88 },
            { label: 'Devotion', value: 100 },
        ],
    },
    {
        id: 'world',
        tabLabel: '03 World',
        eyebrow: 'The World',
        title: 'World of Pavan',
        subtitle: 'Myth Meets the Future',
        description:
            "In a world plagued by corruption, a powerful force stirs from ancient myth. The timeless values of faith, courage, and truth become the cornerstone of the journey. Lord Hanuman's legend was uploaded to escape death — and summoned something older.",
        glow: '#A855F7',
        tag: 'Narrative — Lore Fragment',
        modelUrl: '/gada.glb',
        scale: 1.8,
        position: [0, -0.2, 0], // Adjusted to sit on pedestal
        specs: [
            { label: 'Lore Depth', value: 85 },
            { label: 'Mythology', value: 100 },
            { label: 'Atmosphere', value: 92 },
        ],
    },
];

// ─── Spinning 3D model inside the archive ─────────────────────────────────────
function ModelViewer({ item, mousePos }) {
    const { scene: rawScene } = useGLTF(item.modelUrl);
    const scene = useMemo(() => SkeletonUtils.clone(rawScene), [rawScene]);
    const groupRef = useRef();

    useEffect(() => {
        const color = new THREE.Color(item.glow);
        scene.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.emissive = color;
                child.material.emissiveIntensity = 0.3;
                child.material.needsUpdate = true;
            }
        });
    }, [scene, item.glow]);

    useFrame((state, delta) => {
        if (groupRef.current) {
            // Constant rotation
            groupRef.current.rotation.y += delta * 0.4;

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

    return (
        <group ref={groupRef} position={item.position}>
            <primitive object={scene} scale={item.scale} />
            <pointLight position={[0, 2, 1]} intensity={3} color={item.glow} distance={6} decay={2} />
        </group>
    );
}

// ─── Holographic Pedestal ─────────────────────────────────────────────────────
function Pedestal({ color }) {
    const ringRef = useRef();
    const glowRef = useRef();

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (ringRef.current) {
            ringRef.current.rotation.z = t * 0.2;
            ringRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.05);
        }
    });

    return (
        <group position={[0, -2.4, 0]}>
            {/* The Main Base */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[2.2, 32]} />
                <meshBasicMaterial color={color} transparent opacity={0.1} />
            </mesh>

            {/* Floating Ring Overlay */}
            <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                <ringGeometry args={[2.0, 2.1, 64]} />
                <meshBasicMaterial color={color} transparent opacity={0.4} />
            </mesh>

            {/* Core Floor Glow */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
                <circleGeometry args={[0.8, 32]} />
                <meshBasicMaterial color={color} transparent opacity={0.8} />
            </mesh>
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
const PavanScrollShowcase = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const activeItem = SECTIONS[activeIndex];

    return (
        <section className="pss-section">
            <div className="pss-section__header container">
                <span className="pavan-eyebrow">The Universe of Pavan</span>
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
                            style={{
                                '--tab-glow': item.glow,
                                borderColor: i === activeIndex ? item.glow : 'rgba(255,255,255,0.05)',
                                color: i === activeIndex ? item.glow : 'rgba(255,255,255,0.3)',
                            }}
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
                        onMouseMove={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setMousePos({
                                x: (e.clientX - rect.left) / rect.width * 2 - 1,
                                y: -((e.clientY - rect.top) / rect.height * 2 - 1)
                            });
                        }}
                    >
                        <Canvas
                            camera={{ position: [0, 0, 7], fov: 40 }}
                            gl={{ alpha: true, antialias: true }}
                            style={{ width: '100%', height: '100%', background: 'transparent' }}
                        >
                            <ambientLight intensity={0.6} />
                            <directionalLight position={[5, 10, 5]} intensity={1.5} color="#fff" />

                            {/* Red Spark Explosion */}
                            <ParticleBurst triggerKey={activeIndex} />

                            <Suspense fallback={null}>
                                <Pedestal color={activeItem.glow} />
                                <AnimatePresence mode="wait">
                                    <motion.group
                                        key={activeItem.id}
                                        initial={{ scale: 0.6, opacity: 0, y: 1 }}
                                        animate={{ scale: 1, opacity: 1, y: 0 }}
                                        exit={{ scale: 0.6, opacity: 0, y: 1 }}
                                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                    >
                                        <ModelViewer item={activeItem} mousePos={mousePos} />
                                    </motion.group>
                                </AnimatePresence>
                            </Suspense>
                        </Canvas>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PavanScrollShowcase;

useGLTF.preload('/gada.glb');
useGLTF.preload('/hanuman.glb');
