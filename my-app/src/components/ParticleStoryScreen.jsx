import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { BlastScene, GadaScene, BLAST_CLICK_THRESHOLD } from './InteractiveGadaV2';
import {
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
    key: 'om2',
    title: 'OM2',
    line: 'A new form gathers in the wake of the cosmos.',
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

const STORY_STAGE_VISUALS = {
  galaxy: { colorScheme: 'neon' },
  om2: { colorScheme: 'ember' },
  gada: { colorScheme: 'ocean' },
  hanuman: { colorScheme: 'ember' },
  'gada-live': { colorScheme: 'ocean' },
};

const STORY_DEFAULT_MOTION_PRESET = 'calm';
const STORY_COLOR_SWAP_RATIO = 0.5;
const STORY_CONTINUE_FILL_MS = 10000;
const BLAST_HINT_APPEAR_DELAY_MS = 3400;
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

function ContinueCountdownHint({ label, durationMs, onComplete, startDelayMs = 0 }) {
  const [progress, setProgress] = useState(0);
  const frameRef = useRef(null);
  const timeoutRef = useRef(null);
  const completedRef = useRef(false);

  useEffect(() => {
    completedRef.current = false;
    setProgress(0);

    const start = () => {
      const startedAt = performance.now();
      const tick = () => {
        const nextProgress = Math.min(1, (performance.now() - startedAt) / durationMs);
        setProgress(nextProgress);

        if (nextProgress < 1) {
          frameRef.current = window.requestAnimationFrame(tick);
          return;
        }

        if (!completedRef.current) {
          completedRef.current = true;
          if (typeof onComplete === 'function') onComplete();
        }
      };

      frameRef.current = window.requestAnimationFrame(tick);
    };

    timeoutRef.current = window.setTimeout(start, startDelayMs);

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    };
  }, [durationMs, onComplete, startDelayMs]);

  const progressPct = Math.round(progress * 100);
  const fillStyle = {
    backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.98) ${progressPct}%, rgba(255,255,255,0.34) ${progressPct}%, rgba(255,255,255,0.34) 100%)`,
  };

  return (
    <span className="ps-caption__hint ps-caption__hint--countdown">
      <span className="ps-caption__hint-fillText" style={fillStyle}>
        {label}
      </span>
      <span className="ps-caption__hint-bar" aria-hidden="true">
        <span className="ps-caption__hint-barFill" style={{ width: `${progressPct}%` }} />
      </span>
    </span>
  );
}

function StoryParticleField({ target, colorScheme, motionPreset }) {
  const pointsRef = useRef(null);
  const groupRef = useRef(null);
  const texture = useMemo(() => createStarTexture(), []);
  const [displayColorScheme, setDisplayColorScheme] = useState(colorScheme);
  const initial = useMemo(
    () => generateGalaxy(STORY_CONFIG.particleCount, STORY_CONFIG.shapeSize),
    [],
  );
  const positionBuffer = useMemo(() => new Float32Array(initial), [initial]);
  const colorBuffer = useMemo(
    () => buildColors(initial, displayColorScheme, STORY_CONFIG.shapeSize),
    [initial, displayColorScheme],
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
  const pendingColorSchemeRef = useRef(colorScheme);
  const colorSwapAppliedRef = useRef(true);

  // Morph to the new target whenever the stage changes
  useEffect(() => {
    if (!target || target === morphRef.current.to) return;
    morphRef.current.from = new Float32Array(baseRef.current);
    morphRef.current.to = target;
    morphRef.current.progress = 0;
    morphRef.current.active = true;
  }, [target]);

  // Hold the current palette until the morph reaches the midpoint, then swap.
  useEffect(() => {
    pendingColorSchemeRef.current = colorScheme;
    if (!morphRef.current.active || colorScheme === displayColorScheme) {
      colorSwapAppliedRef.current = true;
      if (displayColorScheme !== colorScheme) {
        setDisplayColorScheme(colorScheme);
      }
      return;
    }

    colorSwapAppliedRef.current = false;
  }, [colorScheme, displayColorScheme]);

  useEffect(() => {
    const nextColors = buildColors(baseRef.current, displayColorScheme, STORY_CONFIG.shapeSize);
    if (pointsRef.current) {
      const colorAttr = pointsRef.current.geometry.attributes.color;
      colorAttr.array.set(nextColors);
      colorAttr.needsUpdate = true;
    }
  }, [displayColorScheme]);

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

      if (!colorSwapAppliedRef.current && morphRef.current.progress >= STORY_COLOR_SWAP_RATIO) {
        colorSwapAppliedRef.current = true;
        setDisplayColorScheme(pendingColorSchemeRef.current);
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
      groupRef.current.rotation.y -= delta * preset.spin;
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

// Pre-warm the home screen after the blast burst settles, not during it
const WARM_DELAY_MS = 1400;

// Click-driven narrative morph: Galaxy → OM2 → Gada → Hanuman → live Gada.
// `modelPoints` is { gada, hanuman } Float32Arrays preloaded by the parent.
function ParticleStoryScreen({ modelPoints, onStageChange, onEnterSaga, onExitBegin, heroTitleRect }) {
  const [stage, setStage] = useState(0);
  const [blastMode, setBlastMode] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [blastToken, setBlastToken] = useState(0);
  const [gadaClicks, setGadaClicks] = useState(0);
  const exitStartedRef = useRef(false);
  const exitTimersRef = useRef([]);
  const pointerStartRef = useRef(null);

  useEffect(() => () => exitTimersRef.current.forEach(clearTimeout), []);

  const targets = useMemo(() => [
    generateGalaxy(STORY_CONFIG.particleCount, STORY_CONFIG.shapeSize),
    modelPoints?.om2 || null,
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

  const activeStage = STORY_STAGES[stage];
  const colorScheme = STORY_STAGE_VISUALS[activeStage.key]?.colorScheme || STORY_STAGE_VISUALS.gada.colorScheme;

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

  // Enter the Saga: identical to the 5-click path — blast → title screen,
  // which stays (orbitable) until the timed hand-off begins
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
      return;
    }

    advance();
  };

  const motionPreset = STORY_DEFAULT_MOTION_PRESET;
  const hideChrome = blastMode;
  const handleContinueComplete = useCallback(() => {
    if (blastMode || exiting || isLastStage || !nextReady) return;
    advance();
  }, [advance, blastMode, exiting, isLastStage, nextReady]);

  return (
    <div className="pm-scene">
      {!hideChrome && (
      <div className="pm-hud">
        <div className="pm-info">
          <div className="pm-info__title">
            Chapter {stage + 1} / {STORY_STAGES.length} — {activeStage.title}
          </div>
          {isLiveGada && (
            <div className="pm-info__counter">
              <span className="pm-info__counter-label">Gada Clicks</span>
              <span className="pm-info__counter-value">
                {String(gadaClicks).padStart(2, '0')} / {String(BLAST_CLICK_THRESHOLD).padStart(2, '0')}
              </span>
            </div>
          )}
        </div>
      </div>
      )}

      {blastMode && !exiting && (
        <div className="ps-blast-hint" key={blastToken}>
          <ContinueCountdownHint
            label="Click anywhere to enter the saga ✦"
            durationMs={STORY_CONTINUE_FILL_MS}
            startDelayMs={BLAST_HINT_APPEAR_DELAY_MS}
            onComplete={beginExitZoom}
          />
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
          nextReady ? (
            <ContinueCountdownHint
              label="Click to continue ✦"
              durationMs={STORY_CONTINUE_FILL_MS}
              onComplete={handleContinueComplete}
            />
          ) : (
            <span className="ps-caption__hint ps-caption__hint--loading">Summoning…</span>
          )
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
                      onClickCountChange={setGadaClicks}
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
