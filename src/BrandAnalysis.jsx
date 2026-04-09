import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { LOGO, ICON_A } from './assets';

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  purple1: '#3730a3', purple2: '#4f46e5', purple3: '#7c3aed',
  purple4: '#9333ea', purple5: '#a855f7', purple6: '#c084fc',
  orange1: '#c2410c', orange2: '#ea580c', orange3: '#f97316',
  orange4: '#fb923c', orange5: '#fdba74', mid: '#d946ef',
};

const MC = {
  'Brand': P.purple2, 'Non-Brand': P.orange3, 'Broad': P.purple3,
  'Phrase': P.purple5, 'Exact': P.orange3, 'Category': P.purple4,
  'Product': P.orange2, 'Auto': P.purple6, 'Other': P.orange5,
  'Top of Search': P.purple2, 'Rest of Search': P.purple4,
  'Product pages': P.orange3, 'Off Amazon': P.orange4,
};

const SPECTRUM = [
  P.purple2, P.orange3, P.purple3, P.orange2,
  P.purple4, P.orange4, P.purple5, P.orange5, P.purple6, P.mid,
];

const getColor = (name, i) => MC[name] || SPECTRUM[i % SPECTRUM.length];

// ── Utils ─────────────────────────────────────────────────────────────────────
const parseNum = (v) => {
  if (typeof v === 'number') return isNaN(v) ? 0 : v;
  return parseFloat(String(v ?? '').replace(/[$,%\s]/g, '')) || 0;
};

const f = {
  $:   (n) => '$' + (n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  n:   (n) => (n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 }),
  x:   (n) => (n || 0).toFixed(2) + 'x',
  pct: (n) => ((n || 0) * 100).toFixed(1) + '%',
  cvr: (n) => ((n || 0) * 100).toFixed(2) + '%',
};

// ── File reading ──────────────────────────────────────────────────────────────
const normCols = (data) =>
  data.map((r) => {
    const nr = {};
    for (const k of Object.keys(r)) nr[k.trim()] = r[k];
    return nr;
  });

const readFile = (file) =>
  new Promise((resolve) => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'csv') {
      Papa.parse(file, {
        header: true, skipEmptyLines: true,
        complete: (r) => resolve(normCols(r.data)),
      });
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const wb = XLSX.read(e.target.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        resolve(normCols(XLSX.utils.sheet_to_json(ws, { defval: '' })));
      };
      reader.readAsBinaryString(file);
    }
  });

// ── Data processing ───────────────────────────────────────────────────────────
const getMatchType = (mt, targeting) => {
  const m = String(mt || '').trim();
  if (m && m !== '-') return m[0].toUpperCase() + m.slice(1).toLowerCase();
  const tg = String(targeting || '').trim().toLowerCase();
  if (tg.startsWith('category=')) return 'Category';
  if (tg.startsWith('asin')) return 'Product';
  if (['close', 'substitutes', 'compliments', 'loose-match'].some((p) => tg.startsWith(p))) return 'Auto';
  return 'Other';
};

const empty = () => ({ impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 });

const addMetrics = (agg, row) => {
  agg.impressions += parseNum(row['Impressions']);
  agg.clicks      += parseNum(row['Clicks']);
  agg.spend       += parseNum(row['Spend']);
  agg.sales       += parseNum(row['14 Day Total Sales'] || row['7 Day Total Sales'] || 0);
  agg.orders      += parseNum(row['14 Day Total Orders (#)'] || row['7 Day Total Orders'] || row['7 Day Total Orders (#)'] || 0);
};

const calc = (a) => ({
  ...a,
  cpc:  a.clicks > 0 ? a.spend  / a.clicks : 0,
  roas: a.spend  > 0 ? a.sales  / a.spend  : 0,
  cvr:  a.clicks > 0 ? a.orders / a.clicks : 0,
});

const processS1 = (searchTerm, branded) => {
  const bTerms = branded
    .map((r) => String(r['Branded Terms'] || Object.values(r)[0] || '').trim())
    .filter(Boolean);
  const bASINs = new Set(bTerms.filter((t) => /^B[0-9A-Z]{9}$/i.test(t)).map((t) => t.toUpperCase()));
  const bText  = bTerms.filter((t) => !/^B[0-9A-Z]{9}$/i.test(t)).map((t) => t.toLowerCase());

  const isBrand = (term) => {
    const t = String(term || '').trim();
    if (bASINs.has(t.toUpperCase())) return true;
    return bText.some((b) => t.toLowerCase().includes(b));
  };

  const s1b = empty(), s1nb = empty();
  const s1bmt = {}, s1nbmt = {};

  for (const r of searchTerm) {
    const brand = isBrand(r['Customer Search Term'] || '');
    const mt    = getMatchType(r['Match Type'], r['Targeting']);
    addMetrics(brand ? s1b : s1nb, r);
    const ma = brand ? s1bmt : s1nbmt;
    if (!ma[mt]) ma[mt] = empty();
    addMetrics(ma[mt], r);
  }

  const totalSpend = s1b.spend + s1nb.spend;
  const totalSales = s1b.sales + s1nb.sales;

  return {
    kpis: {
      totalSpend, totalSales,
      overallROAS: totalSpend > 0 ? totalSales / totalSpend : 0,
      brandPct:    totalSpend > 0 ? s1b.spend  / totalSpend : 0,
    },
    table:      [{ label: 'Brand', ...calc(s1b) }, { label: 'Non-Brand', ...calc(s1nb) }],
    spendPie:   [{ name: 'Brand', value: s1b.spend  }, { name: 'Non-Brand', value: s1nb.spend  }],
    clicksPie:  [{ name: 'Brand', value: s1b.clicks }, { name: 'Non-Brand', value: s1nb.clicks }],
    salesPie:   [{ name: 'Brand', value: s1b.sales  }, { name: 'Non-Brand', value: s1nb.sales  }],
    brandMT:    Object.entries(s1bmt).map(([name, v])  => ({ name, value: v.spend })),
    nonBrandMT: Object.entries(s1nbmt).map(([name, v]) => ({ name, value: v.spend })),
  };
};

// ── SVG Donut Chart ───────────────────────────────────────────────────────────
const DonutChart = ({ data, title, fmtVal = f.$ }) => {
  const [hovered, setHovered] = useState(null);
  const total = data.reduce((s, d) => s + d.value, 0);
  const cx = 90, cy = 90, R = 72, r = 46;

  let startAngle = -Math.PI / 2;
  const slices = data.map((d, i) => {
    const pct   = total > 0 ? d.value / total : 0;
    const sweep = pct * 2 * Math.PI;
    const end   = startAngle + sweep;
    const x1  = cx + R * Math.cos(startAngle), y1  = cy + R * Math.sin(startAngle);
    const x2  = cx + R * Math.cos(end),        y2  = cy + R * Math.sin(end);
    const ix1 = cx + r * Math.cos(startAngle), iy1 = cy + r * Math.sin(startAngle);
    const ix2 = cx + r * Math.cos(end),        iy2 = cy + r * Math.sin(end);
    const large = sweep > Math.PI ? 1 : 0;
    const path  = `M${x1},${y1} A${R},${R} 0 ${large},1 ${x2},${y2} L${ix2},${iy2} A${r},${r} 0 ${large},0 ${ix1},${iy1} Z`;
    const mid = startAngle + sweep / 2;
    const lx  = cx + (r + (R - r) * 0.5) * Math.cos(mid);
    const ly  = cy + (r + (R - r) * 0.5) * Math.sin(mid);
    const s   = { path, fill: getColor(d.name, i), pct, lx, ly, name: d.name, value: d.value };
    startAngle = end;
    return s;
  });

  const hov = hovered !== null ? slices[hovered] : null;

  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{title}</p>
      <svg width="180" height="180" viewBox="0 0 180 180" style={{ overflow: 'visible' }}>
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.fill}
            opacity={hovered === null || hovered === i ? 1 : 0.55}
            style={{ cursor: 'pointer', transition: 'opacity 0.15s' }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
        {slices.map((s, i) => s.pct >= 0.06 ? (
          <text key={i} x={s.lx} y={s.ly} textAnchor="middle" dominantBaseline="central"
            fill="white" fontSize="10" fontWeight="800" style={{ pointerEvents: 'none' }}>
            {(s.pct * 100).toFixed(0)}%
          </text>
        ) : null)}
        {hov && (
          <>
            <text x={cx} y={cy - 8} textAnchor="middle" dominantBaseline="central" fontSize="11" fontWeight="700" fill="#1e293b">{hov.name}</text>
            <text x={cx} y={cy + 10} textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="800" fill={hov.fill}>{fmtVal(hov.value)}</text>
          </>
        )}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#475569' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: s.fill, flexShrink: 0 }} />
            {s.name}
          </div>
        ))}
      </div>
    </div>
  );
};

// ── KPI Bar ───────────────────────────────────────────────────────────────────
const KPIBar = ({ items }) => (
  <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
    {items.map((item, i) => (
      <div key={i} style={{ flex: '1 1 140px', background: 'linear-gradient(135deg,rgba(79,70,229,0.06),rgba(249,115,22,0.04))', borderRadius: 12, padding: '14px 18px', border: '1px solid rgba(79,70,229,0.14)' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>{item.label}</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em' }}>{item.value}</div>
        {item.sub && <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{item.sub}</div>}
      </div>
    ))}
  </div>
);

// ── Data Table ────────────────────────────────────────────────────────────────
const TABLE_COLS = [
  { key: 'label',       label: 'Segment' },
  { key: 'impressions', label: 'Impressions', right: true, fmt: f.n },
  { key: 'spend',       label: 'Spend',       right: true, fmt: f.$ },
  { key: 'clicks',      label: 'Clicks',      right: true, fmt: f.n },
  { key: 'cpc',         label: 'CPC',         right: true, fmt: f.$ },
  { key: 'sales',       label: 'Sales',       right: true, fmt: f.$ },
  { key: 'roas',        label: 'ROAS',        right: true, fmt: f.x },
  { key: 'cvr',         label: 'CVR',         right: true, fmt: f.cvr },
];

const DataTable = ({ rows, cols }) => (
  <div style={{ overflowX: 'auto', borderRadius: 14, border: '1px solid #e8ecf0', marginTop: 4 }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
      <thead>
        <tr style={{ background: 'linear-gradient(90deg,rgba(79,70,229,0.05),rgba(249,115,22,0.04))' }}>
          {cols.map((c) => (
            <th key={c.key} style={{ padding: '11px 16px', textAlign: c.right ? 'right' : 'left', fontWeight: 700, color: '#475569', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', borderBottom: '1.5px solid #e2e8f0', whiteSpace: 'nowrap' }}>{c.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#fafbfc' }}>
            {cols.map((c) => (
              <td key={c.key} style={{ padding: '10px 16px', textAlign: c.right ? 'right' : 'left', color: c.key === 'label' ? '#0f172a' : '#475569', fontWeight: c.key === 'label' ? 700 : 400, borderBottom: '1px solid #f1f5f9' }}>
                {c.fmt ? c.fmt(row[c.key]) : row[c.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ── Divider ───────────────────────────────────────────────────────────────────
const Divider = ({ label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0 20px' }}>
    <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,rgba(79,70,229,0.2),transparent)' }} />
    <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
    <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,transparent,rgba(249,115,22,0.2))' }} />
  </div>
);

// ── Upload Card ───────────────────────────────────────────────────────────────
const FILE_CFG = [
  { id: 'searchTerm', num: '01', label: 'Search Term Report', sub: 'Sponsored Products · Trailing 30 Days', accept: '.xlsx,.xls,.csv' },
  { id: 'branded',    num: '02', label: 'Branded Terms List',  sub: 'ASINs & Brand Name Variations',        accept: '.xlsx,.xls,.csv' },
];

const UploadCard = ({ cfg, loaded, loading, fileName, onFile }) => {
  const [drag, setDrag] = useState(false);
  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); const fl = e.dataTransfer.files[0]; if (fl) onFile(cfg.id, fl); }}
      style={{ cursor: 'pointer', display: 'block' }}>
      <input type="file" accept={cfg.accept} style={{ display: 'none' }} onChange={(e) => onFile(cfg.id, e.target.files[0])} />
      <div style={{ background: loaded ? 'linear-gradient(135deg,rgba(79,70,229,0.05),rgba(249,115,22,0.04))' : drag ? 'rgba(79,70,229,0.03)' : 'white', border: `1.5px ${loaded || drag ? 'solid' : 'dashed'} ${loaded || drag ? P.purple2 : '#d1d5db'}`, borderRadius: 14, padding: '20px 18px', boxShadow: loaded ? `0 0 0 3px rgba(79,70,229,0.1)` : 'none', minHeight: 120 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: loaded ? P.purple2 : '#cbd5e1', fontFamily: '"DM Mono",monospace', letterSpacing: '0.04em' }}>{cfg.num}</span>
          <div style={{ width: 22, height: 22, borderRadius: '50%', background: loaded ? P.orange3 : loading ? P.purple3 : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: loaded ? `0 0 0 3px rgba(249,115,22,0.2)` : 'none', transition: 'all 0.3s' }}>
            {loaded  && <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>✓</span>}
            {loading && <span style={{ color: 'white', fontSize: 10, animation: 'spin 0.8s linear infinite' }}>◌</span>}
          </div>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 4, lineHeight: 1.3 }}>{cfg.label}</div>
        <div style={{ fontSize: 11, color: loaded ? P.purple2 : '#94a3b8', lineHeight: 1.4, wordBreak: 'break-all' }}>
          {loaded ? (fileName.length > 38 ? fileName.slice(0, 38) + '…' : fileName) : cfg.sub}
        </div>
      </div>
    </label>
  );
};

// ── AI Insight ────────────────────────────────────────────────────────────────
const APOLLO_API_KEY = '9k011gxqVNr15wcTw2RCOA';

const SYSTEM_PROMPT = `You are an expert Amazon Advertising strategist working for ELEVATE33, a premium Amazon-focused eCommerce agency. You are analyzing aggregated performance metrics from a Sponsored Products audit.

Your job: deliver sharp, specific, actionable insights in 3-5 sentences.
- Lead with the most important finding
- Include at least one specific number from the data
- End with a concrete recommended action
- Tone: confident, direct, expert — like a senior strategist in a client meeting
- Do NOT use bullet points, headers, or markdown formatting
- Write in flowing prose only`;

const buildPayload = (s1) => {
  const brandSales    = s1.salesPie?.[0]?.value ?? s1.table[0]?.sales ?? 0;
  const nonBrandSales = s1.salesPie?.[1]?.value ?? s1.table[1]?.sales ?? 0;
  const totalAdSales  = brandSales + nonBrandSales;
  return {
    section:             'Branded vs Non-Brand',
    totalSpend:          s1.kpis.totalSpend.toFixed(2),
    totalSales:          s1.kpis.totalSales.toFixed(2),
    overallROAS:         s1.kpis.overallROAS.toFixed(2),
    brandSpendPct:       (s1.kpis.brandPct * 100).toFixed(1),
    nonBrandSpendPct:    ((1 - s1.kpis.brandPct) * 100).toFixed(1),
    brandAdSalesPct:     totalAdSales > 0 ? ((brandSales / totalAdSales) * 100).toFixed(1) : 'n/a',
    nonBrandAdSalesPct:  totalAdSales > 0 ? ((nonBrandSales / totalAdSales) * 100).toFixed(1) : 'n/a',
    brandROAS:           s1.table[0] ? s1.table[0].roas.toFixed(2) : 'n/a',
    nonBrandROAS:        s1.table[1] ? s1.table[1].roas.toFixed(2) : 'n/a',
    brandCVR:            s1.table[0] ? (s1.table[0].cvr * 100).toFixed(1) : 'n/a',
    nonBrandCVR:         s1.table[1] ? (s1.table[1].cvr * 100).toFixed(1) : 'n/a',
    matchTypeSplitBrand:    s1.brandMT.map((m)    => ({ type: m.name, spend: m.value.toFixed(2) })),
    matchTypeSplitNonBrand: s1.nonBrandMT.map((m) => ({ type: m.name, spend: m.value.toFixed(2) })),
  };
};

const InsightCard = ({ s1 }) => {
  const [state,     setState]     = useState('idle');
  const [insight,   setInsight]   = useState('');
  const [cooldown,  setCooldown]  = useState(false);
  const [unlocked,  setUnlocked]  = useState(false);
  const [email,     setEmail]     = useState('');
  const [gateState, setGateState] = useState('idle');

  const handleEmailSubmit = async () => {
    if (!email.includes('@')) return;
    setGateState('loading');
    try {
      await fetch('https://api.apollo.io/v1/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
        body: JSON.stringify({ api_key: APOLLO_API_KEY, email, label_names: ['Brand Analysis Tool'] }),
      });
    } catch (e) { console.warn('Apollo error:', e.message); }
    setUnlocked(true);
  };

  const generate = async () => {
    if (cooldown || state === 'loading') return;
    setState('loading');
    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 600,
          system: SYSTEM_PROMPT,
          messages: [{
            role: 'user',
            content: `Analyze this brand vs. non-brand spend split through a critical lens. The benchmark is no more than 20% of total budget going to branded terms and products — flag immediately if this account exceeds that threshold.\n\nAssess whether the ROAS gap between brand and non-brand is creating a misleading picture of account health. A disproportionately high brand ROAS relative to non-brand is a red flag, not a win — it signals inflated returns with low incrementality, not real growth. If brand spend is a small share of budget but driving a large share of ad sales, that's a problem: it means non-brand campaigns are underperforming and brand is masking it.\n\nEvaluate match type discipline within the brand segment. Brand defense should be concentrated in Exact match with limited Phrase match. Any spend in Auto or Broad for brand terms is a negative keyword gap — call it out directly.\n\nEnd with a clear directional recommendation: should brand spend be reduced, restructured, or maintained, and why.\n\nData:\n\n` + JSON.stringify(buildPayload(s1), null, 2),
          }],
        }),
      });
      if (!res.ok) throw new Error('API error ' + res.status);
      const data = await res.json();
      setInsight(data.content?.[0]?.text || 'Unable to generate insight.');
      setState('done');
    } catch (e) { console.error(e); setState('error'); }
    setCooldown(true);
    setTimeout(() => setCooldown(false), 30000);
  };

  if (!unlocked) return (
    <div style={{ marginTop: 24, background: 'linear-gradient(135deg,rgba(79,70,229,0.04),rgba(249,115,22,0.03))', border: '1.5px solid rgba(79,70,229,0.18)', borderRadius: 14, padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 16 }}>✦</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: P.purple2, textTransform: 'uppercase', letterSpacing: '0.07em' }}>AI Strategic Insight</span>
        <span style={{ fontSize: 10, color: '#94a3b8', background: '#f1f5f9', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>Aggregated data only · No raw files transmitted</span>
      </div>
      <p style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: '#1e293b', lineHeight: 1.5 }}>Want to see how E33 thinks about this data?</p>
      <p style={{ margin: '0 0 18px', fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>Enter your email to unlock the insights and we'll share the newest tools we launch.</p>
      <div style={{ display: 'flex', gap: 10 }}>
        <input
          type="email"
          placeholder="you@brand.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleEmailSubmit()}
          onFocus={(e) => (e.target.style.borderColor = P.purple2)}
          onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
          style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 14, fontFamily: 'inherit', outline: 'none', color: '#0f172a', background: 'white' }}
        />
        <button
          onClick={handleEmailSubmit}
          disabled={!email.includes('@') || gateState === 'loading'}
          style={{ padding: '10px 20px', borderRadius: 10, border: 'none', cursor: email.includes('@') ? 'pointer' : 'not-allowed', background: email.includes('@') ? `linear-gradient(135deg,${P.purple2},${P.orange3})` : '#e2e8f0', color: email.includes('@') ? 'white' : '#94a3b8', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', flexShrink: 0 }}
        >{gateState === 'loading' ? 'Unlocking…' : 'Unlock Insights →'}</button>
      </div>
    </div>
  );

  return (
    <div style={{ marginTop: 24, background: state === 'done' ? 'linear-gradient(135deg,rgba(79,70,229,0.04),rgba(249,115,22,0.03))' : 'rgba(248,250,255,0.8)', border: `1.5px solid ${state === 'done' ? 'rgba(79,70,229,0.18)' : '#e8ecf0'}`, borderRadius: 14, padding: '18px 20px', transition: 'all 0.3s' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>✦</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: P.purple2, textTransform: 'uppercase', letterSpacing: '0.07em' }}>AI Strategic Insight</span>
          <span style={{ fontSize: 10, color: '#94a3b8', background: '#f1f5f9', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>Aggregated data only · No raw files transmitted</span>
        </div>
        {state !== 'loading' && (
          <button onClick={generate} disabled={cooldown} style={{ padding: '7px 16px', borderRadius: 8, border: 'none', cursor: cooldown ? 'not-allowed' : 'pointer', background: cooldown ? '#e2e8f0' : `linear-gradient(135deg,${P.purple2},${P.orange3})`, color: cooldown ? '#94a3b8' : 'white', fontSize: 12, fontWeight: 700, fontFamily: 'inherit', flexShrink: 0 }}>
            {state === 'idle' ? 'Generate Insight' : state === 'done' ? (cooldown ? 'Cooling down…' : 'Regenerate') : 'Retry'}
          </button>
        )}
      </div>
      {state === 'loading' && (
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2.5px solid ${P.purple2}`, borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: '#64748b', fontStyle: 'italic' }}>Analyzing your account data…</span>
        </div>
      )}
      {state === 'done' && insight && (
        <>
          <p style={{ margin: '14px 0 0', fontSize: 14, color: '#1e293b', lineHeight: 1.75 }}>{insight}</p>
          <p style={{ margin: '14px 0 0', fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>
            Ready to take this from insight to action?{' '}
            <a href="https://calendar.app.google/6EdEFcTwZzYv9JF57" target="_blank" rel="noopener noreferrer" style={{ color: P.purple2, fontWeight: 700, textDecoration: 'none' }}>Schedule a call to dig in with our team.</a>
          </p>
        </>
      )}
      {state === 'error' && (
        <p style={{ margin: '10px 0 0', fontSize: 13, color: '#ef4444' }}>Could not generate insight — check your API key or try again.</p>
      )}
    </div>
  );
};

// ── Main App ──────────────────────────────────────────────────────────────────
export default function BrandAnalysis() {
  const [parsedData, setParsedData] = useState({});
  const [loadingId,  setLoadingId]  = useState(null);
  const [fileNames,  setFileNames]  = useState({});

  const handleFile = async (id, file) => {
    if (!file) return;
    setLoadingId(id);
    try {
      const data = await readFile(file);
      setParsedData((prev) => ({ ...prev, [id]: data }));
      setFileNames((prev)  => ({ ...prev, [id]: file.name }));
    } catch (e) { console.error(e); }
    setLoadingId(null);
  };

  const allLoaded   = FILE_CFG.every((c) => parsedData[c.id]?.length > 0);
  const loadedCount = FILE_CFG.filter((c) => parsedData[c.id]?.length > 0).length;

  const results = useMemo(() => {
    if (!allLoaded) return null;
    try { return processS1(parsedData.searchTerm, parsedData.branded); }
    catch (e) { console.error(e); return null; }
  }, [allLoaded, parsedData]);

  return (
    <div style={{ fontFamily: '"DM Sans",system-ui,sans-serif', minHeight: '100vh', background: 'linear-gradient(150deg,#f0f3ff 0%,#f8f9fb 50%,#fff8f3 100%)', color: '#0f172a' }}>
      <header style={{ background: 'rgba(255,255,255,0.93)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #eaedf5', padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 0 rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ background: `linear-gradient(135deg,${P.purple1},#1e1b4b)`, borderRadius: 10, padding: '5px 14px', display: 'flex', alignItems: 'center', boxShadow: `0 2px 10px ${P.purple2}40` }}>
            <img src={LOGO} alt="ELEVATE33" style={{ height: 22, display: 'block' }} />
          </div>
          <div style={{ width: 1, height: 28, background: '#e2e8f0', margin: '0 8px' }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em', lineHeight: 1.2 }}>Brand Spend Analysis</div>
            <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 500 }}>Powered by ELEVATE33</div>
          </div>
        </div>
        <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, fontFamily: '"DM Mono",monospace' }}>{loadedCount}/2 files loaded</span>
      </header>

      <main style={{ maxWidth: 960, margin: '0 auto', padding: '28px 20px 60px' }}>

        {/* Upload panel */}
        <div style={{ background: 'white', borderRadius: 20, padding: '28px 28px 24px', marginBottom: 20, boxShadow: '0 2px 8px rgba(15,23,42,0.06)', border: '1px solid #e8ecf0', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${P.purple2},${P.orange3})` }} />
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 800, color: '#0f172a' }}>Upload Your Reports</h2>
            <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>Upload 2 files to analyze brand vs. non-brand ad spend</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 12 }}>
            {FILE_CFG.map((cfg) => (
              <UploadCard key={cfg.id} cfg={cfg}
                loaded={!!parsedData[cfg.id]?.length} loading={loadingId === cfg.id}
                fileName={fileNames[cfg.id] || ''} onFile={handleFile} />
            ))}
          </div>
          {!allLoaded ? (
            <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 10, background: 'rgba(79,70,229,0.04)', border: '1px solid rgba(79,70,229,0.08)', fontSize: 12, color: '#64748b', display: 'flex', gap: 8, alignItems: 'center' }}>
              🔒 <span>All file processing is <strong>100% local</strong> — your Amazon data never leaves your browser.</span>
            </div>
          ) : (
            <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 10, background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.15)', fontSize: 12, color: P.orange2, fontWeight: 600, display: 'flex', gap: 8, alignItems: 'center' }}>
              ✓ Both files loaded — scroll down to see your analysis
            </div>
          )}
        </div>

        {/* Results panel */}
        {results ? (
          <div style={{ background: 'white', borderRadius: 20, padding: '32px 32px 28px', marginBottom: 20, boxShadow: '0 2px 8px rgba(15,23,42,0.06)', border: '1px solid #e8ecf0', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${P.purple2},${P.orange3})` }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 24 }}>
              <img src={ICON_A} alt="ELEVATE33" style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, objectFit: 'contain' }} />
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.2 }}>Branded Search Trends</h2>
                <p style={{ margin: '3px 0 0', fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>Data includes any brand term or ASIN across match types</p>
              </div>
            </div>

            <KPIBar items={[
              { label: 'Total Spend',       value: f.$(results.kpis.totalSpend) },
              { label: 'Total Sales',       value: f.$(results.kpis.totalSales) },
              { label: 'Overall ROAS',      value: f.x(results.kpis.overallROAS) },
              { label: 'Brand Spend %',     value: f.pct(results.kpis.brandPct),     sub: 'of total ad spend' },
              { label: 'Non-Brand Spend %', value: f.pct(1 - results.kpis.brandPct), sub: 'of total ad spend' },
            ]} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 28 }}>
              <DonutChart data={results.spendPie}  title="Spend Split" />
              <DonutChart data={results.clicksPie} title="Clicks Split" fmtVal={f.n} />
              <DonutChart data={results.salesPie}  title="Sales Split" />
            </div>

            <DataTable rows={results.table} cols={TABLE_COLS} />

            <Divider label="Match Type Distribution by Segment (Spend)" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <DonutChart data={results.brandMT}    title="Brand — Match Type Spend" />
              <DonutChart data={results.nonBrandMT} title="Non-Brand — Match Type Spend" />
            </div>

            <InsightCard s1={results} />
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
            <div style={{ fontSize: 52, marginBottom: 12, opacity: 0.2 }}>📊</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#475569', marginBottom: 4 }}>Upload both files to see your analysis</div>
            <div style={{ fontSize: 13 }}>Search Term Report + Branded Terms list needed</div>
          </div>
        )}

      </main>

      <footer style={{ borderTop: '1px solid #eaedf5', padding: '16px 28px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ background: `linear-gradient(135deg,${P.purple1},#1e1b4b)`, borderRadius: 6, padding: '3px 10px', display: 'flex', alignItems: 'center' }}>
            <img src={LOGO} alt="ELEVATE33" style={{ height: 16, display: 'block' }} />
          </div>
          <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>Brand Spend Analysis</span>
        </div>
        <span style={{ fontSize: 11, color: '#cbd5e1', fontFamily: '"DM Mono",monospace' }}>Powered by ELEVATE33</span>
      </footer>
    </div>
  );
}
