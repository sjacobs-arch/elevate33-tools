import { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import {
  PieChart, Pie, Cell, Tooltip as RTooltip, Legend, ResponsiveContainer,
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
} from "recharts";

// ─── logo ─────────────────────────────────────────────────────────────────────
const LOGO = "data:image/webp;base64,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AAAAAC8ZAQDoAwAALxkBAOgDAAAGAACQBwAEAAAAMDIxMAGRBwAEAAAAAQIDAACgBwAEAAAAMDEwMAGgAwABAAAA//8AAAKgBAABAAAA3AUAAAOgBAABAAAAKwEAAAAAAABYTVAgyQQAADw/eHBhY2tldCBiZWdpbj0n77u/JyBpZD0nVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkJz8+Cjx4OnhtcG1ldGEgeG1sbnM6eD0nYWRvYmU6bnM6bWV0YS8nIHg6eG1wdGs9J0ltYWdlOjpFeGlmVG9vbCAxMi4xNic+CjxyZGY6UkRGIHhtbG5zOnJkZj0naHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyc+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczpkYz0naHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8nPgogIDxkYzpjcmVhdG9yPgogICA8cmRmOlNlcT4KICAgIDxyZGY6bGk+QmFndXM8L3JkZjpsaT4KICAgPC9yZGY6U2VxPgogIDwvZGM6Y3JlYXRvcj4KICA8ZGM6dGl0bGU+CiAgIDxyZGY6QWx0PgogICAgPHJkZjpsaSB4bWw6bGFuZz0neC1kZWZhdWx0Jz5VbnRpdGxlZC02PC9yZGY6bGk+CiAgIDwvcmRmOkFsdD4KICA8L2RjOnRpdGxlPgogPC9yZGY6RGVzY3JpcHRpb24+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczp4bXA9J2h0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8nPgogIDx4bXA6Q3JlYXRvclRvb2w+Q29yZWxEUkFXIFg4PC94bXA6Q3JlYXRvclRvb2w+CiA8L3JkZjpEZXNjcmlwdGlvbj4KCiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0nJwogIHhtbG5zOnN0UmVmPSdodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjJwogIHhtbG5zOnhtcE1NPSdodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vJz4KICA8eG1wTU06RGVyaXZlZEZyb20gcmRmOnBhcnNlVHlwZT0nUmVzb3VyY2UnPgogICA8c3RSZWY6ZG9jdW1lbnRJRD54bXAuZGlkOkUxMkQwQkZDQ0EzNDExRUU4Qzg1RDM3NkUxNzU3OTUzPC9zdFJlZjpkb2N1bWVudElEPgogICA8c3RSZWY6aW5zdGFuY2VJRD54bXAuaWlkOkUxMkQwQkZCQ0EzNDExRUU4Qzg1RDM3NkUxNzU3OTUzPC9zdFJlZjppbnN0YW5jZUlEPgogIDwveG1wTU06RGVyaXZlZEZyb20+CiAgPHhtcE1NOkRvY3VtZW50SUQ+eG1wLmRpZDpFMTJEMEJGRUNBMzQxMUVFOEM4NUQzNzZFMTc1Nzk1MzwveG1wTU06RG9jdW1lbnRJRD4KICA8eG1wTU06SW5zdGFuY2VJRD54bXAuaWlkOkUxMkQwQkZEQ0EzNDExRUU4Qzg1RDM3NkUxNzU3OTUzPC94bXBNTTpJbnN0YW5jZUlEPgogPC9yZGY6RGVzY3JpcHRpb24+CjwvcmRmOlJERj4KPC94OnhtcG1ldGE+Cjw/eHBhY2tldCBlbmQ9J3InPz4A";

// ─── palette ────────────────────────────────────────────────────────────────
const P = {
  purple1: "#3730a3",
  purple2: "#4f46e5",
  purple3: "#7c3aed",
  purple4: "#9333ea",
  purple5: "#a855f7",
  purple6: "#c084fc",
  orange1: "#c2410c",
  orange2: "#ea580c",
  orange3: "#f97316",
  orange4: "#fb923c",
  orange5: "#fdba74",
  mid:     "#d946ef",
};

const MC = {
  "Brand":          P.purple2,
  "Non-Brand":      P.orange3,
  "Broad":          P.purple3,
  "Phrase":         P.purple5,
  "Exact":          P.orange3,
  "Category":       P.purple4,
  "Product":        P.orange2,
  "Auto":           P.purple6,
  "Other":          P.orange5,
  "Top of Search":  P.purple2,
  "Rest of Search": P.purple4,
  "Product pages":  P.orange3,
  "Off Amazon":     P.orange4,
};

const SPECTRUM = [
  P.purple2, P.orange3, P.purple3, P.orange2,
  P.purple4, P.orange4, P.purple5, P.orange5,
  P.purple6, P.mid,
];

const getColor = (name, i) => MC[name] || SPECTRUM[i % SPECTRUM.length];

const MT_IDX = { Broad: 0, Phrase: 1, Exact: 2, Category: 3, Product: 4, Auto: 5, Other: 6 };

// ─── utils ──────────────────────────────────────────────────────────────────
const parseNum = (v) => {
  if (typeof v === "number") return isNaN(v) ? 0 : v;
  return parseFloat(String(v ?? "").replace(/[$,%\s]/g, "")) || 0;
};

const f = {
  $:   (n) => "$" + (n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  n:   (n) => (n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 }),
  x:   (n) => (n || 0).toFixed(2) + "x",
  pct: (n) => ((n || 0) * 100).toFixed(1) + "%",
  p2:  (n) => ((n || 0) * 100).toFixed(2) + "%",
  cvr: (n) => ((n || 0) * 100).toFixed(2) + "%",
};

// ─── file reading ────────────────────────────────────────────────────────────
const normCols = (data) =>
  data.map((r) => {
    const nr = {};
    for (const k of Object.keys(r)) nr[k.trim()] = r[k];
    return nr;
  });

const readFile = (file) =>
  new Promise((resolve) => {
    const ext = file.name.split(".").pop().toLowerCase();
    if (ext === "csv") {
      Papa.parse(file, {
        header: true, skipEmptyLines: true,
        complete: (r) => resolve(normCols(r.data)),
      });
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const wb = XLSX.read(e.target.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        resolve(normCols(XLSX.utils.sheet_to_json(ws, { defval: "" })));
      };
      reader.readAsBinaryString(file);
    }
  });

// ─── data processing ─────────────────────────────────────────────────────────
const getMatchType = (mt, targeting) => {
  const m = String(mt || "").trim();
  if (m && m !== "-") return m[0].toUpperCase() + m.slice(1).toLowerCase();
  const tg = String(targeting || "").trim().toLowerCase();
  if (tg.startsWith("category=")) return "Category";
  if (tg.startsWith("asin")) return "Product";
  if (["close", "substitutes", "compliments", "loose-match"].some((p) => tg.startsWith(p))) return "Auto";
  return "Other";
};

const empty = () => ({ impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0 });

const addMetrics = (agg, row) => {
  agg.impressions += parseNum(row["Impressions"]);
  agg.clicks      += parseNum(row["Clicks"]);
  agg.spend       += parseNum(row["Spend"]);
  agg.sales       += parseNum(row["7 Day Total Sales"]);
  agg.orders      += parseNum(row["7 Day Total Orders"] || row["7 Day Total Orders (#)"] || 0);
};

const calc = (a) => ({
  ...a,
  cpc:  a.clicks > 0 ? a.spend  / a.clicks : 0,
  roas: a.spend  > 0 ? a.sales  / a.spend  : 0,
  cvr:  a.clicks > 0 ? a.orders / a.clicks : 0,
});

const BUCKETS = [
  { label: "$0",          test: (s) => s === 0 },
  { label: "$1–$100",     test: (s) => s > 0   && s <= 100 },
  { label: "$100–$500",   test: (s) => s > 100  && s <= 500 },
  { label: "$500–$1,500", test: (s) => s > 500  && s <= 1500 },
  { label: "$1,500+",     test: (s) => s > 1500 },
];

const processAll = (parsed) => {
  const { searchTerm, branded, placement, businessReport, advertisedProduct } = parsed;

  const bTerms = branded
    .map((r) => String(r["Branded Terms"] || Object.values(r)[0] || "").trim())
    .filter(Boolean);
  const bASINs = new Set(
    bTerms.filter((t) => /^B[0-9A-Z]{9}$/i.test(t)).map((t) => t.toUpperCase())
  );
  const bText = bTerms
    .filter((t) => !/^B[0-9A-Z]{9}$/i.test(t))
    .map((t) => t.toLowerCase());

  const isBrand = (term) => {
    const t = String(term || "").trim();
    if (bASINs.has(t.toUpperCase())) return true;
    return bText.some((b) => t.toLowerCase().includes(b));
  };

  // ── S1 ──
  const s1b = empty(), s1nb = empty();
  const s1bmt = {}, s1nbmt = {};

  for (const r of searchTerm) {
    const brand = isBrand(r["Customer Search Term"] || "");
    const mt = getMatchType(r["Match Type"], r["Targeting"]);
    addMetrics(brand ? s1b : s1nb, r);
    const ma = brand ? s1bmt : s1nbmt;
    if (!ma[mt]) ma[mt] = empty();
    addMetrics(ma[mt], r);
  }

  const totalSpend = s1b.spend + s1nb.spend;
  const totalSales = s1b.sales + s1nb.sales;

  const s1 = {
    kpis: {
      totalSpend, totalSales,
      overallROAS: totalSpend > 0 ? totalSales / totalSpend : 0,
      brandPct: totalSpend > 0 ? s1b.spend / totalSpend : 0,
    },
    table:      [{ label: "Brand", ...calc(s1b) }, { label: "Non-Brand", ...calc(s1nb) }],
    spendPie:   [{ name: "Brand", value: s1b.spend  }, { name: "Non-Brand", value: s1nb.spend  }],
    clicksPie:  [{ name: "Brand", value: s1b.clicks }, { name: "Non-Brand", value: s1nb.clicks }],
    salesPie:   [{ name: "Brand", value: s1b.sales  }, { name: "Non-Brand", value: s1nb.sales  }],
    brandMT:    Object.entries(s1bmt).map(([name, v])  => ({ name, value: v.spend })),
    nonBrandMT: Object.entries(s1nbmt).map(([name, v]) => ({ name, value: v.spend })),
  };

  // ── S2 ──
  const s2Map  = {};
  const termMap = {};

  for (const r of searchTerm) {
    const mt  = getMatchType(r["Match Type"], r["Targeting"]);
    const cst = String(r["Customer Search Term"] || "").trim();
    if (!s2Map[mt]) s2Map[mt] = empty();
    addMetrics(s2Map[mt], r);
    const key = `${mt}|||${cst}`;
    if (!termMap[key]) termMap[key] = { mt, term: cst, spend: 0, sales: 0 };
    termMap[key].spend += parseNum(r["Spend"]);
    termMap[key].sales += parseNum(r["7 Day Total Sales"]);
  }

  const MT_ORDER = ["Broad", "Phrase", "Exact", "Category", "Product", "Auto", "Other"];
  const sortedMT = Object.entries(s2Map).sort(([a], [b]) => MT_ORDER.indexOf(a) - MT_ORDER.indexOf(b));

  const bucketTable = (() => {
    const allMTs = [...new Set(Object.values(termMap).map((t) => t.mt))].sort(
      (a, b) => MT_ORDER.indexOf(a) - MT_ORDER.indexOf(b)
    );
    const rows = allMTs.map((mt) => {
      const terms = Object.values(termMap).filter((t) => t.mt === mt);
      const buckets = BUCKETS.map((b) => {
        const subset = terms.filter((t) => b.test(t.sales));
        return { count: subset.length, spend: subset.reduce((s, t) => s + t.spend, 0) };
      });
      return { mt, buckets };
    });
    const totals = BUCKETS.map((_, bi) => ({
      count: rows.reduce((s, r) => s + r.buckets[bi].count, 0),
      spend: rows.reduce((s, r) => s + r.buckets[bi].spend, 0),
    }));
    return { rows, totals };
  })();

  const s2 = {
    table:      sortedMT.map(([label, v]) => ({ label, ...calc(v) })),
    spendPie:   sortedMT.map(([name, v])  => ({ name, value: v.spend   })),
    clicksPie:  sortedMT.map(([name, v])  => ({ name, value: v.clicks  })),
    salesPie:   sortedMT.map(([name, v])  => ({ name, value: v.sales   })),
    bucketTable,
  };

  // ── S3 ──
  const s3Map = {};
  for (const r of placement) {
    const p = r["Placement"] || "Unknown";
    if (!s3Map[p]) s3Map[p] = empty();
    addMetrics(s3Map[p], r);
  }
  const shorten = (n) => n.replace(" on Amazon", "").replace(" Amazon", "");

  const s3 = {
    chart: Object.entries(s3Map)
      .map(([name, v]) => ({
        name: shorten(name), fullName: name,
        spend: v.spend, sales: v.sales,
        roas: v.spend > 0 ? v.sales  / v.spend  : 0,
        cvr:  v.clicks > 0 ? v.orders / v.clicks : 0,
      }))
      .sort((a, b) => b.spend - a.spend),
  };

  // ── S4 ──
  const bizMap = {};
  for (const r of businessReport) {
    const asin = String(r["(Child) ASIN"] || "").trim().toUpperCase();
    if (!asin) continue;
    bizMap[asin] = (bizMap[asin] || 0) + parseNum(r["Ordered Product Sales"]);
  }

  const adsMap = {};
  for (const r of advertisedProduct) {
    const asin = String(r["Advertised ASIN"] || "").trim().toUpperCase();
    if (!asin) continue;
    if (!adsMap[asin]) adsMap[asin] = empty();
    addMetrics(adsMap[asin], r);
  }

  const allASINs = new Set([...Object.keys(bizMap), ...Object.keys(adsMap)]);
  const rawRows = Array.from(allASINs).map((asin) => {
    const org = bizMap[asin] || 0;
    const ads = adsMap[asin]  || empty();
    return {
      asin,
      organicSales: org,
      adSpend:      ads.spend,
      adSales:      ads.sales,
      adRoas:       ads.spend > 0 ? ads.sales / ads.spend : 0,
      totalRevenue: org + ads.sales,
    };
  }).sort((a, b) => b.totalRevenue - a.totalRevenue);

  const grandTotalSpend   = rawRows.reduce((s, d) => s + d.adSpend,      0);
  const grandTotalRevenue = rawRows.reduce((s, d) => s + d.totalRevenue,  0);

  const s4 = {
    data: rawRows.map((d) => ({
      ...d,
      pctSpend:   grandTotalSpend   > 0 ? d.adSpend      / grandTotalSpend   : 0,
      pctRevenue: grandTotalRevenue > 0 ? d.totalRevenue / grandTotalRevenue : 0,
    })),
    grandTotalSpend,
    grandTotalRevenue,
  };

  return { s1, s2, s3, s4 };
};

// ─── shared UI components ─────────────────────────────────────────────────────

const KPIBar = ({ items }) => (
  <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
    {items.map((item, i) => (
      <div key={i} style={{
        flex: "1 1 140px",
        background: "linear-gradient(135deg,rgba(79,70,229,0.06),rgba(249,115,22,0.04))",
        borderRadius: 12, padding: "14px 18px",
        border: "1px solid rgba(79,70,229,0.14)",
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>{item.label}</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#1e293b", letterSpacing: "-0.02em" }}>{item.value}</div>
        {item.sub && <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{item.sub}</div>}
      </div>
    ))}
  </div>
);

const DonutChart = ({ data, title, fmtVal = f.$, height = 230 }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div style={{ textAlign: "center" }}>
      <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em" }}>{title}</p>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={data} cx="50%" cy="48%" innerRadius={52} outerRadius={82} dataKey="value" labelLine={false}
            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
              if (percent < 0.05) return null;
              const R = Math.PI / 180;
              const r = innerRadius + (outerRadius - innerRadius) * 0.5;
              return (
                <text x={cx + r * Math.cos(-midAngle * R)} y={cy + r * Math.sin(-midAngle * R)}
                  fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={800}>
                  {(percent * 100).toFixed(0)}%
                </text>
              );
            }}
          >
            {data.map((d, i) => <Cell key={i} fill={getColor(d.name, i)} />)}
          </Pie>
          <RTooltip content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            return (
              <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", boxShadow: "0 8px 30px rgba(0,0,0,0.12)", fontSize: 13 }}>
                <div style={{ fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>{payload[0].name}</div>
                <div style={{ color: P.purple2, fontWeight: 600 }}>{fmtVal(payload[0].value)}</div>
                <div style={{ color: "#94a3b8", fontSize: 11, marginTop: 2 }}>{total > 0 ? (payload[0].value / total * 100).toFixed(1) : 0}% of total</div>
              </div>
            );
          }} />
          <Legend iconType="circle" iconSize={7}
            formatter={(v) => <span style={{ fontSize: 11, color: "#475569" }}>{v}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const PieRow = ({ charts }) => (
  <div style={{ display: "grid", gridTemplateColumns: `repeat(${charts.length}, 1fr)`, gap: 8, marginBottom: 28 }}>
    {charts.map((c, i) => <DonutChart key={i} {...c} />)}
  </div>
);

const DataTable = ({ rows, cols }) => (
  <div style={{ overflowX: "auto", borderRadius: 14, border: "1px solid #e8ecf0", marginTop: 4 }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr style={{ background: "linear-gradient(90deg,rgba(79,70,229,0.05),rgba(249,115,22,0.04))" }}>
          {cols.map((c) => (
            <th key={c.key} style={{ padding: "11px 16px", textAlign: c.right ? "right" : "left", fontWeight: 700, color: "#475569", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: "1.5px solid #e2e8f0", whiteSpace: "nowrap" }}>
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#fafbfc" }}>
            {cols.map((c) => (
              <td key={c.key} style={{
                padding: "10px 16px", textAlign: c.right ? "right" : "left",
                color: c.key === "label" || c.key === "asin" ? "#0f172a" : "#475569",
                fontWeight: c.key === "label" || c.key === "asin" ? 700 : 400,
                borderBottom: "1px solid #f1f5f9",
                fontFamily: c.key === "asin" ? '"DM Mono", monospace' : "inherit",
                fontSize: c.key === "asin" ? 12 : 13,
              }}>
                {c.fmt ? c.fmt(row[c.key]) : row[c.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const BucketTable = ({ bucketTable }) => {
  const { rows, totals } = bucketTable;
  const thBase = { fontWeight: 700, color: "#475569", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: "1.5px solid #e2e8f0", whiteSpace: "nowrap", padding: "10px 12px" };
  const tdBase = { padding: "9px 12px", borderBottom: "1px solid #f1f5f9", fontSize: 13 };
  return (
    <div style={{ overflowX: "auto", borderRadius: 14, border: "1px solid #e8ecf0", marginTop: 4 }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "linear-gradient(90deg,rgba(79,70,229,0.05),rgba(249,115,22,0.04))" }}>
            <th rowSpan={2} style={{ ...thBase, textAlign: "left", verticalAlign: "bottom", minWidth: 90 }}>Match Type</th>
            {BUCKETS.map((b) => (
              <th key={b.label} colSpan={2} style={{ ...thBase, textAlign: "center", borderLeft: "1px solid #e8ecf0" }}>{b.label}</th>
            ))}
          </tr>
          <tr style={{ background: "linear-gradient(90deg,rgba(79,70,229,0.03),rgba(249,115,22,0.02))" }}>
            {BUCKETS.map((b) => (
              <>
                <th key={b.label+"c"} style={{ ...thBase, fontSize: 9, borderLeft: "1px solid #e8ecf0", textAlign: "right" }}># Terms</th>
                <th key={b.label+"s"} style={{ ...thBase, fontSize: 9, textAlign: "right" }}>Spend</th>
              </>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={row.mt} style={{ background: ri % 2 === 0 ? "white" : "#fafbfc" }}>
              <td style={{ ...tdBase, textAlign: "left", fontWeight: 700, color: "#0f172a" }}>
                <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: getColor(row.mt, MT_IDX[row.mt] ?? ri), marginRight: 8 }} />
                {row.mt}
              </td>
              {row.buckets.map((b, bi) => (
                <>
                  <td key={bi+"c"} style={{ ...tdBase, textAlign: "right", borderLeft: "1px solid #f1f5f9", color: "#475569", fontFamily: '"DM Mono",monospace', fontSize: 12 }}>{b.count.toLocaleString()}</td>
                  <td key={bi+"s"} style={{ ...tdBase, textAlign: "right", color: "#475569" }}>{f.$(b.spend)}</td>
                </>
              ))}
            </tr>
          ))}
          <tr style={{ background: "linear-gradient(90deg,rgba(79,70,229,0.05),rgba(249,115,22,0.03))", borderTop: "2px solid #e2e8f0" }}>
            <td style={{ ...tdBase, textAlign: "left", fontWeight: 800, color: P.purple2 }}>Total</td>
            {totals.map((t, bi) => (
              <>
                <td key={bi+"c"} style={{ ...tdBase, textAlign: "right", fontWeight: 700, color: P.purple2, borderLeft: "1px solid #f1f5f9", fontFamily: '"DM Mono",monospace', fontSize: 12 }}>{t.count.toLocaleString()}</td>
                <td key={bi+"s"} style={{ ...tdBase, textAlign: "right", fontWeight: 700, color: P.orange3 }}>{f.$(t.spend)}</td>
              </>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const SectionCard = ({ num, title, subtitle, children, accent = P.purple2 }) => (
  <div style={{ background: "white", borderRadius: 20, padding: "32px 32px 28px", marginBottom: 20, boxShadow: "0 2px 8px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)", border: "1px solid #e8ecf0", position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${accent}, ${P.orange3})` }} />
    <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 24 }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${accent}, ${P.orange3})`, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 14, fontWeight: 900, flexShrink: 0, fontFamily: '"DM Mono", monospace', boxShadow: `0 4px 14px ${accent}50` }}>
        {num}
      </div>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em", lineHeight: 1.2 }}>{title}</h2>
        {subtitle && <p style={{ margin: "3px 0 0", fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>{subtitle}</p>}
      </div>
    </div>
    {children}
  </div>
);

const Divider = ({ label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0 20px" }}>
    <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,rgba(79,70,229,0.2),transparent)` }} />
    <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
    <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,transparent,rgba(249,115,22,0.2))` }} />
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 16px", boxShadow: "0 8px 30px rgba(0,0,0,0.12)", fontSize: 13 }}>
      <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, marginBottom: 3, display: "flex", gap: 8 }}>
          <span style={{ color: "#94a3b8" }}>{p.name}:</span>
          <span style={{ fontWeight: 600 }}>
            {p.name === "ROAS" ? f.x(p.value) : f.$(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── upload card ────────────────────────────────────────────────────────────
const UploadCard = ({ cfg, loaded, loading, fileName, onFile }) => {
  const [drag, setDrag] = useState(false);
  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); const fl = e.dataTransfer.files[0]; if (fl) onFile(cfg.id, fl); }}
      style={{ cursor: "pointer", display: "block" }}
    >
      <input type="file" accept={cfg.accept} style={{ display: "none" }}
        onChange={(e) => onFile(cfg.id, e.target.files[0])} />
      <div style={{
        background: loaded ? "linear-gradient(135deg,rgba(79,70,229,0.05),rgba(249,115,22,0.04))" : drag ? "rgba(79,70,229,0.03)" : "white",
        border: `1.5px ${loaded || drag ? "solid" : "dashed"} ${loaded || drag ? P.purple2 : "#d1d5db"}`,
        borderRadius: 14, padding: "18px 16px",
        boxShadow: loaded ? `0 0 0 3px rgba(79,70,229,0.1)` : "none",
        minHeight: 110,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: loaded ? P.purple2 : "#cbd5e1", fontFamily: '"DM Mono", monospace', letterSpacing: "0.04em" }}>{cfg.num}</span>
          <div style={{
            width: 22, height: 22, borderRadius: "50%",
            background: loaded ? P.orange3 : loading ? P.purple3 : "#e2e8f0",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            boxShadow: loaded ? `0 0 0 3px rgba(249,115,22,0.2)` : "none",
            transition: "all 0.3s",
          }}>
            {loaded  && <span style={{ color: "white", fontSize: 12, fontWeight: 700 }}>✓</span>}
            {loading && <span style={{ color: "white", fontSize: 10, animation: "spin 0.8s linear infinite" }}>◌</span>}
          </div>
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 4, lineHeight: 1.3 }}>{cfg.label}</div>
        <div style={{ fontSize: 11, color: loaded ? P.purple2 : "#94a3b8", lineHeight: 1.4, wordBreak: "break-all" }}>
          {loaded ? (fileName.length > 36 ? fileName.slice(0, 36) + "…" : fileName) : cfg.sub}
        </div>
      </div>
    </label>
  );
};

// ─── column definitions ───────────────────────────────────────────────────────
const FILE_CFG = [
  { id: "searchTerm",        num: "01", label: "Search Term Report",          sub: "Sponsored Products · Trailing 30 Days", accept: ".xlsx,.xls" },
  { id: "branded",           num: "02", label: "Branded Terms",               sub: "ASINs & Brand Variations",             accept: ".xlsx,.xls" },
  { id: "placement",         num: "03", label: "Placement Report",            sub: "Sponsored Products · Trailing 30 Days", accept: ".xlsx,.xls" },
  { id: "businessReport",    num: "04", label: "Detail Page Sales & Traffic", sub: "Seller Central · By Child Item",        accept: ".csv,.xlsx,.xls" },
  { id: "advertisedProduct", num: "05", label: "Advertised Product Report",   sub: "Sponsored Products · Trailing 30 Days", accept: ".xlsx,.xls" },
];

const TABLE_COLS = [
  { key: "label",       label: "Segment / Type" },
  { key: "impressions", label: "Impressions", right: true, fmt: f.n },
  { key: "spend",       label: "Spend",       right: true, fmt: f.$ },
  { key: "clicks",      label: "Clicks",      right: true, fmt: f.n },
  { key: "cpc",         label: "CPC",         right: true, fmt: f.$ },
  { key: "sales",       label: "Sales",       right: true, fmt: f.$ },
  { key: "roas",        label: "ROAS",        right: true, fmt: f.x },
  { key: "cvr",         label: "CVR",          right: true, fmt: f.cvr },
];

const S4_COLS = [
  { key: "asin",         label: "ASIN" },
  { key: "organicSales", label: "Organic Sales",    right: true, fmt: f.$ },
  { key: "adSpend",      label: "Ad Spend",         right: true, fmt: f.$ },
  { key: "pctSpend",     label: "% Total Spend",    right: true, fmt: f.p2 },
  { key: "adSales",      label: "Ad Sales",         right: true, fmt: f.$ },
  { key: "totalRevenue", label: "Total Revenue",    right: true, fmt: f.$ },
  { key: "pctRevenue",   label: "% Total Revenue",  right: true, fmt: f.p2 },
  { key: "adRoas",       label: "Ad ROAS",          right: true, fmt: f.x },
];


// ─── ai insight engine ───────────────────────────────────────────────────────
// Uses Claude API to generate actionable commentary from anonymized summaries.
// NO raw report data, search terms, or identifiable ASINs are ever transmitted.

const buildS1Payload = (s1) => ({
  section: "Branded vs Non-Brand",
  totalSpend:     s1.kpis.totalSpend.toFixed(2),
  totalSales:     s1.kpis.totalSales.toFixed(2),
  overallROAS:    s1.kpis.overallROAS.toFixed(2),
  brandSpendPct:  (s1.kpis.brandPct * 100).toFixed(1),
  nonBrandSpendPct: ((1 - s1.kpis.brandPct) * 100).toFixed(1),
  brandROAS:      s1.table[0] ? (s1.table[0].roas).toFixed(2) : "n/a",
  nonBrandROAS:   s1.table[1] ? (s1.table[1].roas).toFixed(2) : "n/a",
  brandCVR:       s1.table[0] ? (s1.table[0].cvr  * 100).toFixed(1) : "n/a",
  nonBrandCVR:    s1.table[1] ? (s1.table[1].cvr  * 100).toFixed(1) : "n/a",
  matchTypeSplitBrand:    s1.brandMT.map(m => ({ type: m.name, spend: m.value.toFixed(2) })),
  matchTypeSplitNonBrand: s1.nonBrandMT.map(m => ({ type: m.name, spend: m.value.toFixed(2) })),
});

const buildS2Payload = (s2) => ({
  section: "Match Type Performance",
  matchTypes: s2.table.map(r => ({
    type:        r.label,
    spend:       r.spend.toFixed(2),
    sales:       r.sales.toFixed(2),
    roas:        r.roas.toFixed(2),
    cvr:         (r.cvr  * 100).toFixed(1),
    clicks:      r.clicks,
    impressions: r.impressions,
    cpc:         r.cpc.toFixed(2),
  })),
  bucketSummary: s2.bucketTable.totals.map((t, i) => ({
    bucket: ["$0 sales","$1-$100","$100-$500","$500-$1500","$1500+"][i],
    termCount: t.count,
    spend: t.spend.toFixed(2),
  })),
});

const buildS3Payload = (s3) => ({
  section: "Placement Performance",
  placements: s3.chart.map(p => ({
    placement: p.name,
    spend:     p.spend.toFixed(2),
    sales:     p.sales.toFixed(2),
    roas:      p.roas.toFixed(2),
  })),
});

const buildS4Payload = (s4) => {
  // ANONYMIZE: replace ASINs with rank labels, send only ratios + relative values
  const total = s4.grandTotalRevenue;
  const ranked = s4.data.slice(0, 15).map((d, i) => ({
    rank:          i + 1,
    revSharePct:   (d.pctRevenue * 100).toFixed(1),
    spendSharePct: (d.pctSpend * 100).toFixed(1),
    adRoas:        d.adRoas.toFixed(2),
    organicToAdSalesRatio: d.adSales > 0 ? (d.organicSales / d.adSales).toFixed(2) : "n/a",
    totalRevenue:  d.totalRevenue.toFixed(2),
    adSpend:       d.adSpend.toFixed(2),
  }));
  return {
    section:          "ASIN Budget & Revenue (anonymized — no ASIN codes transmitted)",
    totalASINs:       s4.data.length,
    grandTotalSpend:  s4.grandTotalSpend.toFixed(2),
    grandTotalRevenue: s4.grandTotalRevenue.toFixed(2),
    blendedROAS:      s4.grandTotalSpend > 0 ? (s4.data.reduce((s,d) => s + d.adSales, 0) / s4.grandTotalSpend).toFixed(2) : "n/a",
    top15ByRevenue:   ranked,
  };
};

const SYSTEM_PROMPT = `You are an expert Amazon Advertising strategist working for ELEVATE33, a premium Amazon-focused eCommerce agency. You are analyzing aggregated performance metrics from a Sponsored Products audit.

Your job: deliver sharp, specific, actionable insights in 3-5 sentences. 
- Lead with the most important finding
- Include at least one specific number from the data
- End with a concrete recommended action
- Tone: confident, direct, expert — like a senior strategist in a client meeting
- Do NOT use bullet points, headers, or markdown formatting
- Write in flowing prose only`;

const callClaude = async (payload) => {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model:      "claude-sonnet-4-6",
      max_tokens: 400,
      system:     SYSTEM_PROMPT,
      messages:   [{ role: "user", content: "Analyze this Amazon Sponsored Products data and provide strategic insights:\n\n" + JSON.stringify(payload, null, 2) }],
    }),
  });
  if (!res.ok) throw new Error("Claude API error: " + res.status);
  const data = await res.json();
  return data.content?.[0]?.text || "Unable to generate insight.";
};

// ─── insight card component ───────────────────────────────────────────────────
const InsightCard = ({ sectionKey, payload }) => {
  const [state,     setState]    = useState("idle"); // idle | loading | done | error
  const [insight,   setInsight]  = useState("");
  const [cooldown,  setCooldown] = useState(false);

  const generate = async () => {
    if (cooldown || state === "loading") return;
    setState("loading");
    try {
      const text = await callClaude(payload);
      setInsight(text);
      setState("done");
    } catch (e) {
      console.error(e);
      setState("error");
    }
    // 30-second cooldown to prevent API abuse
    setCooldown(true);
    setTimeout(() => setCooldown(false), 30000);
  };

  return (
    <div style={{
      marginTop: 24,
      background: state === "done"
        ? "linear-gradient(135deg,rgba(79,70,229,0.04),rgba(249,115,22,0.03))"
        : "rgba(248,250,255,0.8)",
      border: `1.5px solid ${state === "done" ? "rgba(79,70,229,0.18)" : "#e8ecf0"}`,
      borderRadius: 14, padding: "18px 20px",
      transition: "all 0.3s",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 16 }}>✦</div>
          <span style={{ fontSize: 12, fontWeight: 700, color: P.purple2, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            AI Strategic Insight
          </span>
          <span style={{ fontSize: 10, color: "#94a3b8", background: "#f1f5f9", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>
            Aggregated data only · No raw files transmitted
          </span>
        </div>
        {state !== "loading" && (
          <button
            onClick={generate}
            disabled={cooldown}
            style={{
              padding: "7px 16px", borderRadius: 8, border: "none", cursor: cooldown ? "not-allowed" : "pointer",
              background: cooldown ? "#e2e8f0" : `linear-gradient(135deg,${P.purple2},${P.orange3})`,
              color: cooldown ? "#94a3b8" : "white", fontSize: 12, fontWeight: 700,
              fontFamily: "inherit", transition: "opacity 0.2s", flexShrink: 0,
              boxShadow: cooldown ? "none" : `0 2px 10px ${P.purple2}35`,
            }}
          >
            {state === "idle"  ? "Generate Insight" : ""}
            {state === "done"  ? (cooldown ? "Cooling down…" : "Regenerate") : ""}
            {state === "error" ? "Retry" : ""}
          </button>
        )}
      </div>

      {state === "loading" && (
        <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2.5px solid ${P.purple2}`, borderTopColor: "transparent", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: "#64748b", fontStyle: "italic" }}>Analyzing your account data…</span>
        </div>
      )}

      {state === "done" && insight && (
        <p style={{ margin: "14px 0 0", fontSize: 14, color: "#1e293b", lineHeight: 1.75, fontWeight: 400 }}>
          {insight}
        </p>
      )}

      {state === "error" && (
        <p style={{ margin: "10px 0 0", fontSize: 13, color: "#ef4444" }}>
          Could not generate insight — check your Anthropic API key or try again.
        </p>
      )}
    </div>
  );
};

// ─── apollo config ────────────────────────────────────────────────────────────
// Paste your Apollo API key below (Settings → Integrations → API Keys in Apollo)
const APOLLO_API_KEY = "9k011gxqVNr15wcTw2RCOA";

// ─── apollo lead submission ───────────────────────────────────────────────────
const submitToApollo = async ({ firstName, lastName, email, company, title }) => {
  // Apollo v1 contact create endpoint
  const res = await fetch("https://api.apollo.io/v1/contacts", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
    body: JSON.stringify({
      api_key:           APOLLO_API_KEY,
      first_name:        firstName,
      last_name:         lastName,
      email:             email,
      organization_name: company,
      title:             title || "",
      label_names:       ["Amazon Audit Tool"],
    }),
  });
  if (!res.ok) throw new Error("Apollo submission failed: " + res.status);
  return res.json();
};

// ─── lead gate modal ─────────────────────────────────────────────────────────
const LeadGate = ({ onUnlock }) => {
  const [form, setForm]       = useState({ firstName: "", lastName: "", email: "", company: "", title: "" });
  const [status, setStatus]   = useState("idle"); // idle | loading | error
  const [errMsg, setErrMsg]   = useState("");

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const valid = form.firstName && form.lastName && form.email.includes("@") && form.company;

  const handleSubmit = async () => {
    if (!valid) return;
    setStatus("loading");
    setErrMsg("");
    try {
      await submitToApollo(form);
      onUnlock();
    } catch (e) {
      // Still unlock even if Apollo fails — don't block the user
      console.warn("Apollo error:", e.message);
      onUnlock();
    }
  };

  const inputStyle = {
    width: "100%", boxSizing: "border-box",
    padding: "11px 14px", borderRadius: 10, fontSize: 14,
    border: "1.5px solid #e2e8f0", outline: "none", fontFamily: "inherit",
    transition: "border-color 0.2s",
    background: "white", color: "#0f172a",
  };
  const labelStyle = {
    display: "block", fontSize: 11, fontWeight: 700,
    color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6,
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      background: "linear-gradient(150deg,#f0f3ff 0%,#f8f9fb 50%,#fff8f3 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
    }}>
      {/* Decorative blobs */}
      <div style={{ position: "absolute", top: -100, right: -100, width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle,${P.purple2}18 0%,transparent 70%)`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -80, left: -80, width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle,${P.orange3}14 0%,transparent 70%)`, pointerEvents: "none" }} />

      <div style={{
        background: "white", borderRadius: 24, padding: "44px 44px 40px",
        maxWidth: 480, width: "100%", position: "relative",
        boxShadow: "0 24px 80px rgba(15,23,42,0.12), 0 4px 16px rgba(79,70,229,0.08)",
        border: "1px solid rgba(79,70,229,0.1)",
      }}>
        {/* Top accent bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, borderRadius: "24px 24px 0 0", background: `linear-gradient(90deg,${P.purple2},${P.orange3})` }} />

        {/* Logo */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <div style={{ background: `linear-gradient(135deg,${P.purple1},#1e1b4b)`, borderRadius: 12, padding: "8px 20px" }}>
            <img src={LOGO} alt="ELEVATE33" style={{ height: 26, display: "block" }} />
          </div>
        </div>

        <h1 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 900, color: "#0f172a", textAlign: "center", letterSpacing: "-0.03em" }}>
          Amazon Ads Audit Tool
        </h1>
        <p style={{ margin: "0 0 28px", fontSize: 14, color: "#64748b", textAlign: "center", lineHeight: 1.6 }}>
          Free, instant account analysis. Enter your info to get started.
        </p>

        {/* Privacy badge */}
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 10,
          background: "linear-gradient(135deg,rgba(79,70,229,0.05),rgba(249,115,22,0.04))",
          border: "1px solid rgba(79,70,229,0.12)",
          borderRadius: 12, padding: "12px 14px", marginBottom: 24,
        }}>
          <div style={{ fontSize: 18, lineHeight: 1.3, flexShrink: 0 }}>🔒</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: P.purple2, marginBottom: 2 }}>Your data never leaves your browser</div>
            <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.5 }}>
              All report processing happens locally on your device. Your Amazon data is never uploaded to any server — not ours, not anyone's. You can verify this by opening DevTools and watching network traffic.
            </div>
          </div>
        </div>

        {/* Form fields */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 16px", marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>First Name *</label>
            <input style={inputStyle} placeholder="Jane" value={form.firstName} onChange={set("firstName")}
              onFocus={e => e.target.style.borderColor = P.purple2} onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
          </div>
          <div>
            <label style={labelStyle}>Last Name *</label>
            <input style={inputStyle} placeholder="Smith" value={form.lastName} onChange={set("lastName")}
              onFocus={e => e.target.style.borderColor = P.purple2} onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Work Email *</label>
          <input style={inputStyle} type="email" placeholder="jane@brand.com" value={form.email} onChange={set("email")}
            onFocus={e => e.target.style.borderColor = P.purple2} onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 16px", marginBottom: 24 }}>
          <div>
            <label style={labelStyle}>Company *</label>
            <input style={inputStyle} placeholder="Acme Brands" value={form.company} onChange={set("company")}
              onFocus={e => e.target.style.borderColor = P.purple2} onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
          </div>
          <div>
            <label style={labelStyle}>Title <span style={{ color: "#cbd5e1", fontWeight: 400 }}>(optional)</span></label>
            <input style={inputStyle} placeholder="Amazon Manager" value={form.title} onChange={set("title")}
              onFocus={e => e.target.style.borderColor = P.purple2} onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
          </div>
        </div>

        {errMsg && <div style={{ fontSize: 12, color: "#ef4444", marginBottom: 12, textAlign: "center" }}>{errMsg}</div>}

        <button
          onClick={handleSubmit}
          disabled={!valid || status === "loading"}
          style={{
            width: "100%", padding: "14px", borderRadius: 12, border: "none", cursor: valid ? "pointer" : "not-allowed",
            background: valid ? `linear-gradient(135deg,${P.purple2},${P.orange3})` : "#e2e8f0",
            color: valid ? "white" : "#94a3b8", fontSize: 15, fontWeight: 800, letterSpacing: "-0.01em",
            fontFamily: "inherit", transition: "opacity 0.2s, transform 0.1s",
            boxShadow: valid ? `0 4px 20px ${P.purple2}40` : "none",
          }}
          onMouseEnter={e => { if (valid) e.target.style.opacity = "0.9"; }}
          onMouseLeave={e => { e.target.style.opacity = "1"; }}
        >
          {status === "loading" ? "Launching…" : "Launch Audit Tool →"}
        </button>

        <p style={{ margin: "14px 0 0", fontSize: 11, color: "#94a3b8", textAlign: "center", lineHeight: 1.5 }}>
          By continuing you agree to receive occasional outreach from ELEVATE33.{" "}
          <span style={{ color: "#cbd5e1" }}>We don't sell your data.</span>
        </p>
      </div>
    </div>
  );
};

// ─── privacy trust banner ────────────────────────────────────────────────────
const PrivacyBanner = () => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{
      background: "linear-gradient(135deg,rgba(79,70,229,0.05),rgba(249,115,22,0.03))",
      border: "1px solid rgba(79,70,229,0.12)", borderRadius: 14,
      padding: "10px 16px", marginBottom: 20,
      display: "flex", alignItems: "flex-start", gap: 10,
    }}>
      <span style={{ fontSize: 16, lineHeight: 1.4, flexShrink: 0 }}>🔒</span>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: P.purple2 }}>
            100% Local Processing — Your data never leaves this browser tab
          </span>
          <button onClick={() => setExpanded(p => !p)} style={{
            fontSize: 11, color: "#64748b", background: "none", border: "none",
            cursor: "pointer", padding: 0, textDecoration: "underline", fontFamily: "inherit",
          }}>
            {expanded ? "hide" : "how?"}
          </button>
        </div>
        {expanded && (
          <p style={{ margin: "6px 0 0", fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>
            When you upload a file, your browser reads it using the native <strong>FileReader API</strong> and processes it entirely in JavaScript running on your machine. No file data is transmitted over the network — open your browser's DevTools (F12 → Network tab) while uploading to confirm zero outbound requests carrying your data. The only network calls this app makes are: (1) submitting your contact info to our CRM when you register, and (2) sending aggregated summary metrics (no file data, no search terms, no ASIN identifiers) to the Claude AI API when you request an insight.
          </p>
        )}
      </div>
    </div>
  );
};

// ─── page config ─────────────────────────────────────────────────────────────
const PAGES = [
  { id: "upload",   label: "Upload",    icon: "⬆" },
  { id: "brand",    label: "Brand",     icon: "1" },
  { id: "match",    label: "Match",     icon: "2" },
  { id: "placement",label: "Placement", icon: "3" },
  { id: "asin",     label: "ASINs",     icon: "4" },
  { id: "strategy", label: "Strategy",  icon: "★" },
];

// ─── stepper ─────────────────────────────────────────────────────────────────
const Stepper = ({ page, setPage, canAdvance }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
    {PAGES.map((p, i) => {
      const active  = i === page;
      const done    = i < page;
      const locked  = i > 0 && !canAdvance && i !== page;
      return (
        <div key={p.id} style={{ display: "flex", alignItems: "center" }}>
          <button
            onClick={() => { if (done || (i === 0) || (canAdvance)) setPage(i); }}
            disabled={locked}
            title={p.label}
            style={{
              width: 32, height: 32, borderRadius: "50%", border: "none",
              cursor: locked ? "not-allowed" : "pointer",
              background: active
                ? `linear-gradient(135deg,${P.purple2},${P.orange3})`
                : done ? P.purple2 : "#e2e8f0",
              color: active || done ? "white" : "#94a3b8",
              fontSize: active ? 13 : 11, fontWeight: 800,
              fontFamily: '"DM Mono", monospace',
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: active ? `0 2px 12px ${P.purple2}50` : "none",
              transition: "all 0.2s", flexShrink: 0,
            }}
          >
            {done && !active ? "✓" : p.icon}
          </button>
          {i < PAGES.length - 1 && (
            <div style={{ width: 20, height: 2, background: done ? P.purple2 : "#e2e8f0", transition: "background 0.3s" }} />
          )}
        </div>
      );
    })}
  </div>
);

// ─── page nav bar ─────────────────────────────────────────────────────────────
const PageNav = ({ page, setPage, canAdvance, onExport, isStrategyPage }) => (
  <div style={{
    display: "flex", alignItems: "center", justifyContent: "space-between",
    margin: "28px 0 0", padding: "16px 20px",
    background: "white", borderRadius: 14,
    border: "1px solid #e8ecf0",
    boxShadow: "0 1px 4px rgba(15,23,42,0.05)",
  }}>
    <button
      onClick={() => setPage(p => Math.max(0, p - 1))}
      disabled={page === 0}
      style={{
        padding: "9px 20px", borderRadius: 9, border: "1.5px solid #e2e8f0",
        background: "white", cursor: page === 0 ? "not-allowed" : "pointer",
        fontSize: 13, fontWeight: 700, color: page === 0 ? "#cbd5e1" : "#475569",
        fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6,
      }}
    >← {page > 0 ? PAGES[page - 1].label : "Back"}</button>

    <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, fontFamily: '"DM Mono"' }}>
      {page + 1} / {PAGES.length}
    </span>

    <div style={{ display: "flex", gap: 8 }}>
      {isStrategyPage && (
        <button
          onClick={onExport}
          style={{
            padding: "9px 20px", borderRadius: 9, border: "none",
            background: "linear-gradient(135deg,#0f172a,#1e293b)",
            color: "white", cursor: "pointer", fontSize: 13, fontWeight: 700,
            fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6,
            boxShadow: "0 2px 10px rgba(15,23,42,0.25)",
          }}
        >⬇ Export PDF</button>
      )}
      {page < PAGES.length - 1 && (
        <button
          onClick={() => { if (canAdvance || page === 0) setPage(p => p + 1); }}
          disabled={page > 0 && !canAdvance}
          style={{
            padding: "9px 20px", borderRadius: 9, border: "none",
            background: (page > 0 && !canAdvance)
              ? "#e2e8f0"
              : `linear-gradient(135deg,${P.purple2},${P.orange3})`,
            color: (page > 0 && !canAdvance) ? "#94a3b8" : "white",
            cursor: (page > 0 && !canAdvance) ? "not-allowed" : "pointer",
            fontSize: 13, fontWeight: 700, fontFamily: "inherit",
            display: "flex", alignItems: "center", gap: 6,
            boxShadow: (page > 0 && !canAdvance) ? "none" : `0 2px 12px ${P.purple2}40`,
          }}
        >{PAGES[page + 1].label} →</button>
      )}
    </div>
  </div>
);

// ─── strategy payload builder ────────────────────────────────────────────────
const buildStrategyPayload = (results) => {
  const s1 = buildS1Payload(results.s1);
  const s2 = buildS2Payload(results.s2);
  const s3 = buildS3Payload(results.s3);
  const s4 = buildS4Payload(results.s4);
  return { ...s1, ...s2, ...s3, ...s4, section: "Full Account Strategy Report" };
};

// ─── strategy page ────────────────────────────────────────────────────────────
const STRATEGY_SECTIONS = [
  { key: "executive",   label: "Executive Summary",          icon: "📋" },
  { key: "brand",       label: "Brand Strategy",             icon: "🏷" },
  { key: "match",       label: "Match Type Recommendations", icon: "🎯" },
  { key: "placement",   label: "Placement Optimization",     icon: "📍" },
  { key: "asin",        label: "ASIN Portfolio Insights",    icon: "📦" },
  { key: "actions",     label: "Priority Actions (30/60/90 Day)", icon: "⚡" },
];

const STRATEGY_PROMPT = `You are a senior Amazon Advertising strategist at ELEVATE33, an elite eCommerce agency. You are producing a formal strategic audit report for a brand client.

You will be given aggregated account metrics. Produce a structured report with EXACTLY these six sections, each labeled with the exact header shown:

[EXECUTIVE SUMMARY]
3-4 sentences capturing the overall account health, top opportunity, and biggest risk. Be specific with numbers.

[BRAND STRATEGY]
3-4 sentences analyzing the brand vs non-brand balance, what it signals about the account's defensive vs growth posture, and a specific recommendation.

[MATCH TYPE RECOMMENDATIONS]
3-4 sentences analyzing match type efficiency distribution, identifying where budget is being wasted or underinvested, and recommending specific reallocations.

[PLACEMENT OPTIMIZATION]
3-4 sentences on placement ROAS and CVR patterns, which placements are over/under-funded relative to performance, and what to change.

[ASIN PORTFOLIO INSIGHTS]
3-4 sentences on revenue concentration risk, which product tiers need attention, and how to rationalize ad investment across the portfolio.

[PRIORITY ACTIONS (30/60/90 DAY)]
Format as three clear time-boxed blocks:
30 Days: [2-3 immediate tactical actions]
60 Days: [2-3 structural changes]
90 Days: [2-3 strategic shifts]

Rules: Use actual numbers from the data. Be direct and prescriptive. No fluff. Write in confident agency voice.`;

const StrategyPage = ({ results }) => {
  const [sections, setSections] = useState({});
  const [loading,  setLoading]  = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generate = async () => {
    if (loading || cooldown) return;
    setLoading(true);
    setSections({});
    try {
      const payload = buildStrategyPayload(results);
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1200,
          system: STRATEGY_PROMPT,
          messages: [{ role: "user", content: "Generate the full strategy report for this account:\n\n" + JSON.stringify(payload, null, 2) }],
        }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "";

      // Parse the six labeled sections out of the response
      const parsed = {};
      STRATEGY_SECTIONS.forEach(({ key, label }) => {
        // Match the bracketed header and capture everything until the next header or end
        const headerMap = {
          executive:  "EXECUTIVE SUMMARY",
          brand:      "BRAND STRATEGY",
          match:      "MATCH TYPE RECOMMENDATIONS",
          placement:  "PLACEMENT OPTIMIZATION",
          asin:       "ASIN PORTFOLIO INSIGHTS",
          actions:    "PRIORITY ACTIONS",
        };
        const tag   = headerMap[key];
        const regex = new RegExp(`\[${tag}[^\]]*\]([\s\S]*?)(?=\[|$)`, "i");
        const match = text.match(regex);
        parsed[key] = match ? match[1].trim() : "";
      });
      setSections(parsed);
      setGenerated(true);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
    setCooldown(true);
    setTimeout(() => setCooldown(false), 30000);
  };

  return (
    <div>
      {/* Hero card */}
      <div style={{
        background: `linear-gradient(135deg,${P.purple1},#312e81,#1e1b4b)`,
        borderRadius: 20, padding: "36px 40px", marginBottom: 20,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 260, height: 260, borderRadius: "50%", background: `radial-gradient(circle,${P.orange3}22 0%,transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: `${P.orange3}cc`, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>ELEVATE33 · Full Account Analysis</div>
              <h2 style={{ margin: "0 0 8px", fontSize: 26, fontWeight: 900, color: "white", letterSpacing: "-0.03em" }}>Strategy Report</h2>
              <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
                AI-generated strategic recommendations based on your complete account data across all four audit sections.
              </p>
            </div>
            <button
              onClick={generate}
              disabled={loading || cooldown}
              style={{
                padding: "12px 28px", borderRadius: 12, border: "none",
                background: loading || cooldown ? "rgba(255,255,255,0.1)" : `linear-gradient(135deg,${P.orange2},${P.orange3})`,
                color: loading || cooldown ? "rgba(255,255,255,0.4)" : "white",
                fontSize: 14, fontWeight: 800, cursor: loading || cooldown ? "not-allowed" : "pointer",
                fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8,
                boxShadow: loading || cooldown ? "none" : `0 4px 20px ${P.orange3}50`,
                flexShrink: 0,
              }}
            >
              {loading ? (
                <>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", animation: "spin 0.7s linear infinite" }} />
                  Generating…
                </>
              ) : generated ? (cooldown ? "Cooling down…" : "↺ Regenerate Report") : "✦ Generate Strategy Report"}
            </button>
          </div>
        </div>
      </div>

      {/* Privacy notice for strategy page */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, marginBottom: 20,
        padding: "10px 16px", borderRadius: 10, fontSize: 11,
        background: "rgba(79,70,229,0.04)", border: "1px solid rgba(79,70,229,0.1)",
        color: "#64748b",
      }}>
        <span>🔒</span>
        <span>Strategy report uses <strong>aggregated totals only</strong> — ASIN codes are anonymized, no raw file data is transmitted to the AI.</span>
      </div>

      {/* Empty state */}
      {!generated && !loading && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
          <div style={{ fontSize: 52, marginBottom: 16, opacity: 0.25 }}>★</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#475569", marginBottom: 6 }}>Your strategy report will appear here</div>
          <div style={{ fontSize: 13 }}>Click "Generate Strategy Report" above to analyze your complete account</div>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", border: `3px solid ${P.purple2}`, borderTopColor: "transparent", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <div style={{ fontSize: 15, fontWeight: 700, color: "#475569", marginBottom: 4 }}>Analyzing your full account…</div>
          <div style={{ fontSize: 13, color: "#94a3b8" }}>This takes about 10 seconds</div>
        </div>
      )}

      {/* Report sections */}
      {generated && !loading && (
        <div id="strategy-report" style={{ display: "grid", gap: 16 }}>
          {STRATEGY_SECTIONS.map(({ key, label, icon }) => (
            <div key={key} style={{
              background: "white", borderRadius: 16, padding: "24px 28px",
              border: "1px solid #e8ecf0",
              boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${P.purple2},${P.orange3})` }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 18 }}>{icon}</span>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</h3>
              </div>
              {sections[key] ? (
                <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.8, whiteSpace: "pre-line" }}>
                  {sections[key]}
                </div>
              ) : (
                <div style={{ fontSize: 13, color: "#94a3b8", fontStyle: "italic" }}>Section not generated</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── app ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [unlocked,    setUnlocked]    = useState(false);
  const [page,        setPage]        = useState("intro");
  const [parsedData,  setParsedData]  = useState({});
  const [loadingId,   setLoadingId]   = useState(null);
  const [fileNames,   setFileNames]   = useState({});

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
    try { return processAll(parsedData); } catch (e) { console.error(e); return null; }
  }, [allLoaded, parsedData]);

  const nav = (p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const handleExportPDF = () => { window.print(); };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=DM+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      {!unlocked && <LeadGate onUnlock={() => setUnlocked(true)} />}
      <div style={{ fontFamily: '"DM Sans", system-ui, sans-serif', minHeight: "100vh", background: "linear-gradient(150deg,#f0f3ff 0%,#f8f9fb 50%,#fff8f3 100%)", color: "#0f172a" }}>

        {/* HEADER */}
        <header style={{ background: "rgba(255,255,255,0.93)", backdropFilter: "blur(20px)", borderBottom: "1px solid #eaedf5", padding: "0 28px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 0 rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: `linear-gradient(135deg,${P.purple1},#1e1b4b)`, borderRadius: 10, padding: "5px 14px", display: "flex", alignItems: "center", boxShadow: `0 2px 10px ${P.purple2}40`, cursor: "pointer" }} onClick={() => nav("intro")}>
              <img src={LOGO} alt="ELEVATE33" style={{ height: 22, width: "auto", display: "block" }} />
            </div>
            <div style={{ width: 1, height: 28, background: "#e2e8f0", margin: "0 8px" }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#1e293b", letterSpacing: "-0.02em", lineHeight: 1.2 }}>Amazon Sponsored Products Audit</div>
              <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500 }}>Account Performance Dashboard</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Stepper page={page} setPage={setPage} canAdvance={allLoaded} />
            <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600, fontFamily: '"DM Mono", monospace' }}>{loadedCount}/5 files</span>
          </div>
        </header>

        <main style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 20px 60px" }}>

          {/* ── PAGE 0: UPLOADS ── */}
          {page === 0 && (
            <>
              <PrivacyBanner />
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4 }}>
                  <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em" }}>Upload Reports</h1>
                  {allLoaded && (
                    <span style={{ fontSize: 12, fontWeight: 700, color: P.orange3, background: "rgba(249,115,22,0.1)", padding: "2px 10px", borderRadius: 20 }}>All reports loaded ✓</span>
                  )}
                </div>
                <p style={{ margin: "0 0 16px", color: "#64748b", fontSize: 13 }}>Upload all 5 reports below — supports Excel (.xlsx) and CSV files.</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
                  {FILE_CFG.map((cfg) => (
                    <UploadCard key={cfg.id} cfg={cfg}
                      loaded={!!parsedData[cfg.id]?.length} loading={loadingId === cfg.id}
                      fileName={fileNames[cfg.id] || ""} onFile={handleFile} />
                  ))}
                </div>
                {!allLoaded && (
                  <div style={{ textAlign: "center", padding: "50px 20px", color: "#94a3b8" }}>
                    <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.25 }}>📊</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#475569", marginBottom: 4 }}>Upload all 5 reports to begin</div>
                    <div style={{ fontSize: 13 }}>{5 - loadedCount} more report{5 - loadedCount !== 1 ? "s" : ""} needed</div>
                  </div>
                )}
              </div>
              <PageNav page={page} setPage={setPage} canAdvance={allLoaded} />
            </>
          )}

          {/* ── PAGE 1: BRAND ── */}
          {page === 1 && results && (
            <>
              <SectionCard num="1" title="Branded vs. Non-Brand Analysis" subtitle="Customer search term classification against branded terms library" accent={P.purple2}>
                <KPIBar items={[
                  { label: "Total Spend",       value: f.$(results.s1.kpis.totalSpend) },
                  { label: "Total Sales",       value: f.$(results.s1.kpis.totalSales) },
                  { label: "Overall ROAS",      value: f.x(results.s1.kpis.overallROAS) },
                  { label: "Brand Spend %",     value: f.pct(results.s1.kpis.brandPct),     sub: "of total spend" },
                  { label: "Non-Brand Spend %", value: f.pct(1 - results.s1.kpis.brandPct), sub: "of total spend" },
                ]} />
                <PieRow charts={[
                  { data: results.s1.spendPie,  title: "Spend" },
                  { data: results.s1.clicksPie, title: "Clicks", fmtVal: f.n },
                  { data: results.s1.salesPie,  title: "Sales" },
                ]} />
                <DataTable rows={results.s1.table} cols={TABLE_COLS} />
                <Divider label="Match Type Distribution by Segment (Spend)" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <DonutChart data={results.s1.brandMT}    title="Brand — Match Type Spend" />
                  <DonutChart data={results.s1.nonBrandMT} title="Non-Brand — Match Type Spend" />
                </div>
                <InsightCard sectionKey="s1" payload={buildS1Payload(results.s1)} />
              </SectionCard>
              <PageNav page={page} setPage={setPage} canAdvance={allLoaded} />
            </>
          )}

          {/* ── PAGE 2: MATCH TYPE ── */}
          {page === 2 && results && (
            <>
              <SectionCard num="2" title="Match Type Analysis" subtitle="Performance breakdown across Broad, Phrase, Exact, Category, Product & Auto" accent={P.purple3}>
                <PieRow charts={[
                  { data: results.s2.spendPie,  title: "Spend by Match Type" },
                  { data: results.s2.clicksPie, title: "Clicks by Match Type", fmtVal: f.n },
                  { data: results.s2.salesPie,  title: "Sales by Match Type" },
                ]} />
                <DataTable rows={results.s2.table} cols={TABLE_COLS} />
                <Divider label="Search Term Count & Spend by Sales Bucket" />
                <BucketTable bucketTable={results.s2.bucketTable} />
                <InsightCard sectionKey="s2" payload={buildS2Payload(results.s2)} />
              </SectionCard>
              <PageNav page={page} setPage={setPage} canAdvance={allLoaded} />
            </>
          )}

          {/* ── PAGE 3: PLACEMENTS ── */}
          {page === 3 && results && (
            <>
              <SectionCard num="3" title="Placement Performance" subtitle="Spend (bars), ROAS and CVR (lines) across ad placements" accent={P.purple4}>
                <ResponsiveContainer width="100%" height={340}>
                  <ComposedChart data={results.s3.chart} margin={{ top: 16, right: 64, bottom: 24, left: 20 }}>
                    <defs>
                      <linearGradient id="placementBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor={P.purple2} stopOpacity={1} />
                        <stop offset="100%" stopColor={P.purple4} stopOpacity={0.9} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} axisLine={false} tickLine={false}
                      label={{ value: "Spend ($)", angle: -90, position: "insideLeft", fill: "#94a3b8", fontSize: 11, dy: 30 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v) => v.toFixed(1)+"x"} axisLine={false} tickLine={false}
                      label={{ value: "ROAS", angle: 90, position: "insideRight", fill: "#94a3b8", fontSize: 11, dy: -16 }} />
                    <YAxis yAxisId="right2" orientation="right" tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v) => (v*100).toFixed(0)+"%"} axisLine={false} tickLine={false} width={52}
                      label={{ value: "CVR %", angle: 90, position: "insideRight", fill: "#94a3b8", fontSize: 11, dy: -20 }} />
                    <RTooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 12, color: "#475569" }}>{v}</span>} />
                    <Bar  yAxisId="left"   dataKey="spend" name="Spend" fill="url(#placementBar)" radius={[8,8,0,0]} maxBarSize={90} />
                    <Line yAxisId="right"  type="monotone" dataKey="roas" name="ROAS" stroke={P.orange3} strokeWidth={2.5}
                      dot={{ fill: P.orange3, r: 6, strokeWidth: 2, stroke: "white" }} activeDot={{ r: 8, stroke: P.orange3, strokeWidth: 2 }} />
                    <Line yAxisId="right2" type="monotone" dataKey="cvr"  name="CVR"  stroke={P.purple4} strokeWidth={2.5} strokeDasharray="5 3"
                      dot={{ fill: P.purple4, r: 6, strokeWidth: 2, stroke: "white" }} activeDot={{ r: 8, stroke: P.purple4, strokeWidth: 2 }} />
                  </ComposedChart>
                </ResponsiveContainer>
                <InsightCard sectionKey="s3" payload={buildS3Payload(results.s3)} />
              </SectionCard>
              <PageNav page={page} setPage={setPage} canAdvance={allLoaded} />
            </>
          )}

          {/* ── PAGE 4: ASINs ── */}
          {page === 4 && results && (() => {
            const { data, grandTotalSpend, grandTotalRevenue } = results.s4;
            const totalOrganic = data.reduce((s, d) => s + d.organicSales, 0);
            const totalAdSales = data.reduce((s, d) => s + d.adSales, 0);
            const blendedROAS  = grandTotalSpend > 0 ? totalAdSales / grandTotalSpend : 0;
            const top10 = data.slice(0, 10).map((d) => ({
              asin: "…" + d.asin.slice(-6),
              "Organic Sales": d.organicSales, "Ad Sales": d.adSales, "Ad Spend": d.adSpend,
            }));
            return (
              <>
                <SectionCard num="4" title="ASIN Budget & Revenue Relationship" subtitle="Organic sales merged with advertising investment by product ASIN" accent={P.purple2}>
                  <KPIBar items={[
                    { label: "Total Organic Sales", value: f.$(totalOrganic) },
                    { label: "Total Ad Spend",      value: f.$(grandTotalSpend) },
                    { label: "Total Ad Sales",      value: f.$(totalAdSales) },
                    { label: "Blended ROAS",        value: f.x(blendedROAS), sub: "ads only" },
                    { label: "ASINs Tracked",       value: data.length.toString() },
                  ]} />
                  <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Top 10 ASINs — Revenue vs. Ad Spend</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={top10} margin={{ top: 8, right: 70, bottom: 40, left: 20 }}>
                      <defs>
                        <linearGradient id="orgGrad2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%"   stopColor={P.purple2} stopOpacity={0.9} />
                          <stop offset="100%" stopColor={P.purple2} stopOpacity={0.7} />
                        </linearGradient>
                        <linearGradient id="adGrad2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%"   stopColor={P.purple4} stopOpacity={0.9} />
                          <stop offset="100%" stopColor={P.purple4} stopOpacity={0.7} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="asin" tick={{ fontSize: 10, fill: "#64748b", fontFamily: '"DM Mono"' }} angle={-35} textAnchor="end" axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
                      <YAxis yAxisId="left"  tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false}
                        label={{ value: "Sales ($)", angle: -90, position: "insideLeft", fill: "#94a3b8", fontSize: 11, dy: 28 }} />
                      <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `$${(v/1000).toFixed(1)}k`} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false}
                        label={{ value: "Ad Spend", angle: 90, position: "insideRight", fill: "#94a3b8", fontSize: 11, dy: -30 }} />
                      <RTooltip content={<CustomTooltip />} />
                      <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 12, color: "#475569" }}>{v}</span>} />
                      <Bar  yAxisId="left" dataKey="Organic Sales" stackId="rev" fill="url(#orgGrad2)" radius={[0,0,0,0]} />
                      <Bar  yAxisId="left" dataKey="Ad Sales"      stackId="rev" fill="url(#adGrad2)"  radius={[4,4,0,0]} />
                      <Line yAxisId="right" type="monotone" dataKey="Ad Spend" name="Ad Spend" stroke={P.orange3} strokeWidth={2.5}
                        dot={{ fill: P.orange3, r: 5, strokeWidth: 2, stroke: "white" }} activeDot={{ r: 8, stroke: P.orange3, strokeWidth: 2 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                  <Divider label="All ASINs — with % Share" />
                  <DataTable rows={data} cols={S4_COLS} />
                  <InsightCard sectionKey="s4" payload={buildS4Payload(results.s4)} />
                </SectionCard>
                <PageNav page={page} setPage={setPage} canAdvance={allLoaded} />
              </>
            );
          })()}

          {/* ── PAGE 5: STRATEGY ── */}
          {page === 5 && results && (
            <>
              <StrategyPage results={results} />
              <PageNav page={page} setPage={setPage} canAdvance={allLoaded} isStrategyPage onExport={handleExportPDF} />
            </>
          )}

        </main>
        <footer style={{ borderTop: "1px solid #eaedf5", padding: "16px 28px", background: "white", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ background: `linear-gradient(135deg,${P.purple1},#1e1b4b)`, borderRadius: 6, padding: "3px 10px", display: "flex", alignItems: "center" }}>
              <img src={LOGO} alt="ELEVATE33" style={{ height: 16, width: "auto", display: "block" }} />
            </div>
            <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>Amazon Sponsored Products Audit</span>
          </div>
          <span style={{ fontSize: 11, color: "#cbd5e1", fontFamily: '"DM Mono", monospace' }}>Powered by ELEVATE33</span>
        </footer>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          * { box-sizing: border-box; }
          body { margin: 0; }
          tr:hover td { background: rgba(79,70,229,0.025) !important; transition: background 0.1s; }
          label:hover > div { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(79,70,229,0.14) !important; }
          label > div { transition: transform 0.2s, box-shadow 0.2s; }
          ::-webkit-scrollbar { width: 6px; height: 6px; }
          ::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 3px; }
          ::-webkit-scrollbar-thumb { background: rgba(79,70,229,0.25); border-radius: 3px; }
          ::-webkit-scrollbar-thumb:hover { background: rgba(249,115,22,0.4); }
          @media print {
            header, footer, .no-print, button { display: none !important; }
            body { background: white !important; }
            main { padding: 0 !important; max-width: 100% !important; }
            #strategy-report > div { break-inside: avoid; page-break-inside: avoid; }
            * { box-shadow: none !important; }
            @page { margin: 20mm; }
          }
        `}</style>
      </div>
    </>
  );
}
