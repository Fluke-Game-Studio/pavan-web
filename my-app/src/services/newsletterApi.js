import { resolveApiBase } from '../apiBase';

const API_BASE = resolveApiBase();

function safe(v) {
  return String(v ?? '').trim();
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

export const newsletterApi = {
  async subscribeManual(body) {
    const res = await fetch(`${API_BASE}/newsletter/subscribe`, {
      method: 'POST',
      headers: { Accept: '*/*', 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const payload = await readJson(res);
    if (!res.ok || !payload?.ok) {
      throw new Error(payload?.error || `newsletter subscribe failed (${res.status})`);
    }
    return payload;
  },

  async subscribeGoogle(body) {
    const res = await fetch(`${API_BASE}/newsletter/google/subscribe`, {
      method: 'POST',
      headers: { Accept: '*/*', 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const payload = await readJson(res);
    if (!res.ok || !payload?.ok) {
      throw new Error(payload?.error || `newsletter google subscribe failed (${res.status})`);
    }
    return payload;
  },

  async startDiscordConnect(body) {
    const res = await fetch(`${API_BASE}/newsletter/discord/start`, {
      method: 'POST',
      headers: { Accept: '*/*', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        returnTo: safe(body?.returnTo),
        phone: safe(body?.phone),
        source: safe(body?.source),
        consent_newsletter: body?.consent_newsletter,
        consent_marketing: body?.consent_marketing,
      }),
    });
    const payload = await readJson(res);
    if (!res.ok || !payload?.ok || !payload?.authorizeUrl) {
      throw new Error(payload?.error || `newsletter discord start failed (${res.status})`);
    }
    return payload;
  },

  async unsubscribe(body) {
    const res = await fetch(`${API_BASE}/newsletter/unsubscribe`, {
      method: 'POST',
      headers: { Accept: '*/*', 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const payload = await readJson(res);
    if (!res.ok || !payload?.ok) {
      throw new Error(payload?.error || `newsletter unsubscribe failed (${res.status})`);
    }
    return payload;
  },
};
