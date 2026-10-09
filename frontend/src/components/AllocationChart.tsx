import { useMemo, useState, type CSSProperties } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { PillarSummary } from '../lib/api';
import { formatINR } from '../lib/format';
import CategoryIcon from './CategoryIcon';

type TabId = 'stacked' | 'pie' | 'types';

const TABS: { id: TabId; label: string; hint: string }[] = [
  {
    id: 'stacked',
    label: 'Stacked bars',
    hint: 'Click a pillar bar to jump below. Colours inside show the split — hover for amounts.',
  },
  {
    id: 'pie',
    label: 'Pie chart',
    hint: 'Click a slice (or name) to open that pillar below. Hover to see what is inside.',
  },
  {
    id: 'types',
    label: 'By type',
    hint: 'Click a type (e.g. Mutual funds) to see only those items in the pillar below.',
  },
];

function tipStyle(): CSSProperties {
  return {
    borderRadius: 12,
    border: '1px solid rgba(20,32,31,0.1)',
    background: '#fffdf8',
    boxShadow: '0 12px 30px rgba(20,32,31,0.12)',
    padding: '10px 12px',
  };
}

/** Wrap long pillar names under each bar */
function PillarAxisTick({
  x,
  y,
  payload,
}: {
  x?: number;
  y?: number;
  payload?: { value?: string };
}) {
  const label = payload?.value || '';
  const parts =
    label.length > 16
      ? label.replace(' Investments', '\nInvestments').replace(' Insurance', '\nInsurance').split('\n')
      : [label];

  return (
    <g transform={`translate(${x},${y})`}>
      {parts.map((line, i) => (
        <text
          key={`${line}-${i}`}
          x={0}
          y={i * 14}
          dy={12}
          textAnchor="middle"
          fill="#3d4f4d"
          fontSize={11}
          fontWeight={600}
        >
          {line}
        </text>
      ))}
    </g>
  );
}

function PieTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    payload?: {
      name?: string;
      value?: number;
      isCover?: boolean;
      color?: string;
      parts?: Array<{ name: string; value: number; color: string }>;
    };
  }>;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;
  const parts = row.parts || [];

  return (
    <div style={tipStyle()}>
      <div style={{ fontWeight: 700, marginBottom: 8, color: '#14201f' }}>
        {row.name} · {formatINR(Number(row.value), true)}
        {row.isCover ? ' cover' : ''}
      </div>
      {parts.length === 0 ? (
        <div style={{ fontSize: 13, color: '#6b7a78' }}>Nothing inside yet</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#6b7a78',
              marginBottom: 2,
            }}
          >
            Inside this pillar
          </div>
          {parts.map((part) => (
            <div
              key={part.name}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 18,
                fontSize: 13,
                color: part.color || '#3d4f4d',
                fontWeight: 600,
              }}
            >
              <span>{part.name}</span>
              <span style={{ color: '#14201f' }}>{formatINR(part.value, true)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Only show types that actually have money in this bar */
function StackTooltip({
  active,
  payload,
  stackNames,
}: {
  active?: boolean;
  payload?: Array<{
    value?: number | string;
    dataKey?: string | number;
    color?: string;
    payload?: { fullName?: string; total?: number; pillarId?: string };
  }>;
  stackNames: Record<string, string>;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  const items = payload
    .filter((p) => Number(p.value) > 0)
    .sort((a, b) => Number(b.value) - Number(a.value));
  if (!items.length || !row) return null;

  const isCover = row.pillarId === 'insurance';

  return (
    <div style={tipStyle()}>
      <div style={{ fontWeight: 700, marginBottom: 8, color: '#14201f' }}>
        {row.fullName} · {formatINR(Number(row.total), true)}
        {isCover ? ' cover' : ''}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {items.map((item) => {
          const key = String(item.dataKey);
          return (
            <div
              key={key}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 18,
                fontSize: 13,
                color: item.color || '#3d4f4d',
                fontWeight: 600,
              }}
            >
              <span>{stackNames[key] || key}</span>
              <span style={{ color: '#14201f' }}>{formatINR(Number(item.value), true)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function pillarChartValue(pillar: PillarSummary) {
  if (pillar.id === 'insurance') return pillar.cover;
  return pillar.current;
}

function subChartValue(pillar: PillarSummary, sub: PillarSummary['subcategories'][number]) {
  if (pillar.id === 'insurance') return sub.cover;
  return sub.current;
}

type AllocationChartProps = {
  pillars: PillarSummary[];
  onSelectPillar?: (pillarId: string) => void;
  onSelectCategory?: (pillarId: string, categoryId: string) => void;
};

export default function AllocationChart({
  pillars,
  onSelectPillar,
  onSelectCategory,
}: AllocationChartProps) {
  const [tab, setTab] = useState<TabId>('stacked');

  const { stackedRows, stackKeys, stackColors, stackNames, pieData, typeBars, chartTotal } =
    useMemo(() => {
      const keySet = new Set<string>();
      const colors: Record<string, string> = {};
      const names: Record<string, string> = {};

      for (const pillar of pillars) {
        for (const sub of pillar.subcategories) {
          keySet.add(sub.categoryId);
          colors[sub.categoryId] = sub.color || pillar.color;
          names[sub.categoryId] = sub.shortName || sub.name;
        }
      }

      const rows = pillars.map((pillar) => {
        const total = pillarChartValue(pillar);
        const row: Record<string, string | number> = {
          pillarId: pillar.id,
          name: pillar.name,
          fullName: pillar.name,
          total,
          isCover: pillar.id === 'insurance' ? 1 : 0,
        };
        for (const sub of pillar.subcategories) {
          const value = subChartValue(pillar, sub);
          if (value > 0) row[sub.categoryId] = value;
        }
        return row;
      });

      const keys = Array.from(keySet).filter((key) =>
        rows.some((r) => Number(r[key]) > 0)
      );

      const total = pillars.reduce((s, p) => s + pillarChartValue(p), 0);

      const pie = pillars
        .map((p) => {
          const parts = p.subcategories
            .map((sub) => ({
              name: sub.shortName || sub.name,
              value: subChartValue(p, sub),
              color: sub.color || p.color,
            }))
            .filter((part) => part.value > 0)
            .sort((a, b) => b.value - a.value);
          return {
            id: p.id,
            name: p.name,
            value: pillarChartValue(p),
            color: p.color,
            isCover: p.id === 'insurance',
            parts,
          };
        })
        .filter((p) => p.value > 0);

      const types: {
        key: string;
        pillarId: string;
        name: string;
        shortName: string;
        value: number;
        color: string;
        pillarName: string;
      }[] = [];

      for (const pillar of pillars) {
        for (const sub of pillar.subcategories) {
          const value = subChartValue(pillar, sub);
          if (value <= 0) continue;
          types.push({
            key: sub.categoryId,
            pillarId: pillar.id,
            name: sub.name,
            shortName: sub.shortName || sub.name,
            value,
            color: sub.color || pillar.color,
            pillarName: pillar.name,
          });
        }
      }
      types.sort((a, b) => b.value - a.value);

      return {
        stackedRows: rows,
        stackKeys: keys,
        stackColors: colors,
        stackNames: names,
        pieData: pie,
        typeBars: types,
        chartTotal: total,
      };
    }, [pillars]);

  const hasAny = stackedRows.some((r) => Number(r.total) > 0) || typeBars.length > 0;
  if (!hasAny) {
    return <div className="empty">Add money under any pillar to see the split</div>;
  }

  const activeHint = TABS.find((t) => t.id === tab)?.hint;
  const mobileTopTypes = typeBars.slice(0, 6);
  const mobileTypeTotal = mobileTopTypes.reduce((s, t) => s + t.value, 0) || 1;

  return (
    <div className="money-map">
      {/* Desktop: full chart tabs */}
      <div className="desktop-viz">
        <div className="viz-tabs" role="tablist" aria-label="Money views">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`viz-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <p className="viz-hint">{activeHint}</p>

        {tab === 'stacked' && (
          <div className="viz-panel">
            <div className="viz-chart">
              <ResponsiveContainer width="100%" height={340}>
                <BarChart
                  data={stackedRows}
                  margin={{ top: 8, right: 8, left: 0, bottom: 48 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(20,32,31,0.08)" />
                  <XAxis
                    dataKey="name"
                    interval={0}
                    tick={<PillarAxisTick />}
                    axisLine={false}
                    tickLine={false}
                    height={56}
                  />
                  <YAxis
                    tickFormatter={(v) => formatINR(Number(v), true).replace('₹', '')}
                    tick={{ fill: '#6b7a78', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={52}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(20,32,31,0.04)' }}
                    content={<StackTooltip stackNames={stackNames} />}
                  />
                  {stackKeys.map((key) => (
                    <Bar
                      key={key}
                      dataKey={key}
                      stackId="money"
                      fill={stackColors[key]}
                      maxBarSize={72}
                      cursor="pointer"
                      onClick={(data) => {
                        const payload = (data as { payload?: { pillarId?: string }; pillarId?: string })
                          ?.payload;
                        const pillarId = payload?.pillarId ?? (data as { pillarId?: string })?.pillarId;
                        if (pillarId) onSelectPillar?.(pillarId);
                      }}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="viz-legend">
              {stackKeys.map((key) => (
                <span key={key} className="badge">
                  <span className="dot" style={{ background: stackColors[key] }} />
                  {stackNames[key]}
                </span>
              ))}
            </div>
          </div>
        )}

        {tab === 'pie' && (
          <div className="viz-panel viz-pie-row">
            <div className="viz-chart" style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={2}
                    stroke="none"
                    cursor="pointer"
                    onClick={(_, index) => {
                      const entry = pieData[index];
                      if (entry) onSelectPillar?.(entry.id);
                    }}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.id} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="pie-side-list">
              {pieData.map((p) => {
                const displayPct = chartTotal > 0 ? (p.value / chartTotal) * 100 : 0;
                return (
                  <button
                    type="button"
                    key={p.id}
                    className="pie-side-item clickable"
                    onClick={() => onSelectPillar?.(p.id)}
                  >
                    <span className="dot" style={{ background: p.color }} />
                    <div>
                      <strong>{p.name}</strong>
                      <p>
                        {formatINR(p.value, true)}
                        {p.isCover ? ' cover' : ''} · {displayPct.toFixed(0)}%
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'types' && (
          <div className="viz-panel">
            <div className="viz-chart">
              <ResponsiveContainer width="100%" height={Math.max(280, typeBars.length * 36)}>
                <BarChart
                  data={typeBars}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(20,32,31,0.08)" />
                  <XAxis
                    type="number"
                    tickFormatter={(v) => formatINR(Number(v), true).replace('₹', '')}
                    tick={{ fill: '#6b7a78', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="shortName"
                    width={78}
                    tick={{ fill: '#3d4f4d', fontSize: 12, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={tipStyle()}
                    formatter={(value) => [formatINR(Number(value), true), 'Amount']}
                    labelFormatter={(_, payload) => {
                      const row = payload?.[0]?.payload;
                      if (!row) return '';
                      return `${row.name} · ${row.pillarName}`;
                    }}
                  />
                  <Bar
                    dataKey="value"
                    radius={[0, 8, 8, 0]}
                    maxBarSize={22}
                    cursor="pointer"
                    onClick={(data) => {
                      const payload = (
                        data as {
                          payload?: { key?: string; pillarId?: string };
                          key?: string;
                          pillarId?: string;
                        }
                      )?.payload;
                      const row = payload ?? (data as { key?: string; pillarId?: string });
                      if (row?.pillarId && row?.key) onSelectCategory?.(row.pillarId, row.key);
                    }}
                  >
                    {typeBars.map((entry) => (
                      <Cell key={entry.key} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Mobile: compact pie + top types + pillar strip */}
      <div className="mobile-viz">
        <div className="mobile-viz-tabs" role="tablist" aria-label="Mobile money views">
          <button
            type="button"
            className={`viz-tab ${tab === 'pie' || tab === 'stacked' ? 'active' : ''}`}
            onClick={() => setTab('pie')}
          >
            Pillars
          </button>
          <button
            type="button"
            className={`viz-tab ${tab === 'types' ? 'active' : ''}`}
            onClick={() => setTab('types')}
          >
            Top types
          </button>
        </div>

        {(tab === 'pie' || tab === 'stacked') && (
          <div className="mobile-viz-card">
            <div className="mobile-pie-wrap">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={52}
                    outerRadius={82}
                    paddingAngle={2}
                    stroke="none"
                    cursor="pointer"
                    onClick={(_, index) => {
                      const entry = pieData[index];
                      if (entry) onSelectPillar?.(entry.id);
                    }}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.id} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mobile-pie-legend">
              {pieData.map((p) => {
                const displayPct = chartTotal > 0 ? (p.value / chartTotal) * 100 : 0;
                return (
                  <button
                    type="button"
                    key={p.id}
                    className="mobile-legend-row"
                    onClick={() => onSelectPillar?.(p.id)}
                  >
                    <span className="dot" style={{ background: p.color }} />
                    <span className="mobile-legend-name">{p.name}</span>
                    <strong>
                      {formatINR(p.value, true)}
                      <em>{displayPct.toFixed(0)}%</em>
                    </strong>
                  </button>
                );
              })}
            </div>
            <p className="mobile-viz-note">Tap a slice or name to open that pillar</p>
          </div>
        )}

        {tab === 'types' && (
          <div className="mobile-viz-card">
            <p className="mobile-viz-note" style={{ marginTop: 0 }}>
              Biggest money types — tap to filter below
            </p>
            <div className="mobile-type-list">
              {mobileTopTypes.map((t) => {
                const width = Math.max(10, (t.value / mobileTypeTotal) * 100);
                return (
                  <button
                    type="button"
                    key={t.key}
                    className="mobile-type-row"
                    onClick={() => onSelectCategory?.(t.pillarId, t.key)}
                  >
                    <div className="mobile-type-top">
                      <span>{t.shortName}</span>
                      <strong>{formatINR(t.value, true)}</strong>
                    </div>
                    <div className="mobile-type-track">
                      <div
                        className="mobile-type-fill"
                        style={{ width: `${width}%`, background: t.color }}
                      />
                    </div>
                    <em>{t.pillarName}</em>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mobile-pillar-strip">
          {pieData.map((p) => {
            const pct = chartTotal > 0 ? (p.value / chartTotal) * 100 : 0;
            return (
              <button
                type="button"
                key={p.id}
                className="mobile-pillar-chip"
                style={{ '--pillar': p.color } as CSSProperties}
                onClick={() => onSelectPillar?.(p.id)}
              >
                <span className="dot" style={{ background: p.color }} />
                <strong>{p.name.split(' ')[0]}</strong>
                <em>{pct.toFixed(0)}%</em>
              </button>
            );
          })}
        </div>
      </div>

      <div className="pillar-glance-grid">
        {pillars.map((pillar) => {
          const total = pillarChartValue(pillar);
          const activeSubs = pillar.subcategories.filter(
            (s) => subChartValue(pillar, s) > 0 || s.count > 0
          );
          const maxSubLocal = Math.max(
            ...activeSubs.map((s) => subChartValue(pillar, s) || 1),
            1
          );

          return (
            <div
              key={pillar.id}
              className="glance-card clickable"
              role="button"
              tabIndex={0}
              style={
                {
                  '--pillar': pillar.color,
                  '--pillar-accent': pillar.accent,
                } as CSSProperties
              }
              onClick={() => onSelectPillar?.(pillar.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectPillar?.(pillar.id);
                }
              }}
            >
              <div className="glance-head">
                <div className="glance-icon">
                  <CategoryIcon name={pillar.icon} size={18} color={pillar.color} />
                </div>
                <div>
                  <strong>{pillar.name}</strong>
                  <p>{pillar.tagline}</p>
                </div>
              </div>

              <div className="glance-total">
                <span>{pillar.id === 'insurance' ? 'Cover' : 'Worth today'}</span>
                <strong>{formatINR(total, true)}</strong>
                {chartTotal > 0 && total > 0 && (
                  <em>{((total / chartTotal) * 100).toFixed(0)}% of chart</em>
                )}
              </div>

              <div className="glance-subs">
                {activeSubs.length === 0 ? (
                  <p className="glance-empty">Nothing added here yet</p>
                ) : (
                  activeSubs.map((sub) => {
                    const value = subChartValue(pillar, sub);
                    const width = Math.max(8, (value / maxSubLocal) * 100);
                    return (
                      <div
                        key={sub.categoryId}
                        className="glance-sub interactive"
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCategory?.(pillar.id, sub.categoryId);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                            onSelectCategory?.(pillar.id, sub.categoryId);
                          }
                        }}
                      >
                        <div className="glance-sub-top">
                          <span>
                            <CategoryIcon name={sub.icon} size={13} color={sub.color} />
                            {sub.shortName || sub.name}
                          </span>
                          <strong>
                            {value > 0
                              ? formatINR(value, true)
                              : `${sub.count} item${sub.count === 1 ? '' : 's'}`}
                          </strong>
                        </div>
                        <div className="glance-track">
                          <div
                            className="glance-fill"
                            style={{
                              width: `${width}%`,
                              background: sub.color || pillar.color,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <span className="glance-cta">View details below ↓</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
