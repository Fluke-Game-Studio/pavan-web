import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import BlackHoleIntro from '../components/BlackHoleIntro';
import BlackHoleMorphOverlay from '../components/BlackHoleMorphOverlay';
import ParticleMorphScreen from '../components/ParticleMorphScreen';
import PavanTitleModel from '../components/PavanTitleModel';

import './WebsiteV2Page.css';

// ── Narrative phases ──────────────────────────────────────────────────────────
// blackhole → morph → particle → panels
// ─────────────────────────────────────────────────────────────────────────────

const HORIZONTAL_PANELS = ['hero', 'weapons', 'warriors', 'worlds', 'showcase'];

const DISCORD_URL = 'https://discord.gg/flukegames';
const CAREERS_URL = 'https://www.flukegamestudio.com/careers';

export default function WebsiteV2Page() {
  const [phase, setPhase] = useState('blackhole'); // blackhole | morph | particle | panels
  const [morphPhase, setMorphPhase] = useState('collapse');
  const [activePanel, setActivePanel] = useState(0);
  const trackRef = useRef(null);
  const isScrollingRef = useRef(false);
  const timerRef = useRef(null);

  // ── Narrative: blackhole click ──
  const handleBlackholeEnter = useCallback(() => {
    setPhase('morph');
    setMorphPhase('expand');

    timerRef.current = setTimeout(() => {
      setPhase('particle');
    }, 2800);
  }, []);

  // ── Particle screen → panels ──
  const handleEnterSaga = useCallback(() => {
    setPhase('panels');
  }, []);

  // ── Horizontal scroll ──
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
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') setActivePanel(p => Math.min(HORIZONTAL_PANELS.length - 1, p + 1));
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') setActivePanel(p => Math.max(0, p - 1));
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
    };
  }, [phase]);

  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(-${activePanel * 100}vw)`;
    }
  }, [activePanel]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <div className="v2-root">
      {/* ── Persistent CTA buttons (all screens) ── */}
      <div className="v2-persistent-btns">
        <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="v2-persist-btn v2-persist-btn--ghost">
          Join Discord
        </a>
        <a href={CAREERS_URL} target="_blank" rel="noreferrer" className="v2-persist-btn v2-persist-btn--gold">
          Work With Us
        </a>
      </div>

      {/* ── PHASE: BLACKHOLE ── */}
      <AnimatePresence>
        {phase === 'blackhole' && (
          <motion.div
            key="blackhole"
            className="v2-layer"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <BlackHoleIntro onEnter={handleBlackholeEnter} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PHASE: MORPH OVERLAY ── */}
      {(phase === 'morph' || phase === 'particle') && (
        <div className="v2-layer">
          <BlackHoleMorphOverlay active={true} phase={morphPhase} />
        </div>
      )}

      {/* ── PHASE: PARTICLE MORPH SCREEN ── */}
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

            {/* Enter button overlaid on particle screen */}
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

      {/* ── PHASE: HORIZONTAL PANELS ── */}
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

            {/* Panel label */}
            <div className="v2-panel-label">
              {HORIZONTAL_PANELS[activePanel].toUpperCase()}
            </div>

            {/* Horizontal track */}
            <div className="v2-track-wrap">
              <div className="v2-track" ref={trackRef}>

                {/* ── PANEL 0: HERO ── */}
                <section className="v2-panel v2-panel--hero">
                  <div className="v2-hero-bg" />
                  <div className="v2-hero-grid" />
                  <motion.div
                    className="v2-panel__content"
                    animate={{ opacity: activePanel === 0 ? 1 : 0, y: activePanel === 0 ? 0 : 30 }}
                    transition={{ duration: 0.7 }}
                  >
                    <span className="v2-eyebrow">A Fluke Games Production</span>
                    <div className="v2-title-model">
                      <PavanTitleModel modelPath="/titlenew.glb" />
                    </div>
                    <span className="v2-title-sub">THE PRIMAL SAGA</span>
                    <p className="v2-hero-tagline">
                      Where divine wrath meets the pulse of the future.
                    </p>
                    <button className="v2-hero-next" onClick={() => setActivePanel(1)}>
                      Explore the World →
                    </button>
                  </motion.div>
                  <ScrollHint />
                </section>

                {/* ── PANEL 1: WEAPONS ── */}
                <section className="v2-panel v2-panel--weapons">
                  <div className="v2-panel-bg v2-panel-bg--weapons" />
                  <motion.div
                    className="v2-panel__content"
                    animate={{ opacity: activePanel === 1 ? 1 : 0, x: activePanel === 1 ? 0 : 40 }}
                    transition={{ duration: 0.7 }}
                  >
                    <span className="v2-eyebrow">Arsenal of the Gods</span>
                    <h2 className="v2-panel-title">Weapons</h2>
                    <p className="v2-panel-sub">
                      Forged in celestial fire and tempered by ancient rites —
                      each weapon carries the memory of a thousand battles.
                    </p>
                    <div className="v2-coming-grid">
                      {['Gada', 'Trishul', 'Chakra', 'Khadga'].map((w) => (
                        <div key={w} className="v2-coming-card">
                          <div className="v2-coming-card__icon">⚔</div>
                          <span>{w}</span>
                          <div className="v2-coming-soon-tag">
                            <div className="v2-pulse" /> Coming Soon
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </section>

                {/* ── PANEL 2: WARRIORS ── */}
                <section className="v2-panel v2-panel--warriors">
                  <div className="v2-panel-bg v2-panel-bg--warriors" />
                  <motion.div
                    className="v2-panel__content"
                    animate={{ opacity: activePanel === 2 ? 1 : 0, x: activePanel === 2 ? 0 : 40 }}
                    transition={{ duration: 0.7 }}
                  >
                    <span className="v2-eyebrow">Legends of the Realm</span>
                    <h2 className="v2-panel-title">Warriors</h2>
                    <p className="v2-panel-sub">
                      Demigods, rebels, and ancient protectors — every warrior
                      carries a destiny written before time began.
                    </p>
                    <div className="v2-coming-grid">
                      {['Pavan', 'Yodha', 'Devi', 'Rakshasa'].map((w) => (
                        <div key={w} className="v2-coming-card">
                          <div className="v2-coming-card__icon">⚡</div>
                          <span>{w}</span>
                          <div className="v2-coming-soon-tag">
                            <div className="v2-pulse" /> Coming Soon
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </section>

                {/* ── PANEL 3: WORLDS ── */}
                <section className="v2-panel v2-panel--worlds">
                  <div className="v2-panel-bg v2-panel-bg--worlds" />
                  <motion.div
                    className="v2-panel__content"
                    animate={{ opacity: activePanel === 3 ? 1 : 0, x: activePanel === 3 ? 0 : 40 }}
                    transition={{ duration: 0.7 }}
                  >
                    <span className="v2-eyebrow">The Fractured Realm</span>
                    <h2 className="v2-panel-title">Worlds</h2>
                    <p className="v2-panel-sub">
                      Ancient temples and neon megacities coexist in a realm
                      where mythology was uploaded and something older awoke.
                    </p>
                    <div className="v2-coming-grid">
                      {['Svarga Loka', 'Neon Kashi', 'Pataal Net', 'The Rift'].map((w) => (
                        <div key={w} className="v2-coming-card">
                          <div className="v2-coming-card__icon">🌐</div>
                          <span>{w}</span>
                          <div className="v2-coming-soon-tag">
                            <div className="v2-pulse" /> Coming Soon
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </section>

                {/* ── PANEL 4: SHOWCASE ── */}
                <section className="v2-panel v2-panel--showcase">
                  <div className="v2-panel-bg v2-panel-bg--showcase" />
                  <motion.div
                    className="v2-panel__content v2-panel__content--center"
                    animate={{ opacity: activePanel === 4 ? 1 : 0, scale: activePanel === 4 ? 1 : 0.97 }}
                    transition={{ duration: 0.7 }}
                  >
                    <span className="v2-eyebrow">Witness the Vision</span>
                    <h2 className="v2-panel-title">Studio Showcase</h2>
                    <p className="v2-panel-sub" style={{ maxWidth: 500, margin: '0 auto 2.5rem' }}>
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

function ScrollHint() {
  return (
    <div className="v2-scroll-hint">
      <span>SCROLL</span>
      <div className="v2-scroll-line" />
    </div>
  );
}
