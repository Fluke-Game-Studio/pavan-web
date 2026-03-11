import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '../components/ThemeToggle';

const navLinks = [
    { name: 'Home', to: '/' },
    { name: 'Pavan', to: '/pavan' },
    { name: 'Careers', to: '/careers' },
    { name: 'About', to: '/about' },
    { name: 'Contact', to: '/contact' },
];

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 0);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    const handleLinkClick = () => setMenuOpen(false);

    return (
        <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
            <div className="nav-container--full nav-content">
                <NavLink to="/" className={`logo logo--with-text${isScrolled ? ' logo--shrink' : ''}`} onClick={handleLinkClick}>
                    <div className="logo-img-wrapper">
                        <img
                            src="/logo.png"
                            alt="Fluke Games Logo"
                            className="logo-img"
                        />
                    </div>
                    <span className="logo-text logo-text--navbar">Fluke Games™</span>
                </NavLink>
                {/* Desktop links */}
                <div className="nav-links nav-links--desktop">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.name}
                            to={link.to}
                            className={({ isActive }) =>
                                `nav-link ${isActive ? 'nav-link--active' : ''}`
                            }
                        >
                            {link.name}
                            <div className="nav-underline" />
                        </NavLink>
                    ))}
                    <NavLink to="/login" className="btn btn-outline font-w nav-login-btn">
                        Sign In
                    </NavLink>
                    <ThemeToggle />
                </div>
                {/* Mobile hamburger */}
                <button
                    className="nav-hamburger"
                    onClick={() => setMenuOpen((v) => !v)}
                    aria-label="Toggle menu"
                >
                    <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
                    <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
                    <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
                </button>
            </div>
            {/* Mobile drawer */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        className="nav-drawer"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                    >
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.name}
                                to={link.to}
                                className="nav-drawer__link"
                                onClick={handleLinkClick}
                            >
                                {link.name}
                            </NavLink>
                        ))}
                        <NavLink to="/login" className="nav-drawer__link" onClick={handleLinkClick}>
                            Sign In
                            <div style={{ padding: '1rem', display: 'flex', justifyContent: 'center' }}>
                                <ThemeToggle />
                            </div>
                        </NavLink>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
