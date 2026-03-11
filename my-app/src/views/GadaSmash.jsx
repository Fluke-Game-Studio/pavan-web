import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GadaSmash = () => {
    const [smashes, setSmashes] = useState([]);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleDown = (e) => {
            // Ignore clicks on interactive elements
            const target = e.target;
            const isInteractive = target.closest('button, a, input, textarea, select, [role="button"]');
            
            if (isInteractive) {
                return;
            }

            const newSmash = {
                id: Date.now(),
                x: e.clientX,
                y: e.clientY,
            };

            setSmashes((prev) => [...prev, newSmash]);

            // Remove smash after animation completes
            setTimeout(() => {
                setSmashes((prev) => prev.filter((smash) => smash.id !== newSmash.id));
            }, 1500);
        };

        window.addEventListener('mousedown', handleDown);

        return () => {
            window.removeEventListener('mousedown', handleDown);
        };
    }, []);

    return (
        <div ref={containerRef} className="gada-container">
            <AnimatePresence>
                {smashes.map((smash) => (
                    <div
                        key={smash.id}
                        className="smash-wrapper"
                        style={{
                            left: smash.x,
                            top: smash.y,
                        }}
                    >
                        {/* Cinematic Ripple Shockwave */}
                        <motion.div
                            initial={{ scale: 0, opacity: 0.8 }}
                            animate={{ scale: 5, opacity: 0 }}
                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                            className="cinematic-ripple"
                        />
                        <motion.div
                            initial={{ scale: 0, opacity: 0.5 }}
                            animate={{ scale: 3.5, opacity: 0 }}
                            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
                            className="cinematic-ripple ripple-secondary"
                        />
                    </div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default GadaSmash;
