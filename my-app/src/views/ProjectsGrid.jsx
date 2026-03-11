import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { GiBee } from 'react-icons/gi';

const ProjectCard = ({ title, description, isFeatured, link, hasInteractive, status }) => {
    return (
        <Link to={link} className="project-card-link">
            <motion.div
                whileHover={{ y: -10 }}
                className={`project-card ${isFeatured ? 'featured' : ''}`}
            >
                <div className="project-image-placeholder">
                    <div className="project-glow" />
                    {status && (
                        <div className="project-status">{status}</div>
                    )}
                    {hasInteractive && (
                        <div className="project-badge">
                            <GiBee className="project-bee-icon" />
                            Interactive
                        </div>
                    )}
                </div>
                <div className="project-info">
                    <h3 className="project-title">{title}</h3>
                    <p className="project-desc">{description}</p>
                    <div className="project-link">Explore →</div>
                </div>
            </motion.div>
        </Link>
    );
};

const ProjectsGrid = () => {
    const projects = [
        {
            title: "Pavan: The Primal Saga",
            description: "An epic action-adventure where ancient mythology collides with cyberpunk aesthetics. Play as Pavan, a deity navigating a fractured world of gods and technology.",
            isFeatured: true,
            link: "/pavan",
            hasInteractive: false,
            status: "In Development"
        },
        {
            title: "Queen Bee Maze",
            description: "A whimsical multiplayer experiment featuring real-time bee simulation and interactive maze navigation. Follow the queen and explore the hive!",
            isFeatured: false,
            link: "/queenbee",
            hasInteractive: true,
            status: "Playable Prototype"
        },
        {
            title: "Arcade Internal",
            description: "Our experimental sandbox for rapid prototyping, gameplay mechanics testing, and creative exploration. Access limited to team members.",
            isFeatured: false,
            link: "https://www.arcade.flukegamestudio.com",
            hasInteractive: false,
            status: "Internal Tool"
        }
    ];

    return (
        <section id="projects" className="section-padding">
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="section-header-center"
                >
                    <span className="phi-label">Our Games</span>
                    <h2 className="section-title volt-glow">
                        Studio Portfolio
                    </h2>
                    <p className="section-subtitle">
                        Explore our current projects and experimental prototypes.
                    </p>
                </motion.div>
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={{
                        visible: { transition: { staggerChildren: 0.2 } },
                        hidden: {}
                    }}
                    className="projects-grid"
                >
                    {projects.map((project, index) => (
                        <motion.div
                            key={index}
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0 }
                            }}
                            className={project.isFeatured ? 'featured' : ''}
                        >
                            <ProjectCard {...project} />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default ProjectsGrid;
