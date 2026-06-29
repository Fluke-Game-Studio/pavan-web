import React, { useCallback, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BlackHoleIntro from '../components/BlackHoleIntro';
import PavanTitleModel from '../components/PavanTitleModel';
import './WebsiteV2Page.css';

const PANELS = ['hero', 'showcase', 'cta'];

const WebsiteV2Page = () => {
  const [narrativeDone, setNarrativeDone] = useState(false);
  const [activePanel, setActivePanel] = useState(0);
  const scrollerRef = useRef(null);
  const isScrollingRef = useRef(false);

  const handleNarrativeEnter = useCallback(() => {
    setTimeout(() => setNarrativeDone(true), 3200);
  }, []);

  // Wheel-based panel navigation
  useEffect(() => {
    if (!narrativeDone) return;

    const onWheel = (e) => {
      if (isScrollingRef.current) return;
      e.preventDefault();

      const dir = e.deltaY > 0 ? 1 : -1;
      setActivePanel((prev) => {
        const next = Math.max(0, Math.min(PANELS.length - 1, prev + dir));
        if (next !== prev) {
          isScrollingRef.current = true;
          setTimeout(() => { isScrollingRef.current = false; }, 900);
        }
        return next;
      });
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [narrativeDone]);

  // Keyboard navigation
  useEffect(() => {
    if (!narrativeDone) return;
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setActivePanel((p) => Math.min(PANELS.length - 1, p + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setActivePanel((p) => Math.max(0, p - 1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [narrativeDone]);

  // Sync scroll position
  useEffect(() => {
    if (!scrollerRef.current) return;
    scrollerRef.current.style.transform = `translateX(-${activePanel * 100}vw)`;
  }, [activePanel]);

  return (
    <div className="v2-root">
      <AnimatePresence>
        {!narrativeDone && (
          <motion.div
            key="narrative"
            className="v2-narrative"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <BlackHoleIntro onEnter={handleNarrativeEnter} />
          </motion.div>
        )}
      </AnimatePresence>

      {narrativeDone && (
        <motion.div
          className="v2-experience"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Panel dots nav */}
          <div className="v2-dots">
            {PANELS.map((_, i) => (
              <button
                key={i}
                className={`v2-dot ${i === activePanel ? 'v2-dot--active' : ''}`}
                onClick={() => setActivePanel(i)}
                aria-label={`Go to panel ${i + 1}`}
              />
            ))}
          </div>

          {/* Horizontal strip */}
          <div className="v2-track-wrap">
            <div className="v2-track" ref={scrollerRef}>

              {/* ── PANEL 1: HERO ── */}
              <section className="v2-panel v2-panel--hero">
                <div className="v2-panel__bg v2-panel__bg--hero" />
                <motion.div
                  className="v2-panel__content"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: activePanel === 0 ? 1 : 0, y: activePanel === 0 ? 0 : 40 }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                >
                  <span className="v2-eyebrow">A Fluke Games Production</span>
                  <div className="v2-hero__model">
                    <PavanTitleModel />
                  </div>
                  <span className="v2-hero__sub">THE PRIMAL SAGA</span>
                  <p className="v2-hero__tagline">
                    Where divine wrath meets the pulse of the future.
                  </p>
                  <button
                    className="v2-hero__next"
                    onClick={() => setActivePanel(1)}
                  >
                    Discover the Saga →
                  </button>
                </motion.div>
                <div className="v2-scroll-hint">
                  <span>SCROLL</span>
                  <div className="v2-scroll-line" />
                </div>
              </section>

              {/* ── PANEL 2: SHOWCASE ── */}
              <section className="v2-panel v2-panel--showcase">
                <div className="v2-panel__bg v2-panel__bg--showcase" />
                <motion.div
                  className="v2-panel__content"
                  initial={{ opacity: 0, x: 60 }}
                  animate={{ opacity: activePanel === 1 ? 1 : 0, x: activePanel === 1 ? 0 : 60 }}
                  transition={{ duration: 0.7, delay: 0.15 }}
                >
                  <span className="v2-eyebrow">Witness the Vision</span>
                  <h2 className="v2-section-title">Studio Showcase</h2>
                  <p className="v2-section-sub">
                    Cinematic reveals and the expanding universe of Pavan: The Primal Saga.
                  </p>

                  <div className="v2-showcase-grid">
                    <div className="v2-showcase-card">
                      <div className="v2-showcase-card__thumb v2-showcase-card__thumb--devlog">
                        <div className="v2-coming-soon">
                          <div className="v2-pulse" />
                          Development Log — Coming Soon
                        </div>
                      </div>
                      <p className="v2-showcase-card__label">Behind the Scenes</p>
                    </div>
                    <div className="v2-showcase-card">
                      <div className="v2-showcase-card__thumb v2-showcase-card__thumb--gameplay">
                        <div className="v2-coming-soon">
                          <div className="v2-pulse" />
                          Gameplay Reveal — Coming Soon
                        </div>
                      </div>
                      <p className="v2-showcase-card__label">First Look</p>
                    </div>
                  </div>

                  <button
                    className="v2-btn v2-btn--ghost"
                    onClick={() => setActivePanel(2)}
                  >
                    Join the Journey →
                  </button>
                </motion.div>
              </section>

              {/* ── PANEL 3: CTA ── */}
              <section className="v2-panel v2-panel--cta">
                <div className="v2-panel__bg v2-panel__bg--cta" />
                <motion.div
                  className="v2-panel__content v2-panel__content--center"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: activePanel === 2 ? 1 : 0, scale: activePanel === 2 ? 1 : 0.95 }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                >
                  <span className="v2-eyebrow">Be Part of the Legend</span>
                  <h2 className="v2-cta-title">Ready to Build<br />Something Eternal?</h2>
                  <p className="v2-cta-sub">
                    We're looking for artists, developers, writers, and composers.<br />
                    No salary. Just legacy.
                  </p>

                  <div className="v2-cta-actions">
                    <a
                      href="https://www.flukegamestudio.com/careers"
                      target="_blank"
                      rel="noreferrer"
                      className="v2-btn v2-btn--gold"
                    >
                      Work With Us
                    </a>
                    <a
                      href="https://discord.gg/flukegames"
                      target="_blank"
                      rel="noreferrer"
                      className="v2-btn v2-btn--ghost"
                    >
                      Join Discord
                    </a>
                  </div>

                  <div className="v2-cta-stats">
                    <div className="v2-stat">
                      <span className="v2-stat__num">∞</span>
                      <span className="v2-stat__label">Branching Choices</span>
                    </div>
                    <div className="v2-stat">
                      <span className="v2-stat__num">7</span>
                      <span className="v2-stat__label">Ancient Pantheons</span>
                    </div>
                    <div className="v2-stat">
                      <span className="v2-stat__num">2050+</span>
                      <span className="v2-stat__label">Lines of Lore</span>
                    </div>
                  </div>
                </motion.div>
              </section>

            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default WebsiteV2Page;
