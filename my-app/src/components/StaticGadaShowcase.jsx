import React, { Suspense, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import { motion, useInView } from 'framer-motion';
import * as THREE from 'three';

// ─── Static (non-interactive) gada that slides in from right on scroll ───────
function StaticGadaModel({ inView }) {
    const { scene: rawScene } = useGLTF('/gada.glb');
    const scene = useMemo(() => SkeletonUtils.clone(rawScene), [rawScene]);
    const groupRef = useRef();
    const targetXRef = useRef(5); // right viewport edge
    const hasEnteredRef = useRef(false);

    useEffect(() => {
        if (inView && !hasEnteredRef.current) {
            hasEnteredRef.current = true;
            targetXRef.current = -3; // settle on the left side
        }
    }, [inView]);

    useFrame((_, delta) => {
        if (!groupRef.current) return;
        // Fast smooth slide to target X — feels like continuing from canvas 1
        groupRef.current.position.x += (targetXRef.current - groupRef.current.position.x) * 0.08;
        // Gentle float bob
        groupRef.current.position.y = Math.sin(Date.now() * 0.0009) * 0.18;
        // Slow idle Y rotation
        groupRef.current.rotation.y += 0.008 * delta * 60;
        // Slight tilt matching horizontal position
        groupRef.current.rotation.z = -(groupRef.current.position.x / 18);
    });

    return (
        <group ref={groupRef} position={[5, 0, 0]}>
            <primitive object={scene} scale={2.5} />
            <pointLight position={[0, 2.5, 1]} intensity={2.5} color="#FFD700" distance={6} decay={2} />
            <pointLight position={[1, -1, 2]} intensity={1.5} color="#FF9500" distance={4} decay={2} />
        </group>
    );
}

// ─── Exported section ─────────────────────────────────────────────────────────
const StaticGadaShowcase = () => {
    const sectionRef = useRef();
    const isInView = useInView(sectionRef, { once: true, margin: '0px' });

    return (
        <section className="static-gada-section" ref={sectionRef}>

            {/* 3D canvas occupies the left half — pointer-events off so it doesn't intercept page scroll */}
            <div className="static-gada-canvas">
                <Canvas
                    camera={{ position: [0, 0, 8], fov: 50 }}
                    gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
                    dpr={[1, 1.5]}
                    style={{ background: 'transparent', width: '100%', height: '100%' }}
                >
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[5, 5, 5]} intensity={1.2} color="#FFD700" />
                    <pointLight position={[-3, 2, -3]} intensity={0.6} color="#E8383A" />

                    <Suspense fallback={null}>
                        <StaticGadaModel inView={isInView} />
                    </Suspense>
                </Canvas>
            </div>

            {/* Info panel slides in from the right */}
            <motion.div
                className="static-gada-content"
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: isInView ? 1 : 0, x: isInView ? 0 : 60 }}
                transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
                <span className="pavan-eyebrow" style={{ color: '#FFD700' }}>Sacred Weapon</span>
                <h2 className="pavan-info-section__title">The Sacred Gada</h2>
                <p className="pavan-info-section__subtitle">Weapon of the Divine</p>

                <div className="pavan-info-section__body">
                    <p>
                        The mace isn't merely about precision — it's about sheer, overwhelming power, much like
                        Hanuman himself. In the game, the Gada bounces across the battlefield relentlessly
                        targeting enemies within the player's field of view. Its unpredictable motion mirrors
                        Hanuman's own ferocity, ensuring no foe escapes its crushing impact.
                    </p>
                </div>

                <span
                    className="pavan-info-section__tag"
                    style={{ borderColor: 'rgba(255,215,0,0.33)', color: '#FFD700', background: 'rgba(255,215,0,0.06)' }}
                >
                    WIP — Prototype Phase
                </span>

                <div className="gada-specs">
                    <div className="gada-spec-item">
                        <span className="gada-spec-label">Power Level</span>
                        <div className="gada-spec-bar">
                            <motion.div
                                className="gada-spec-fill"
                                initial={{ width: 0 }}
                                animate={{ width: isInView ? '85%' : 0 }}
                                transition={{ duration: 1.2, delay: 0.75 }}
                            />
                        </div>
                    </div>
                    <div className="gada-spec-item">
                        <span className="gada-spec-label">Divine Weight</span>
                        <div className="gada-spec-bar">
                            <motion.div
                                className="gada-spec-fill"
                                initial={{ width: 0 }}
                                animate={{ width: isInView ? '100%' : 0 }}
                                transition={{ duration: 1.4, delay: 0.95 }}
                            />
                        </div>
                    </div>
                </div>
            </motion.div>

        </section>
    );
};

export default StaticGadaShowcase;
