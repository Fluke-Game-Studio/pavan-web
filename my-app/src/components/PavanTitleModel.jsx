import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, PerspectiveCamera, Center } from '@react-three/drei';
import * as THREE from 'three';

function TitleModel({ url, mousePositionRef }) {
    const { scene } = useGLTF(url);
    const modelRef = useRef();

    // Optimize model materials and make V glow
    useEffect(() => {
        if (scene) {
            scene.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = false;
                    child.receiveShadow = false;
                    if (child.material) {
                        // Check if this mesh is the V
                        const meshName = child.name.toLowerCase();
                        if (meshName.includes('v') || meshName.includes('letter') || child.position.x > 0.1) {
                            child.material = child.material.clone();
                            child.material.emissive = new THREE.Color(0xFFD700);
                            child.material.emissiveIntensity = 1.5;
                            child.material.color = new THREE.Color(0xFFFFFF);
                        }
                        child.material.needsUpdate = true;
                    }
                }
            });
        }
    }, [scene]);

    // Subtle movement following mouse position
    useFrame(() => {
        if (modelRef.current && mousePositionRef.current) {
            const targetX = mousePositionRef.current.x * 0.4;
            const targetY = -mousePositionRef.current.y * 0.3;
            
            // Smoothly interpolate rotation based on mouse position
            modelRef.current.rotation.y += (targetX - modelRef.current.rotation.y) * 0.08;
            modelRef.current.rotation.x += (targetY - modelRef.current.rotation.x) * 0.08;
        }
    });

    return (
        <Center>
            <primitive
                ref={modelRef}
                object={scene}
                scale={3.2}
                position={[0, -0.2, 0]}
            />
        </Center>
    );
}

const PavanTitleModel = ({ modelPath = '/titlenew.glb' }) => {
    const mousePosition = useRef({ x: 0, y: 0 });
    const [isScrolled, setIsScrolled] = React.useState(false);

    const handleMouseMove = (event) => {
        if (isScrolled) return; // Don't track mouse if scrolled
        
        const { clientX, clientY, currentTarget } = event;
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        
        // Normalize mouse position to -1 to 1 range
        mousePosition.current = {
            x: ((clientX - left) / width) * 2 - 1,
            y: -((clientY - top) / height) * 2 + 1
        };
    };

    // Track scroll to center the model
    React.useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.scrollY > 50;
            setIsScrolled(scrolled);
            
            // Reset mouse position to center when scrolled
            if (scrolled) {
                mousePosition.current = { x: 0, y: 0 };
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="pavan-title-3d" onMouseMove={handleMouseMove}>
            <div className={`pavan-hero__backdrop ${isScrolled ? 'pavan-hero__backdrop--scrolled' : ''}`}>
                <img src="/hanuman.png" alt="Hanuman Backdrop" className="pavan-hero__backdrop-img" />
                <div className="pavan-hero__backdrop-glow" />
            </div>
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
                <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />

                {/* Lighting setup for dramatic effect */}
                <ambientLight intensity={0.4} />
                <directionalLight
                    position={[5, 5, 5]}
     the                intensity={1.5}
                    color="#FFD700"
                />
                <pointLight position={[-3, 2, -3]} intensity={0.8} color="#E8383A" />
                <pointLight position={[3, -2, 3]} intensity={0.6} color="#FFA500" />
                {/* Extra light to make the V glow */}
                <pointLight position={[0.5, 0, 2]} intensity={2} color="#FFD700" distance={3} />
                <spotLight 
                    position={[0.5, 0, 3]} 
                    angle={0.3} 
                    penumbra={0.5}
                    intensity={3}
                    color="#FFEB3B"
                    target-position={[0.5, 0, 0]}
                />

                {/* Model */}
                <Suspense fallback={null}>
                    <TitleModel url={modelPath} mousePositionRef={mousePosition} />
                </Suspense>
            </Canvas>
        </div>
    );
};

// Preload the model
useGLTF.preload('/titlenew.glb');

export default PavanTitleModel;
