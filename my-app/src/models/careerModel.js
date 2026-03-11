// src/models/careerModel.js
// Data layer for career/job listings

import { tryJsonParse, unwrapPayload, safeStr } from '../shared/utils';

const API_BASE = '/api';

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

    if (!res.ok) throw new Error(`Failed to fetch jobs (${res.status})`);

    const data = await res.json();
    const payload = unwrapPayload(data);

    const items =
        (Array.isArray(payload?.items) && payload.items) ||
        (Array.isArray(payload?.Items) && payload.Items) ||
        (Array.isArray(payload?.data) && payload.data) ||
        (Array.isArray(payload) && payload) ||
        [];

    return items.map(normalizeJob);
}
