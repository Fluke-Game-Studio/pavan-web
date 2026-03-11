import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './PavanStat.css';

const PavanStat = ({ number, label }) => {
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

export default PavanStat;
