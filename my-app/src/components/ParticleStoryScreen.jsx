import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { BlastScene, GadaScene } from './InteractiveGadaV2';
import {
  COLOR_SCHEMES,
  MOTION_PRESETS,
  buildColors,
  createStarTexture,
  easeInOutCubic,
  generateGalaxy,
} from './ParticleMorphScreen';
import './ParticleMorphScreen.css';
import './ParticleStoryScreen.css';

export const STORY_CONFIG = {
  particleCount: 25000,
  shapeSize: 14,
  morphDuration: 2.4,
};

// Placeholder narrative beats — copy will be replaced when the lore is written
export const STORY_STAGES = [
  {
    key: 'galaxy',
    title: 'The Cosmos',
    line: 'Before time was counted, there was only the spiral of stars.',
  },
  {
    key: 'gada',
    title: 'The Gada',
    line: 'From the swirling void, a weapon of divine strength took form.',
  },
  {
    key: 'hanuman',
    title: 'Hanuman',
    line: 'And the eternal warrior rose to wield it.',
  },
  {
    key: 'gada-live',
    title: 'The Weapon Awakens',
    line: 'The mace of the primal warrior — made real.',
    hint: 'Hover to control • Click to throw',
  },
];

const CLICK_DRAG_TOLERANCE = 8; // px — beyond this it's an orbit drag, not a click
const LIVE_GADA_STAGE = STORY_STAGES.length - 1;

// Scales its children in from zero so the live gada blends in with the
// particle morph instead of popping into the scene.
function ScaleInGroup({ children, duration = 1.6 }) {
  const ref = useRef(null);
  const startRef = useRef(null);

  useFrame((state) => {
    if (!ref.current) return;
    if (startRef.current === null) startRef.current = state.clock.getElapsedTime();
    const t = Math.min(1, (state.clock.getElapsedTime() - startRef.current) / duration);
    ref.current.scale.setScalar(easeInOutCubic(t));
  });

  return <group ref={ref} scale={0}>{children}</group>;
}

// Glides the camera back to the default front view. Orbit/auto-rotate can leave
// the camera behind the scene, which mirrors the gada's mouse controls.
function CameraRig({ active }) {
  const { camera } = useThree();
  const home = useMemo(() => new THREE.Vector3(0, 0, 32), []);

  useFrame((_, delta) => {
    if (!active) return;
    camera.position.lerp(home, Math.min(1, delta * 2.5));
    camera.up.set(0, 1, 0);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

function StoryParticleField({ target, colorScheme, motionPreset }) {
  const pointsRef = useRef(null);
  const groupRef = useRef(null);
  const texture = useMemo(() => createStarTexture(), []);
  const initial = useMemo(
    () => generateGalaxy(STORY_CONFIG.particleCount, STORY_CONFIG.shapeSize),
    [],
  );
  const positionBuffer = useMemo(() => new Float32Array(initial), [initial]);
  const colorBuffer = useMemo(
    () => buildColors(initial, colorScheme, STORY_CONFIG.shapeSize),
    [initial], // eslint-disable-line react-hooks/exhaustive-deps
  );
  // baseRef holds the clean shape (no drift); drift is a continuous function of
  // time layered on top, so morph start/end never causes a positional jump
  const baseRef = useRef(new Float32Array(initial));
  const morphRef = useRef({
    active: false,
    progress: 1,
    from: new Float32Array(initial),
    to: initial,
  });

  // Morph to the new target whenever the stage changes
  useEffect(() => {
    if (!target || target === morphRef.current.to) return;
    morphRef.current.from = new Float32Array(baseRef.current);
    morphRef.current.to = target;
    morphRef.current.progress = 0;
    morphRef.current.active = true;
  }, [target]);

  useEffect(() => {
    const nextColors = buildColors(baseRef.current, colorScheme, STORY_CONFIG.shapeSize);
    if (pointsRef.current) {
      const colorAttr = pointsRef.current.geometry.attributes.color;
      colorAttr.array.set(nextColors);
      colorAttr.needsUpdate = true;
    }
  }, [colorScheme]);

  useFrame((state, delta) => {
    const points = pointsRef.current;
    if (!points) return;

    const positionAttr = points.geometry.attributes.position;
    const positions = positionAttr.array;
    const { from, to } = morphRef.current;
    const base = baseRef.current;
    const preset = MOTION_PRESETS[motionPreset];
    const elapsed = state.clock.getElapsedTime();

    if (morphRef.current.active) {
      morphRef.current.progress = Math.min(
        1,
        morphRef.current.progress + (delta / STORY_CONFIG.morphDuration),
      );
      const eased = easeInOutCubic(morphRef.current.progress);

      for (let i = 0; i < base.length; i += 3) {
        base[i] = THREE.MathUtils.lerp(from[i], to[i], eased);
        base[i + 1] = THREE.MathUtils.lerp(from[i + 1], to[i + 1], eased);
        base[i + 2] = THREE.MathUtils.lerp(from[i + 2], to[i + 2], eased);
      }

      if (morphRef.current.progress >= 1) {
        morphRef.current.active = false;
      }
    }

    for (let i = 0; i < positions.length; i += 3) {
      positions[i] = base[i] + Math.sin(elapsed * 0.65 + i * 0.0013) * preset.swirl;
      positions[i + 1] = base[i + 1] + Math.cos(elapsed * 0.7 + i * 0.0017) * preset.swirl;
      positions[i + 2] = base[i + 2] + Math.sin(elapsed * 0.9 + i * 0.0019) * preset.swirl;
    }

    positionAttr.needsUpdate = true;

    if (groupRef.current) {
      groupRef.current.rotation.y += delta * preset.spin;
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
          size={0.15}
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

// Minimum time on the blast/title screen before a click can exit — the user
// was just clicking rapidly to trigger it, so absorb the leftover clicks
const BLAST_EXIT_LOCK_MS = 3200;
// Pre-warm the home screen after the blast burst settles, not during it
const WARM_DELAY_MS = 1400;

// Click-driven narrative morph: Galaxy → Gada → Hanuman → live Gada.
// `modelPoints` is { gada, hanuman } Float32Arrays preloaded by the parent.
function ParticleStoryScreen({ modelPoints, onStageChange, onEnterSaga, onExitBegin, heroTitleRect }) {
  const [stage, setStage] = useState(0);
  const [colorScheme, setColorScheme] = useState('ember');
  const [motionPreset, setMotionPreset] = useState('surge');
  const [blastMode, setBlastMode] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [blastToken, setBlastToken] = useState(0);
  const blastStartRef = useRef(0);
  const exitStartedRef = useRef(false);
  const exitTimersRef = useRef([]);
  const pointerStartRef = useRef(null);

  useEffect(() => () => exitTimersRef.current.forEach(clearTimeout), []);

  const targets = useMemo(() => [
    generateGalaxy(STORY_CONFIG.particleCount, STORY_CONFIG.shapeSize),
    modelPoints?.gada || null,
    modelPoints?.hanuman || null,
  ], [modelPoints]);

  const isLiveGada = stage === LIVE_GADA_STAGE;

  // The live gada stage has no particle target — it's always reachable
  const stageAvailable = useCallback(
    (i) => i === LIVE_GADA_STAGE || Boolean(targets[i]),
    [targets],
  );

  const isLastStage = stage === STORY_STAGES.length - 1;
  const nextReady = !isLastStage && stageAvailable(stage + 1);
  const hasPrev = stage > 0;
  const hasNext = stage < LIVE_GADA_STAGE;

  useEffect(() => {
    if (typeof onStageChange === 'function') onStageChange(stage);
  }, [stage, onStageChange]);

  // Step forward/backward, skipping stages whose points failed to load
  const step = useCallback((dir) => {
    setStage((current) => {
      let next = current + dir;
      while (next >= 0 && next < STORY_STAGES.length && !stageAvailable(next)) next += dir;
      if (next < 0 || next >= STORY_STAGES.length || !stageAvailable(next)) return current;
      return next;
    });
  }, [stageAvailable]);

  const advance = useCallback(() => step(1), [step]);

  // Pre-warm the home screen once the blast burst has settled — mounting it
  // during the explosion causes visible jank
  const scheduleWarm = useCallback(() => {
    exitTimersRef.current.push(setTimeout(() => {
      if (typeof onExitBegin === 'function') onExitBegin();
    }, WARM_DELAY_MS));
  }, [onExitBegin]);

  const handleBlastTrigger = useCallback(() => {
    blastStartRef.current = performance.now();
    setBlastToken((value) => value + 1);
    setBlastMode(true);
    scheduleWarm();
  }, [scheduleWarm]);

  // Start the exit: BlastScene homes the camera, zooms the title, then calls
  // onExitComplete → onEnterSaga
  const beginExitZoom = useCallback(() => {
    if (exitStartedRef.current) return;
    exitStartedRef.current = true;
    setExiting(true);
  }, []);

  const handleExitComplete = useCallback(() => {
    if (typeof onEnterSaga === 'function') onEnterSaga();
  }, [onEnterSaga]);

  // Enter the Saga: identical to the 10-click path — blast → title screen,
  // which stays (orbitable) until the user clicks to continue home
  const beginSagaOutro = useCallback(() => {
    if (exitStartedRef.current || blastMode) return;
    handleBlastTrigger();
  }, [blastMode, handleBlastTrigger]);

  const handlePointerDown = (e) => {
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e) => {
    const start = pointerStartRef.current;
    pointerStartRef.current = null;
    if (!start) return;
    const dist = Math.hypot(e.clientX - start.x, e.clientY - start.y);
    if (dist > CLICK_DRAG_TOLERANCE) return;

    if (blastMode) {
      if (performance.now() - blastStartRef.current >= BLAST_EXIT_LOCK_MS) {
        beginExitZoom();
      }
      return;
    }

    advance();
  };

  const activeStage = STORY_STAGES[stage];
  const hideChrome = blastMode;

  return (
    <div className="pm-scene">
      {!hideChrome && (
      <div className="pm-hud">
        <div className="pm-info">
          <div className="pm-info__title">
            Chapter {stage + 1} / {STORY_STAGES.length} — {activeStage.title}
          </div>
          <div className="pm-info__subtitle">
            Scheme: {COLOR_SCHEMES[colorScheme].label} | Motion: {MOTION_PRESETS[motionPreset].label}
          </div>
        </div>
      </div>
      )}

      {blastMode && !exiting && (
        <div className="ps-blast-hint" key={blastToken}>
          Click anywhere to enter the saga ✦
        </div>
      )}

      {isLiveGada && !hideChrome && (
        <motion.div
          className="v2-particle-enter"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.8 }}
        >
          <button className="v2-enter-saga-btn" onClick={beginSagaOutro}>
            Enter the Saga ↓
          </button>
        </motion.div>
      )}

      {!hideChrome && (
      <div className="ps-caption" key={activeStage.key}>
        <h2 className="ps-caption__title">{activeStage.title}</h2>
        <p className="ps-caption__line">{activeStage.line}</p>
        {activeStage.hint ? (
          <span className="ps-caption__hint">{activeStage.hint}</span>
        ) : !isLastStage && (
          <span className={`ps-caption__hint${nextReady ? '' : ' ps-caption__hint--loading'}`}>
            {nextReady ? 'Click to continue ✦' : 'Summoning…'}
          </span>
        )}
      </div>
      )}

      {!hideChrome && (
      <>
      <button
        type="button"
        className="ps-nav ps-nav--left"
        onClick={() => step(-1)}
        disabled={!hasPrev}
        aria-label="Previous chapter"
      >
        <FaChevronLeft />
      </button>
      <button
        type="button"
        className="ps-nav ps-nav--right"
        onClick={() => step(1)}
        disabled={!hasNext}
        aria-label="Next chapter"
      >
        <FaChevronRight />
      </button>
      </>
      )}

      {!hideChrome && (
      <div className="pm-controls ps-controls">
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

      <div
        className="pm-canvas-host"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <Canvas
          dpr={[1, 1.75]}
          camera={{ position: [0, 8, 32], fov: 55 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          onCreated={({ gl }) => {
            gl.setClearColor('#000000', 0);
          }}
        >
          <Suspense fallback={null}>
            {hideChrome ? (
              <BlastScene
                triggerKey={blastToken}
                modelPath="/titlenew.glb"
                exiting={exiting}
                onExitComplete={handleExitComplete}
                titleTarget={heroTitleRect}
              />
            ) : (
              <>
                <ambientLight intensity={1.1} />
                <fog attach="fog" args={['#050608', 18, 85]} />
                <Stars radius={110} depth={55} count={2600} factor={4} saturation={0} fade speed={0.8} />
                {!isLiveGada && (
                  <StoryParticleField
                    target={targets[stage]}
                    colorScheme={colorScheme}
                    motionPreset={motionPreset}
                  />
                )}
                <CameraRig active={isLiveGada} />
                <OrbitControls
                  enabled={!isLiveGada}
                  enablePan={false}
                  enableZoom
                  minDistance={12}
                  maxDistance={48}
                  autoRotate={!isLiveGada}
                  autoRotateSpeed={0.45}
                  enableDamping
                  dampingFactor={0.05}
                />
                {isLiveGada && (
                  <ScaleInGroup>
                    <GadaScene
                      modelPath="/gada.glb"
                      showStarField={false}
                      cameraDistance={32}
                      modelScale={5.5}
                      onBlastTrigger={handleBlastTrigger}
                    />
                  </ScaleInGroup>
                )}
              </>
            )}
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}

export default ParticleStoryScreen;
