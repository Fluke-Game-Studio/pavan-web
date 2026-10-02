import React from 'react';
import { motion } from 'framer-motion';

const PavanFeature = () => {
    return (
        <section id="pavan" className="pavan-feature section-padding">
            <div className="container">
                <div className="pavan-grid">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1 }}
                        viewport={{ once: true }}
                        className="pavan-content"
                    >
                        <h2 className="section-title volt-glow">The Saga of Pavan</h2>
                        <p className="pavan-desc">
                            Beneath the neon pulse of tomorrow lies the ancient echo of primal gods.
                            Step into a cinematic odyssey where your choices weave the tapestry of destiny and steel.
                        </p>
                        <button className="btn btn-gold">Enter the Saga</button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.2 }}
                        viewport={{ once: true }}
                        className="pavan-image"
                    >
                        <div className="cinematic-frame">
                            <div className="frame-glow" />
                            {/* Note: User can add a high-quality still image here */}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default PavanFeature;
