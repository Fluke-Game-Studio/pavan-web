import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import BlackHoleIntro from '../components/BlackHoleIntro';
import BlackHoleMorphOverlay from '../components/BlackHoleMorphOverlay';
import ParticleMorphScreen from '../components/ParticleMorphScreen';
import PavanTitleModel from '../components/PavanTitleModel';
import PavanScrollShowcase from '../components/PavanScrollShowcase';

import './WebsiteV2Page.css';
import './pavan/PavanTheme.css';
import './pavan/PavanHero.css';

const HORIZONTAL_PANELS = ['hero', 'showcase', 'discover'];

const DISCORD_URL  = 'https://discord.gg/flukegames';
const CAREERS_URL  = 'https://www.flukegamestudio.com/careers';

export default function WebsiteV2Page() {
  const [phase, setPhase]           = useState('blackhole');
  const [morphPhase, setMorphPhase] = useState('collapse');
  const [activePanel, setActivePanel] = useState(0);
  const trackRef       = useRef(null);
  const isScrollingRef = useRef(false);
  const timerRef       = useRef(null);

  const handleBlackholeEnter = useCallback(() => {
    setPhase('morph');
    setMorphPhase('expand');
    timerRef.current = setTimeout(() => setPhase('particle'), 2800);
  }, []);

  const handleEnterSaga = useCallback(() => setPhase('panels'), []);

  // Wheel + keyboard navigation for horizontal panels
  useEffect(() => {
    if (phase !== 'panels') return;

    const onWheel = (e) => {
      if (isScrollingRef.current) return;
      e.preventDefault();
      const dir = e.deltaY > 0 ? 1 : -1;
      setActivePanel((prev) => {
        const next = Math.max(0, Math.min(HORIZONTAL_PANELS.length - 1, prev + dir));
        if (next !== prev) {
          isScrollingRef.current = true;
          setTimeout(() => { isScrollingRef.current = false; }, 900);
        }
        return next;
      });
    };

    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown')
        setActivePanel(p => Math.min(HORIZONTAL_PANELS.length - 1, p + 1));
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp')
        setActivePanel(p => Math.max(0, p - 1));
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
    };
  }, [phase]);

  useEffect(() => {
    if (trackRef.current)
      trackRef.current.style.transform = `translateX(-${activePanel * 100}vw)`;
  }, [activePanel]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <div className="v2-root">

      {/* ── Persistent CTAs on every screen ── */}
      <div className="v2-persistent-btns">
        <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="v2-persist-btn v2-persist-btn--ghost">
          Join Discord
        </a>
        <a href={CAREERS_URL} target="_blank" rel="noreferrer" className="v2-persist-btn v2-persist-btn--gold">
          Work With Us
        </a>
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
          <motion.div
            key="particle"
            className="v2-layer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <ParticleMorphScreen />
            <motion.div
              className="v2-particle-enter"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
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
          <motion.div
            key="panels"
            className="v2-layer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9 }}
          >
            {/* Dot nav */}
            <div className="v2-dots">
              {HORIZONTAL_PANELS.map((name, i) => (
                <button
                  key={name}
                  className={`v2-dot ${i === activePanel ? 'v2-dot--active' : ''}`}
                  onClick={() => setActivePanel(i)}
                  aria-label={name}
                />
              ))}
            </div>

            <div className="v2-track-wrap">
              <div className="v2-track" ref={trackRef}>

                {/* ── PANEL 0: HERO — full width just like v1 ── */}
                <section className="v2-panel pavan-hero">
                  <div className="pavan-hero__gradient" />
                  <div className="pavan-hero__grid-overlay" />

                  <div className="pavan-hero__content container" style={{ width: '100%', maxWidth: '100%', paddingLeft: '6vw' }}>
                    <motion.div
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: activePanel === 0 ? 1 : 0, y: activePanel === 0 ? 0 : 50 }}
                      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <span className="pavan-eyebrow" style={{ position: 'static', border: 'none', background: 'none', padding: 0, fontSize: '0.7rem' }}>
                        A Fluke Games Production
                      </span>

                      <div className="pavan-hero__title-wrapper">
                        <PavanTitleModel modelPath="/titlenew.glb" />
                        <span className="pavan-hero__title-sub">THE PRIMAL SAGA</span>
                      </div>

                      <p className="pavan-hero__tagline">
                        Where divine wrath meets the pulse of the future.
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: activePanel === 0 ? 1 : 0, y: activePanel === 0 ? 0 : 20 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                    >
                      <button className="v2-hero-next" onClick={() => setActivePanel(1)}>
                        Explore the World →
                      </button>
                    </motion.div>
                  </div>

                  <div className="pavan-hero__scroll-hint" onClick={() => setActivePanel(1)} style={{ cursor: 'pointer' }}>
                    <span>SCROLL</span>
                    <div className="pavan-scroll-line" />
                  </div>
                </section>

                {/* ── PANEL 1: WEAPONS · WARRIORS · WORLDS (PavanScrollShowcase) ── */}
                <section className="v2-panel v2-panel--showcase-section">
                  <motion.div
                    className="v2-showcase-wrap"
                    animate={{ opacity: activePanel === 1 ? 1 : 0 }}
                    transition={{ duration: 0.7 }}
                  >
                    <PavanScrollShowcase />
                  </motion.div>
                </section>

                {/* ── PANEL 2: DISCOVER / SHOWCASE ── */}
                <section className="v2-panel v2-panel--discover">
                  <div className="v2-panel-bg v2-panel-bg--discover" />
                  <motion.div
                    className="v2-discover-content"
                    animate={{ opacity: activePanel === 2 ? 1 : 0, scale: activePanel === 2 ? 1 : 0.97 }}
                    transition={{ duration: 0.7 }}
                  >
                    <span className="v2-eyebrow">Witness the Vision</span>
                    <h2 className="v2-discover-title">Studio Showcase</h2>
                    <p className="v2-discover-sub">
                      Cinematic reveals and devlogs from the making of Pavan: The Primal Saga.
                    </p>
                    <div className="v2-showcase-cards">
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
