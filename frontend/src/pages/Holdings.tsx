import { useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import { formatINR, formatPct } from '../lib/format';
import PlatformChip from '../components/PlatformChip';
import CategoryIcon from '../components/CategoryIcon';

export default function Holdings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category') || 'all';
  const pillarFilter = searchParams.get('pillar') || 'all';
  const navigate = useNavigate();
  const { holdings, categories, pillars, loading, error } = usePortfolio();

  const filtered = useMemo(() => {
    return holdings.filter((h) => {
      if (pillarFilter !== 'all' && h.pillarId !== pillarFilter) return false;
      if (categoryFilter !== 'all' && h.categoryId !== categoryFilter) return false;
      return true;
    });
  }, [holdings, categoryFilter, pillarFilter]);

  const visibleCategories = useMemo(() => {
    if (pillarFilter === 'all') return categories;
    return categories.filter((c) => c.pillarId === pillarFilter);
  }, [categories, pillarFilter]);

  if (loading && holdings.length === 0) {
    return <div className="loading-screen">Loading holdings…</div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="eyebrow">All entries</p>
          <h1>Your Money Book items</h1>
          <p>Filter by pillar, then by type. Click any row for details and benefits.</p>
        </div>
        <Link className="btn btn-primary" to="/holdings/new">
          Add money
        </Link>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="filters">
        <button
          className={`chip ${pillarFilter === 'all' && categoryFilter === 'all' ? 'active' : ''}`}
          onClick={() => setSearchParams({})}
        >
          All
        </button>
        {pillars.map((p) => (
          <button
            key={p.id}
            className={`chip ${pillarFilter === p.id && categoryFilter === 'all' ? 'active' : ''}`}
            onClick={() => setSearchParams({ pillar: p.id })}
          >
            {p.shortName}
          </button>
        ))}
      </div>

      <div className="filters">
        <button
          className={`chip ${categoryFilter === 'all' ? 'active' : ''}`}
          onClick={() =>
            setSearchParams(pillarFilter === 'all' ? {} : { pillar: pillarFilter })
          }
        >
          All types
        </button>
        {visibleCategories.map((c) => (
          <button
            key={c.id}
            className={`chip ${categoryFilter === c.id ? 'active' : ''}`}
            onClick={() =>
              setSearchParams(
                pillarFilter === 'all'
                  ? { category: c.id }
                  : { pillar: pillarFilter, category: c.id }
              )
            }
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <CategoryIcon name={c.icon} size={14} color={c.color} />
              {c.shortName}
            </span>
          </button>
        ))}
      </div>

      <div className="panel">
        {filtered.length === 0 ? (
          <div className="empty">No items here yet. Add one to start this section.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="holdings-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Pillar</th>
                  <th>Type</th>
                  <th>Platform</th>
                  <th>Put in</th>
                  <th>Worth today</th>
                  <th>Gain</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((h) => (
                  <tr key={h.id} onClick={() => navigate(`/holdings/${h.id}`)}>
                    <td>
                      <strong>{h.name}</strong>
                      {h.notes && <div className="holding-note">{h.notes}</div>}
                      {h.isRecurring && h.recurringAmount > 0 && (
                        <div style={{ color: 'var(--muted)', fontSize: '0.82rem', marginTop: 4 }}>
                          {formatINR(h.recurringAmount)} / {h.recurringFrequency}
                        </div>
                      )}
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{ background: `${h.pillarColor}18`, color: h.pillarColor }}
                      >
                        {h.pillarName}
                      </span>
                    </td>
                    <td>
                      <span className="badge">
                        <CategoryIcon name={h.categoryIcon} size={14} color={h.categoryColor} />
                        {h.categoryName}
                      </span>
                    </td>
                    <td>
                      <PlatformChip platform={h.platform} />
                    </td>
                    <td>{formatINR(h.investedAmount, true)}</td>
                    <td>
                      {h.isProtection
                        ? `${formatINR(h.coverAmount, true)} cover`
                        : formatINR(h.currentValue, true)}
                    </td>
                    <td className={h.profit >= 0 ? 'gain' : 'loss'}>
                      {h.isProtection
                        ? 'Protection'
                        : `${formatINR(h.profit, true)} (${formatPct(h.profitPct)})`}
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
