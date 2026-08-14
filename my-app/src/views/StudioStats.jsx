import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ number, label, suffix = '', delay }) => (
    <motion.div
        className="stat-card"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay }}
    >
        <div className="stat-card__number">
            {number}
            {suffix && <span className="stat-card__suffix">{suffix}</span>}
        </div>
        <div className="stat-card__label">{label}</div>
    </motion.div>
);

const StudioStats = () => {
    return (
        <section className="studio-stats section-padding">
            <div className="container">
                <motion.div
                    className="stats-header"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <span className="phi-label">By The Numbers</span>
                    <h2 className="pavan-section-title" style={{ color: 'var(--text-primary)' }}>
                        Our Journey So Far
                    </h2>
                </motion.div>

                <div className="stats-grid">
                    <StatCard number="2019" label="Studio Founded" delay={0} />
                    <StatCard number="7" suffix="+" label="Years in Development" delay={0.1} />
                    <StatCard number="15" suffix="+" label="Team Members" delay={0.2} />
                    <StatCard number="2" label="Projects in Development" delay={0.3} />
                    <StatCard number="10K" suffix="+" label="Development Hours" delay={0.4} />
                    <StatCard number="100%" label="Volunteer-Driven" delay={0.5} />
                </div>
            </div>
        </section>
    );
};

export default StudioStats;
