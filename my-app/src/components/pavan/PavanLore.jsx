import React from 'react';
import { motion } from 'framer-motion';
import './PavanLore.css';

const PavanLore = ({ title, quote, delay = 0 }) => (
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

export default PavanLore;
