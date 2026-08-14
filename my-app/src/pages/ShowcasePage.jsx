import React from 'react';
import { motion } from 'framer-motion';
import Hero from '../views/Hero';
import Philosophy from '../views/Philosophy';

const ShowcasePage = () => {
    return (
        <div className="showcase-page">
            <Hero />
            <div className="content-sheet">
                <section className="page-hero container section-padding" style={{ paddingBottom: 0 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9 }}
                    >
                        <span className="phi-label">Witness the Vision</span>
                        <h1 className="page-hero__title">Studio Showcase</h1>
                        <p className="page-hero__sub">
                            Explore the core philosophy, cinematic reveals, and the expanding universe of Fluke Games.
                        </p>
                    </motion.div>
                </section>

                <section className="devlog-section container section-padding">
                    <motion.div
                        className="devlog-card"
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="devlog-card__content">
                            <span className="phi-label">Behind the Scenes</span>
                            <h2 className="devlog-title">Development Log</h2>
                            <p className="devlog-sub">
                                Follow our journey as we build Pavan: The Primal Saga. 
                                Updates on mechanics, lore, and art arriving soon.
                            </p>
                            <div className="coming-soon-badge">
                                <div className="pulse-dot" />
                                Coming Soon
                            </div>
                        </div>
                        <div className="devlog-card__bg" />
                    </motion.div>
                </section>
                
                <div className="mythic-line" />
                
                <Philosophy />

                {/* CTA back to Pavan (Home) */}
                <div className="container section-padding">
                    <motion.div
                        className="showcase-cta"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{ textAlign: 'center', marginTop: '4rem' }}
                    >
                        <h2>Experience the Legend</h2>
                        <p>Step into the world of Pavan: The Primal Saga</p>
                        <a href="/" className="btn btn-gold" style={{ display: 'inline-block', marginTop: '1rem' }}>
                            Discover Pavan →
                        </a>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ShowcasePage;
