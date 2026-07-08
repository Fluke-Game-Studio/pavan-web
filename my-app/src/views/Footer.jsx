import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="container footer-content">
                <div className="footer-cols">
                    <div className="footer-col">
                        <h4 className="footer-title">Studio</h4>
                        <ul className="footer-links">
                            <li><Link to="/">Home</Link></li>
                            <li><a href="https://www.linkedin.com/company/fluke-games" target="_blank" rel="noreferrer">Careers</a></li>
                            <li><a href="https://www.arcade.flukegamestudio.com" target="_blank" rel="noreferrer">Arcade Internal</a></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4 className="footer-title">Projects</h4>
                        <ul className="footer-links">
                            <li><Link to="/">Pavan Game</Link></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4 className="footer-title">Legal</h4>
                        <ul className="footer-links">
                            <li><a href="#">Privacy Policy</a></li>
                            <li><a href="#">Terms</a></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4 className="footer-title">Social</h4>
                        <ul className="footer-links">
                            <li><a href="https://www.youtube.com/@FlukGames" target="_blank" rel="noreferrer">YouTube</a></li>
                            <li><a href="https://x.com/flukgames" target="_blank" rel="noreferrer">X (Twitter)</a></li>
                            <li><a href="https://www.instagram.com/fluke.games/" target="_blank" rel="noreferrer">Instagram</a></li>
                            <li><a href="https://www.linkedin.com/company/fluke-games" target="_blank" rel="noreferrer">LinkedIn</a></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div className="footer-logo gold-glow">Fluke Games™</div>
                    <div className="copyright">
                        Copyright 2019 - {currentYear} © Fluke Games ™
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
