import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, type Category, type HoldingInput, type Pillar } from '../lib/api';
import { usePortfolio } from '../context/PortfolioContext';

const empty: HoldingInput = {
  categoryId: 'fixed_deposits',
  name: '',
  platform: '',
  investedAmount: 0,
  currentValue: 0,
  investedDate: '',
  notes: '',
  isProtection: false,
  isRecurring: false,
  recurringAmount: 0,
  recurringFrequency: 'monthly',
  coverAmount: 0,
};

export default function HoldingForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { refresh } = usePortfolio();
  const [categories, setCategories] = useState<Category[]>([]);
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [form, setForm] = useState<HoldingInput>(empty);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    api.getCategories().then(({ categories, pillars }) => {
      setCategories(categories);
      setPillars(pillars);
    });
  }, []);

  useEffect(() => {
    if (!id) return;
    api
      .getHolding(id)
      .then(({ holding }) => {
        setForm({
          categoryId: holding.categoryId,
          name: holding.name,
          platform: holding.platform || '',
          investedAmount: holding.investedAmount,
          currentValue: holding.currentValue,
          investedDate: holding.investedDate || '',
          notes: holding.notes || '',
          isProtection: holding.isProtection,
          isRecurring: holding.isRecurring,
          recurringAmount: holding.recurringAmount,
          recurringFrequency: holding.recurringFrequency || 'monthly',
          coverAmount: holding.coverAmount,
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const grouped = useMemo(() => {
    return pillars.map((p) => ({
      pillar: p,
      categories: categories.filter((c) => c.pillarId === p.id),
    }));
  }, [pillars, categories]);

  const selected = categories.find((c) => c.id === form.categoryId);

  function setField<K extends keyof HoldingInput>(key: K, value: HoldingInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onCategoryChange(categoryId: string) {
    const cat = categories.find((c) => c.id === categoryId);
    setForm((prev) => ({
      ...prev,
      categoryId,
      isProtection: cat?.pillarId === 'insurance',
    }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const payload = {
        ...form,
        isProtection:
          form.isProtection || selected?.pillarId === 'insurance' || false,
      };
      if (isEdit && id) {
        await api.updateHolding(id, payload);
        await refresh();
        navigate(`/holdings/${id}`);
      } else {
        const { holding } = await api.createHolding(payload);
        await refresh();
        navigate(`/holdings/${holding.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="loading-screen">Loading…</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="eyebrow">{isEdit ? 'Update' : 'Add'}</p>
          <h1>{isEdit ? 'Edit name & amounts' : 'Add to Money Book'}</h1>
          <p>
            {isEdit
              ? 'Change the name to make it clearer, and update the amounts anytime.'
              : 'Pick the pillar and type, give it a clear name, then enter amounts.'}
          </p>
        </div>
        <Link className="btn btn-ghost" to={isEdit ? `/holdings/${id}` : '/holdings'}>
          Cancel
        </Link>
      </div>

      <div className="panel" style={{ maxWidth: 760 }}>
        <form className="form" onSubmit={onSubmit}>
          {error && <div className="error-banner">{error}</div>}

          <div className="form-section-label">1. Type</div>
          <label>
            Under which pillar / type?
            <select
              value={form.categoryId}
              onChange={(e) => onCategoryChange(e.target.value)}
              required
            >
              {grouped.map(({ pillar, categories: cats }) => (
                <optgroup key={pillar.id} label={`${pillar.name} — ${pillar.tagline}`}>
                  {cats.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>

          {selected && (
            <div
              className="panel"
              style={{
                margin: 0,
                background: `${selected.color}10`,
                borderColor: `${selected.color}33`,
                boxShadow: 'none',
              }}
            >
              <strong>{selected.name}</strong>
              <p className="hint" style={{ marginBottom: 0 }}>
                {selected.description}
              </p>
            </div>
          )}

          <div className="form-section-label">2. Name — you can rename this anytime</div>
          <label>
            Clear name for this item
            <input
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              placeholder="e.g. Emergency SBI FD — 444 days, Family term cover"
              required
            />
          </label>

          <label>
            Where do you manage it? (app / bank / platform)
            <input
              value={form.platform || ''}
              onChange={(e) => setField('platform', e.target.value)}
              placeholder="e.g. Groww, Yono SBI, WintWealth"
            />
          </label>

          <div className="form-section-label">3. Amounts</div>
          <div className="form-row">
            <label>
              Money put in (₹)
              <input
                type="number"
                min={0}
                step="1"
                value={form.investedAmount ?? 0}
                onChange={(e) => setField('investedAmount', Number(e.target.value))}
              />
            </label>
            <label>
              Worth today (₹)
              <input
                type="number"
                min={0}
                step="1"
                value={form.currentValue ?? 0}
                onChange={(e) => setField('currentValue', Number(e.target.value))}
                disabled={selected?.pillarId === 'insurance'}
              />
            </label>
          </div>

          <label>
            Date you started / invested
            <input
              type="date"
              value={form.investedDate || ''}
              onChange={(e) => setField('investedDate', e.target.value)}
            />
          </label>

          {(selected?.pillarId === 'insurance' || form.isProtection) && (
            <label>
              Cover amount (₹) — protection for family
              <input
                type="number"
                min={0}
                value={form.coverAmount ?? 0}
                onChange={(e) => setField('coverAmount', Number(e.target.value))}
              />
            </label>
          )}

          <div className="check-row">
            <input
              id="isRecurring"
              type="checkbox"
              checked={!!form.isRecurring}
              onChange={(e) => setField('isRecurring', e.target.checked)}
            />
            <label htmlFor="isRecurring">This has a monthly / yearly payment (SIP, premium, APY…)</label>
          </div>

          {form.isRecurring && (
            <div className="form-row">
              <label>
                Payment amount (₹)
                <input
                  type="number"
                  min={0}
                  value={form.recurringAmount ?? 0}
                  onChange={(e) => setField('recurringAmount', Number(e.target.value))}
                />
              </label>
              <label>
                How often?
                <select
                  value={form.recurringFrequency || 'monthly'}
                  onChange={(e) => setField('recurringFrequency', e.target.value)}
                >
                  <option value="monthly">Every month</option>
                  <option value="yearly">Every year</option>
                </select>
              </label>
            </div>
          )}

          <div className="form-section-label">4. Personal note (shown on dashboard)</div>
          <label>
            Write anything you want to remember — family context, whose name, place, reason…
            <textarea
              value={form.notes || ''}
              onChange={(e) => setField('notes', e.target.value)}
              placeholder="e.g. On father’s name — ₹10L at iB Group, Lingampally / family investment"
            />
          </label>

          <button className="btn btn-primary" disabled={busy}>
            {busy ? 'Saving…' : isEdit ? 'Save name & amounts' : 'Add to Money Book'}
          </button>
        </form>
      </div>
    </div>
  );
}
