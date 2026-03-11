import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaBolt, FaGlobe, FaTheaterMasks, FaMusic, FaCog, FaFire } from 'react-icons/fa';

// Components
import PavanTitleModel from '../components/PavanTitleModel';
import InteractiveGada from '../components/InteractiveGada';
import PavanScrollShowcase from '../components/PavanScrollShowcase';
import PavanStat from '../components/pavan/PavanStat';
import PavanFeature from '../components/pavan/PavanFeature';
import PavanLore from '../components/pavan/PavanLore';

// Section Styles
import './pavan/PavanTheme.css';
import './pavan/PavanHero.css';
import './pavan/PavanStatsSection.css';
import './pavan/PavanFeaturesSection.css';
import './pavan/PavanLoreSection.css';
import './pavan/PavanCTA.css';
import './pavan/PavanInfoSection.css';

// ─── Main Page ───────────────────────────────────────────────────────────────
const PavanPage = () => {
    return (
        <div className="pavan-page">

            {/* ── CINEMATIC HERO ─────────────────────────────────────────────── */}
            <section className="pavan-hero">
                <div className="pavan-hero__gradient" />
                <div className="pavan-hero__grid-overlay" />

                <div className="pavan-hero__content container">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <span className="pavan-eyebrow">A Fluke Games Production</span>
                        <div className="pavan-hero__title-wrapper">
                            <PavanTitleModel />
                            <span className="pavan-hero__title-sub">THE PRIMAL SAGA</span>
                        </div>
                        <p className="pavan-hero__tagline">
                            Where divine wrath meets the pulse of the future.
                        </p>
                    </motion.div>

                    <motion.div
                        className="pavan-hero__actions"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                    >
                        <Link to="/careers" className="btn pavan-btn-primary">Join the Team</Link>
                        <a href="https://www.linkedin.com/company/fluke-games" target="_blank" rel="noreferrer" className="btn pavan-btn-ghost">
                            Watch Prototype
                        </a>
                    </motion.div>
                </div>

                <div className="pavan-hero__scroll-hint">
                    <span>SCROLL</span>
                    <div className="pavan-scroll-line" />
                </div>
            </section>

            {/* ── INTERACTIVE GADA SECTION ─────────────────────────────────────── */}
            <section className="pavan-gada-section">
                <InteractiveGada />
            </section>

            {/* ── SCROLL SHOWCASE (3 sections — text left, 3D box right) ─────── */}
            <PavanScrollShowcase />

            {/* ── STATS BAR ─────────────────────────────────────────────────── */}
            <section className="pavan-stats">
                <div className="container pavan-stats__grid">
                    <PavanStat number="∞" label="Branching Choices" />
                    <PavanStat number="7" label="Ancient Pantheons" />
                    <PavanStat number="2050+" label="Lines of Lore" />
                    <PavanStat number="1" label="Unbreakable Will" />
                </div>
            </section>

            {/* ── FEATURES ───────────────────────────────────────────────────── */}
            <section className="section-padding">
                <div className="container">
                    <motion.div
                        className="pavan-section-header"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <span className="pavan-section-label">Core Experience</span>
                        <h2 className="pavan-section-title">Why Pavan is Different</h2>
                    </motion.div>

                    <div className="pavan-feats-grid">
                        <PavanFeature
                            icon={<FaBolt />}
                            title="God-Tier Combat"
                            body="Fluid, kinetic combat rooted in ancient martial traditions. Every strike carries the weight of mythology."
                        />
                        <PavanFeature
                            icon={<FaGlobe />}
                            title="Open World Mythology"
                            body="Explore a fractured realm where ancient temples and neon megacities coexist. Every corner holds a story."
                            delay={0.15}
                        />
                        <PavanFeature
                            icon={<FaTheaterMasks />}
                            title="Narrative Depth"
                            body="Your decisions carve the fate of gods and men alike. No two playthroughs are the same."
                            delay={0.3}
                        />
                        <PavanFeature
                            icon={<FaMusic />}
                            title="Mythic Soundtrack"
                            body="An original score blending classical Indian instruments with cinematic electronic compositions."
                            delay={0.45}
                        />
                        <PavanFeature
                            icon={<FaCog />}
                            title="No Pay-to-Win"
                            body="Every mechanic earned through skill and story. No microtransactions, no shortcut stores."
                            delay={0.6}
                        />
                        <PavanFeature
                            icon={<FaFire />}
                            title="Volunteer-Built"
                            body="Crafted by passionate volunteers who believe great stories shouldn't need a AAA budget to exist."
                            delay={0.75}
                        />
                    </div>
                </div>
            </section>

            {/* ── LORE CARDS ─────────────────────────────────────────────────── */}
            <section className="pavan-lore-cards section-padding">
                <div className="container">
                    <motion.div
                        className="pavan-section-header"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="pavan-section-label">Fragments</span>
                        <h2 className="pavan-section-title">From the Chronicles</h2>
                    </motion.div>

                    <div className="pavan-lore-grid">
                        <PavanLore
                            title="The Vaayu Prophecy"
                            quote={`"He who commands the wind shall never be bound — not by iron, not by fate, not by the silence of forgotten gods."`}
                        />
                        <PavanLore
                            title="The Neon Oath"
                            quote={`"The old world ended in prayer. The new world began in circuitry. Pavan is the bridge between the last prayer and the first signal."`}
                            delay={0.2}
                        />
                        <PavanLore
                            title="The Fractured Realm"
                            quote={`"They uploaded the legends to escape death. Instead, they summoned something older than death itself."`}
                            delay={0.4}
                        />
                    </div>
                </div>
            </section>

            {/* ── CTA ────────────────────────────────────────────────────────── */}
            <section className="pavan-cta">
                <div className="container pavan-cta__inner">
                    <motion.h2
                        className="pavan-cta__title"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        Ready to Build the Legend?
                    </motion.h2>
                    <motion.p
                        className="pavan-cta__sub"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        We're looking for artists, developers, writers, and composers.
                        No salary. Just legacy.
                    </motion.p>
                    <Link to="/careers" className="btn pavan-btn-primary">
                        View Open Roles →
                    </Link>
                </div>
            </section>

        </div>
    );
};

export default PavanPage;
