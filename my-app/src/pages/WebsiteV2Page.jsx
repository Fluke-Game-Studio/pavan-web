import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaYoutube, FaTwitter, FaInstagram, FaLinkedin, FaDiscord, FaShare, FaTimes, FaChevronLeft, FaChevronRight, FaPlay, FaPause, FaExpand, FaCompress } from 'react-icons/fa';

import BlackHoleIntro from '../components/BlackHoleIntro';
import BlackHoleMorphOverlay from '../components/BlackHoleMorphOverlay';
import ParticleMorphScreen from '../components/ParticleMorphScreen';
import PavanTitleModel from '../components/PavanTitleModel';
import PavanScrollShowcase from '../components/PavanScrollShowcase';

import './WebsiteV2Page.css';
import './pavan/PavanTheme.css';
import './pavan/PavanHero.css';

const PANELS = ['hero', 'showcase', 'discover'];
const SHOWCASE_TABS = 3; // Gada, Hanuman, World

const SOCIALS = [
  { icon: FaDiscord,   label: 'Discord',   url: 'https://discord.gg/xDQPgXkj5X' },
  { icon: FaYoutube,   label: 'YouTube',   url: 'https://www.youtube.com/@FlukGames' },
  { icon: FaTwitter,   label: 'X / Twitter', url: 'https://x.com/flukgames' },
  { icon: FaInstagram, label: 'Instagram', url: 'https://www.instagram.com/fluke.games/' },
  { icon: FaLinkedin,  label: 'LinkedIn',  url: 'https://www.linkedin.com/company/fluke-games' },
];

const CAREERS_URL = 'https://www.flukegamestudio.com/careers';

export default function WebsiteV2Page() {
  const [phase, setPhase]               = useState('blackhole');
  const [morphPhase, setMorphPhase]     = useState('collapse');
  const [activePanel, setActivePanel]   = useState(0);
  const [showcaseTab, setShowcaseTab]   = useState(0);
  const [socialsOpen, setSocialsOpen]   = useState(false);
  const trackRef       = useRef(null);
  const isScrollingRef = useRef(false);
  const timerRef       = useRef(null);

  const handleBlackholeEnter = useCallback(() => {
    setPhase('morph');
    setMorphPhase('expand');
    timerRef.current = setTimeout(() => setPhase('particle'), 2800);
  }, []);

  const handleEnterSaga = useCallback(() => setPhase('panels'), []);

  const goTo = useCallback((i) => {
    const next = Math.max(0, Math.min(PANELS.length - 1, i));
    setActivePanel(next);
    if (next !== 1) setShowcaseTab(0); // reset tabs when leaving showcase
  }, []);

  // Wheel navigation — showcase panel does internal tab cycling first
  useEffect(() => {
    if (phase !== 'panels') return;

    const onWheel = (e) => {
      if (isScrollingRef.current) return;
      e.preventDefault();
      const dir = e.deltaY > 0 ? 1 : -1;

      if (activePanel === 1) {
        // On showcase panel: cycle internal tabs first
        const nextTab = showcaseTab + dir;
        if (nextTab >= 0 && nextTab < SHOWCASE_TABS) {
          setShowcaseTab(nextTab);
          isScrollingRef.current = true;
          setTimeout(() => { isScrollingRef.current = false; }, 600);
        } else {
          // Exhausted tabs — move to next/prev panel
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
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goTo(activePanel - 1);
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

      {/* ── TOP RIGHT: Social expand ── */}
      <div className="v2-socials">
        <button
          className={`v2-socials__toggle ${socialsOpen ? 'v2-socials__toggle--open' : ''}`}
          onClick={() => setSocialsOpen(o => !o)}
          aria-label="Social links"
        >
          {socialsOpen ? <FaTimes /> : <FaShare />}
        </button>
        <AnimatePresence>
          {socialsOpen && (
            <motion.div
              className="v2-socials__panel"
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              transition={{ duration: 0.25 }}
            >
              {SOCIALS.map(({ icon: Icon, label, url }) => (
                <a key={label} href={url} target="_blank" rel="noreferrer" className="v2-social-link" title={label}>
                  <Icon />
                  <span>{label}</span>
                </a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
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
            <button
              className="v2-arrow-btn"
              disabled={activePanel === 0}
              onClick={() => goTo(activePanel - 1)}
              aria-label="Previous section"
            >
              <FaChevronLeft />
            </button>
            <div className="v2-dots">
              {PANELS.map((name, i) => (
                <button
                  key={name}
                  className={`v2-dot ${i === activePanel ? 'v2-dot--active' : ''}`}
                  onClick={() => goTo(i)}
                  aria-label={name}
                />
              ))}
            </div>
            <button
              className="v2-arrow-btn"
              disabled={activePanel === PANELS.length - 1}
              onClick={() => goTo(activePanel + 1)}
              aria-label="Next section"
            >
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
            <motion.div className="v2-particle-enter" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.5, duration: 0.8 }}>
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
                  <div className="pavan-hero__scroll-hint" onClick={() => goTo(1)} style={{ cursor: 'pointer' }}>
                    <span>SCROLL</span>
                    <div className="pavan-scroll-line" />
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
                    {/* header */}
                    <div className="v2-discover-header">
                      <span className="v2-eyebrow">Witness the Vision</span>
                      <h2 className="v2-discover-title">Studio Showcase</h2>
                    </div>

                    {/* two-column: video left, cards right */}
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

function VideoPlayer({ src }) {
  const videoRef  = useRef(null);
  const [playing, setPlaying]   = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hovering, setHovering] = useState(false);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else          { v.pause(); setPlaying(false); }
  };

  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setProgress(v.currentTime / v.duration);
  };

  const onLoadedMetadata = () => {
    if (videoRef.current) setDuration(videoRef.current.duration);
  };

  const seek = (e) => {
    const bar = e.currentTarget;
    const ratio = (e.clientX - bar.getBoundingClientRect().left) / bar.offsetWidth;
    const v = videoRef.current;
    if (v) { v.currentTime = ratio * v.duration; setProgress(ratio); }
  };

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={`v2-player ${expanded ? 'v2-player--expanded' : ''}`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="v2-player-badge">
        <div className="v2-pulse" /> Prototype Trailer
      </div>

      <video
        ref={videoRef}
        className="v2-player-video"
        src={src}
        playsInline
        loop
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onClick={toggle}
      />

      {/* Big play overlay when paused */}
      {!playing && (
        <button className="v2-player-overlay-play" onClick={toggle} aria-label="Play">
          <FaPlay />
        </button>
      )}

      {/* Controls — show on hover or when paused */}
      <div className={`v2-player-controls ${hovering || !playing ? 'v2-player-controls--visible' : ''}`}>
        <div className="v2-player-progress" onClick={seek}>
          <div className="v2-player-progress__fill" style={{ width: `${progress * 100}%` }} />
        </div>
        <div className="v2-player-bar">
          <button className="v2-player-btn" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
            {playing ? <FaPause /> : <FaPlay />}
          </button>
          <span className="v2-player-time">
            {fmt(progress * duration)} / {fmt(duration)}
          </span>
          <button
            className="v2-player-btn v2-player-btn--expand"
            onClick={() => setExpanded(e => !e)}
            aria-label={expanded ? 'Shrink' : 'Expand'}
          >
            {expanded ? <FaCompress /> : <FaExpand />}
          </button>
        </div>
      </div>
    </div>
  );
}
