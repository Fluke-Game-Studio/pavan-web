import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

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

export default ParallaxBlock;
