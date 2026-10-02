// src/views/careers/JobCard.jsx
// Pure UI component for displaying a job card

import React from 'react';
import { motion } from 'framer-motion';
import { TagBadge } from './TagBadge';

export const JobCard = ({ job, isSelected, onClick }) => (
    <motion.div
        className={`job-card ${isSelected ? 'job-card--active' : ''}`}
        onClick={() => onClick(job)}
        whileHover={{ x: 4 }}
        layout
    >
        <div className="job-card__header">
            <h3 className="job-card__title">{job.title}</h3>
            <span className="job-card__type">{job.type}</span>
        </div>
        {job.tags?.length > 0 && (
            <div className="job-card__tags">
                {job.tags.map((tag, i) => <TagBadge key={i} tag={tag} />)}
            </div>
        )}
    </motion.div>
);
