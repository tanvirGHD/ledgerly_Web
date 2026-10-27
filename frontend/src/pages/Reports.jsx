import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { formatMoney } from "../lib/format";
import Panel from "../components/Panel";

const RANGES = [
  { key: "7d", label: "7d" },
  { key: "4w", label: "4w" },
  { key: "6m", label: "6m" },
  { key: "year", label: "Year" },
];

const PIE_COLORS = ["#18A875", "#42C28F", "#D96560", "#78BE94", "#10835B", "#A8CDBA", "#F08A83", "#52665C"];

export default function Reports() {
  const { user } = useAuth();
  const currency = user?.currency || "BDT";
  const [range, setRange] = useState("7d");
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/reports/range", { params: { range } }).then((res) => setData(res.data));
  }, [range]);

  function exportCsv() {
    if (!data) return;
    const rows = [["Date", "Type", "Amount", "Category", "Payment Method", "Notes", "Source"]];
    data.transactions.forEach((t) => {
      rows.push([
        new Date(t.date).toISOString().slice(0, 10),
        t.type,
        t.amount,
        t.category,
        t.paymentMethod,
        (t.notes || "").replace(/,/g, " "),
        (t.source || "").replace(/,/g, " "),
      ]);
    });
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ledgerly-transactions-${range}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-[1280px] space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl text-paper-100">Reports</h1>
          <p className="text-sm text-paper-400">Trends and breakdowns across the period you choose.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex border border-ink-700/60 rounded overflow-hidden text-sm">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={`px-3 py-1.5 ${range === r.key ? "bg-gold-500 text-ink-950" : "text-paper-400"}`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button onClick={exportCsv} className="flex items-center gap-2 border border-ink-700/60 rounded px-3 py-1.5 text-sm text-paper-200 hover:bg-ink-800">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {!data ? (
        <p className="text-sm text-paper-400">Loading report…</p>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <Panel title="Income vs expense by day" className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.series} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid stroke="#304139" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" stroke="#73867A" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis domain={[0, "dataMax"]} allowDecimals={false} tickCount={5} tickFormatter={formatChartValue} stroke="#73867A" fontSize={11} tickLine={false} axisLine={false} width={42} />
                <Tooltip
                  contentStyle={{ background: "#17201C", border: "1px solid #52665C", borderRadius: 6, fontSize: 12 }}
                  formatter={(v, name) => [formatMoney(v, currency), name === "income" ? "Income" : "Expenses"]}
                />
                <Bar dataKey="income" fill="#18A875" radius={[3, 3, 0, 0]} />
                <Bar dataKey="expense" fill="#D96560" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Panel>

          <Panel title="Expenses by category">
            {data.categoryBreakdown.length === 0 ? (
              <p className="text-sm text-paper-400 py-16 text-center">No expenses in this range.</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={data.categoryBreakdown} dataKey="value" nameKey="category" innerRadius={55} outerRadius={88} paddingAngle={3} stroke="none">
                    {data.categoryBreakdown.map((item, i) => (
                      <Cell key={item.category} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#17201C", border: "1px solid #52665C", borderRadius: 6, fontSize: 12 }}
                    formatter={(v, name) => [formatMoney(v, currency), name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            {data.categoryBreakdown.length > 0 && <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-ink-700/60 pt-4">{data.categoryBreakdown.map((item, index) => <div key={item.category} className="flex min-w-0 items-center gap-2 text-xs"><span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} /><span className="truncate text-paper-400">{item.category}</span><span className="ml-auto text-right font-tabular text-paper-200">{formatMoney(item.value, currency)}</span></div>)}</div>}
          </Panel>
        </div>
      )}
    </div>
  );
}

function formatChartValue(value) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}m`;
  if (value >= 1000) return `${Math.round(value / 1000)}k`;
  return value;
}
