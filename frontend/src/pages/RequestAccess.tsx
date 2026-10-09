import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

export default function RequestAccess() {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.requestAccess({ name, mobile, note });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save request');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="brand-mark">Money Book</div>
        {done ? (
          <>
            <h2>Request received</h2>
            <p className="lede">
              Thanks — we’ve saved your number. We’ll review and get back to you about
              tracking your finances in Money Book.
            </p>
            <p className="lede" style={{ marginTop: 8 }}>
              You can close this page now.
            </p>
          </>
        ) : (
          <>
            <h2>Request access</h2>
            <p className="lede">
              Want to track your savings and investments in real time? Share your mobile
              number — open signup isn’t available yet. We’ll check your request and follow up.
            </p>
            <form className="form" onSubmit={onSubmit}>
              {error && <div className="error-banner">{error}</div>}
              <label>
                Your name (optional)
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya"
                  maxLength={80}
                />
              </label>
              <label>
                Mobile number
                <input
                  type="tel"
                  inputMode="numeric"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="10-digit mobile"
                  required
                  autoComplete="tel"
                />
              </label>
              <label>
                Anything you’d like to say (optional)
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. I want to track FDs and mutual funds"
                  maxLength={280}
                  rows={3}
                />
              </label>
              <button className="btn btn-primary" disabled={busy}>
                {busy ? 'Sending…' : 'Submit request'}
              </button>
            </form>
            <div className="auth-switch">
              Already have access? <Link to="/login">Sign in</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
