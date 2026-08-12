import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, CheckCircle2, Loader2, Mail, Send, Sparkles, X } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { FaDiscord } from 'react-icons/fa';

import { newsletterApi } from '../services/newsletterApi';

import './NewsletterBell.css';

const EMAIL_KEY = 'pavan_newsletter_email_v1';
const DISCORD_JOIN_URL = 'https://discord.gg/xDQPgXkj5X';
const GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();

function safeStr(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function parseJwtPayload(credential) {
  try {
    const payload = String(credential || '').split('.')[1] || '';
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

export default function NewsletterBell({ stacked = false }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [consentNewsletter, setConsentNewsletter] = useState(true);
  const [consentMarketing, setConsentMarketing] = useState(true);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [identity, setIdentity] = useState(null);
  const [googleReady, setGoogleReady] = useState(false);
  const emailRef = useRef('');
  const consentNewsletterRef = useRef(true);
  const consentMarketingRef = useRef(true);
  const googleInitializedRef = useRef(false);
  const successTimerRef = useRef(null);
  const bellAudioRef = useRef(null);

  const preferenceSummary = () => {
    const newsletter = consentNewsletterRef.current;
    const marketing = consentMarketingRef.current;
    if (newsletter && marketing) return 'Newsletter and marketing are enabled.';
    if (newsletter) return 'Newsletter emails are enabled.';
    if (marketing) return 'Marketing emails are enabled.';
    return 'No email consent is enabled.';
  };

  const closePanel = () => {
    if (successTimerRef.current) {
      window.clearTimeout(successTimerRef.current);
      successTimerRef.current = null;
    }
    setOpen(false);
  };

  const handleGoogleCredentialResponse = async (response) => {
    const credential = safeStr(response?.credential);
    const payload = parseJwtPayload(credential);
    const nextEmail = safeStr(payload?.email);
    const name = safeStr(payload?.name || payload?.given_name || '');

    if (!nextEmail) {
      setStatus('error');
      setError('Google did not return an email address.');
      return;
    }

    setStatus('loading-google');
    setError('');
    setMessage('');

    try {
      const result = await newsletterApi.subscribeGoogle({
        email: nextEmail,
        name,
        google_sub: safeStr(payload?.sub),
        picture: safeStr(payload?.picture),
        source: 'pavan-newsletter',
        source_page: window.location.href,
        consent_newsletter: consentNewsletterRef.current,
        consent_marketing: consentMarketingRef.current,
      });

      setEmail(safeStr(result?.subscriber?.email || nextEmail));
      setIdentity({
        provider: 'google',
        name: safeStr(result?.subscriber?.name || name),
        email: safeStr(result?.subscriber?.email || nextEmail),
        avatar: safeStr(payload?.picture),
      });
      setStatus('success');
      setMessage(
        consentNewsletterRef.current || consentMarketingRef.current
          ? `Google connected. ${preferenceSummary()}`
          : 'Google connected. Your record is saved with no email consent.'
      );

      if (successTimerRef.current) {
        window.clearTimeout(successTimerRef.current);
      }
      successTimerRef.current = window.setTimeout(() => {
        setOpen(false);
      }, 1400);
    } catch (err) {
      setStatus('error');
      setError(safeStr(err?.message || 'Google subscribe failed.'));
    }
  };

  useEffect(() => {
    if (!open) return undefined;

    setStatus('idle');
    setError('');
    setMessage('');
    setIdentity(null);
    setConsentNewsletter(true);
    setConsentMarketing(true);

    try {
      const savedEmail = window.localStorage.getItem(EMAIL_KEY);
      if (savedEmail !== null) {
        setEmail(savedEmail);
      }
    } catch {}

    return undefined;
  }, [open]);

  useEffect(() => {
    emailRef.current = email;
    try {
      window.localStorage.setItem(EMAIL_KEY, email);
    } catch {}
  }, [email]);

  useEffect(() => {
    consentNewsletterRef.current = consentNewsletter;
    consentMarketingRef.current = consentMarketing;
  }, [consentNewsletter, consentMarketing]);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) {
        window.clearTimeout(successTimerRef.current);
        successTimerRef.current = null;
      }
      if (bellAudioRef.current) {
        bellAudioRef.current.pause();
        bellAudioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!bellAudioRef.current) {
      const audio = new Audio('/ringingbellaudio.mp3');
      audio.preload = 'auto';
      audio.volume = 0.85;
      bellAudioRef.current = audio;
    }
  }, []);

  useEffect(() => {
    document.body.classList.toggle('newsletter-bell-open', open);

    return () => {
      document.body.classList.remove('newsletter-bell-open');
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    let cancelled = false;
    let tries = 0;

    setGoogleReady(false);

    const initGoogle = () => {
      if (cancelled) return;

      if (!GOOGLE_CLIENT_ID) {
        setError('Google sign-in is not configured yet.');
        return;
      }

      if (!window.google?.accounts?.id) {
        tries += 1;
        if (tries > 40) {
          setError('Google sign-in could not load. You can still continue with Discord or email.');
          return;
        }
        window.setTimeout(initGoogle, 150);
        return;
      }

      try {
        if (!googleInitializedRef.current) {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCredentialResponse,
            context: 'signup',
            cancel_on_tap_outside: true,
          });
          googleInitializedRef.current = true;
        }

        setGoogleReady(true);
      } catch {
        setError('Google sign-in could not initialize. You can still continue with Discord or email.');
      }
    };

    initGoogle();

    return () => {
      cancelled = true;
    };
  }, [open]);

  async function handleManualSubmit(event) {
    event.preventDefault();
    if (status === 'loading-google' || status === 'loading-manual') return;

    const nextEmail = safeStr(emailRef.current);
    if (!isValidEmail(nextEmail)) {
      setStatus('error');
      setError('Enter a valid email address.');
      return;
    }

    setStatus('loading-manual');
    setError('');
    setMessage('');

    try {
      const result = await newsletterApi.subscribeManual({
        email: nextEmail,
        source: 'pavan-newsletter',
        source_page: window.location.href,
        consent_newsletter: consentNewsletterRef.current,
        consent_marketing: consentMarketingRef.current,
      });

      setIdentity({
        provider: 'manual',
        name: safeStr(result?.subscriber?.name || ''),
        email: safeStr(result?.subscriber?.email || nextEmail),
        avatar: '',
      });
      setStatus('success');
      setMessage(
        consentNewsletterRef.current || consentMarketingRef.current
          ? `Email saved. ${preferenceSummary()}`
          : 'Email saved. Your record is stored with no email consent.'
      );

      if (successTimerRef.current) {
        window.clearTimeout(successTimerRef.current);
      }
      successTimerRef.current = window.setTimeout(() => {
        setOpen(false);
      }, 1400);
    } catch (err) {
      setStatus('error');
      setError(safeStr(err?.message || 'Email save failed.'));
    }
  }

  function handleDiscordJoin() {
    try {
      window.open(DISCORD_JOIN_URL, '_blank', 'noopener,noreferrer');
    } catch {
      window.location.href = DISCORD_JOIN_URL;
    }
  }

  function handleGoogleConnect() {
    if (status === 'loading-google' || status === 'loading-manual') return;

    if (!googleReady || !window.google?.accounts?.id) {
      setStatus('error');
      setError('Google sign-in is still loading. Please try again.');
      return;
    }

    setStatus('loading-google');
    setError('');
    setMessage('');

    try {
      window.google.accounts.id.prompt((notification) => {
        if (!notification) return;

        if (notification.isNotDisplayed?.()) {
          setStatus('error');
          setError('Google sign-in could not be displayed. Try email or Discord instead.');
          return;
        }

        if (notification.isSkippedMoment?.() || notification.isDismissedMoment?.()) {
          setStatus('idle');
          return;
        }
      });
    } catch (err) {
      setStatus('error');
      setError(safeStr(err?.message || 'Google sign-in failed.'));
    }
  }

  function handleLaunchClick() {
    const audio = bellAudioRef.current;
    if (audio) {
      try {
        audio.pause();
        audio.currentTime = 0;
        void audio.play();
      } catch {}
    }

    setOpen((current) => !current);
  }

  return (
    <div className={`newsletter-bell${stacked ? ' newsletter-bell--stacked' : ''}`}>
      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              className="newsletter-bell__backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closePanel}
            />

            <motion.div
              className="newsletter-bell__panel"
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.96 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="newsletter-bell-title"
            >
              <div className="newsletter-bell__glow newsletter-bell__glow--gold" />
              <div className="newsletter-bell__glow newsletter-bell__glow--blue" />

              <div className="newsletter-bell__header">
                <div className="newsletter-bell__title-wrap">
                  <div className="newsletter-bell__icon">
                    <Bell size={18} />
                  </div>
                  <div>
                    <p className="newsletter-bell__eyebrow">Newsletter Beacon</p>
                    <h3 id="newsletter-bell-title">Join the saga updates</h3>
                    <p className="newsletter-bell__copy">
                      Enter your email directly, or connect Google or Discord to save it instantly.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="newsletter-bell__close"
                  onClick={closePanel}
                  aria-label="Close newsletter panel"
                >
                  <X size={16} />
                </button>
              </div>

              <form className="newsletter-bell__body" onSubmit={handleManualSubmit}>
                <label className="newsletter-bell__field">
                  <span className="newsletter-bell__field-label">
                    <Mail size={13} />
                    Email address
                  </span>
                  <div className="newsletter-bell__email-row">
                    <input
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="newsletter-bell__input"
                    />

                    <button
                      type="submit"
                      disabled={status === 'loading-google' || status === 'loading-manual'}
                      className="newsletter-bell__email-submit"
                      aria-label="Save email"
                      title="Save email"
                    >
                      {status === 'loading-manual' ? (
                        <Loader2 size={15} className="newsletter-bell__spin" />
                      ) : (
                        <Send size={15} />
                      )}
                    </button>
                  </div>
                </label>

                <div className="newsletter-bell__consents">
                  <label className="newsletter-bell__consent">
                    <input
                      type="checkbox"
                      checked={consentNewsletter}
                      onChange={(event) => setConsentNewsletter(event.target.checked)}
                    />
                    <span>
                      <span className="newsletter-bell__consent-title">Subscribe to newsletter</span>
                      <span className="newsletter-bell__consent-copy">Product drops, story beats, and studio updates.</span>
                    </span>
                  </label>

                  <label className="newsletter-bell__consent">
                    <input
                      type="checkbox"
                      checked={consentMarketing}
                      onChange={(event) => setConsentMarketing(event.target.checked)}
                    />
                    <span>
                      <span className="newsletter-bell__consent-title">Subscribe to marketing</span>
                      <span className="newsletter-bell__consent-copy">Broader promotional emails and announcements.</span>
                    </span>
                  </label>
                </div>

                <div className="newsletter-bell__provider-grid">
                  <button
                    type="button"
                    onClick={handleGoogleConnect}
                    disabled={!googleReady || status === 'loading-google' || status === 'loading-manual'}
                    className="newsletter-bell__provider-card newsletter-bell__provider-card--google"
                  >
                    {status === 'loading-google' ? (
                      <>
                        <Loader2 size={16} className="newsletter-bell__spin" />
                        Connecting Google...
                      </>
                    ) : (
                      <>
                        <FcGoogle size={22} aria-hidden="true" />
                        <span>{googleReady ? 'Sign up with Google' : 'Loading Google...'}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleDiscordJoin}
                    className="newsletter-bell__provider-card newsletter-bell__provider-card--discord"
                  >
                    <FaDiscord size={18} aria-hidden="true" />
                    Join Discord
                  </button>
                </div>

                {status === 'success' ? (
                  <div className="newsletter-bell__status newsletter-bell__status--success">
                    <CheckCircle2 size={16} />
                    <div>
                      <div className="newsletter-bell__status-title">{message}</div>
                      {identity?.email ? (
                        <div className="newsletter-bell__status-sub">
                          Saved as {identity.name || 'subscriber'} {identity.email ? `(${identity.email})` : ''}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {status === 'error' && error ? (
                  <div className="newsletter-bell__status newsletter-bell__status--error">{error}</div>
                ) : null}

              </form>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={handleLaunchClick}
        animate={{ rotate: open ? 10 : 0, y: open ? -1 : 0 }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="newsletter-bell__launch"
        aria-label={open ? 'Close newsletter panel' : 'Open newsletter panel'}
        aria-expanded={open}
        title={open ? 'Close newsletter panel' : 'Open newsletter panel'}
      >
        <span className="newsletter-bell__launch-glow" />
        <Sparkles size={14} className="newsletter-bell__spark" />
        <Bell size={20} />
      </motion.button>
    </div>
  );
}
