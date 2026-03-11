import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaNewspaper, FaHandshake, FaComments, FaLinkedin, FaYoutube, FaInstagram, FaTwitter, FaDiscord } from 'react-icons/fa';

const ContactCard = ({ icon, title, description, email, delay }) => (
    <motion.div
        className="contact-card"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay }}
    >
        <div className="contact-card__icon">{icon}</div>
        <h3 className="contact-card__title">{title}</h3>
        <p className="contact-card__desc">{description}</p>
        {email && (
            <a href={`mailto:${email}`} className="contact-card__email">
                {email}
            </a>
        )}
    </motion.div>
);

const ContactPage = () => {
    const [form, setForm] = useState({ name: '', email: '', message: '', category: 'general' });
    const [sent, setSent] = useState(false);

    function handleChange(e) {
        setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    }

    function handleSubmit(e) {
        e.preventDefault();
        // TODO: wire to your backend/email service
        setSent(true);
    }

    return (
        <div className="contact-page">
            <section className="page-hero container">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9 }}
                >
                    <span className="phi-label">Get in Touch</span>
                    <h1 className="page-hero__title">Contact Us</h1>
                    <p className="page-hero__sub">
                        Questions? Ideas? Press enquiries? We'd love to hear from you.
                    </p>
                </motion.div>
            </section>

            {/* Contact Methods */}
            <section className="section-padding" style={{ background: 'rgba(0,0,0,0.3)' }}>
                <div className="container">
                    <div className="contact-methods">
                        <ContactCard
                            icon={<FaNewspaper />}
                            title="Press & Media"
                            description="Media inquiries, interviews, and press kit requests."
                            email="press@flukegames.com"
                            delay={0}
                        />
                        <ContactCard
                            icon={<FaHandshake />}
                            title="Partnerships"
                            description="Collaboration opportunities, sponsorships, and business development."
                            email="partnerships@flukegames.com"
                            delay={0.1}
                        />
                        <ContactCard
                            icon={<FaComments />}
                            title="General Inquiries"
                            description="Questions about our games, studio, or volunteering opportunities."
                            email="hello@flukegames.com"
                            delay={0.2}
                        />
                    </div>
                </div>
            </section>

            {/* Contact Form */}
            <div className="container contact-form-section">{sent ? (
                <motion.div
                    className="contact-success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <div className="apply-success__icon">✓</div>
                    <h2>Message Sent</h2>
                    <p>We'll get back to you as soon as possible.</p>
                </motion.div>
            ) : (
                <motion.div
                    className="contact-form-wrapper"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="contact-form-header">
                        <span className="pavan-section-label">Send a Message</span>
                        <h2 className="pavan-section-title" style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
                            Get in Touch
                        </h2>
                    </div>

                    <form className="contact-form" onSubmit={handleSubmit}>
                        <div className="apply-field">
                            <label className="apply-field__label" htmlFor="category">
                                Category <span className="apply-field__req">*</span>
                            </label>
                            <select
                                className="apply-field__input"
                                id="category"
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                required
                            >
                                <option value="general">General Inquiry</option>
                                <option value="press">Press & Media</option>
                                <option value="partnership">Partnership</option>
                                <option value="support">Technical Support</option>
                            </select>
                        </div>

                        <div className="apply-field">
                            <label className="apply-field__label" htmlFor="name">
                                Name <span className="apply-field__req">*</span>
                            </label>
                            <input
                                className="apply-field__input"
                                id="name"
                                name="name"
                                type="text"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Your name"
                                required
                            />
                        </div>

                        <div className="apply-field">
                            <label className="apply-field__label" htmlFor="email">
                                Email <span className="apply-field__req">*</span>
                            </label>
                            <input
                                className="apply-field__input"
                                id="email"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div className="apply-field">
                            <label className="apply-field__label" htmlFor="message">
                                Message <span className="apply-field__req">*</span>
                            </label>
                            <textarea
                                className="apply-field__textarea"
                                id="message"
                                name="message"
                                value={form.message}
                                onChange={handleChange}
                                placeholder="What's on your mind?"
                                rows={6}
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-gold" style={{ alignSelf: 'flex-start' }}>
                            Send Message →
                        </button>
                    </form>
                </motion.div>
            )}
            </div>

            {/* Social Media & Additional Info */}
            <section className="section-padding" style={{ background: 'rgba(0,0,0,0.3)' }}>
                <div className="container">
                    <motion.div
                        className="pavan-section-header"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="pavan-section-label">Connect</span>
                        <h2 className="pavan-section-title" style={{ color: 'var(--text-primary)' }}>
                            Follow Our Journey
                        </h2>
                        <p className="pavan-body-text" style={{ textAlign: 'center', marginTop: '1rem' }}>
                            Stay updated with development progress, behind-the-scenes content, and community events.
                        </p>
                    </motion.div>

                    <motion.div
                        className="social-links"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        <a href="https://www.linkedin.com/company/fluke-games" target="_blank" rel="noreferrer" className="social-link">
                            <span className="social-link__icon"><FaLinkedin /></span>
                            <span className="social-link__name">LinkedIn</span>
                        </a>
                        <a href="https://www.youtube.com/@FlukeGamesStudio" target="_blank" rel="noreferrer" className="social-link">
                            <span className="social-link__icon"><FaYoutube /></span>
                            <span className="social-link__name">YouTube</span>
                        </a>
                        <a href="https://www.instagram.com/fluke.games/" target="_blank" rel="noreferrer" className="social-link">
                            <span className="social-link__icon"><FaInstagram /></span>
                            <span className="social-link__name">Instagram</span>
                        </a>
                        <a href="https://twitter.com/flukegames" target="_blank" rel="noreferrer" className="social-link">
                            <span className="social-link__icon"><FaTwitter /></span>
                            <span className="social-link__name">Twitter</span>
                        </a>
                        <a href="https://discord.gg/flukegames" target="_blank" rel="noreferrer" className="social-link">
                            <span className="social-link__icon"><FaDiscord /></span>
                            <span className="social-link__name">Discord</span>
                        </a>
                    </motion.div>

                    <motion.p
                        className="contact-note"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                    >
                        Looking to join the team? Check out our <Link to="/careers">Careers page</Link> for volunteer opportunities.
                    </motion.p>
                </div>
            </section>
        </div>
    );
};

export default ContactPage;
