import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ShowcasePage = () => {
    const videoIds = [
        'QggJzZdIYPI', // Example YouTube video ID - replace with actual
    ];

    return (
        <div className="showcase-page">
            <section className="page-hero container">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9 }}
                >
                    <span className="phi-label">Witness the Vision</span>
                    <h1 className="page-hero__title">Pavan Game Showcase</h1>
                    <p className="page-hero__sub">
                        Dive into the prototype builds, cinematic gameplay reveals, and behind-the-scenes
                        development of Pavan: The Primal Saga.
                    </p>
                </motion.div>
            </section>

            <div className="container section-padding">
                {/* Video Grid */}
                <div className="showcase-videos">
                    {videoIds.map((id, index) => (
                        <motion.div
                            key={id}
                            className="showcase-video-card"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, delay: index * 0.1 }}
                        >
                            <div className="showcase-video-frame">
                                <iframe
                                    src={`https://www.youtube.com/embed/${id}`}
                                    title={`Pavan Showcase ${index + 1}`}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                            <div className="showcase-video-info">
                                <h3>Prototype Build v{index + 1}</h3>
                                <p>Early gameplay demonstration and world exploration.</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* CTA back to Pavan */}
                <motion.div
                    className="showcase-cta"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2>Ready to Learn More?</h2>
                    <p>Explore the full vision behind Pavan: The Primal Saga.</p>
                    <Link to="/pavan" className="btn btn-gold">
                        Discover Pavan →
                    </Link>
                </motion.div>
            </div>
        </div>
    );
};

export default ShowcasePage;
