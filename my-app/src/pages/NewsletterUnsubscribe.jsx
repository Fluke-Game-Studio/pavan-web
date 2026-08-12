import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, MailX, Sparkles } from 'lucide-react';

import { newsletterApi } from '../services/newsletterApi';

import './NewsletterUnsubscribe.css';

export default function NewsletterUnsubscribe() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Unsubscribing you now...');
  const email = String(params.get('email') || '').trim();
  const token = String(params.get('token') || '').trim();

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!email || !token) {
        setStatus('error');
        setMessage('Missing unsubscribe information.');
        return;
      }

      try {
        const result = await newsletterApi.unsubscribe({
          email,
          token,
          source_page: window.location.href,
          origin: window.location.origin,
        });

        if (cancelled) return;
        setStatus('success');
        setMessage(
          result?.subscriber?.consent_marketing
            ? 'You have been unsubscribed from newsletter emails. Your marketing preference remains saved.'
            : 'You have been unsubscribed from newsletter emails and your record remains saved.'
        );
      } catch (err) {
        if (cancelled) return;
        setStatus('error');
        setMessage(String(err?.message || 'Unsubscribe failed.'));
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [email, token]);

  return (
    <div className="newsletter-unsubscribe">
      <div className="newsletter-unsubscribe__bg" />
      <div className="newsletter-unsubscribe__halo newsletter-unsubscribe__halo--gold" />
      <div className="newsletter-unsubscribe__halo newsletter-unsubscribe__halo--blue" />

      <div className="newsletter-unsubscribe__shell">
        <div className="newsletter-unsubscribe__card">
          <div className="newsletter-unsubscribe__header">
            <div className="newsletter-unsubscribe__icon">
              <MailX size={20} />
            </div>
            <div>
              <p className="newsletter-unsubscribe__eyebrow">Newsletter</p>
              <h1>Unsubscribe</h1>
            </div>
          </div>

          <div className="newsletter-unsubscribe__body">
            {status === 'loading' ? (
              <div className="newsletter-unsubscribe__state newsletter-unsubscribe__state--loading">
                <Loader2 size={18} className="newsletter-unsubscribe__spin" />
                {message}
              </div>
            ) : null}

            {status === 'success' ? (
              <div className="newsletter-unsubscribe__state newsletter-unsubscribe__state--success">
                <CheckCircle2 size={18} className="newsletter-unsubscribe__success-icon" />
                <div>
                  <div className="newsletter-unsubscribe__message">{message}</div>
                  {email ? <div className="newsletter-unsubscribe__email">{email}</div> : null}
                </div>
              </div>
            ) : null}

            {status === 'error' ? (
              <div className="newsletter-unsubscribe__state newsletter-unsubscribe__state--error">{message}</div>
            ) : null}
          </div>

          <div className="newsletter-unsubscribe__footer">
            <Link to="/" className="newsletter-unsubscribe__home">
              <Sparkles size={14} />
              Back to site
            </Link>
            <span className="newsletter-unsubscribe__note">
              Your subscriber record stays on file for marketing preference tracking.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
