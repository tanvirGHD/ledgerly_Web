import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { formatMoney, formatDate } from "../lib/format";
import Panel from "../components/Panel";
import TransactionDialog from "../components/TransactionDialog";

export default function Transactions() {
  const { user } = useAuth();
  const currency = user?.currency || "BDT";

  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [searchParams] = useSearchParams();

  const [filters, setFilters] = useState({ search: searchParams.get("search") || "", type: "", category: "", from: "", to: "" });

  async function load() {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.type) params.type = filters.type;
      if (filters.category) params.category = filters.category;
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
      const res = await api.get("/transactions", { params });
      setTransactions(res.data.transactions);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data.categories));
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const totals = useMemo(() => {
    const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { income, expense, count: transactions.length };
  }, [transactions]);

  async function handleDelete() {
    try {
      await api.delete(`/transactions/${toDelete._id}`);
      toast.success("Transaction deleted");
      setToDelete(null);
      load();
    } catch {
      toast.error("Could not delete transaction");
    }
  }

  return (
    <div className="mx-auto max-w-[1280px] space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-2xl text-paper-100">Transactions</h1>
          <p className="text-sm text-paper-400">Every taka in and out, in one ledger.</p>
        </div>
        <button
          onClick={() => { setEditing(null); setDialogOpen(true); }}
          className="flex items-center gap-2 bg-gold-500 text-ink-950 px-4 py-2 rounded text-sm font-medium hover:bg-gold-400"
        >
          <Plus size={16} /> Add transaction
        </button>
      </div>

      <Panel>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div className="relative md:col-span-2 xl:col-span-2">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-paper-400" />
            <input
              placeholder="Search notes, source, category…"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              className="input pl-8"
            />
          </div>
          <select
            value={filters.type}
            onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
            className="input"
          >
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select
            value={filters.category}
            onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
            className="input"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c.name}>{c.name}</option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-2 md:col-span-2 xl:col-span-1">
            <input type="date" value={filters.from} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))} className="input" />
            <input type="date" value={filters.to} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))} className="input" />
          </div>
        </div>
      </Panel>

      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <p className="text-paper-400">Entries: <span className="font-tabular text-paper-200">{totals.count}</span></p>
        <p className="text-paper-400">Filtered income: <span className="text-sage-400 font-tabular">{formatMoney(totals.income, currency)}</span></p>
        <p className="text-paper-400">Filtered expense: <span className="text-brick-400 font-tabular">{formatMoney(totals.expense, currency)}</span></p>
      </div>

      <Panel>
        {loading ? (
          <p className="text-sm text-paper-400 py-8 text-center">Loading transactions…</p>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-paper-400 py-8 text-center">No transactions match these filters yet.</p>
        ) : (
          <div className="divide-y divide-ink-700/60">
            {transactions.map((t) => (
              <div key={t._id} className="interactive-row group flex flex-col gap-3 rounded-md py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-paper-100">{t.category} <span className="text-xs text-paper-600">· {t.paymentMethod.replace("_", " ")}</span></p>
                  <p className="text-xs text-paper-400 truncate">{formatDate(t.date)} {t.notes && `· ${t.notes}`} {t.source && `· ${t.source}`}</p>
                </div>
                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <p className={`font-tabular ${t.type === "income" ? "text-sage-400" : "text-brick-400"}`}>
                    {t.type === "income" ? "+" : "−"}{formatMoney(t.amount, currency)}
                  </p>
                  <div className="flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                    <button aria-label={`Edit ${t.category} transaction`} onClick={() => { setEditing(t); setDialogOpen(true); }} className="rounded p-1.5 text-paper-400 hover:bg-ink-800">
                      <Pencil size={14} />
                    </button>
                    <button aria-label={`Delete ${t.category} transaction`} onClick={() => setToDelete(t)} className="rounded p-1.5 text-brick-400 hover:bg-ink-800">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <TransactionDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={load}
        categories={categories}
        existing={editing}
      />

      {toDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="w-full max-w-sm bg-ink-900 border border-ink-700/60 rounded p-5">
            <h3 className="font-display text-lg mb-2">Delete transaction?</h3>
            <p className="text-sm text-paper-400 mb-5">This can't be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setToDelete(null)} className="flex-1 border border-ink-700/60 rounded py-2 text-sm">Cancel</button>
              <button onClick={handleDelete} className="flex-1 bg-brick-500 rounded py-2 text-sm text-paper-100">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
