import { useEffect, useState } from "react";
import { Plus, Trash2, CircleCheck, Pencil } from "lucide-react";
import { toast } from "sonner";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { formatMoney, formatDate } from "../lib/format";
import Panel from "../components/Panel";

export default function Salary() {
  const { user } = useAuth();
  const currency = user?.currency || "BDT";
  const [salaries, setSalaries] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank());

  function blank() {
    return { source: "", gross: "", bonus: "", deductions: "", net: "", effectiveFrom: new Date().toISOString().slice(0, 10), notes: "" };
  }

  async function load() {
    const [sRes, dRes] = await Promise.all([api.get("/salaries"), api.get("/reports/dashboard")]);
    setSalaries(sRes.data.salaries);
    setDashboard(dRes.data);
  }

  useEffect(() => { load(); }, []);

  const active = salaries.find((s) => {
    const now = new Date();
    return new Date(s.effectiveFrom) <= now && (!s.effectiveTo || new Date(s.effectiveTo) >= now);
  });

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editing) await api.put(`/salaries/${editing._id}`, form);
      else await api.post("/salaries", form);
      toast.success(editing ? "Salary updated" : "Salary added");
      setForm(blank());
      setEditing(null);
      setFormOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not add salary");
    }
  }

  async function handleDelete(id) {
    await api.delete(`/salaries/${id}`);
    toast.success("Deleted");
    load();
  }

  async function handlePost(id) {
    try {
      await api.post(`/salaries/${id}/post-to-month`);
      toast.success("Posted this month's salary as income");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not post salary");
    }
  }

  return (
    <div className="mx-auto max-w-[1280px] space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-paper-100">Salary</h1>
          <p className="text-sm text-paper-400">Keep your salary history and post it into the month.</p>
        </div>
        <button
          onClick={() => { setEditing(null); setForm(blank()); setFormOpen((v) => !v); }}
          className="flex items-center gap-2 bg-gold-500 text-ink-950 px-4 py-2 rounded text-sm font-medium hover:bg-gold-400"
        >
          <Plus size={16} /> Add salary
        </button>
      </div>

      {active && dashboard && (
        <Panel title="Current salary">
          <div className="grid sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-xs text-paper-400 mb-1">Source</p>
              <p className="text-paper-100">{active.source}</p>
            </div>
            <div>
              <p className="text-xs text-paper-400 mb-1">Net / month</p>
              <p className="font-tabular text-gold-400">{formatMoney(active.net, currency)}</p>
            </div>
            <div>
              <p className="text-xs text-paper-400 mb-1">This month's income</p>
              <p className="font-tabular text-sage-400">{formatMoney(dashboard.kpis.monthIncome, currency)}</p>
            </div>
            <div>
              <p className="text-xs text-paper-400 mb-1">Remaining</p>
              <p className="font-tabular">{formatMoney(dashboard.kpis.monthRemaining, currency)}</p>
            </div>
          </div>
          <button
            onClick={() => handlePost(active._id)}
            className="mt-4 flex items-center gap-2 text-sm text-gold-400 hover:text-gold-300"
          >
            <CircleCheck size={16} /> Add to this month
          </button>
        </Panel>
      )}

      {formOpen && (
        <Panel title={editing ? "Edit salary entry" : "New salary entry"}>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-3 gap-4">
            <Field label="Source">
              <input value={form.source} onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))} className="input" required />
            </Field>
            <Field label="Gross">
              <input type="number" value={form.gross} onChange={(e) => setForm((f) => ({ ...f, gross: e.target.value }))} className="input" required />
            </Field>
            <Field label="Bonus">
              <input type="number" value={form.bonus} onChange={(e) => setForm((f) => ({ ...f, bonus: e.target.value }))} className="input" />
            </Field>
            <Field label="Deductions">
              <input type="number" value={form.deductions} onChange={(e) => setForm((f) => ({ ...f, deductions: e.target.value }))} className="input" />
            </Field>
            <Field label="Net">
              <input type="number" value={form.net} onChange={(e) => setForm((f) => ({ ...f, net: e.target.value }))} className="input" required />
            </Field>
            <Field label="Effective from">
              <input type="date" value={form.effectiveFrom} onChange={(e) => setForm((f) => ({ ...f, effectiveFrom: e.target.value }))} className="input" required />
            </Field>
            <div className="sm:col-span-3">
              <Field label="Notes (optional)">
                <input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} className="input" />
              </Field>
            </div>
            <button className="sm:col-span-3 bg-gold-500 text-ink-950 rounded py-2 text-sm font-medium hover:bg-gold-400">
              Save salary
            </button>
          </form>
        </Panel>
      )}

      <Panel title="Salary history">
        {salaries.length === 0 ? (
          <p className="text-sm text-paper-400 py-8 text-center">No salary entries yet.</p>
        ) : (
          <div className="divide-y divide-ink-700/60">
            {salaries.map((s) => (
              <div key={s._id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="text-paper-100">{s.source}</p>
                  <p className="text-xs text-paper-400">
                    {formatDate(s.effectiveFrom)} — {s.effectiveTo ? formatDate(s.effectiveTo) : "ongoing"}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-tabular text-gold-400">{formatMoney(s.net, currency)}</p>
                  <button onClick={() => { setEditing(s); setForm({ source: s.source, gross: s.gross, bonus: s.bonus, deductions: s.deductions, net: s.net, effectiveFrom: new Date(s.effectiveFrom).toISOString().slice(0, 10), notes: s.notes || "" }); setFormOpen(true); }} className="rounded p-1.5 text-paper-400 hover:bg-ink-800 hover:text-paper-100" title="Edit salary"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(s._id)} className="p-1.5 rounded hover:bg-ink-800 text-brick-400">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block text-sm">
      <span className="text-xs text-paper-400 block mb-1">{label}</span>
      {children}
    </label>
  );
}
