import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaBolt, FaGlobe, FaTheaterMasks, FaMusic, FaCog, FaFire } from 'react-icons/fa';
import PavanTitleModel from '../components/PavanTitleModel';
import InteractiveGada from '../components/InteractiveGada';
import PavanScrollShowcase from '../components/PavanScrollShowcase';

// ─── Parallax Section Component ─────────────────────────────────────────────
const ParallaxBlock = ({ children, offset = 60 }) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
    const y = useTransform(scrollYProgress, [0, 1], [-offset, offset]);
    return (
        <motion.div ref={ref} style={{ y }}>
            {children}
        </motion.div>
    );
};

// ─── Count-up Stat ───────────────────────────────────────────────────────────
const StatItem = ({ number, label }) => {
    const ref = useRef();
    const [displayed, setDisplayed] = useState('0');
    const isNumeric = !isNaN(parseFloat(number)) && number !== '∞';

    useEffect(() => {
        if (!isNumeric) { setDisplayed(number); return; }
        const target = parseFloat(number);
        const suffix = typeof number === 'string' ? number.replace(/[\d.]/g, '') : '';
        let start = null;
        const duration = 1400;
        const observer = new IntersectionObserver(([e]) => {
            if (!e.isIntersecting) return;
            observer.disconnect();
            const step = (ts) => {
                if (!start) start = ts;
                const progress = Math.min((ts - start) / duration, 1);
                const ease = 1 - Math.pow(1 - progress, 3);
                setDisplayed(Math.round(ease * target) + suffix);
                if (progress < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        }, { threshold: 0.5 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [number]);

    return (
        <motion.div
            ref={ref}
            className="pavan-stat"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
        >
            <span className="pavan-stat__num">{displayed}</span>
            <span className="pavan-stat__label">{label}</span>
        </motion.div>
    );
};

// ─── Feature Block ───────────────────────────────────────────────────────────
const FeatureBlock = ({ icon, title, body, delay = 0 }) => (
    <motion.div
        className="pavan-feat"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay }}
    >
        <div className="pavan-feat__icon">{icon}</div>
        <h3 className="pavan-feat__title">{title}</h3>
        <p className="pavan-feat__body">{body}</p>
    </motion.div>
);

// ─── World Lore Card ─────────────────────────────────────────────────────────
const LoreCard = ({ title, quote, delay = 0 }) => (
    <motion.div
        className="pavan-lore"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay }}
    >
        <h4 className="pavan-lore__title">{title}</h4>
        <blockquote className="pavan-lore__quote">{quote}</blockquote>
    </motion.div>
);

// ─── Lore Section with Gada ────────────────────────────────────────────────

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
                    <StatItem number="∞" label="Branching Choices" />
                    <StatItem number="7" label="Ancient Pantheons" />
                    <StatItem number="2050+" label="Lines of Lore" />
                    <StatItem number="1" label="Unbreakable Will" />
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
                        <FeatureBlock
                            icon={<FaBolt />}
                            title="God-Tier Combat"
                            body="Fluid, kinetic combat rooted in ancient martial traditions. Every strike carries the weight of mythology."
                            delay={0}
                        />
                        <FeatureBlock
                            icon={<FaGlobe />}
                            title="Open World Mythology"
                            body="Explore a fractured realm where ancient temples and neon megacities coexist. Every corner holds a story."
                            delay={0.15}
                        />
                        <FeatureBlock
                            icon={<FaTheaterMasks />}
                            title="Narrative Depth"
                            body="Your decisions carve the fate of gods and men alike. No two playthroughs are the same."
                            delay={0.3}
                        />
                        <FeatureBlock
                            icon={<FaMusic />}
                            title="Mythic Soundtrack"
                            body="An original score blending classical Indian instruments with cinematic electronic compositions."
                            delay={0.45}
                        />
                        <FeatureBlock
                            icon={<FaCog />}
                            title="No Pay-to-Win"
                            body="Every mechanic earned through skill and story. No microtransactions, no shortcut stores."
                            delay={0.6}
                        />
                        <FeatureBlock
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
                        <LoreCard
                            title="The Vaayu Prophecy"
                            quote={`"He who commands the wind shall never be bound — not by iron, not by fate, not by the silence of forgotten gods."`}
                            delay={0}
                        />
                        <LoreCard
                            title="The Neon Oath"
                            quote={`"The old world ended in prayer. The new world began in circuitry. Pavan is the bridge between the last prayer and the first signal."`}
                            delay={0.2}
                        />
                        <LoreCard
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
