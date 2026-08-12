import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { BlastScene, GadaScene } from './InteractiveGadaV2';
import './ParticleMorphScreen.css';

const CONFIG = {
  particleCount: 7000,
  shapeSize: 14,
  morphDuration: 1.7,
};

const SHAPES = [
  { name: 'Sphere', generator: generateSphere },
  { name: 'Cube', generator: generateCube },
  { name: 'Pyramid', generator: generatePyramid },
  { name: 'Torus', generator: generateTorus },
  { name: 'Galaxy', generator: generateGalaxy },
  { name: 'Gada', generator: generateGada },
  { name: 'Wave', generator: generateWave },
  { name: 'Model', generator: generateSphere }, // placeholder; overridden by uploaded points
];

// Gada is excluded from particle rendering (shows 3D model instead)
// Model IS included — driven by uploaded gadaPointsSource
const PARTICLE_SHAPES = SHAPES.filter((shape) => shape.name !== 'Gada');

export const COLOR_SCHEMES = {
  ember: { label: 'Ember', startHue: 8, endHue: 38, saturation: 1, lightness: 0.62 },
  neon: { label: 'Neon', startHue: 295, endHue: 175, saturation: 1, lightness: 0.67 },
  ocean: { label: 'Ocean', startHue: 195, endHue: 235, saturation: 0.95, lightness: 0.62 },
  aurora: { label: 'Aurora', startHue: 120, endHue: 320, saturation: 0.9, lightness: 0.64 },
  mono: { label: 'Mono', startHue: 0, endHue: 0, saturation: 0, lightness: 0.8 },
};

export const MOTION_PRESETS = {
  calm: { label: 'Calm', swirl: 0.18, jitter: 0.08, spin: 0.08 },
  surge: { label: 'Surge', swirl: 0.55, jitter: 0.22, spin: 0.18 },
  storm: { label: 'Storm', swirl: 0.95, jitter: 0.42, spin: 0.28 },
};

export function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function createStarTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.2, 'rgba(255,255,255,0.85)');
  gradient.addColorStop(0.5, 'rgba(255,255,255,0.3)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

function generateSphere(count, size) {
  const points = new Float32Array(count * 3);
  const phi = Math.PI * (Math.sqrt(5) - 1);

  for (let i = 0; i < count; i += 1) {
    const y = 1 - (i / (count - 1)) * 2;
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = phi * i;
    points[i * 3] = Math.cos(theta) * radius * size;
    points[i * 3 + 1] = y * size;
    points[i * 3 + 2] = Math.sin(theta) * radius * size;
  }

  return points;
}

function generateCube(count, size) {
  const points = new Float32Array(count * 3);
  const halfSize = size / 2;

  for (let i = 0; i < count; i += 1) {
    const face = Math.floor(Math.random() * 6);
    const u = Math.random() * size - halfSize;
    const v = Math.random() * size - halfSize;

    switch (face) {
      case 0:
        points.set([halfSize, u, v], i * 3);
        break;
      case 1:
        points.set([-halfSize, u, v], i * 3);
        break;
      case 2:
        points.set([u, halfSize, v], i * 3);
        break;
      case 3:
        points.set([u, -halfSize, v], i * 3);
        break;
      case 4:
        points.set([u, v, halfSize], i * 3);
        break;
      default:
        points.set([u, v, -halfSize], i * 3);
        break;
    }
  }

  return points;
}

function generatePyramid(count, size) {
  const points = new Float32Array(count * 3);
  const halfBase = size / 2;
  const height = size * 1.2;
  const apex = new THREE.Vector3(0, height / 2, 0);
  const baseVertices = [
    new THREE.Vector3(-halfBase, -height / 2, -halfBase),
    new THREE.Vector3(halfBase, -height / 2, -halfBase),
    new THREE.Vector3(halfBase, -height / 2, halfBase),
    new THREE.Vector3(-halfBase, -height / 2, halfBase),
  ];

  for (let i = 0; i < count; i += 1) {
    const faceIndex = Math.floor(Math.random() * 4);
    const v1 = baseVertices[faceIndex];
    const v2 = baseVertices[(faceIndex + 1) % 4];
    const u = Math.random();
    const v = Math.random();
    const p = new THREE.Vector3().copy(v1).lerp(v2, u).lerp(apex, v);
    points.set([p.x, p.y, p.z], i * 3);
  }

  return points;
}

function generateTorus(count, size) {
  const points = new Float32Array(count * 3);
  const majorRadius = size * 0.7;
  const minorRadius = size * 0.3;

  for (let i = 0; i < count; i += 1) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 2;
    const x = (majorRadius + minorRadius * Math.cos(phi)) * Math.cos(theta);
    const y = minorRadius * Math.sin(phi);
    const z = (majorRadius + minorRadius * Math.cos(phi)) * Math.sin(theta);
    points[i * 3] = x;
    points[i * 3 + 1] = y;
    points[i * 3 + 2] = z;
  }

  return points;
}

export function generateGalaxy(count, size) {
  const points = new Float32Array(count * 3);
  const arms = 4;
  const armWidth = 0.6;

  for (let i = 0; i < count; i += 1) {
    const t = Math.pow(Math.random(), 1.5);
    const radius = t * size;
    const armIndex = Math.floor(Math.random() * arms);
    const armOffset = (armIndex / arms) * Math.PI * 2;
    const rotationAmount = (radius / size) * 6;
    const angle = armOffset + rotationAmount + ((Math.random() - 0.5) * armWidth * (1 - radius / size));
    points[i * 3] = radius * Math.cos(angle);
    points[i * 3 + 1] = (Math.random() - 0.5) * size * 0.08;
    points[i * 3 + 2] = radius * Math.sin(angle);
  }

  return points;
}

function generateWave(count, size) {
  const points = new Float32Array(count * 3);
  const waveScale = size * 0.45;

  for (let i = 0; i < count; i += 1) {
    const u = Math.random() * 2 - 1;
    const v = Math.random() * 2 - 1;
    const x = u * size;
    const z = v * size;
    const dist = Math.sqrt(u * u + v * v);
    const angle = Math.atan2(v, u);
    const y = Math.sin(dist * Math.PI * 3) * Math.cos(angle * 2) * waveScale * (1 - dist);
    points[i * 3] = x;
    points[i * 3 + 1] = y;
    points[i * 3 + 2] = z;
  }

  return points;
}

export function generatePointCloudFromSource(sourcePoints, count, size) {
  const points = new Float32Array(count * 3);
  const sourceCount = Math.max(1, Math.floor(sourcePoints.length / 3));
  const center = new THREE.Vector3();
  const temp = new THREE.Vector3();

  for (let i = 0; i < sourceCount; i += 1) {
    temp.set(sourcePoints[i * 3], sourcePoints[i * 3 + 1], sourcePoints[i * 3 + 2]);
    center.add(temp);
  }

  center.multiplyScalar(1 / sourceCount);

  let maxDistance = 1;
  for (let i = 0; i < sourceCount; i += 1) {
    temp.set(sourcePoints[i * 3], sourcePoints[i * 3 + 1], sourcePoints[i * 3 + 2]);
    maxDistance = Math.max(maxDistance, temp.distanceTo(center));
  }

  const scale = size / maxDistance;

  for (let i = 0; i < count; i += 1) {
    const sourceIndex = Math.floor((i / count) * sourceCount) % sourceCount;
    const x = sourcePoints[sourceIndex * 3];
    const y = sourcePoints[sourceIndex * 3 + 1];
    const z = sourcePoints[sourceIndex * 3 + 2];
    points[i * 3] = (x - center.x) * scale;
    points[i * 3 + 1] = (y - center.y) * scale;
    points[i * 3 + 2] = (z - center.z) * scale;
  }

  return points;
}

function generateGada(count, size) {
  return generatePointCloudFromSource(GADA_POINTS, count, size);
}

export function buildColors(positions, schemeName, shapeSize = CONFIG.shapeSize) {
  const scheme = COLOR_SCHEMES[schemeName];
  const colors = new Float32Array(positions.length);
  const maxRadius = shapeSize * 1.2;
  const center = new THREE.Vector3();
  const temp = new THREE.Vector3();

  for (let i = 0; i < positions.length; i += 3) {
    temp.set(positions[i], positions[i + 1], positions[i + 2]);
    const dist = temp.distanceTo(center);
    const hue = schemeName === 'mono'
      ? 0
      : THREE.MathUtils.mapLinear(dist, 0, maxRadius, scheme.startHue, scheme.endHue);
    const color = new THREE.Color().setHSL(
      (hue % 360) / 360,
      scheme.saturation,
      scheme.lightness,
    );
    colors[i] = color.r;
    colors[i + 1] = color.g;
    colors[i + 2] = color.b;
  }

  return colors;
}

const MODEL_PARTICLE_INDEX = PARTICLE_SHAPES.findIndex((s) => s.name === 'Model');

function ParticleField({ shapeIndex, colorScheme, motionPreset, gadaPointsSource, onReady }) {
  const pointsRef = useRef(null);
  const groupRef = useRef(null);
  const texture = useMemo(() => createStarTexture(), []);
  const targets = useMemo(
    () => PARTICLE_SHAPES.map((shape) => shape.generator(CONFIG.particleCount, CONFIG.shapeSize)),
    [],
  );
  const positionBuffer = useMemo(() => new Float32Array(targets[0]), [targets]);
  const colorBuffer = useMemo(() => buildColors(targets[0], colorScheme), [targets, colorScheme]);
  const sourceBufferRef = useRef(new Float32Array(targets[0]));
  const targetBufferRef = useRef(targets[0]);
  const morphRef = useRef({
    active: false,
    progress: 1,
    startedAt: 0,
    from: new Float32Array(targets[0]),
    to: targets[0],
  });
  const uploadedPointsRef = useRef(null);

  useEffect(() => {
    if (typeof onReady === 'function') {
      onReady();
    }
  }, [onReady]);

  // Generate point cloud from uploaded model whenever source changes
  useEffect(() => {
    if (!gadaPointsSource?.length) return;
    uploadedPointsRef.current = generatePointCloudFromSource(
      gadaPointsSource, CONFIG.particleCount, CONFIG.shapeSize,
    );
  }, [gadaPointsSource]);

  useEffect(() => {
    // When on Model shape, use uploaded points if available; else fall back to placeholder
    const isModel = shapeIndex === MODEL_PARTICLE_INDEX;
    const nextTarget = (isModel && uploadedPointsRef.current)
      ? uploadedPointsRef.current
      : targets[shapeIndex];

    if (!nextTarget) return;

    morphRef.current.active = true;
    morphRef.current.progress = 0;
    morphRef.current.startedAt = performance.now();
    const livePositions = pointsRef.current?.geometry?.attributes?.position?.array || sourceBufferRef.current;
    morphRef.current.from = new Float32Array(livePositions);
    morphRef.current.to = nextTarget;
    targetBufferRef.current = nextTarget;
  }, [shapeIndex, targets, gadaPointsSource]);

  useEffect(() => {
    const livePositions = pointsRef.current?.geometry?.attributes?.position?.array || sourceBufferRef.current;
    const nextColors = buildColors(livePositions, colorScheme);
    if (pointsRef.current) {
      const colorAttr = pointsRef.current.geometry.attributes.color;
      colorAttr.array.set(nextColors);
      colorAttr.needsUpdate = true;
    }
  }, [colorScheme]);

  useFrame((state, delta) => {
    const points = pointsRef.current;
    if (!points) return;

    const geometry = points.geometry;
    const positionAttr = geometry.attributes.position;
    const colorAttr = geometry.attributes.color;
    const positions = positionAttr.array;
    const from = morphRef.current.from;
    const to = morphRef.current.to;
    const motion = MOTION_PRESETS[motionPreset];
    const elapsed = state.clock.getElapsedTime();

    if (morphRef.current.active) {
      morphRef.current.progress = Math.min(1, morphRef.current.progress + (delta / CONFIG.morphDuration));
      const eased = easeInOutCubic(morphRef.current.progress);

      for (let i = 0; i < positions.length; i += 3) {
        const sway = Math.sin(elapsed * 1.2 + i * 0.0017) * motion.jitter;
        const curl = Math.cos(elapsed * 0.9 + i * 0.0021) * motion.jitter;
        positions[i] = THREE.MathUtils.lerp(from[i], to[i], eased) + sway;
        positions[i + 1] = THREE.MathUtils.lerp(from[i + 1], to[i + 1], eased) + curl;
        positions[i + 2] = THREE.MathUtils.lerp(from[i + 2], to[i + 2], eased) + Math.sin(elapsed * 1.1 + i * 0.0011) * motion.jitter;
      }

      if (morphRef.current.progress >= 1) {
        sourceBufferRef.current = new Float32Array(to);
        morphRef.current.from = new Float32Array(to);
        morphRef.current.to = targetBufferRef.current;
        morphRef.current.active = false;
      }
    } else {
      for (let i = 0; i < positions.length; i += 3) {
        const drift = Math.sin(elapsed * 0.65 + i * 0.0013) * motion.swirl;
        const ripple = Math.cos(elapsed * 0.7 + i * 0.0017) * motion.swirl;
        positions[i] = sourceBufferRef.current[i] + drift;
        positions[i + 1] = sourceBufferRef.current[i + 1] + ripple;
        positions[i + 2] = sourceBufferRef.current[i + 2] + Math.sin(elapsed * 0.9 + i * 0.0019) * motion.swirl;
      }
    }

    positionAttr.needsUpdate = true;
    if (colorAttr) colorAttr.needsUpdate = true;

    if (groupRef.current) {
      groupRef.current.rotation.y += delta * motion.spin;
      groupRef.current.rotation.x = Math.sin(elapsed * 0.12) * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positionBuffer, 3]} />
          <bufferAttribute attach="attributes-color" args={[colorBuffer, 3]} />
        </bufferGeometry>
        <pointsMaterial
          map={texture}
          size={0.22}
          sizeAttenuation
          transparent
          depthWrite={false}
          vertexColors
          blending={THREE.AdditiveBlending}
          opacity={0.95}
        />
      </points>
    </group>
  );
}

function Scene({
  shapeIndex,
  backgroundShapeIndex,
  colorScheme,
  motionPreset,
  gadaPointsSource,
  onReady,
  isGadaMode,
  onBlastTrigger,
}) {
  const activeShape = SHAPES[shapeIndex].name;

  return (
    <>
      <ambientLight intensity={1.1} />
      <directionalLight position={[8, 12, 8]} intensity={2.2} color="#ffffff" />
      <pointLight position={[-10, -4, -8]} intensity={1.4} color="#2ec7ff" />
      <pointLight position={[10, 6, 8]} intensity={1.2} color="#ff8a3d" />
      <fog attach="fog" args={['#050608', 18, 85]} />
      <Stars radius={110} depth={55} count={2600} factor={4} saturation={0} fade speed={0.8} />
      <ParticleField
        shapeIndex={backgroundShapeIndex}
        colorScheme={colorScheme}
        motionPreset={motionPreset}
        gadaPointsSource={gadaPointsSource}
        onReady={onReady}
      />
      <OrbitControls
        enabled={!isGadaMode}
        enablePan={false}
        enableZoom={true}
        minDistance={12}
        maxDistance={48}
        autoRotate={!isGadaMode}
        autoRotateSpeed={0.45}
        enableDamping
        dampingFactor={0.05}
      />
      {isGadaMode && (
        <GadaScene
          modelPath="/gada.glb"
          showStarField={false}
          cameraDistance={32}
          modelScale={5.5}
          onBlastTrigger={onBlastTrigger}
        />
      )}
    </>
  );
}

function ParticleMorphScreen({ gadaPointsSource, focusOnGeneratedPoints = true }) {
  const [shapeIndex, setShapeIndex] = useState(0);
  const [colorScheme, setColorScheme] = useState('ember');
  const [motionPreset, setMotionPreset] = useState('surge');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const lastParticleShapeIndexRef = useRef(0);
  const [sceneMode, setSceneMode] = useState('normal');
  const [blastToken, setBlastToken] = useState(0);

  const activeShape = SHAPES[shapeIndex].name;
  const gadaShapeIndex = useMemo(() => SHAPES.findIndex((shape) => shape.name === 'Gada'), []);
  const modelShapeIndex = useMemo(() => SHAPES.findIndex((shape) => shape.name === 'Model'), []);
  const isGadaMode = activeShape === 'Gada';

  // Hide the Model button until a model has been uploaded
  const shapeList = useMemo(
    () => SHAPES.map((shape) => shape.name).filter((name) => name !== 'Model' || gadaPointsSource?.length),
    [gadaPointsSource],
  );

  useEffect(() => {
    let cancelled = false;
    let progress = 0;

    const tick = () => {
      if (cancelled) return;
      progress = Math.min(100, progress + 7);
      setLoadingProgress(progress);
      if (progress < 100) {
        window.setTimeout(tick, 32);
      } else {
        window.setTimeout(() => {
          if (!cancelled) setLoadingComplete(true);
        }, 180);
      }
    };

    tick();

    return () => {
      cancelled = true;
    };
  }, []);

  // When a model is uploaded via Convert, switch to the particle-cloud Model shape
  useEffect(() => {
    if (!gadaPointsSource?.length || modelShapeIndex < 0) return;
    setShapeIndex(modelShapeIndex);
  }, [gadaPointsSource, modelShapeIndex]);

  useEffect(() => {
    if (isGadaMode) {
      setSceneReady(true);
    } else {
      lastParticleShapeIndexRef.current = shapeIndex < gadaShapeIndex ? shapeIndex : shapeIndex - 1;
    }
  }, [gadaShapeIndex, isGadaMode, shapeIndex]);

  useEffect(() => {
    if (sceneMode === 'blast') {
      setSceneReady(true);
    }
  }, [sceneMode]);

  const backgroundShapeIndex = isGadaMode
    ? lastParticleShapeIndexRef.current
    : (shapeIndex < gadaShapeIndex ? shapeIndex : shapeIndex - 1);

  const runShapeTransition = (nextIndex) => {
    if (nextIndex === shapeIndex) return;
    setShapeIndex(nextIndex);
  };

  const handleBlastTrigger = () => {
    setBlastToken((value) => value + 1);
    setSceneMode('blast');
  };

  return (
    <div className="pm-scene">
      <div className={`pm-loading${loadingComplete ? ' pm-loading--hidden' : ''}`} style={{ display: sceneMode === 'blast' ? 'none' : undefined }}>
        <span>Spawning the particle world...</span>
        <div className="pm-loading__bar">
          <div className="pm-loading__fill" style={{ width: `${loadingProgress}%` }} />
        </div>
      </div>

      {sceneMode !== 'blast' && (
        <div className="pm-hud">
        <div className="pm-info">
          <div className="pm-info__title">Shape: {activeShape}</div>
          <div className="pm-info__subtitle">
            Scheme: {COLOR_SCHEMES[colorScheme].label} | Motion: {MOTION_PRESETS[motionPreset].label}
          </div>
        </div>
        </div>
      )}

      {sceneMode !== 'blast' && (
        <div className="pm-controls" id="pm-controls">
        <div className="pm-controls__group">
          <span className="pm-controls__label">Shape</span>
          <div className="pm-pill-row">
            {shapeList.map((name, index) => (
              <button
                key={name}
                type="button"
                className={`pm-pill ${index === shapeIndex ? 'active' : ''}`}
                onClick={() => runShapeTransition(index)}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <div className="pm-controls__group">
          <span className="pm-controls__label">Effects</span>
          <div className="pm-pill-row">
            {Object.entries(MOTION_PRESETS).map(([key, preset]) => (
              <button
                key={key}
                type="button"
                className={`pm-pill ${key === motionPreset ? 'active' : ''}`}
                onClick={() => setMotionPreset(key)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pm-controls__group">
          <span className="pm-controls__label">Glow</span>
          <div className="pm-color-picker">
            {Object.entries(COLOR_SCHEMES).map(([key, scheme]) => (
              <button
                key={key}
                type="button"
                className={`pm-color-option ${colorScheme === key ? 'active' : ''}`}
                aria-label={scheme.label}
                title={scheme.label}
                style={{
                  background: `linear-gradient(135deg, hsl(${scheme.startHue}, 100%, 56%), hsl(${scheme.endHue}, 100%, 64%))`,
                }}
                onClick={() => setColorScheme(key)}
              />
            ))}
          </div>
        </div>
        </div>
      )}

      <div className="pm-canvas-host">
        <Canvas
          dpr={[1, 1.75]}
          camera={{ position: [0, 8, 32], fov: 55 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          onCreated={({ gl }) => {
            gl.setClearColor('#000000', 0);
          }}
        >
          <Suspense fallback={null}>
            {sceneMode === 'blast' ? (
              <BlastScene triggerKey={blastToken} />
            ) : (
              <Scene
                shapeIndex={shapeIndex}
                backgroundShapeIndex={backgroundShapeIndex}
                colorScheme={colorScheme}
                motionPreset={motionPreset}
                gadaPointsSource={gadaPointsSource}
                onReady={() => setSceneReady(true)}
                isGadaMode={isGadaMode}
                onBlastTrigger={handleBlastTrigger}
              />
            )}
          </Suspense>
        </Canvas>
      </div>

      {!sceneReady && !isGadaMode && sceneMode !== 'blast' && (
        <div className="pm-fallback">
          <span>Preparing WebGL scene...</span>
        </div>
      )}
    </div>
  );
}

export default ParticleMorphScreen;
