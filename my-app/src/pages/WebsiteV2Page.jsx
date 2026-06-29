import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaYoutube, FaTwitter, FaInstagram, FaLinkedin, FaDiscord,
  FaChevronLeft, FaChevronRight, FaPlay, FaPause, FaExpand, FaCompress, FaTimes,
} from 'react-icons/fa';

import BlackHoleIntro from '../components/BlackHoleIntro';
import BlackHoleMorphOverlay from '../components/BlackHoleMorphOverlay';
import ParticleMorphScreen from '../components/ParticleMorphScreen';
import PavanTitleModel from '../components/PavanTitleModel';
import PavanScrollShowcase from '../components/PavanScrollShowcase';

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

export default function WebsiteV2Page() {
  const [phase, setPhase]             = useState('blackhole');
  const [morphPhase, setMorphPhase]   = useState('collapse');
  const [activePanel, setActivePanel] = useState(0);
  const [showcaseTab, setShowcaseTab] = useState(0);
  const trackRef        = useRef(null);
  const isScrollingRef  = useRef(false);
  const accDeltaRef     = useRef(0);   // accumulated wheel delta for trackpad
  const timerRef        = useRef(null);

  const handleBlackholeEnter = useCallback(() => {
    setPhase('morph');
    setMorphPhase('expand');
    timerRef.current = setTimeout(() => setPhase('particle'), 2800);
  }, []);

  const handleEnterSaga = useCallback(() => setPhase('panels'), []);

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
      <div className="v2-logo">
        <img src="/logo.png" alt="Fluke Games" className="v2-logo__img" />
      </div>

      {/* ── TOP RIGHT: Social icons (horizontal) ── */}
      <div className="v2-socials">
        {SOCIALS.map(({ icon: Icon, label, url }) => (
          <a key={label} href={url} target="_blank" rel="noreferrer" className="v2-social-icon" title={label}>
            <Icon />
          </a>
        ))}
      </div>

      {/* ── BOTTOM BAR ── */}
      <div className="v2-bottom-bar">
        <div className="v2-bottom-bar__left">
          <a href={CAREERS_URL} target="_blank" rel="noreferrer" className="v2-persist-btn v2-persist-btn--gold">
            Work With Us
          </a>
        </div>

        {showNav && (
          <div className="v2-bottom-bar__center">
            <button className="v2-arrow-btn" disabled={activePanel === 0} onClick={() => goTo(activePanel - 1)} aria-label="Previous">
              <FaChevronLeft />
            </button>
            <div className="v2-dots">
              {PANELS.map((name, i) => (
                <button key={name} className={`v2-dot ${i === activePanel ? 'v2-dot--active' : ''}`} onClick={() => goTo(i)} aria-label={name} />
              ))}
            </div>
            <button className="v2-arrow-btn" disabled={activePanel === PANELS.length - 1} onClick={() => goTo(activePanel + 1)} aria-label="Next">
              <FaChevronRight />
            </button>
          </div>
        )}

        <div className="v2-bottom-bar__right" />
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

      {/* ── PARTICLE MORPH SCREEN ── */}
      <AnimatePresence>
        {phase === 'particle' && (
          <motion.div key="particle" className="v2-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}>
            <ParticleMorphScreen />
            {/* Centered button — use flex on a full-size container to avoid transform conflict */}
            <motion.div
              className="v2-particle-enter"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5, duration: 0.8 }}
            >
              <button className="v2-enter-saga-btn" onClick={handleEnterSaga}>
                Enter the Saga ↓
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HORIZONTAL PANELS ── */}
      <AnimatePresence>
        {phase === 'panels' && (
          <motion.div key="panels" className="v2-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9 }}>
            <div className="v2-track-wrap">
              <div className="v2-track" ref={trackRef}>

                {/* ── PANEL 0: HERO ── */}
                <section className="v2-panel pavan-hero">
                  <div className="pavan-hero__gradient" />
                  <div className="pavan-hero__grid-overlay" />
                  <div className="pavan-hero__content container v2-hero-content">
                    <motion.div
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: activePanel === 0 ? 1 : 0, y: activePanel === 0 ? 0 : 50 }}
                      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <span className="v2-eyebrow-inline">A Fluke Games Production</span>
                      <div className="pavan-hero__title-wrapper">
                        <PavanTitleModel modelPath="/titlenew.glb" />
                        <span className="pavan-hero__title-sub">THE PRIMAL SAGA</span>
                      </div>
                      <p className="pavan-hero__tagline">
                        Where divine wrath meets the pulse of the future.
                      </p>
                    </motion.div>
                  </div>
                </section>

                {/* ── PANEL 1: WEAPONS · WARRIORS · WORLDS ── */}
                <section className="v2-panel v2-panel--showcase-section">
                  <div className="v2-showcase-inner">
                    <PavanScrollShowcase activeIndex={showcaseTab} onIndexChange={setShowcaseTab} />
                  </div>
                </section>

                {/* ── PANEL 2: STUDIO SHOWCASE ── */}
                <section className="v2-panel v2-panel--discover">
                  <div className="v2-panel-bg--discover" />
                  <motion.div
                    className="v2-discover-content"
                    animate={{ opacity: activePanel === 2 ? 1 : 0 }}
                    transition={{ duration: 0.7 }}
                  >
                    <div className="v2-discover-header">
                      <span className="v2-eyebrow">Witness the Vision</span>
                      <h2 className="v2-discover-title">Studio Showcase</h2>
                    </div>
                    <div className="v2-discover-grid">
                      <VideoPlayer src="/trailer.mp4" />
                      <div className="v2-discover-cards">
                        <div className="v2-showcase-card">
                          <div className="v2-showcase-thumb v2-showcase-thumb--devlog">
                            <div className="v2-coming-soon-tag"><div className="v2-pulse" /> Dev Log — Coming Soon</div>
                          </div>
                          <p className="v2-showcase-label">Behind the Scenes</p>
                        </div>
                        <div className="v2-showcase-card">
                          <div className="v2-showcase-thumb v2-showcase-thumb--gameplay">
                            <div className="v2-coming-soon-tag"><div className="v2-pulse" /> Gameplay Reveal — Coming Soon</div>
                          </div>
                          <p className="v2-showcase-label">First Look</p>
                        </div>
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
