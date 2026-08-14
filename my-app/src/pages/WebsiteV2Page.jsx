import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaYoutube, FaTwitter, FaInstagram, FaLinkedin, FaDiscord,
  FaChevronLeft, FaChevronRight, FaPlay, FaPause, FaExpand, FaCompress, FaTimes,
  FaRedo,
} from 'react-icons/fa';

import BlackHoleIntro from '../components/BlackHoleIntro';
import BlackHoleMorphOverlay from '../components/BlackHoleMorphOverlay';
import ParticleStoryScreen, { STORY_CONFIG } from '../components/ParticleStoryScreen';
import PavanTitleModel from '../components/PavanTitleModel';
import PavanScrollShowcase from '../components/PavanScrollShowcase';
import { loadGlbPoints } from '../utils/glbPointSampler';

import './WebsiteV2Page.css';
import './pavan/PavanTheme.css';
import './pavan/PavanHero.css';

const PANELS        = ['hero', 'showcase', 'discover'];
const SHOWCASE_TABS = 3;
// Trackpad: accumulate delta and only trigger once threshold is passed
const SCROLL_THRESHOLD = 80;

const SOCIALS = [
  { icon: FaDiscord,   label: 'Discord',   url: 'https://discord.gg/xDQPgXkj5X' },
  { icon: FaYoutube,   label: 'YouTube',   url: 'https://www.youtube.com/@FlukGames' },
  { icon: FaTwitter,   label: 'X',         url: 'https://x.com/flukgames' },
  { icon: FaInstagram, label: 'Instagram', url: 'https://www.instagram.com/fluke.games/' },
  { icon: FaLinkedin,  label: 'LinkedIn',  url: 'https://www.linkedin.com/company/fluke-games' },
];

const CAREERS_URL = 'https://www.flukegamestudio.com/careers';

// Hero entrance — the title lands first (settling from a zoom), then the
// other elements cascade in around it. `custom` = per-element delay.
const HERO_CONTAINER = { hidden: {}, show: {} };
const HERO_ITEM = {
  hidden: { opacity: 0, y: 40 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  }),
};
const HERO_TITLE = {
  hidden: { opacity: 0, scale: 1.08 },
  show: { opacity: 1, scale: 1, transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] } },
};

// Chrome (logo / socials / bottom bar) entrance + micro-interactions
const CHROME_SPRING = { type: 'spring', stiffness: 260, damping: 20 };
const SOCIALS_WRAP = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.5 } },
};
const SOCIAL_ICON = {
  hidden: { opacity: 0, y: -18, scale: 0.4 },
  show: { opacity: 1, y: 0, scale: 1, transition: CHROME_SPRING },
};

// Discover panel: header, video, and cards cascade in when the panel activates
const DISCOVER_CONTAINER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};
const DISCOVER_ITEM = {
  hidden: { opacity: 0, y: 36 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};
const DISCOVER_CARD = {
  hidden: { opacity: 0, x: 48 },
  show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

export default function WebsiteV2Page() {
  const [phase, setPhase]             = useState('blackhole');
  const [morphPhase, setMorphPhase]   = useState('collapse');
  const [activePanel, setActivePanel] = useState(0);
  const [showcaseTab, setShowcaseTab] = useState(0);
  const [storyPoints, setStoryPoints] = useState(null);
  // Pre-mounts the panels layer (invisible) during the story outro so the
  // hero 3D title is already rendered when the crossfade lands
  const [panelsWarm, setPanelsWarm]   = useState(false);
  // Measured screen rect of the hero title — the outro zoom targets it exactly
  const [heroTitleRect, setHeroTitleRect] = useState(null);
  const heroTitleRef = useRef(null);
  // Heavy home-screen widgets (SciChart map, showcase canvas, video) mount only
  // after arrival — mounting them during the blast/warm phase janks the explosion
  const [heavyReady, setHeavyReady] = useState(false);

  useEffect(() => {
    if (phase !== 'panels') return undefined;
    const timer = setTimeout(() => setHeavyReady(true), 900);
    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (!panelsWarm) return undefined;
    const timer = setTimeout(() => {
      const el = heroTitleRef.current;
      if (!el) return;
      // Measure the 3D canvas itself, not the wrapper — the wrapper includes
      // the "THE PRIMAL SAGA" text below, which skews the center/height
      const canvasEl = el.querySelector('canvas');
      const r = (canvasEl || el).getBoundingClientRect();
      if (!r.width) return;
      // The hidden hero state is scaled 1.08 — correct back to resting size
      const cx = (r.left + r.width / 2) / window.innerWidth;
      const cy = (r.top + r.height / 2) / window.innerHeight;
      const h = (r.height / 1.08) / window.innerHeight;
      // Discard implausible measurements (e.g. taken while the panel track is
      // translated) — the fallback exit constants are centered and safe
      if (cx < 0.35 || cx > 0.65 || cy < 0.1 || cy > 0.9 || h < 0.05 || h > 0.8) return;
      setHeroTitleRect({ cx, cy, h });
    }, 300);
    return () => clearTimeout(timer);
  }, [panelsWarm]);
  const trackRef        = useRef(null);
  const isScrollingRef  = useRef(false);
  const accDeltaRef     = useRef(0);   // accumulated wheel delta for trackpad
  const timerRef        = useRef(null);

  // Preload story point clouds during the black-hole phase so morphs are instant
  useEffect(() => {
    let cancelled = false;
    const { particleCount, shapeSize } = STORY_CONFIG;

    Promise.allSettled([
      loadGlbPoints('/gada.glb', particleCount, shapeSize),
      loadGlbPoints('/om2.glb', particleCount, shapeSize),
      // detailBias pulls points toward dense geometry (face, hands, ornaments)
      loadGlbPoints('/hanuman.glb', particleCount, shapeSize, { detailBias: 0.6 }),
    ]).then(([gada, om2, hanuman]) => {
      if (cancelled) return;
      if (gada.status === 'rejected') console.error('Failed to sample gada.glb', gada.reason);
      if (om2.status === 'rejected') console.error('Failed to sample om2.glb', om2.reason);
      if (hanuman.status === 'rejected') console.error('Failed to sample hanuman.glb', hanuman.reason);
      setStoryPoints({
        om2: om2.status === 'fulfilled' ? om2.value : null,
        gada: gada.status === 'fulfilled' ? gada.value : null,
        hanuman: hanuman.status === 'fulfilled' ? hanuman.value : null,
      });
    });

    return () => { cancelled = true; };
  }, []);

  const handleBlackholeEnter = useCallback(() => {
    setPhase('morph');
    setMorphPhase('expand');
    timerRef.current = setTimeout(() => setPhase('particle'), 2800);
  }, []);

  const handleEnterSaga = useCallback(() => setPhase('panels'), []);

  // Replay the full narrative from the black hole onward. Story points stay
  // loaded, so the replay is instant.
  const handleReplay = useCallback(() => {
    window.clearTimeout(timerRef.current);
    setPhase('blackhole');
    setMorphPhase('collapse');
    setActivePanel(0);
    setShowcaseTab(0);
    setPanelsWarm(false);
    setHeroTitleRect(null);
    setHeavyReady(false);
  }, []);

  const goTo = useCallback((i) => {
    const next = Math.max(0, Math.min(PANELS.length - 1, i));
    setActivePanel(next);
    if (next !== 1) setShowcaseTab(0);
  }, []);

  // Wheel navigation with trackpad-safe delta accumulation
  useEffect(() => {
    if (phase !== 'panels') return;

    const onWheel = (e) => {
      e.preventDefault();

      if (isScrollingRef.current) {
        accDeltaRef.current = 0;
        return;
      }

      accDeltaRef.current += e.deltaY;
      if (Math.abs(accDeltaRef.current) < SCROLL_THRESHOLD) return;

      const dir = accDeltaRef.current > 0 ? 1 : -1;
      accDeltaRef.current = 0;

      if (activePanel === 1) {
        const nextTab = showcaseTab + dir;
        if (nextTab >= 0 && nextTab < SHOWCASE_TABS) {
          setShowcaseTab(nextTab);
          isScrollingRef.current = true;
          setTimeout(() => { isScrollingRef.current = false; }, 700);
        } else {
          const nextPanel = activePanel + dir;
          if (nextPanel >= 0 && nextPanel < PANELS.length) {
            setActivePanel(nextPanel);
            setShowcaseTab(0);
            isScrollingRef.current = true;
            setTimeout(() => { isScrollingRef.current = false; }, 900);
          }
        }
        return;
      }

      const next = Math.max(0, Math.min(PANELS.length - 1, activePanel + dir));
      if (next !== activePanel) {
        setActivePanel(next);
        isScrollingRef.current = true;
        setTimeout(() => { isScrollingRef.current = false; }, 900);
      }
    };

    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goTo(activePanel + 1);
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   goTo(activePanel - 1);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
    };
  }, [phase, activePanel, showcaseTab, goTo]);

  useEffect(() => {
    if (trackRef.current)
      trackRef.current.style.transform = `translateX(-${activePanel * 100}vw)`;
  }, [activePanel]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const showNav = phase === 'panels';

  return (
    <div className="v2-root">

      {/* ── TOP LEFT: Logo ── */}
      <motion.div
        className="v2-logo"
        initial={{ opacity: 0, x: -28 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ ...CHROME_SPRING, delay: 0.3 }}
      >
        <img src="/logo.png" alt="Fluke Games" className="v2-logo__img" />
      </motion.div>

      {/* ── TOP RIGHT: Social icons (horizontal) ── */}
      <motion.div className="v2-socials" variants={SOCIALS_WRAP} initial="hidden" animate="show">
        {SOCIALS.map(({ icon: Icon, label, url }) => (
          <motion.a
            key={label}
            href={url}
            target="_blank"
            rel="noreferrer"
            className="v2-social-icon"
            title={label}
            variants={SOCIAL_ICON}
            whileHover={{ scale: 1.22, y: -3 }}
            whileTap={{ scale: 0.88 }}
          >
            <Icon />
          </motion.a>
        ))}
      </motion.div>

      {/* ── BOTTOM BAR ── */}
      <div className="v2-bottom-bar">
        <motion.div
          className="v2-bottom-bar__left"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...CHROME_SPRING, delay: 0.7 }}
        >
          <motion.a
            href={CAREERS_URL}
            target="_blank"
            rel="noreferrer"
            className="v2-persist-btn v2-persist-btn--gold"
            whileHover={{ scale: 1.06, y: -2 }}
            whileTap={{ scale: 0.94 }}
          >
            Work With Us
          </motion.a>
        </motion.div>

        {showNav && (
          <motion.div
            className="v2-bottom-bar__center"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...CHROME_SPRING, delay: 0.25 }}
          >
            <motion.button
              className="v2-arrow-btn"
              disabled={activePanel === 0}
              onClick={() => goTo(activePanel - 1)}
              aria-label="Previous"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.85 }}
            >
              <FaChevronLeft />
            </motion.button>
            <div className="v2-dots">
              {PANELS.map((name, i) => (
                <motion.button
                  key={name}
                  className={`v2-dot ${i === activePanel ? 'v2-dot--active' : ''}`}
                  onClick={() => goTo(i)}
                  aria-label={name}
                  whileHover={{ scale: 1.6 }}
                  whileTap={{ scale: 0.8 }}
                />
              ))}
            </div>
            <motion.button
              className="v2-arrow-btn"
              disabled={activePanel === PANELS.length - 1}
              onClick={() => goTo(activePanel + 1)}
              aria-label="Next"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.85 }}
            >
              <FaChevronRight />
            </motion.button>
          </motion.div>
        )}

        <div className="v2-bottom-bar__right">
          {phase === 'panels' && (
            <motion.button
              className="v2-replay-btn"
              onClick={handleReplay}
              title="Replay the intro experience"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...CHROME_SPRING, delay: 1.2 }}
              whileHover={{ scale: 1.06, y: -2 }}
              whileTap={{ scale: 0.94 }}
            >
              <FaRedo /> Replay Intro
            </motion.button>
          )}
        </div>
      </div>

      {/* ── BLACK HOLE ── */}
      <AnimatePresence>
        {phase === 'blackhole' && (
          <motion.div key="blackhole" className="v2-layer" exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
            <BlackHoleIntro onEnter={handleBlackholeEnter} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MORPH OVERLAY ── */}
      {(phase === 'morph' || phase === 'particle') && (
        <div className="v2-layer">
          <BlackHoleMorphOverlay active={true} phase={morphPhase} />
        </div>
      )}

      {/* ── PARTICLE STORY SCREEN (Galaxy → Gada → Hanuman) ── */}
      <AnimatePresence>
        {phase === 'particle' && (
          <motion.div key="particle" className="v2-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}>
            {/* The story screen owns the Enter button + title-zoom outro; it
                calls onEnterSaga once the transition is ready to hand off */}
            <ParticleStoryScreen
              modelPoints={storyPoints}
              onEnterSaga={handleEnterSaga}
              onExitBegin={() => setPanelsWarm(true)}
              heroTitleRect={heroTitleRect}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HORIZONTAL PANELS ── */}
      <AnimatePresence>
        {(phase === 'panels' || panelsWarm) && (
          <motion.div
            key="panels"
            className="v2-layer"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === 'panels' ? 1 : 0 }}
            transition={{ duration: 0.9 }}
            style={{
              // visibility (not just pointer-events) so no descendant can
              // steal drags from the title canvas while pre-warming
              pointerEvents: phase === 'panels' ? 'auto' : 'none',
              visibility: phase === 'panels' ? 'visible' : 'hidden',
            }}
          >
            <div className="v2-track-wrap">
              <div className="v2-track" ref={trackRef}>

                {/* ── PANEL 0: HERO ── */}
                <section className="v2-panel pavan-hero">
                  <div className="pavan-hero__gradient" />
                  <div className="pavan-hero__grid-overlay" />
                  <div className="pavan-hero__content container v2-hero-content">
                    <motion.div
                      variants={HERO_CONTAINER}
                      initial="hidden"
                      animate={phase === 'panels' && activePanel === 0 ? 'show' : 'hidden'}
                    >
                      <motion.span className="v2-eyebrow-inline" variants={HERO_ITEM} custom={0.55}>
                        A Fluke Games Production
                      </motion.span>
                      <motion.div className="pavan-hero__title-wrapper" variants={HERO_TITLE} ref={heroTitleRef}>
                        <PavanTitleModel modelPath="/titlenew.glb" />
                        <span className="pavan-hero__title-sub">THE PRIMAL SAGA</span>
                      </motion.div>
                      <motion.p className="pavan-hero__tagline" variants={HERO_ITEM} custom={0.75}>
                        Where divine wrath meets the pulse of the future.
                      </motion.p>
                    </motion.div>
                  </div>
                </section>

                {/* ── PANEL 1: WEAPONS · WARRIORS · WORLDS ── */}
                <section className="v2-panel v2-panel--showcase-section">
                  <motion.div
                    className="v2-showcase-inner"
                    animate={{
                      opacity: activePanel === 1 ? 1 : 0.25,
                      scale: activePanel === 1 ? 1 : 0.94,
                    }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {heavyReady && (
                      <PavanScrollShowcase activeIndex={showcaseTab} onIndexChange={setShowcaseTab} />
                    )}
                  </motion.div>
                </section>

                {/* ── PANEL 2: STUDIO SHOWCASE ── */}
                <section className="v2-panel v2-panel--discover">
                  <div className="v2-panel-bg--discover" />
                  <motion.div
                    className="v2-discover-content"
                    variants={DISCOVER_CONTAINER}
                    initial="hidden"
                    animate={activePanel === 2 ? 'show' : 'hidden'}
                  >
                    <div className="v2-discover-header">
                      <motion.span className="v2-eyebrow" variants={DISCOVER_ITEM}>Witness the Vision</motion.span>
                      <motion.h2 className="v2-discover-title" variants={DISCOVER_ITEM}>Studio Showcase</motion.h2>
                    </div>
                    <div className="v2-discover-grid">
                      <motion.div variants={DISCOVER_ITEM}>
                        {heavyReady ? <VideoPlayer src="/trailer.mp4" /> : <div className="v2-player" />}
                      </motion.div>
                      <div className="v2-discover-cards">
                        <motion.div
                          className="v2-showcase-card"
                          variants={DISCOVER_CARD}
                          whileHover={{ y: -6, scale: 1.02 }}
                        >
                          <div className="v2-showcase-thumb v2-showcase-thumb--devlog">
                            <div className="v2-coming-soon-tag"><div className="v2-pulse" /> Dev Log — Coming Soon</div>
                          </div>
                          <p className="v2-showcase-label">Behind the Scenes</p>
                        </motion.div>
                        <motion.div
                          className="v2-showcase-card"
                          variants={DISCOVER_CARD}
                          whileHover={{ y: -6, scale: 1.02 }}
                        >
                          <div className="v2-showcase-thumb v2-showcase-thumb--gameplay">
                            <div className="v2-coming-soon-tag"><div className="v2-pulse" /> Gameplay Reveal — Coming Soon</div>
                          </div>
                          <p className="v2-showcase-label">First Look</p>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </section>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── VideoPlayer ──────────────────────────────────────────────────────────────
// Expanded state portals to document.body to escape the CSS transform on
// .v2-track which would otherwise break position:fixed behaviour.
function VideoPlayer({ src }) {
  const videoRef      = useRef(null);
  const portalVideoRef = useRef(null);
  const [playing,  setPlaying]  = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hovering, setHovering] = useState(false);

  const toggle = (ref) => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else          { v.pause(); setPlaying(false); }
  };

  // Sync time between inline and portal video
  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setProgress(v.currentTime / v.duration);
    setDuration(v.duration);
  };

  const seek = (e, ref) => {
    const bar   = e.currentTarget;
    const ratio = (e.clientX - bar.getBoundingClientRect().left) / bar.offsetWidth;
    const v     = ref.current;
    if (v) { v.currentTime = ratio * v.duration; setProgress(ratio); }
  };

  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // When expanding, pause inline and play portal; when collapsing, do the reverse
  const handleExpand = () => {
    if (!expanded) {
      // Going to expand — pause inline first
      if (videoRef.current) videoRef.current.pause();
    }
    setExpanded(e => !e);
  };

  // Sync time on expand/collapse
  useEffect(() => {
    if (expanded && portalVideoRef.current && videoRef.current) {
      portalVideoRef.current.currentTime = videoRef.current.currentTime;
      if (playing) portalVideoRef.current.play();
    }
    if (!expanded && videoRef.current && portalVideoRef.current) {
      videoRef.current.currentTime = portalVideoRef.current.currentTime;
      if (playing) videoRef.current.play();
    }
  }, [expanded]); // eslint-disable-line

  // ESC closes expanded player
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e) => { if (e.key === 'Escape') setExpanded(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [expanded]);

  const Controls = ({ vRef }) => (
    <div className={`v2-player-controls ${hovering || !playing ? 'v2-player-controls--visible' : ''}`}>
      <div className="v2-player-progress" onClick={(e) => seek(e, vRef)}>
        <div className="v2-player-progress__fill" style={{ width: `${progress * 100}%` }} />
      </div>
      <div className="v2-player-bar">
        <button className="v2-player-btn" onClick={() => toggle(vRef)}>
          {playing ? <FaPause /> : <FaPlay />}
        </button>
        <span className="v2-player-time">{fmt(progress * duration)} / {fmt(duration)}</span>
        <button className="v2-player-btn v2-player-btn--expand" onClick={handleExpand}>
          {expanded ? <FaCompress /> : <FaExpand />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Inline player (always rendered so time tracking works) */}
      <div
        className="v2-player"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        style={{ visibility: expanded ? 'hidden' : 'visible' }}
      >
        <div className="v2-player-badge"><div className="v2-pulse" /> Prototype Trailer</div>
        <video
          ref={videoRef}
          className="v2-player-video"
          src={src}
          playsInline
          loop
          onTimeUpdate={onTimeUpdate}
          onClick={() => toggle(videoRef)}
        />
        {!playing && (
          <button className="v2-player-overlay-play" onClick={() => toggle(videoRef)}>
            <FaPlay />
          </button>
        )}
        <Controls vRef={videoRef} />
      </div>

      {/* Expanded overlay — portalled to body to escape CSS transform ancestors */}
      {expanded && createPortal(
        <div
          className="v2-player-portal"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          <div className="v2-player-portal__backdrop" onClick={handleExpand} />
          <div className="v2-player-portal__box">
            <div className="v2-player-badge"><div className="v2-pulse" /> Prototype Trailer</div>
            <video
              ref={portalVideoRef}
              className="v2-player-video"
              src={src}
              playsInline
              loop
              onTimeUpdate={() => {
                const v = portalVideoRef.current;
                if (!v || !v.duration) return;
                setProgress(v.currentTime / v.duration);
                setDuration(v.duration);
              }}
              onClick={() => toggle(portalVideoRef)}
            />
            {!playing && (
              <button className="v2-player-overlay-play" onClick={() => toggle(portalVideoRef)}>
                <FaPlay />
              </button>
            )}
            <Controls vRef={portalVideoRef} />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
