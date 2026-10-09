import { useEffect, useState } from 'react';
import { api } from '../lib/api';

type AccessRequest = {
  id: string;
  name: string | null;
  mobile: string;
  note: string | null;
  status: string;
  createdAt: string;
};

export default function AccessRequests() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .listAccessRequests()
      .then(({ requests }) => setRequests(requests))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen">Loading requests…</div>;

  return (
    <div className="dash">
      <div className="page-header">
        <div>
          <p className="eyebrow">Inbox</p>
          <h1>Access requests</h1>
          <p>People who saw a shared Money Book and asked to track their own finances.</p>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="panel">
        {requests.length === 0 ? (
          <div className="empty">No access requests yet.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="holdings-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Note</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} style={{ cursor: 'default' }}>
                    <td>{r.createdAt}</td>
                    <td>{r.name || '—'}</td>
                    <td>
                      <strong>{r.mobile}</strong>
                    </td>
                    <td>{r.note || '—'}</td>
                    <td>
                      <span className="badge">{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
