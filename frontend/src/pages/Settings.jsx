import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { CURRENCIES } from "../lib/format";
import Panel from "../components/Panel";

export default function Settings() {
  const { user, setUser } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [currency, setCurrency] = useState(user?.currency || "BDT");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState({ name: "", type: "expense" });

  async function loadCategories() {
    const res = await api.get("/categories");
    setCategories(res.data.categories);
  }

  useEffect(() => { loadCategories().catch(() => {}); }, []);

  async function addCategory(e) {
    e.preventDefault();
    if (!category.name.trim()) return;
    try {
      await api.post("/categories", { ...category, name: category.name.trim() });
      setCategory({ name: "", type: "expense" });
      loadCategories();
      toast.success("Category added");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not add category");
    }
  }

  async function deleteCategory(id) {
    try {
      await api.delete(`/categories/${id}`);
      loadCategories();
      toast.success("Category removed");
    } catch { toast.error("Default categories cannot be removed"); }
  }

  async function saveProfile(e) {
    e.preventDefault();
    try {
      const res = await api.patch("/auth/me", { displayName, currency });
      setUser(res.data.user);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update profile");
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    try {
      await api.post("/auth/change-password", { currentPassword, newPassword });
      toast.success("Password updated");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update password");
    }
  }

  return (
    <div className="mx-auto max-w-[1280px] space-y-6">
      <div>
        <h1 className="font-display text-2xl text-paper-100">Settings</h1>
        <p className="text-sm text-paper-400">Update your profile, currency and password.</p>
      </div>

      <Panel title="Profile">
        <form onSubmit={saveProfile} className="space-y-4">
          <label className="block text-sm">
            <span className="text-xs text-paper-400 block mb-1">Display name</span>
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="input" />
          </label>
          <label className="block text-sm">
            <span className="text-xs text-paper-400 block mb-1">Currency</span>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="input">
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <button className="bg-gold-500 text-ink-950 rounded px-4 py-2 text-sm font-medium hover:bg-gold-400">
            Save profile
          </button>
        </form>
      </Panel>

      <Panel title="Password">
        <form onSubmit={changePassword} className="space-y-4">
          <label className="block text-sm">
            <span className="text-xs text-paper-400 block mb-1">Current password</span>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="input" />
          </label>
          <label className="block text-sm">
            <span className="text-xs text-paper-400 block mb-1">New password</span>
            <input type="password" minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input" />
          </label>
          <button className="bg-gold-500 text-ink-950 rounded px-4 py-2 text-sm font-medium hover:bg-gold-400">
            Update password
          </button>
        </form>
      </Panel>

      <Panel title="Categories">
        <form onSubmit={addCategory} className="flex flex-col gap-2 sm:flex-row">
          <input value={category.name} onChange={(e) => setCategory((value) => ({ ...value, name: e.target.value }))} className="input flex-1" placeholder="New category" />
          <select value={category.type} onChange={(e) => setCategory((value) => ({ ...value, type: e.target.value }))} className="input sm:w-36"><option value="expense">Expense</option><option value="income">Income</option></select>
          <button className="rounded-lg bg-gold-500 px-4 py-2 text-sm font-medium text-ink-950">Add</button>
        </form>
        <div className="mt-4 flex flex-wrap gap-2">{categories.map((item) => <span key={item._id} className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${item.type === "income" ? "border-sage-500/25 bg-sage-500/12 text-sage-400" : "border-brick-500/20 bg-brick-500/10 text-paper-400"}`}><span>{item.name}</span>{!item.isDefault && <button onClick={() => deleteCategory(item._id)} className="text-brick-400" title={`Remove ${item.name}`}><Trash2 size={12} /></button>}</span>)}</div>
      </Panel>
    </div>
  );
}
