// src/views/careers/JobDetail.jsx
// Pure UI component for displaying job details

import React from 'react';
import { motion } from 'framer-motion';
import { TagBadge } from './TagBadge';

export const JobDetail = ({ job, onApply }) => (
    <motion.div
        key={job.jobId || job.title}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35 }}
        className="job-detail"
    >
        <div className="job-detail__top">
            <h2 className="job-detail__title">{job.title}</h2>
            <span className="job-detail__type">{job.type}</span>
        </div>

        {job.tags?.length > 0 && (
            <div className="job-detail__tags">
                {job.tags.map((tag, i) => <TagBadge key={i} tag={tag} />)}
            </div>
        )}

        {job.desc ? (
            <div
                className="job-detail__desc"
                dangerouslySetInnerHTML={{ __html: job.desc }}
            />
        ) : (
            <p className="job-detail__desc job-detail__desc--empty">
                No description provided. Reach out if you're interested!
            </p>
        )}

        <button className="btn btn-gold job-detail__apply" onClick={() => onApply(job)}>
            Apply for this Role →
        </button>
    </motion.div>
);
