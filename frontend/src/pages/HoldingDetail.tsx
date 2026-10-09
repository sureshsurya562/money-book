import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { api, type Category, type Holding, type Pillar } from '../lib/api';
import { formatINR, formatPct } from '../lib/format';
import { usePortfolio } from '../context/PortfolioContext';
import PlatformChip from '../components/PlatformChip';
import CategoryIcon from '../components/CategoryIcon';

export default function HoldingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refresh } = usePortfolio();
  const [holding, setHolding] = useState<Holding | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [pillar, setPillar] = useState<Pillar | null>(null);
  const [error, setError] = useState('');
  const [saveMsg, setSaveMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState('');
  const [platform, setPlatform] = useState('');
  const [notes, setNotes] = useState('');
  const [investedAmount, setInvestedAmount] = useState(0);
  const [currentValue, setCurrentValue] = useState(0);
  const [coverAmount, setCoverAmount] = useState(0);

  useEffect(() => {
    if (!id) return;
    api
      .getHolding(id)
      .then(({ holding, category, pillar }) => {
        setHolding(holding);
        setCategory(category);
        setPillar(pillar);
        setName(holding.name);
        setPlatform(holding.platform || '');
        setNotes(holding.notes || '');
        setInvestedAmount(holding.investedAmount);
        setCurrentValue(holding.currentValue);
        setCoverAmount(holding.coverAmount);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function onDelete() {
    if (!id || !holding) return;
    if (!confirm(`Delete “${holding.name}”?`)) return;
    await api.deleteHolding(id);
    await refresh();
    navigate('/holdings');
  }

  async function onQuickSave(e: FormEvent) {
    e.preventDefault();
    if (!id || !holding) return;
    if (!name.trim()) {
      setError('Please enter a name');
      return;
    }
    setBusy(true);
    setError('');
    setSaveMsg('');
    try {
      const { holding: updated } = await api.updateHolding(id, {
        name: name.trim(),
        platform,
        notes,
        investedAmount,
        currentValue: holding.isProtection ? holding.currentValue : currentValue,
        coverAmount: holding.isProtection ? coverAmount : holding.coverAmount,
      });
      setHolding(updated);
      setName(updated.name);
      setPlatform(updated.platform || '');
      setNotes(updated.notes || '');
      setInvestedAmount(updated.investedAmount);
      setCurrentValue(updated.currentValue);
      setCoverAmount(updated.coverAmount);
      await refresh();
      setSaveMsg('Saved — name, note, and amounts updated');
      setTimeout(() => setSaveMsg(''), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="loading-screen">Loading…</div>;
  if (!holding || !category) {
    return error ? <div className="error-banner">{error}</div> : null;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="eyebrow">{pillar?.name || 'Money Book'}</p>
          <h1>{holding.name}</h1>
          <p style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span
              className="badge"
              style={{ background: `${holding.pillarColor}18`, color: holding.pillarColor }}
            >
              {holding.pillarName}
            </span>
            <span className="badge">
              <CategoryIcon name={category.icon} size={14} color={category.color} />
              {holding.categoryName}
            </span>
          </p>
        </div>
        <div className="toolbar">
          <Link className="btn btn-primary" to={`/holdings/${id}/edit`}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Pencil size={16} />
              Full edit
            </span>
          </Link>
          <button className="btn btn-danger" onClick={onDelete}>
            Delete
          </button>
          <Link className="btn btn-ghost" to="/holdings">
            Back
          </Link>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 16, maxWidth: 820 }}>
        <h2>Change name, note, or amounts</h2>
        <p className="hint">
          Your personal note will also show on the dashboard under this item — so family context stays
          visible.
        </p>
        <form className="form" onSubmit={onQuickSave}>
          {error && <div className="error-banner">{error}</div>}
          {saveMsg && (
            <div
              className="error-banner"
              style={{ background: 'rgba(15,118,110,0.1)', color: 'var(--gain)' }}
            >
              {saveMsg}
            </div>
          )}

          <label>
            Name (change this to whatever is clear for you)
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Shares — iB Group (Father)"
              required
            />
          </label>

          <label>
            Platform / app
            <input
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              placeholder="e.g. Groww, Yono SBI, iB Group"
            />
          </label>

          <label>
            Personal note (shown on dashboard)
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. On father’s name — took ₹10L, Lingampally / Goud family investment. Keep this for family record."
            />
          </label>

          <div className="form-row">
            <label>
              Money put in (₹)
              <input
                type="number"
                min={0}
                value={investedAmount}
                onChange={(e) => setInvestedAmount(Number(e.target.value))}
              />
            </label>
            {holding.isProtection ? (
              <label>
                Cover amount (₹)
                <input
                  type="number"
                  min={0}
                  value={coverAmount}
                  onChange={(e) => setCoverAmount(Number(e.target.value))}
                />
              </label>
            ) : (
              <label>
                Worth today (₹)
                <input
                  type="number"
                  min={0}
                  value={currentValue}
                  onChange={(e) => setCurrentValue(Number(e.target.value))}
                />
              </label>
            )}
          </div>

          <button className="btn btn-primary" disabled={busy}>
            {busy ? 'Saving…' : 'Save name, note & amounts'}
          </button>
        </form>
      </div>

      <div className="panel" style={{ maxWidth: 820 }}>
        <h2>Current snapshot</h2>
        <p className="hint">Gain updates automatically when you change the amounts above.</p>
        <div className="stats-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="stat">
            <div className="stat-label">Money put in</div>
            <div className="stat-value">{formatINR(holding.investedAmount)}</div>
          </div>
          <div className="stat">
            <div className="stat-label">
              {holding.isProtection ? 'Cover amount' : 'Worth today'}
            </div>
            <div className="stat-value">
              {holding.isProtection
                ? formatINR(holding.coverAmount)
                : formatINR(holding.currentValue)}
            </div>
          </div>
          {!holding.isProtection && (
            <div className="stat">
              <div className="stat-label">Gain / loss</div>
              <div className={`stat-value ${holding.profit >= 0 ? 'gain' : 'loss'}`}>
                {formatINR(holding.profit)}
                <span className="stat-sub">{formatPct(holding.profitPct)}</span>
              </div>
            </div>
          )}
          <div className="stat">
            <div className="stat-label">Platform / app</div>
            <div className="stat-value" style={{ fontSize: '1.05rem' }}>
              <PlatformChip platform={holding.platform} />
            </div>
          </div>
        </div>

        {holding.notes && (
          <div className="personal-note-box">
            <strong>Your note</strong>
            <p>{holding.notes}</p>
          </div>
        )}

        {holding.isRecurring && (
          <p style={{ marginTop: 16 }}>
            <strong>Regular payment:</strong> {formatINR(holding.recurringAmount)} /{' '}
            {holding.recurringFrequency}
          </p>
        )}
        {holding.investedDate && (
          <p>
            <strong>Started:</strong> {holding.investedDate}
          </p>
        )}
      </div>
    </div>
  );
}
