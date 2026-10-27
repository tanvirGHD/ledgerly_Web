import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, CalendarDays, ChevronRight, ClipboardList, Plus, WalletCards } from "lucide-react";
import { Link } from "react-router-dom";
import { Area, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { formatDate, formatMoney, monthKey } from "../lib/format";
import Panel from "../components/Panel";
import Kpi from "../components/Kpi";

const PIE_COLORS = [1, 2, 3, 4, 5, 6, 7, 8].map((color) => `rgb(var(--pie-color-${color}))`);
const CHART_TOOLTIP_STYLE = {
  background: "rgb(var(--chart-tooltip))",
  border: "1px solid rgb(var(--chart-tooltip-border))",
  borderRadius: 6,
  color: "rgb(var(--paper-100))",
  fontSize: 12,
};

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [error, setError] = useState(false);
  const currency = user?.currency || "BDT";
  const currentMonth = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });

  useEffect(() => {
    Promise.all([
      api.get("/reports/dashboard"),
      api.get("/budgets", { params: { month: monthKey() } }),
    ])
      .then(([report, budget]) => {
        setData(report.data);
        setBudgets(budget.data.budgets);
      })
      .catch(() => setError(true));
  }, []);

  if (error) return <DashboardErrorState onRetry={() => window.location.reload()} />;
  if (!data) return <DashboardSkeleton />;

  const { kpis, trend, categoryBreakdown, recentTransactions } = data;
  const noTransactionsThisMonth = Number(kpis.monthIncome) === 0 && Number(kpis.monthExpense) === 0;
  const totalBudget = budgets.find((item) => !item.category);
  const budgetPercent = totalBudget ? Math.min(100, (totalBudget.spent / totalBudget.limit) * 100 || 0) : 0;
  const budgetOver = totalBudget && totalBudget.spent > totalBudget.limit;

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-7">
      <header className="flex min-w-0 flex-wrap items-end justify-between gap-5">
        <div className="min-w-0">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-gold-500">Financial overview</p>
          <h1 className="break-words font-display text-2xl font-semibold text-paper-100 sm:text-3xl">Good to see you, {user?.displayName || "there"}.</h1>
          <p className="mt-2 text-sm text-paper-400">Here is your financial position for {currentMonth}.</p>
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <Link to="/transactions" className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-gold-500 px-3.5 py-2.5 text-sm font-semibold text-ink-950 transition-colors hover:bg-gold-400 focus-visible:ring-2 focus-visible:ring-gold-500 sm:w-auto"><Plus size={16} aria-hidden="true" /> Add transaction</Link>
        </div>
      </header>

      <section className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Total balance" value={formatMoney(kpis.balance, currency)} accent="text-gold-400" />
        <Kpi label="Income this month" value={formatMoney(kpis.monthIncome, currency)} accent="text-sage-400" helperText={noTransactionsThisMonth ? "No transactions this month" : undefined} />
        <Kpi label="Expenses this month" value={formatMoney(kpis.monthExpense, currency)} accent="text-brick-400" helperText={noTransactionsThisMonth ? "No transactions this month" : undefined} />
        <Kpi label="Remaining this month" value={formatMoney(kpis.monthRemaining, currency)} accent="text-paper-100" helperText={noTransactionsThisMonth ? "No transactions this month" : undefined} />
      </section>

      <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)]">
        <Panel title="Cash flow" action={<ChartLegend />}>
          <div className="mb-4 flex items-center gap-2 text-xs text-paper-400"><CalendarDays size={14} /> Last six months</div>
          <div className="min-w-0">
          <ResponsiveContainer width="100%" height={286}>
            <LineChart data={trend} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
              <defs><linearGradient id="cashFlowIncome" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="rgb(var(--chart-income))" stopOpacity={0.32} /><stop offset="100%" stopColor="rgb(var(--chart-income))" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid stroke="rgb(var(--chart-grid))" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" stroke="rgb(var(--chart-axis))" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis domain={[0, "dataMax"]} allowDecimals={false} tickCount={5} tickFormatter={formatChartValue} stroke="rgb(var(--chart-axis))" fontSize={11} tickLine={false} axisLine={false} width={52} />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(value, name) => [formatMoney(value, currency), name === "income" ? "Income" : "Expenses"]} labelFormatter={(label) => `${label} 2026`} />
              <Area type="monotone" dataKey="income" stroke="none" fill="url(#cashFlowIncome)" fillOpacity={1} isAnimationActive animationDuration={450} />
              <Line type="monotone" dataKey="income" stroke="rgb(var(--chart-income))" strokeWidth={2.5} dot={{ r: 3, fill: "rgb(var(--chart-income))", strokeWidth: 0 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="expense" stroke="rgb(var(--chart-expense))" strokeWidth={2.5} dot={{ r: 3, fill: "rgb(var(--chart-expense))", strokeWidth: 0 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Budget status" action={<Link to="/budget" className="text-xs text-gold-400 hover:text-gold-300">Manage</Link>}>
          {totalBudget ? <div className="flex h-full min-h-[286px] flex-col justify-between">
            <div><div className="mb-5 flex items-start justify-between gap-3"><div><p className="text-sm text-paper-400">Overall monthly limit</p><p className="mt-1 font-display text-2xl font-semibold text-paper-100">{formatMoney(totalBudget.limit, currency)}</p></div><span className={`rounded-md px-2 py-1 text-xs font-medium ${budgetOver ? "bg-brick-500/15 text-brick-400" : "bg-sage-500/15 text-sage-400"}`}>{budgetOver ? "Over budget" : "On track"}</span></div><div className="h-2 overflow-hidden rounded-full bg-ink-800"><div className={`h-full rounded-full ${budgetOver ? "bg-brick-500" : "bg-gold-500"}`} style={{ width: `${budgetPercent}%` }} /></div><div className="mt-2 flex justify-between text-xs text-paper-400"><span>{formatMoney(totalBudget.spent, currency)} spent</span><span>{Math.round(budgetPercent)}%</span></div></div>
            <div className="border-t border-ink-700/60 pt-4"><p className="text-xs uppercase tracking-[0.12em] text-paper-600">Remaining</p><p className={`mt-1 font-display text-xl font-semibold ${budgetOver ? "text-brick-400" : "text-sage-400"}`}>{formatMoney(Math.abs(totalBudget.limit - totalBudget.spent), currency)}</p><p className="mt-1 text-xs text-paper-400">{budgetOver ? "Amount over your limit" : "Available for the rest of the month"}</p></div>
          </div> : <EmptyBudget />}
        </Panel>
      </section>

      <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <Panel title="Recent activity" action={<Link to="/transactions" className="inline-flex items-center gap-1 text-xs text-gold-400 hover:text-gold-300">View all <ChevronRight size={14} /></Link>}>
          {recentTransactions.length === 0 ? <EmptyActivity /> : <div className="divide-y divide-ink-700/60">{recentTransactions.slice(0, 6).map((transaction) => <ActivityRow key={transaction._id} transaction={transaction} currency={currency} />)}</div>}
        </Panel>

        <Panel title="Spending mix" action={<span className="text-xs text-paper-600">{currentMonth}</span>}>
          {categoryBreakdown.length === 0 ? <p className="py-14 text-center text-sm text-paper-400">No expenses logged yet this month.</p> : <div className="flex flex-col gap-4 sm:flex-row sm:items-center xl:flex-col xl:items-stretch"><ResponsiveContainer width="100%" height={180}><PieChart><Pie data={categoryBreakdown} dataKey="value" nameKey="category" innerRadius={52} outerRadius={78} paddingAngle={3} stroke="none">{categoryBreakdown.map((item, index) => <Cell key={item.category} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}</Pie><Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(value, name) => [formatMoney(value, currency), name]} /></PieChart></ResponsiveContainer><div className="grid grid-cols-2 gap-x-4 gap-y-2">{categoryBreakdown.slice(0, 6).map((item, index) => <div key={item.category} className="flex min-w-0 items-center gap-2 text-xs"><span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} /><span className="truncate text-paper-400">{item.category}</span><span className="ml-auto text-right font-tabular text-paper-200">{formatMoney(item.value, currency)}</span></div>)}</div></div>}
        </Panel>
      </section>
    </div>
  );
}

function ChartLegend() {
  return <div className="flex items-center gap-3 text-[11px] text-paper-400"><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-gold-500" />Income</span><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-brick-500" />Expenses</span></div>;
}

function ActivityRow({ transaction, currency }) {
  const income = transaction.type === "income";
  return <div className="flex items-center gap-3 py-3"><div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${income ? "bg-sage-500/12 text-sage-400" : "bg-brick-500/12 text-brick-400"}`}>{income ? <ArrowUpRight size={17} /> : <ArrowDownRight size={17} />}</div><div className="min-w-0 flex-1"><p className="truncate text-sm text-paper-100">{transaction.category}</p><p className="truncate text-xs text-paper-400">{formatDate(transaction.date)}{transaction.notes || transaction.source ? ` · ${transaction.notes || transaction.source}` : ""}</p></div><p className={`shrink-0 font-tabular text-sm font-medium ${income ? "text-sage-400" : "text-brick-400"}`}>{income ? "+" : "−"}{formatMoney(transaction.amount, currency)}</p></div>;
}

function EmptyActivity() {
  return <div className="flex flex-col items-center justify-center py-12 text-center"><div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-ink-800 text-paper-400"><ClipboardList size={18} /></div><p className="text-sm text-paper-200">Your ledger is ready</p><p className="mt-1 max-w-xs text-xs leading-relaxed text-paper-400">Add your first income or expense to start seeing your financial rhythm.</p><Link to="/transactions" className="mt-4 inline-flex items-center gap-2 rounded-md bg-gold-500 px-3.5 py-2 text-xs font-medium text-ink-950 hover:bg-gold-400">Add a transaction <ChevronRight size={14} /></Link></div>;
}

function EmptyBudget() {
  return <div className="flex min-h-[286px] flex-col items-center justify-center text-center"><div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-gold-500/12 text-gold-400"><WalletCards size={20} /></div><p className="text-sm font-medium text-paper-200">No monthly budget yet</p><p className="mt-1 max-w-[220px] text-xs leading-relaxed text-paper-400">Set a limit to see how your spending is tracking.</p><Link to="/budget" className="mt-4 inline-flex items-center gap-2 rounded-md bg-gold-500 px-3.5 py-2 text-xs font-medium text-ink-950 hover:bg-gold-400">Create a budget <ChevronRight size={14} /></Link></div>;
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-7" aria-label="Loading dashboard" aria-busy="true">
      <div className="space-y-2">
        <div className="skeleton h-3 w-32 rounded" />
        <div className="skeleton h-9 w-64 max-w-full rounded sm:w-80" />
        <div className="skeleton h-4 w-52 max-w-full rounded sm:w-64" />
      </div>
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => <div key={item} className="skeleton h-24 rounded-lg" />)}
      </section>
      <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)]">
        <div className="skeleton h-[390px] rounded-lg" />
        <div className="skeleton h-[390px] rounded-lg" />
      </section>
      <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="skeleton h-[330px] rounded-lg" />
        <div className="skeleton h-[330px] rounded-lg" />
      </section>
    </div>
  );
}

function DashboardErrorState({ onRetry }) {
  const unavailable = "This section couldn't be loaded. Check your connection and try again.";
  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-5">
      <div className="rounded-lg border border-brick-500/40 bg-ink-900 p-5" role="alert">
        <p className="font-display text-lg text-paper-100">We couldn't load your dashboard.</p>
        <p className="mt-2 text-sm text-paper-400">Check your connection and try again.</p>
        <button onClick={onRetry} className="mt-4 rounded-md bg-gold-500 px-4 py-2 text-sm font-medium text-ink-950 hover:bg-gold-400">Try again</button>
      </div>
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {["Total balance", "Income this month", "Expenses this month", "Remaining this month"].map((label) => (
          <div key={label} className="min-w-0 rounded-lg border border-ink-700/60 bg-ink-900 p-4">
            <p className="text-xs text-paper-400">{label}</p>
            <p className="mt-3 text-xs text-brick-400">{unavailable}</p>
          </div>
        ))}
      </section>
      <section className="grid min-w-0 gap-5 xl:grid-cols-2">
        <DashboardErrorPanel title="Cash flow" message={unavailable} />
        <DashboardErrorPanel title="Recent activity" message={unavailable} />
        <DashboardErrorPanel title="Spending mix" message={unavailable} />
      </section>
    </div>
  );
}

function DashboardErrorPanel({ title, message }) {
  return (
    <div className="min-w-0 rounded-lg border border-ink-700/60 bg-ink-900">
      <h2 className="border-b border-ink-700/60 px-5 py-4 font-display text-base text-paper-100">{title}</h2>
      <p className="px-5 py-10 text-center text-sm text-brick-400" role="alert">{message}</p>
    </div>
  );
}

function formatChartValue(value) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}m`;
  if (value >= 1000) return `${Math.round(value / 1000)}k`;
  return value;
}