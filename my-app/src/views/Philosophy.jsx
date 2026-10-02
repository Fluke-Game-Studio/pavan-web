import React from 'react';
import { motion } from 'framer-motion';

const Philosophy = () => {
    return (
        <section className="philosophy section-padding">
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    viewport={{ once: true }}
                    className="philosophy-content"
                >
                    <span className="phi-label">The Fluke Doctrine</span>
                    <h2 className="phi-text">
                        Crafting the <span className="volt-glow">New Myths</span> of the Digital Age
                    </h2>
                    <p className="phi-subtitle">
                        Where boundary-pushing technology meets timeless storytelling.
                    </p>
                </motion.div>

                {/* Mission Pillars */}
                <div className="mission-pillars">
                    <motion.div
                        className="mission-pillar"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <div className="mission-pillar__number">01</div>
                        <h3 className="mission-pillar__title">Authentic Mythology</h3>
                        <p className="mission-pillar__text">
                            We honor the depth and richness of South Asian mythology, crafting narratives 
                            that respect cultural heritage while reimagining it for modern audiences.
                        </p>
                    </motion.div>

                    <motion.div
                        className="mission-pillar"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <div className="mission-pillar__number">02</div>
                        <h3 className="mission-pillar__title">Player-First Design</h3>
                        <p className="mission-pillar__text">
                            No microtransactions. No pay-to-win. Just pure, unadulterated gameplay experiences 
                            that prioritize immersion, challenge, and meaningful choice.
                        </p>
                    </motion.div>

                    <motion.div
                        className="mission-pillar"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <div className="mission-pillar__number">03</div>
                        <h3 className="mission-pillar__title">Community-Driven</h3>
                        <p className="mission-pillar__text">
                            Built by passionate volunteers who believe in the vision. Every contributor 
                            shapes the final product, creating something greater than the sum of its parts.
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Philosophy;
