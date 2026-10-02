import React, { useRef, Suspense, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, ContactShadows } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import { motion, useScroll, useTransform } from 'framer-motion';
import './GadaShowcaseSection.css';

// ─── A single gada model driven by scroll ────────────────────────────────────
// Each instance clones the raw GLB scene so they don't share the same Three.js
// Object3D (which only supports one parent at a time).
function ScrollGada({ url, scale, startX, endX, startY, endY, rotSpeed, glowColor, scrollRef }) {
    const { scene: rawScene } = useGLTF(url);
    const scene = useMemo(() => SkeletonUtils.clone(rawScene), [rawScene]);
    const groupRef = useRef();
    const baseYRef = useRef(startY);

    useEffect(() => {
        scene.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.needsUpdate = true;
            }
        });
    }, [scene]);

    useFrame((_, delta) => {
        if (!groupRef.current) return;

        // Lerp X + base Y to scroll-driven targets
        const t = scrollRef.current;
        const targetX = startX + (endX - startX) * t;
        const targetY = startY + (endY - startY) * t;
        groupRef.current.position.x += (targetX - groupRef.current.position.x) * 0.055;

        // Lerp base Y separately so the float doesn't fight it
        baseYRef.current += (targetY - baseYRef.current) * 0.08;
        // SET y = lerped base + gentle bob (not +=)
        groupRef.current.position.y = baseYRef.current + Math.sin(Date.now() * 0.0009) * 0.15;

        // Continuous slow rotation
        groupRef.current.rotation.y += rotSpeed * delta * 60;
        // Slight tilt based on horizontal position
        groupRef.current.rotation.z = -(groupRef.current.position.x / 18);
    });

    return (
        <group ref={groupRef} position={[startX, startY, 0]}>
            <primitive object={scene} scale={scale} />
            <pointLight position={[0, 2.5, 1]} intensity={2.5} color="#FFD700" distance={6} decay={2} />
            <pointLight position={[1, -1, 2]} intensity={1.5} color={glowColor} distance={4} decay={2} />
        </group>
    );
}

// ─── Canvas wrapper ────────────────────────────────────────────────────────
function DualGadaCanvas({ scrollRef }) {
    return (
        <Canvas
            camera={{ position: [0, 0, 10], fov: 48 }}
            gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
            dpr={[1, 1.5]}
            style={{ width: '100%', height: '100%', background: 'transparent' }}
        >
            <ambientLight intensity={0.7} />
            <directionalLight position={[0, 10, 6]} intensity={1.4} color="#fff8e7" />

            <Suspense fallback={null}>
                {/* Left gada — slides LEFT→RIGHT + DOWN */}
                <ScrollGada
                    url="/gada.glb"
                    scale={2.2}
                    startX={-6}
                    endX={4.5}
                    startY={3}
                    endY={-4}
                    rotSpeed={0.007}
                    glowColor="#FFD700"
                    scrollRef={scrollRef}
                />

                {/* Right gada — slides RIGHT→LEFT + DOWN */}
                <ScrollGada
                    url="/gada.glb"
                    scale={3.5}
                    startX={6}
                    endX={-4.5}
                    startY={3}
                    endY={-4}
                    rotSpeed={0.009}
                    glowColor="#FF9500"
                    scrollRef={scrollRef}
                />

                <ContactShadows
                    position={[0, -3.5, 0]}
                    opacity={0.18}
                    scale={14}
                    blur={3}
                    color="#000"
                />
            </Suspense>
        </Canvas>
    );
}

// ─── Main exported component ──────────────────────────────────────────────────
const GadaShowcaseSection = () => {
    const wrapperRef = useRef();
    // Plain ref shared with the R3F world — no re-renders, just a live 0-1 value
    const scrollRef = useRef(0);

    const { scrollYProgress } = useScroll({
        target: wrapperRef,
        offset: ['start start', 'end end'],
    });

    // Keep scrollRef in sync (runs outside render, no setState)
    useEffect(() => {
        return scrollYProgress.on('change', (v) => { scrollRef.current = v; });
    }, [scrollYProgress]);

    // Text card: fade in early, hold, fade out near the end
    const textOpacity = useTransform(scrollYProgress, [0.08, 0.22, 0.78, 0.92], [0, 1, 1, 0]);
    const textY = useTransform(scrollYProgress, [0.08, 0.22], [28, 0]);

    // Ambient glow intensity hint — CSS variable update via inline style
    const glowOpacity = useTransform(scrollYProgress, [0.1, 0.3, 0.7, 0.9], [0, 1, 1, 0]);

    return (
        // Tall wrapper → sticky inner gives the scroll-driven animation room
        <div className="gss-wrapper" ref={wrapperRef}>
            <div className="gss-sticky">

                {/* Full-screen R3F canvas sits behind everything */}
                <div className="gss-canvas-bg">
                    <DualGadaCanvas scrollRef={scrollRef} />
                </div>

                {/* Ambient radial glow */}
                <motion.div className="gss-ambient" style={{ opacity: glowOpacity }} />

                {/* Center glassmorphism text card */}
                <motion.div
                    className="gss-card"
                    style={{ opacity: textOpacity, y: textY }}
                >
                    <span className="gss-eyebrow">Sacred Weapon</span>
                    <h2 className="gss-title">The Sacred Gada</h2>
                    <p className="gss-subtitle">Weapon of the Divine</p>
                    <p className="gss-body">
                        The mace isn't merely about precision — it's about sheer, overwhelming power,
                        much like Hanuman himself. In the game, the Gada bounces across the battlefield
                        relentlessly targeting enemies within the player's field of view. Its unpredictable
                        motion mirrors Hanuman's own ferocity, ensuring no foe escapes its crushing impact.
                    </p>
                    <span className="gss-tag">WIP — Prototype Phase</span>

                    {/* Scroll hint — only visible before scroll starts */}
                    <motion.span
                        className="gss-scroll-hint"
                        style={{ opacity: useTransform(scrollYProgress, [0, 0.12], [1, 0]) }}
                    >
                        ↓ scroll to see them cross
                    </motion.span>
                </motion.div>

            </div>
        </div>
    );
};

export default GadaShowcaseSection;

useGLTF.preload('/gada.glb');
