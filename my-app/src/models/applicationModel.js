// src/models/applicationModel.js
// Data layer for job applications

import { tryJsonParse, safeStr, humanizeId, inferTypeFromId } from '../shared/utils';

const API_BASE = 'https://xtipeal88c.execute-api.us-east-1.amazonaws.com';

/**
 * Normalizes a question object from the API
 */
function normalizeQuestion(q) {
    const id = q?.id || q?.key || '';
    if (!id) return null;

    let t = String(q?.type || inferTypeFromId(id)).toLowerCase().trim();
    if (t === 'phone' || t === 'phonenumber' || t === 'mobile') t = 'tel';
    if (t === 'longtext' || t === 'multiline') t = 'textarea';
    if (t === 'singlechoice') t = 'radio';
    if (t === 'multichoice') t = 'checkbox';
    if (!t) t = 'text';

    return {
        key: id,
        id,
        label: q?.label || humanizeId(id),
        type: t,
        required: !!(q?.required),
        options: q?.options,
        placeholder: q?.placeholder || (t === 'email' ? 'you@example.com' : t === 'textarea' ? 'Write your answer here…' : ''),
        helpText: q?.helpText,
    };
}

/**
 * Normalizes a list of questions
 */
function normalizeQuestions(list) {
    return (list || []).map(normalizeQuestion).filter(Boolean);
}

/**
 * Orders questions based on provided IDs
 */
function orderByIds(ids, list) {
    const qs = normalizeQuestions(list);
    if (!Array.isArray(ids) || !ids.length) return qs;

    const byId = Object.fromEntries(qs.map((q) => [q.id, q]));
    const ordered = ids.filter((id) => byId[id]).map((id) => byId[id]);
    const remaining = qs.filter((q) => !ids.includes(q.id));
    return [...ordered, ...remaining];
}

/**
 * Converts job to role ID
 */
function jobToRoleId(job) {
    return safeStr(job?.title)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || safeStr(job?.jobId);
}

/**
 * Builds application flow structure from job data
 */
export function buildApplicationFlow(job) {
    if (!job) return null;

    const roleId = jobToRoleId(job);
    const roleTitle = safeStr(job.title) || roleId;

    const generalFields = orderByIds(job.generalQuestionIds, job.generalQuestions);
    const personalFields = orderByIds(job.personalQuestionIds, job.personalQuestions);
    const roleFields = orderByIds(job.roleQuestionIds, job.roleQuestions);

    const chapters = [];

    if (generalFields.length) {
        chapters.push({
            title: 'General Questions',
            description: "Share how you connect with the game's direction and any feedback you may have.",
            fields: generalFields,
        });
    }

    if (personalFields.length) {
        chapters.push({
            title: 'Applicant Information',
            description: 'Tell us a bit about yourself.',
            fields: personalFields,
        });
    }

    chapters.push({
        title: roleTitle,
        description: safeStr(job.description).trim() ? 'Role-specific questions for this position.' : '',
        fields: roleFields,
    });

    // Always-present acknowledgement chapter
    chapters.push({
        title: 'Acknowledgement',
        description: 'Before submitting, please confirm you understand this is a volunteer-based role.',
        fields: [
            {
                key: 'ackVolunteer',
                id: 'ackVolunteer',
                label: 'I acknowledge that this is a volunteer based role.',
                type: 'radio',
                required: true,
                options: ['Agree and Submit', 'Disagree'],
            },
        ],
    });

    return {
        intro: {
            title: 'Fluke Games – Application Form',
            body: [
                'Welcome to the Fluke Games Volunteer Portal.',
                '',
                "Please watch the prototype / gameplay video on our LinkedIn page. If the vision resonates with you, we'd love to learn more about you.",
            ],
            note: 'Note: This is an unpaid volunteer role intended for skill development, collaboration, and portfolio-building experience.',
        },
        role: {
            id: roleId,
            title: roleTitle,
            jobId: safeStr(job.jobId),
            team: safeStr(job.team),
            location: safeStr(job.location),
            employmentType: safeStr(job.employmentType),
            tags: job.tags || [],
            description: safeStr(job.description),
        },
        chapters,
    };
}

/**
 * Submits job application to the API
 */
export async function submitApplication(payload) {
    const res = await fetch(`${API_BASE}/apply`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify(payload),
    });

    const text = await res.text();
    const data = tryJsonParse(text);

    if (!res.ok) {
        const msg =
            data?.message || data?.error || `Submission failed (${res.status})`;
        throw new Error(msg);
    }

    return data || {};
}
