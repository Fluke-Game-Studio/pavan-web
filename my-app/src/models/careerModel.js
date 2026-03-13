// src/models/careerModel.js
// Data layer for career/job listings

import { tryJsonParse, unwrapPayload, safeStr } from '../shared/utils';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

/**
 * Normalizes raw job data from API
 */
function normalizeJob(j) {
    const title = j?.title ? String(j.title) : '';
    const type = j?.employmentType || j?.employment_type || j?.type || 'Volunteer (Remote)';
    const tags = Array.isArray(j?.tags) ? j.tags.map(String) : [];
    let desc = j?.description || j?.desc || '';

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
 */
export async function fetchJobs() {
    const res = await fetch(`${API_BASE}/jobs`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
    });

    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    const text = await res.text();
    const data = tryJsonParse(text);

    if (!res.ok) {
        const msg =
            data?.message ||
            data?.error ||
            `Failed to fetch jobs (${res.status})`;
        throw new Error(msg);
    }

    if (!data || (!contentType.includes('application/json') && text.trim().startsWith('<'))) {
        throw new Error(
            'Jobs API did not return JSON. Check API URL/proxy configuration for /api/jobs.'
        );
    }

    const payload = unwrapPayload(data);

    const items =
        (Array.isArray(payload?.items) && payload.items) ||
        (Array.isArray(payload?.Items) && payload.Items) ||
        (Array.isArray(payload?.data) && payload.data) ||
        (Array.isArray(payload) && payload) ||
        [];

    return items.map(normalizeJob);
}
