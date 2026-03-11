import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, PerspectiveCamera, Center } from '@react-three/drei';

function Model({ url }) {
    const { scene } = useGLTF(url);
    const modelRef = useRef();

    // Optimize model materials
    useEffect(() => {
        if (scene) {
            scene.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = false;
                    child.receiveShadow = false;
                    if (child.material) {
                        child.material.needsUpdate = true;
                    }
                }
            });
        }
    }, [scene]);

    // Auto-rotate the model
    useFrame((state, delta) => {
        if (modelRef.current) {
            modelRef.current.rotation.y += delta * 0.25;
        }
    });

    return (
        <Center>
            <primitive
                ref={modelRef}
                object={scene}
                scale={3.5}
                position={[0, 0, 0]}
            />
        </Center>
    );
}

function Loader() {
    return (
        <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'var(--volt-primary)',
            fontSize: '18px',
            fontFamily: 'Inter, sans-serif'
        }}>
            Loading Hanuman Model...
        </div>
    );
}

const HanumanModel = ({ modelPath = '/assets/ddd/goathumaun.glb' }) => {
    return (
        <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
            <Canvas
                shadows={false}
                dpr={[1, 1.5]}
                performance={{ min: 0.5 }}
                gl={{ 
                    antialias: true,
                    alpha: true,
                    powerPreference: 'high-performance'
                }}
                style={{ background: 'transparent' }}
                frameloop="always"
            >
                <PerspectiveCamera makeDefault position={[0, 0.5, 4]} fov={50} />
                
                {/* Optimized Lighting */}
                <ambientLight intensity={0.6} />
                <directionalLight
                    position={[5, 5, 5]}
                    intensity={1.2}
                />
                <pointLight position={[-5, 3, -5]} intensity={0.4} color="#FFD700" />
                <spotLight
                    position={[0, 8, 2]}
                    angle={0.5}
                    penumbra={1}
                    intensity={0.8}
                    color="#FFF000"
                />

                {/* Model */}
                <Suspense fallback={null}>
                    <Model url={modelPath} />
                    <Environment preset="sunset" background={false} />
                </Suspense>

                {/* Controls */}
                <OrbitControls
                    enableZoom={true}
                    enablePan={false}
                    minDistance={2.5}
                    maxDistance={7}
                    autoRotate={false}
                    enableDamping={true}
                    dampingFactor={0.05}
                />
            </Canvas>
            <Suspense fallback={<Loader />}>
                {null}
            </Suspense>
        </div>
    );
};

// Preload the model
useGLTF.preload('/goathumaun.glb');

export default HanumanModel;
