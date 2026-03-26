import { useState, useEffect } from 'react';

/**
 * Shared utility functions
 */
export const utils = {
    tryJsonParse: (x) => {
        if (!x) return null;
        if (typeof x === 'object') return x;
        try { return JSON.parse(x); } catch { return null; }
    },
    unwrapPayload: (data) => {
        let p = data;
        if (typeof p === 'string') p = utils.tryJsonParse(p) || { raw: p };
        if (p && typeof p.body === 'string') p = utils.tryJsonParse(p.body) || p;
        return p || {};
    },
    safeStr: (x) => (x === null || x === undefined ? '' : String(x))
};

/**
 * Normalizes raw job data from API
 */
function normalizeJob(j) {
    const title = j?.title ? String(j.title) : '';
    const type = j?.employmentType || j?.employment_type || j?.type || 'Volunteer (Remote)';
    const tags = Array.isArray(j?.tags) ? j.tags.map(String) : [];
    let desc = j?.description || j?.desc || '';

    // Simple HTML normalization for non-HTML descriptions
    if (desc && !desc.includes('<')) {
        desc = desc
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br>');
    }

    return {
        jobId: j?.jobId || j?.id ? String(j.jobId || j.id) : undefined,
        title,
        type: String(type),
        tags,
        desc,
        raw: j || {},
    };
}

/**
 * Fetches all available jobs from the API
 * @param {string} apiBase - The base URL for the API
 */
export async function fetchJobs(apiBase = '/api') {
    const res = await fetch(`${apiBase}/jobs`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
    });

    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    const text = await res.text();
    const data = utils.tryJsonParse(text);

    if (!res.ok) {
        throw new Error(data?.message || data?.error || `Failed to fetch jobs (${res.status})`);
    }

    if (!data || (!contentType.includes('application/json') && text.trim().startsWith('<'))) {
        throw new Error('Jobs API did not return JSON.');
    }

    const payload = utils.unwrapPayload(data);
    const items = payload?.items || payload?.Items || payload?.data || (Array.isArray(payload) ? payload : []);

    return items.map(normalizeJob);
}

/**
 * Controller hook for managing career/job listings
 * @param {string} apiBase - The base URL for the API
 */
export function useCareerController(apiBase) {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedJob, setSelectedJob] = useState(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError('');

        fetchJobs(apiBase)
            .then((data) => {
                if (cancelled) return;
                setJobs(data);
                setSelectedJob(data.length ? data[0] : null);
            })
            .catch((err) => {
                if (cancelled) return;
                setError(err?.message || 'Failed to load jobs.');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [apiBase]);

    return { jobs, loading, error, selectedJob, setSelectedJob };
}
