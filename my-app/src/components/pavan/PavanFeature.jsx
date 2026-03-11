import React from 'react';
import { motion } from 'framer-motion';
import './PavanFeature.css';

const PavanFeature = ({ icon, title, body, delay = 0 }) => (
    <motion.div
        className="pavan-feat"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay }}
    >
        <div className="pavan-feat__icon">{icon}</div>
        <h3 className="pavan-feat__title">{title}</h3>
        <p className="pavan-feat__body">{body}</p>
    </motion.div>
);

export default PavanFeature;
