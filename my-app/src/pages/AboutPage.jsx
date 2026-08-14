import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaFire, FaBolt, FaHandshake, FaBullseye, FaUser } from 'react-icons/fa';
import { SiUnrealengine, SiBlender, SiGit, SiPerforce } from 'react-icons/si';
import { MdBrush } from 'react-icons/md';
import { RiListCheck2 } from 'react-icons/ri';

const ValueCard = ({ icon, title, body, delay }) => (
    <motion.div
        className="about-value"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay }}
    >
        <span className="about-value__icon">{icon}</span>
        <h3 className="about-value__title">{title}</h3>
        <p className="about-value__body">{body}</p>
    </motion.div>
);

const TeamMember = ({ name, role, image, delay }) => (
    <motion.div
        className="team-member"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay }}
    >
        <div className="team-member__avatar">
            {image ? (
                <img
                    src={image}
                    alt={name}
                    width="120"
                    height="120"
                />
            ) : (
                <div className="team-member__placeholder">
                    <FaUser />
                </div>
            )}
        </div>
        <h3 className="team-member__name">{name}</h3>
        <p className="team-member__role">{role}</p>
    </motion.div>
);

const TimelineMilestone = ({ year, title, description, delay }) => (
    <motion.div
        className="timeline-item"
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay }}
    >
        <div className="timeline-item__year">{year}</div>
        <div className="timeline-item__content">
            <h3 className="timeline-item__title">{title}</h3>
            <p className="timeline-item__desc">{description}</p>
        </div>
    </motion.div>
);

const TechBadge = ({ name, icon, delay }) => (
    <motion.div
        className="tech-badge"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
    >
        <span className="tech-badge__icon">{icon}</span>
        <span className="tech-badge__name">{name}</span>
    </motion.div>
);

const AboutPage = () => {
    return (
        <div className="about-page">

            {/* Hero */}
            <section className="page-hero container">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9 }}
                >
                    <span className="phi-label">Who We Are</span>
                    <h1 className="page-hero__title">Forging New Myths</h1>
                    <p className="page-hero__sub">
                        Fluke Games is an independent, volunteer-driven game studio with a single obsession:
                        building the most culturally rich, narratively bold game ever made.
                        We don't have millions. We have conviction.
                    </p>
                </motion.div>
            </section>

            <div className="volt-line" style={{ margin: '0 auto 5rem', display: 'block', width: 60 }} />

            {/* Origin Story */}
            <section className="section-padding container">
                <div className="about-origin">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="pavan-section-label">The Origin</span>
                        <h2 className="pavan-section-title" style={{ color: 'var(--text-primary)' }}>
                            Started in 2019.<br />Still burning.
                        </h2>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <p className="pavan-body-text">
                            Fluke Games was born from a single question: why don't games rooted in South Asian
                            mythology get the same cinematic treatment as Norse or Greek epics?
                        </p>
                        <p className="pavan-body-text">
                            We set out to change that. Not with a massive studio or venture capital —
                            but with a community of creatives who believe the story is worth building.
                        </p>
                        <p className="pavan-body-text">
                            Every contributor brings something different: code, art, music, writing.
                            Together we're building something none of us could build alone.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Values */}
            <section className="section-padding" style={{ background: 'rgba(0,0,0,0.3)' }}>
                <div className="container">
                    <motion.div
                        className="pavan-section-header"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="pavan-section-label">Core Principles</span>
                        <h2 className="pavan-section-title" style={{ color: 'var(--text-primary)' }}>What We Stand For</h2>
                    </motion.div>

                    <div className="about-values-grid">
                        <ValueCard icon={<FaFire />} title="Authentic Storytelling" body="Every narrative beat is researched, considered, and crafted to honour the source material while pushing it forward." delay={0} />
                        <ValueCard icon={<FaBolt />} title="Quality Over Speed" body="We take the time to get it right. A polished build beats a rushed release every single time." delay={0.15} />
                        <ValueCard icon={<FaHandshake />} title="Community First" body="Contributors are credited, heard, and valued. This is a collaborative effort, not a hierarchy." delay={0.3} />
                        <ValueCard icon={<FaBullseye />} title="No Compromise" body="No pay-to-win. No filler content. No design decisions driven by monetisation metrics." delay={0.45} />
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="section-padding container">
                <motion.div
                    className="pavan-section-header"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <span className="pavan-section-label">Our Journey</span>
                    <h2 className="pavan-section-title" style={{ color: 'var(--text-primary)' }}>Studio Timeline</h2>
                </motion.div>

                <div className="timeline">
                    <TimelineMilestone
                        year="2019"
                        title="Studio Founded"
                        description="Fluke Games was born from a vision to bring South Asian mythology to the gaming world."
                        delay={0}
                    />
                    <TimelineMilestone
                        year="2020"
                        title="Concept Development"
                        description="Core gameplay mechanics and narrative framework established for Pavan: The Primal Saga."
                        delay={0.1}
                    />
                    <TimelineMilestone
                        year="2021"
                        title="Prototype Build"
                        description="First playable prototype showcasing combat systems and world design."
                        delay={0.2}
                    />
                    <TimelineMilestone
                        year="2023"
                        title="Team Expansion"
                        description="Growing community of volunteer contributors across art, code, and narrative design."
                        delay={0.3}
                    />
                    <TimelineMilestone
                        year="2024"
                        title="Alpha Development"
                        description="Active development phase with regular playtesting and iteration cycles."
                        delay={0.4}
                    />
                    <TimelineMilestone
                        year="2026"
                        title="Present Day"
                        description="Continuing to build, refine, and prepare for the next stage of development."
                        delay={0.5}
                    />
                </div>
            </section>

            {/* Team Section */}
            <section className="section-padding" style={{ background: 'rgba(0,0,0,0.3)' }}>
                <div className="container">
                    <motion.div
                        className="pavan-section-header"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="pavan-section-label">The Team</span>
                        <h2 className="pavan-section-title" style={{ color: 'var(--text-primary)' }}>Core Contributors</h2>
                        <p className="pavan-body-text" style={{ textAlign: 'center', marginTop: '1rem', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
                            Meet the passionate individuals driving Fluke Games forward.
                        </p>
                    </motion.div>

                    <div className="team-grid">
                        <TeamMember name="Founder Name" role="Studio Director & Lead Designer" delay={0} />
                        <TeamMember name="Developer Name" role="Lead Programmer" delay={0.1} />
                        <TeamMember name="Artist Name" role="Art Director" delay={0.2} />
                        <TeamMember name="Writer Name" role="Narrative Designer" delay={0.3} />
                        <TeamMember name="Composer Name" role="Audio Lead" delay={0.4} />
                        <TeamMember name="Manager Name" role="Project Manager" delay={0.5} />
                    </div>
                </div>
            </section>

            {/* Technology Stack */}
            <section className="section-padding container">
                <motion.div
                    className="pavan-section-header"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <span className="pavan-section-label">Our Tools</span>
                    <h2 className="pavan-section-title" style={{ color: 'var(--text-primary)' }}>Technology Stack</h2>
                    <p className="pavan-body-text" style={{ textAlign: 'center', marginTop: '1rem' }}>
                        Built with industry-leading tools and technologies.
                    </p>
                </motion.div>

                <div className="tech-stack">
                    <TechBadge name="Unreal Engine" icon={<SiUnrealengine />} delay={0} />
                    <TechBadge name="Blender" icon={<SiBlender />} delay={0.05} />
                    <TechBadge name="Substance Painter" icon={<MdBrush />} delay={0.1} />
                    <TechBadge name="Houdini" icon={<FaBolt />} delay={0.15} />
                    <TechBadge name="Maya" icon={<MdBrush />} delay={0.2} />
                    <TechBadge name="Git" icon={<SiGit />} delay={0.25} />
                    <TechBadge name="Jira" icon={<RiListCheck2 />} delay={0.3} />
                    <TechBadge name="Perforce" icon={<SiPerforce />} delay={0.35} />
                </div>
            </section>

            {/* CTA */}
            <section className="section-padding container" style={{ textAlign: 'center' }}>
                <motion.h2
                    className="pavan-section-title"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{ color: 'var(--text-primary)', marginBottom: '1.5rem' }}
                >
                    Want to be part of this?
                </motion.h2>
                <Link to="/careers" className="btn btn-gold">
                    See Open Roles →
                </Link>
            </section>

        </div>
    );
};

export default AboutPage;
