import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, type Holding, type Summary } from '../lib/api';
import DashboardView from '../components/DashboardView';

export default function PublicShare() {
  const { token } = useParams();
  const [ownerName, setOwnerName] = useState('');
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    api
      .getShared(token)
      .then(({ ownerName, holdings, summary }) => {
        setOwnerName(ownerName);
        setHoldings(holdings);
        setSummary(summary);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="loading-screen">Opening shared Money Book…</div>;

  if (error) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="brand-mark">Money Book</div>
          <h2>Link unavailable</h2>
          <p className="lede">{error}</p>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="main public-share-page">
      <DashboardView
        holdings={holdings}
        summary={summary}
        readOnly
        eyebrow="Shared Money Book"
        title={`${ownerName}'s dashboard`}
        subtitle="Same full money picture as their Money Book — read-only for family and friends."
        banner={
          <div className="public-banner">
            <div>
              <strong>{ownerName}'s Money Book</strong>
              <div style={{ opacity: 0.75, fontSize: '0.9rem' }}>
                Read-only shared view · same dashboard layout
              </div>
            </div>
            <div className="brand-mark" style={{ fontSize: '1.4rem' }}>
              Money Book
            </div>
          </div>
        }
      />
    </div>
  );
}
