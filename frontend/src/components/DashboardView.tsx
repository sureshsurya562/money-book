import { useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, CircleHelp, X } from 'lucide-react';
import type { Holding, PillarSummary, SubcategorySummary, Summary } from '../lib/api';
import { formatINR, formatPct } from '../lib/format';
import AllocationChart from './AllocationChart';
import CategoryIcon from './CategoryIcon';
import InfoModal from './InfoModal';
import PlatformChip from './PlatformChip';

type InfoTarget =
  | { kind: 'pillar'; data: PillarSummary }
  | { kind: 'sub'; data: SubcategorySummary; pillarColor: string }
  | null;

type DashboardViewProps = {
  holdings: Holding[];
  summary: Summary;
  readOnly?: boolean;
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  banner?: ReactNode;
  toolbar?: ReactNode;
  onOpenHolding?: (id: string) => void;
};

export default function DashboardView({
  holdings,
  summary,
  readOnly = false,
  title = 'Money Book dashboard',
  subtitle = 'Four simple buckets — safety money, growth money, insurance cover, and retirement. Anyone in the family should understand this in one look.',
  eyebrow = 'Your full money picture',
  banner,
  toolbar,
  onOpenHolding,
}: DashboardViewProps) {
  const [openPillar, setOpenPillar] = useState<string | null>('growth');
  const [focusCategory, setFocusCategory] = useState<string | null>(null);
  const [infoTarget, setInfoTarget] = useState<InfoTarget>(null);

  const storyHoldings = holdings
    .filter((h) => !h.isProtection && h.currentValue > 0)
    .sort((a, b) => b.currentValue - a.currentValue)
    .slice(0, 10);

  function scrollToPillar(pillarId: string) {
    window.setTimeout(() => {
      document.getElementById(`pillar-${pillarId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 50);
  }

  function goToPillar(pillarId: string) {
    setOpenPillar(pillarId);
    setFocusCategory(null);
    scrollToPillar(pillarId);
  }

  function goToCategory(pillarId: string, categoryId: string) {
    setOpenPillar(pillarId);
    setFocusCategory(categoryId);
    scrollToPillar(pillarId);
  }

  function clearCategoryFocus() {
    setFocusCategory(null);
  }

  function openPillarInfo(e: MouseEvent, pillar: PillarSummary) {
    e.stopPropagation();
    setInfoTarget({ kind: 'pillar', data: pillar });
  }

  function openSubInfo(e: MouseEvent, sub: SubcategorySummary, pillarColor: string) {
    e.stopPropagation();
    setInfoTarget({ kind: 'sub', data: sub, pillarColor });
  }

  function openHolding(id: string) {
    if (readOnly || !onOpenHolding) return;
    onOpenHolding(id);
  }

  return (
    <div className="dash">
      {banner}

      <div className="page-header">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        {toolbar ? <div className="toolbar">{toolbar}</div> : null}
      </div>

      <section className="journey">
        <div className="journey-step">
          <span className="journey-num">1</span>
          <div>
            <strong>Keep safe money</strong>
            <p>Emergency fund first</p>
          </div>
        </div>
        <div className="journey-line" />
        <div className="journey-step">
          <span className="journey-num">2</span>
          <div>
            <strong>Protect family</strong>
            <p>Life & health cover</p>
          </div>
        </div>
        <div className="journey-line" />
        <div className="journey-step">
          <span className="journey-num">3</span>
          <div>
            <strong>Grow for years</strong>
            <p>Funds, stocks, property</p>
          </div>
        </div>
        <div className="journey-line" />
        <div className="journey-step">
          <span className="journey-num">4</span>
          <div>
            <strong>Plan retirement</strong>
            <p>PPF, NPS, EPF, APY</p>
          </div>
        </div>
      </section>

      <div className="section-kicker">Money you have today</div>
      <div className="stats-grid hero-stats">
        <div className="stat hero-stat">
          <div className="stat-label">Money put in (safety + growth)</div>
          <div className="stat-value">{formatINR(summary.totalInvested, true)}</div>
        </div>
        <div className="stat hero-stat">
          <div className="stat-label">Worth today</div>
          <div className="stat-value">{formatINR(summary.totalCurrent, true)}</div>
        </div>
        <div className="stat hero-stat">
          <div className="stat-label">Gain / loss</div>
          <div className={`stat-value ${summary.totalProfit >= 0 ? 'gain' : 'loss'}`}>
            {formatINR(summary.totalProfit, true)}
            <span className="stat-sub">{formatPct(summary.totalProfitPct)}</span>
          </div>
        </div>
        <div className="stat hero-stat">
          <div className="stat-label">Tracked wealth items</div>
          <div className="stat-value">{summary.assetCount}</div>
        </div>
      </div>

      <div className="panel chart-panel" style={{ marginBottom: 22 }}>
        <div className="chart-head">
          <div>
            <h2>Where your money sits</h2>
            <p className="hint">
              Click a pillar or type (e.g. MFs) to jump below and see only those items.
            </p>
            <p className="hint hint-mobile">
              Charts below are phone-friendly — tap pie slices or top types to jump to details.
            </p>
          </div>
        </div>
        <AllocationChart
          pillars={summary.byPillar}
          onSelectPillar={goToPillar}
          onSelectCategory={goToCategory}
        />
      </div>

      <div className="section-head" id="pillars-detail">
        <h2>All four pillars</h2>
        <p>
          Tap a pillar to open what’s inside. Safety & growth = money today; insurance &
          retirement = future cover / pension.
        </p>
      </div>

      <div className="pillar-stack">
        {summary.byPillar.map((pillar, index) => {
          const open = openPillar === pillar.id;
          const focusedSub = focusCategory
            ? pillar.subcategories.find((s) => s.categoryId === focusCategory)
            : null;
          const pillarHoldings = holdings.filter((h) => {
            if (h.pillarId !== pillar.id) return false;
            if (open && focusCategory) return h.categoryId === focusCategory;
            return true;
          });
          const visibleSubs =
            open && focusCategory
              ? pillar.subcategories.filter((s) => s.categoryId === focusCategory)
              : pillar.subcategories;

          return (
            <article
              key={pillar.id}
              id={`pillar-${pillar.id}`}
              className={`pillar-card ${open ? 'open' : ''} ${open && focusCategory ? 'filtered' : ''}`}
              style={
                {
                  '--pillar': pillar.color,
                  '--pillar-accent': pillar.accent,
                  animationDelay: `${index * 0.06}s`,
                } as CSSProperties
              }
            >
              <div className={`pillar-head-row ${open ? 'is-open' : ''}`}>
                <button
                  type="button"
                  className="pillar-head"
                  aria-expanded={open}
                  onClick={() => {
                    if (open) {
                      setOpenPillar(null);
                      setFocusCategory(null);
                    } else {
                      goToPillar(pillar.id);
                    }
                  }}
                >
                  <div className="pillar-icon-wrap">
                    <CategoryIcon name={pillar.icon} size={26} color={pillar.color} />
                  </div>
                  <div className="pillar-title">
                    <div className="pillar-kicker">Pillar {index + 1}</div>
                    <h3>{pillar.name}</h3>
                    <p>{pillar.tagline}</p>
                  </div>
                  <div className="pillar-metrics">
                    {pillar.id === 'insurance' ? (
                      <>
                        <div>
                          <span>Future cover</span>
                          <strong>{formatINR(pillar.cover, true)}</strong>
                        </div>
                        <div>
                          <span>Policies</span>
                          <strong>{pillar.count}</strong>
                        </div>
                      </>
                    ) : pillar.id === 'retirement' ? (
                      <>
                        <div>
                          <span>Corpus so far</span>
                          <strong>{formatINR(pillar.current, true)}</strong>
                        </div>
                        <div>
                          <span>Items</span>
                          <strong>{pillar.count}</strong>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <span>Worth today</span>
                          <strong>{formatINR(pillar.current, true)}</strong>
                        </div>
                        <div>
                          <span>Of wealth</span>
                          <strong>{pillar.allocationPct.toFixed(0)}%</strong>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="pillar-expand-cue" aria-hidden="true">
                    <span>{open ? 'Hide details' : 'View details'}</span>
                    <ChevronDown
                      size={18}
                      className={`pillar-chevron ${open ? 'open' : ''}`}
                    />
                  </div>
                </button>
                <button
                  type="button"
                  className="info-icon-btn"
                  onClick={(e) => openPillarInfo(e, pillar)}
                  title="Why this matters"
                  aria-label={`Why ${pillar.name} matters`}
                >
                  <CircleHelp size={18} />
                </button>
              </div>

              {open && (
                <div className="pillar-body">
                  {focusCategory && focusedSub && (
                    <div className="focus-banner">
                      <span>
                        Showing only <strong>{focusedSub.name}</strong>
                      </span>
                      <button type="button" className="chip" onClick={clearCategoryFocus}>
                        <X size={14} /> Show all in this pillar
                      </button>
                    </div>
                  )}
                  <div className="subcat-grid">
                    {visibleSubs.map((sub) => (
                      <div key={sub.categoryId} className="subcat-tile-wrap">
                        <button
                          type="button"
                          className={`subcat-tile ${focusCategory === sub.categoryId ? 'active' : ''}`}
                          onClick={() => goToCategory(pillar.id, sub.categoryId)}
                        >
                          <div
                            className="subcat-icon"
                            style={{ background: `${sub.color}18`, color: sub.color }}
                          >
                            <CategoryIcon name={sub.icon} size={20} color={sub.color} />
                          </div>
                          <div className="subcat-copy">
                            <strong>{sub.name}</strong>
                            <div className="subcat-meta">
                              {pillar.id === 'insurance' ? (
                                <span>
                                  Cover {formatINR(sub.cover, true)} · {sub.count} item
                                  {sub.count === 1 ? '' : 's'}
                                </span>
                              ) : (
                                <span>
                                  {formatINR(sub.current, true)} · {sub.count} item
                                  {sub.count === 1 ? '' : 's'}
                                </span>
                              )}
                              {sub.monthlyRecurring > 0 && (
                                <span className="recurring-pill">
                                  {formatINR(sub.monthlyRecurring)} / month
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                        <button
                          type="button"
                          className="subcat-info"
                          onClick={(e) => openSubInfo(e, sub, pillar.color)}
                          aria-label={`About ${sub.name}`}
                          title="What is this?"
                        >
                          <CircleHelp size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {pillarHoldings.length > 0 && (
                    <div className="pillar-holdings">
                      <h4>{readOnly ? 'Items in this pillar' : 'Your items in this pillar'}</h4>
                      <div className="pillar-holding-list">
                        {pillarHoldings.map((h) => {
                          const body = (
                            <>
                              <div>
                                <strong>{h.name}</strong>
                                {h.notes && <p className="holding-note">{h.notes}</p>}
                                <div className="row-meta">
                                  <PlatformChip platform={h.platform} />
                                  <span className="badge">{h.categoryName}</span>
                                </div>
                              </div>
                              <div className="row-nums">
                                {h.isProtection ? (
                                  <strong>{formatINR(h.coverAmount || 0, true)} cover</strong>
                                ) : (
                                  <>
                                    <strong>{formatINR(h.currentValue, true)}</strong>
                                    <span className={h.profit >= 0 ? 'gain' : 'loss'}>
                                      {formatPct(h.profitPct)}
                                    </span>
                                  </>
                                )}
                              </div>
                            </>
                          );

                          if (readOnly) {
                            return (
                              <div key={h.id} className="pillar-holding-row readonly">
                                {body}
                              </div>
                            );
                          }

                          return (
                            <button
                              type="button"
                              key={h.id}
                              className="pillar-holding-row"
                              onClick={() => openHolding(h.id)}
                            >
                              {body}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>

      {readOnly ? (
        <section className="share-cta-panel">
          <p className="eyebrow">Want the same for yourself?</p>
          <h2>Track your finances in one clear Money Book</h2>
          <p>
            If you’d like to track your savings, investments, insurance, and retirement in
            real time — like this — leave your mobile number. We’ll review and get you set up.
          </p>
          <Link className="btn btn-primary" to="/request-access">
            Request access
          </Link>
        </section>
      ) : (
        <div className="panel" style={{ marginTop: 8 }}>
          <h2>Biggest pieces of money</h2>
          <p className="hint">Tap any row to see details and update today’s value.</p>
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
                {storyHoldings.map((h) => (
                  <tr key={h.id} onClick={() => openHolding(h.id)}>
                    <td>
                      <strong>{h.name}</strong>
                      {h.notes && <div className="holding-note">{h.notes}</div>}
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{ background: `${h.pillarColor}18`, color: h.pillarColor }}
                      >
                        {h.pillarName}
                      </span>
                    </td>
                    <td>{h.categoryName}</td>
                    <td>
                      <PlatformChip platform={h.platform} />
                    </td>
                    <td>{formatINR(h.investedAmount, true)}</td>
                    <td>{formatINR(h.currentValue, true)}</td>
                    <td className={h.profit >= 0 ? 'gain' : 'loss'}>
                      {formatINR(h.profit, true)} ({formatPct(h.profitPct)})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <InfoModal
        open={!!infoTarget}
        onClose={() => setInfoTarget(null)}
        title={
          infoTarget?.kind === 'pillar'
            ? infoTarget.data.name
            : infoTarget?.kind === 'sub'
              ? infoTarget.data.name
              : ''
        }
        tagline={infoTarget?.kind === 'pillar' ? infoTarget.data.tagline : undefined}
        color={
          infoTarget?.kind === 'pillar'
            ? infoTarget.data.color
            : infoTarget?.kind === 'sub'
              ? infoTarget.data.color || infoTarget.pillarColor
              : undefined
        }
        icon={
          infoTarget?.kind === 'pillar'
            ? infoTarget.data.icon
            : infoTarget?.kind === 'sub'
              ? infoTarget.data.icon
              : undefined
        }
        description={infoTarget?.data.description}
        whyUseful={
          infoTarget?.kind === 'pillar'
            ? infoTarget.data.whyUseful
            : infoTarget?.kind === 'sub'
              ? infoTarget.data.whyUseful
              : undefined
        }
        benefits={
          infoTarget?.kind === 'pillar'
            ? infoTarget.data.benefits
            : infoTarget?.kind === 'sub'
              ? infoTarget.data.benefits
              : undefined
        }
        howItWorks={infoTarget?.kind === 'pillar' ? infoTarget.data.howItWorks : undefined}
      />
    </div>
  );
}
