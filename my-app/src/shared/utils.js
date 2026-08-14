// src/shared/utils.js
// Shared utility functions

/**
 * Safely parses JSON string
 */
export function tryJsonParse(x) {
    if (!x) return null;
    if (typeof x === 'object') return x;
    try { return JSON.parse(x); } catch { return null; }
}

/**
 * Unwraps API response payload
 */
export function unwrapPayload(data) {
    let p = data;
    if (typeof p === 'string') p = tryJsonParse(p) || { raw: p };
    if (p && typeof p.body === 'string') p = tryJsonParse(p.body) || p;
    return p || {};
}

/**
 * Converts value to string safely
 */
export function safeStr(x) {
    return x === null || x === undefined ? '' : String(x);
}

/**
 * Converts snake_case or kebab-case ID to human-readable label
 */
export function humanizeId(id) {
    const s = safeStr(id).replace(/[_-]+/g, ' ').trim();
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Infers input type from field ID
 */
export function inferTypeFromId(id) {
    const k = safeStr(id).toLowerCase();
    if (k.includes('email')) return 'email';
    if (k.includes('phone') || k.includes('mobile')) return 'tel';
    if (k.includes('resume') || k.includes('portfolio') || k.includes('link') || k.includes('url')) return 'url';
    return 'text';
}
