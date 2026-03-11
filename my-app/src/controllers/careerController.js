// src/controllers/careerController.js
// Business logic for managing career listings

import { useState, useEffect } from 'react';
import { fetchJobs } from '../models/careerModel';

/**
 * Controller hook for managing career/job listings
 * Handles loading, error states, and job selection
 */
export function useCareerController() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedJob, setSelectedJob] = useState(null);

    useEffect(() => {
        let cancelled = false;

        setLoading(true);
        setError('');

        fetchJobs()
            .then((data) => {
                if (cancelled) return;
                setJobs(data);
                setSelectedJob(data.length ? data[0] : null);
            })
            .catch((err) => {
                if (cancelled) return;
                setError(err?.message || 'Failed to load jobs. Please try again.');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, []);

    return { jobs, loading, error, selectedJob, setSelectedJob };
}
