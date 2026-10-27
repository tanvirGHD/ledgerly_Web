import { useEffect, useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Eye, EyeOff, LockKeyhole, Mail, Sparkles } from "lucide-react";
import api from "../lib/api";

export default function Auth() {
  const [mode, setMode] = useState("signin");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const { user, loading, signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const existing = document.querySelector('meta[name="robots"]');
    const meta = existing || document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    if (!existing) document.head.appendChild(meta);
    return () => {
      if (!existing) meta.remove();
    };
  }, []);

  useEffect(() => {
    const oauthError = new URLSearchParams(window.location.search).get("oauth");
    if (oauthError) {
      toast.error(oauthError === "unavailable" ? "Google sign-in is not configured yet" : "Google sign-in could not be completed");
      window.history.replaceState({}, document.title, "/auth");
    }
  }, []);

  if (!loading && user) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        await signIn(email, password);
        toast.success("Welcome back");
        navigate("/dashboard");
      } else if (mode === "signup") {
        if (!displayName.trim()) throw new Error("Please enter your name");
        await signUp(displayName, email, password);
        toast.success("Account created");
        navigate("/dashboard");
      } else if (mode === "forgot") {
        const res = await api.post("/auth/forgot-password", { email });
        if (res.data.resetToken) {
          setResetToken(res.data.resetToken);
          setMode("reset");
        } else {
          setMode("signin");
        }
        toast.success("Check your reset instructions");
      } else {
        if (password !== confirmPassword) throw new Error("Passwords do not match");
        await api.post("/auth/reset-password", { token: resetToken, newPassword: password });
        toast.success("Password reset. You can sign in now.");
        setPassword("");
        setConfirmPassword("");
        setMode("signin");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen px-4 py-6 text-paper-200 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(420px,520px)] lg:gap-10 lg:px-8">
      <div className="hidden flex-col justify-between py-8 lg:flex">
        <Link to="/" className="flex items-center gap-3 font-display text-2xl text-gold-500">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-500 to-sage-500 text-ink-950 shadow-lg shadow-gold-500/20">
            <Sparkles size={18} />
          </span>
          Ledgerly
        </Link>

        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-500">Financial clarity</p>
          <h1 className="mt-5 font-display text-5xl leading-[0.98] text-paper-100 xl:text-6xl">
            A better relationship with money.
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-paper-400">
            Track spending, set goals, monitor salary flow, and keep your habits intentional with a cleaner financial system.
          </p>
        </div>

        <div className="grid max-w-lg gap-3 text-sm text-paper-400">
          {[
            "Track expenses with context, not confusion.",
            "Build monthly budgets that actually fit your life.",
            "Review your finances in one place, from any device.",
          ].map((point) => (
            <div key={point} className="flex items-start gap-3 rounded-2xl border border-ink-700/70 bg-ink-900/60 p-3.5">
              <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-gold-500/15 text-gold-500">✓</span>
              <span>{point}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-md flex-col justify-center py-10 lg:max-w-none">
        <div className="mb-7 flex items-center justify-between lg:hidden">
          <Link to="/" className="flex items-center gap-2 font-display text-2xl text-gold-500">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-gold-500 to-sage-500 text-ink-950">
              <Sparkles size={16} />
            </span>
            Ledgerly
          </Link>
          <Link to="/" className="text-sm text-paper-400 transition hover:text-gold-400">Back home</Link>
        </div>

        <div className="rounded-[28px] border border-ink-700/70 bg-ink-900/80 p-5 shadow-[0_30px_70px_rgba(4,13,10,0.28)] backdrop-blur-sm sm:p-7">
          {mode === "signin" || mode === "signup" ? (
            <div className="mb-7 flex border-b border-ink-700/60">
              {["signin", "signup"].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 pb-3 text-sm font-semibold transition-colors ${
                    mode === m ? "border-b-2 border-gold-500 text-gold-500" : "text-paper-400"
                  }`}
                >
                  {m === "signin" ? "Sign in" : "Create account"}
                </button>
              ))}
            </div>
          ) : (
            <button onClick={() => setMode("signin")} className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-paper-400 transition hover:text-gold-400">
              <ArrowLeft size={16} /> Back to sign in
            </button>
          )}

          <div className="mb-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500/10 text-gold-500">
              {mode === "forgot" ? <Mail size={20} /> : <LockKeyhole size={20} />}
            </div>
            <h1 className="font-display text-3xl text-paper-100">
              {mode === "signin" && "Welcome back"}
              {mode === "signup" && "Create your account"}
              {mode === "forgot" && "Reset your password"}
              {mode === "reset" && "Choose a new password"}
            </h1>
            <p className="mt-2 text-sm leading-6 text-paper-400">
              {mode === "signin" && "Sign in to keep your ledger moving."}
              {mode === "signup" && "Start making sense of your money today."}
              {mode === "forgot" && "Enter your email and we will send reset instructions."}
              {mode === "reset" && "Your reset link is ready. Set a secure new password below."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <label className="block text-sm">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.14em] text-paper-500">Display name</span>
                <input required value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="input" placeholder="Your name" />
              </label>
            )}

            {mode !== "reset" && (
              <label className="block text-sm">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.14em] text-paper-500">Email</span>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@example.com" />
              </label>
            )}

            {mode === "reset" && !resetToken && (
              <p className="rounded-xl border border-gold-500/20 bg-gold-500/10 p-3 text-sm text-gold-400">
                Your reset session is missing. Request a new link to continue.
              </p>
            )}

            {(mode === "signin" || mode === "signup" || mode === "reset") && (
              <label className="block text-sm">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.14em] text-paper-500">{mode === "reset" ? "New password" : "Password"}</span>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="input pr-11" placeholder="At least 6 characters" />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-paper-400 transition hover:text-paper-100" aria-label="Toggle password visibility">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>
            )}

            {mode === "reset" && (
              <label className="block text-sm">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.14em] text-paper-500">Confirm password</span>
                <input type="password" required minLength={6} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input" placeholder="Repeat your new password" />
              </label>
            )}

            <button
              disabled={busy || (mode === "reset" && !resetToken)}
              className="w-full rounded-full bg-gold-500 py-3 text-sm font-semibold text-ink-950 shadow-lg shadow-gold-500/20 transition hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "Please wait..." : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset link" : "Reset password"}
            </button>
          </form>

          {mode === "signin" && (
            <>
              <div className="my-5 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.2em] text-paper-600">
                <span className="h-px flex-1 bg-ink-700" />
                Or
                <span className="h-px flex-1 bg-ink-700" />
              </div>

              <button
                type="button"
                onClick={signInWithGoogle}
                className="flex w-full items-center justify-center gap-3 rounded-full border border-ink-700 bg-ink-950/60 py-3 text-sm font-semibold text-paper-100 transition hover:border-gold-500/40 hover:bg-ink-800"
              >
                <span className="font-black text-[#EA4335]">G</span>
                Continue with Google
              </button>
            </>
          )}

          {mode === "signin" && (
            <button onClick={() => setMode("forgot")} className="mt-5 block w-full text-center text-sm text-paper-400 transition hover:text-gold-400">
              Forgot password?
            </button>
          )}

          {mode === "forgot" && resetToken && <p className="mt-4 text-xs text-paper-400">Reset access was created for this account. Continue below to choose a new password.</p>}
        </div>

        <p className="mt-6 text-center text-xs text-paper-600">Your financial data stays scoped to your Ledgerly account.</p>
      </div>
    </div>
  );
}
