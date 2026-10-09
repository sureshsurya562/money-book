import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function ShareSettings() {
  const { user, setUser } = useAuth();
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const shareUrl =
    user?.shareToken && typeof window !== 'undefined'
      ? `${window.location.origin}/p/${user.shareToken}`
      : '';

  async function toggleShare(enabled: boolean) {
    setBusy(true);
    setError('');
    try {
      const { user: updated } = await api.updateShare({ enabled });
      setUser(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setBusy(false);
    }
  }

  async function rotateLink() {
    setBusy(true);
    setError('');
    try {
      const { user: updated } = await api.updateShare({ rotate: true, enabled: true });
      setUser(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Share portfolio</h1>
          <p>
            Generate a public read-only page of your entire portfolio for family or advisors — no login
            required for viewers.
          </p>
        </div>
      </div>

      <div className="panel" style={{ maxWidth: 720 }}>
        {error && <div className="error-banner">{error}</div>}

        <h2>Public share link</h2>
        <p className="hint">
          Dashboard and editing stay private. Only this link shows the view-only portfolio when sharing
          is enabled.
        </p>

        <div className="toolbar" style={{ marginBottom: 16 }}>
          {user?.shareEnabled ? (
            <button className="btn btn-danger" disabled={busy} onClick={() => toggleShare(false)}>
              Disable sharing
            </button>
          ) : (
            <button className="btn btn-primary" disabled={busy} onClick={() => toggleShare(true)}>
              Enable sharing
            </button>
          )}
          <button className="btn btn-ghost" disabled={busy} onClick={rotateLink}>
            Rotate link
          </button>
        </div>

        {user?.shareEnabled && shareUrl ? (
          <div className="share-box">
            <code>{shareUrl}</code>
            <button className="btn btn-gold btn-small" onClick={copy}>
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          </div>
        ) : (
          <p style={{ color: 'var(--muted)' }}>Sharing is currently off.</p>
        )}
      </div>
    </div>
  );
}
