import { resolveApiBase } from '../apiBase';

const API_BASE = resolveApiBase();

function safe(v) {
  return String(v ?? '').trim();
}

function normalizeBase(base) {
  return String(base || '').trim().replace(/\/+$/, '');
}

function buildCandidateBases() {
  const explicit = normalizeBase(import.meta.env.VITE_API_BASE || '');
  const current = normalizeBase(API_BASE);
  const fallback = '/api';
  const directProduction = 'https://xtipeal88c.execute-api.us-east-1.amazonaws.com';

  const candidates = [];
  if (explicit) candidates.push(explicit);
  if (current && !candidates.includes(current)) candidates.push(current);
  if (!candidates.includes(fallback)) candidates.push(fallback);
  if (!candidates.includes(directProduction)) candidates.push(directProduction);

  return candidates;
}

async function readJson(res) {
  const txt = await res.text().catch(() => '');
  if (!txt) return {};
  try {
    return JSON.parse(txt);
  } catch {
    return { raw: txt };
  }
}

function summarizeRaw(raw) {
  const text = String(raw || '').replace(/\s+/g, ' ').trim();
  if (!text) return '';
  return text.length > 220 ? `${text.slice(0, 220)}…` : text;
}

async function postJsonWithFallback(path, body, errorLabel) {
  const candidates = buildCandidateBases();
  let lastError = null;

  for (const base of candidates) {
    try {
      const res = await fetch(`${base}${path}`, {
        method: 'POST',
        headers: { Accept: '*/*', 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const payload = await readJson(res);
      if (res.ok && payload?.ok) return payload;
      const raw = summarizeRaw(payload?.raw);
      const details = [
        `status=${res.status}`,
        `url=${base}${path}`,
        payload?.error ? `error=${payload.error}` : '',
        raw ? `raw=${raw}` : '',
      ]
        .filter(Boolean)
        .join(' | ');
      lastError = `newsletter ${errorLabel} failed (${res.status})${details ? ` :: ${details}` : ''}`;
    } catch (err) {
      lastError = String(err?.message || err || `newsletter ${errorLabel} failed`);
    }
  }

  throw new Error(lastError || `newsletter ${errorLabel} failed`);
}

export const newsletterApi = {
  async subscribeManual(body) {
    return postJsonWithFallback('/newsletter/subscribe', body, 'subscribe');
  },

  async subscribeGoogle(body) {
    return postJsonWithFallback('/newsletter/google/subscribe', body, 'google subscribe');
  },

  async startDiscordConnect(body) {
    const payload = await postJsonWithFallback('/newsletter/discord/start', {
      returnTo: safe(body?.returnTo),
      phone: safe(body?.phone),
      source: safe(body?.source),
      consent_newsletter: body?.consent_newsletter,
      consent_marketing: body?.consent_marketing,
    }, 'discord start');
    if (!payload?.authorizeUrl) {
      throw new Error('newsletter discord start failed (missing-authorize-url)');
    }
    return payload;
  },

  async unsubscribe(body) {
    return postJsonWithFallback('/newsletter/unsubscribe', body, 'unsubscribe');
  },
};
