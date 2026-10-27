import { Link, Navigate } from "react-router-dom";
import { ArrowRight, BarChart3, CheckCircle2, PiggyBank, ShieldCheck, TrendingUp, WalletCards } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const FEATURES = [
  { title: "Smart spending overview", body: "See where your money is moving without digging through receipts or spreadsheets.", icon: TrendingUp },
  { title: "Monthly budget control", body: "Set realistic limits, spot overspending early, and keep every category aligned.", icon: PiggyBank },
  { title: "Live financial insight", body: "Turn transactions into trend lines, summaries, and actionable decisions.", icon: BarChart3 },
];

const HIGHLIGHTS = [
  "Private account-by-account tracking",
  "Budget milestones and progress checks",
  "Clean reporting for income, savings, and expenses",
];

export default function Landing() {
  const { user, loading } = useAuth();
  if (!loading && user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen overflow-hidden text-paper-200">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 font-display text-xl text-paper-100">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-500 to-sage-500 text-ink-950 shadow-lg shadow-gold-500/20">
            <WalletCards size={18} />
          </span>
          Ledgerly
        </Link>

        <div className="flex items-center gap-3 sm:gap-6">
          <Link to="/auth" className="text-sm font-medium text-paper-300 transition hover:text-gold-400">Sign in</Link>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-4 py-2.5 text-sm font-semibold text-ink-950 shadow-lg shadow-gold-500/20 transition hover:-translate-y-0.5 hover:bg-gold-400"
          >
            Get started
            <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pb-16 lg:pt-12">
          <div className="rounded-[32px] border border-ink-700/60 bg-ink-900/75 p-5 shadow-[0_30px_80px_rgba(4,13,10,0.35)] backdrop-blur-sm sm:p-8 lg:p-10">
            <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-gold-400">
                  Personal finance, rethought
                </div>

                <h1 className="max-w-xl font-display text-4xl leading-none text-paper-100 sm:text-5xl lg:text-6xl">
                  Clarity for your cash,
                  <span className="mt-2 block text-gold-500">without the overwhelm.</span>
                </h1>

                <p className="mt-5 max-w-xl text-base leading-7 text-paper-400 sm:text-lg">
                  See every paycheck, payment, and recurring cost in one organized place. Ledgerly gives you a calmer way to plan spending, save intentionally, and understand where your money actually goes.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/auth"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-gold-500 px-5 py-3.5 text-sm font-semibold text-ink-950 shadow-lg shadow-gold-500/20 transition hover:-translate-y-0.5 hover:bg-gold-400"
                  >
                    Start managing money
                    <ArrowRight size={17} />
                  </Link>
                  <Link
                    to="/auth"
                    className="inline-flex items-center justify-center rounded-full border border-ink-700 bg-ink-950/60 px-5 py-3.5 text-sm font-semibold text-paper-200 transition hover:border-gold-500/40 hover:text-gold-400"
                  >
                    Sign in
                  </Link>
                </div>

                <div className="mt-6 flex flex-wrap gap-3 text-sm text-paper-500">
                  {HIGHLIGHTS.map((item) => (
                    <div key={item} className="flex items-center gap-2 rounded-full border border-ink-700 bg-ink-950/60 px-3 py-1.5">
                      <CheckCircle2 size={14} className="text-gold-500" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="relative rounded-[28px] border border-ink-700 bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950 p-4 shadow-2xl shadow-black/25">
                  <div className="mb-4 flex items-center justify-between rounded-2xl border border-ink-700 bg-ink-950/60 px-3 py-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-paper-600">Balance</p>
                      <p className="mt-1 font-display text-3xl text-paper-100">$24,850</p>
                    </div>
                    <div className="rounded-xl bg-gold-500/10 p-2 text-gold-500">
                      <TrendingUp size={18} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { label: "Income", value: "$6,300", tone: "text-gold-400" },
                      { label: "Expenses", value: "$3,780", tone: "text-brick-400" },
                      { label: "Investments", value: "$1,950", tone: "text-sage-400" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between rounded-2xl border border-ink-700/80 bg-ink-950/60 px-3 py-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.16em] text-paper-600">{item.label}</p>
                          <p className={`mt-1 font-display text-xl ${item.tone}`}>{item.value}</p>
                        </div>
                        <div className="h-10 w-20 rounded-full bg-gradient-to-r from-gold-500/20 to-sage-500/20" />
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-2xl border border-ink-700 bg-ink-950/60 p-3">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-medium text-paper-200">Monthly overview</p>
                      <ShieldCheck size={16} className="text-gold-500" />
                    </div>
                    <div className="flex items-end gap-2">
                      {[24, 38, 52, 46, 66, 58, 76].map((height, idx) => (
                        <div key={height} className="flex-1 rounded-t-xl bg-gradient-to-t from-gold-600 to-gold-400/80" style={{ height: `${height}px`, opacity: idx % 2 === 0 ? 0.9 : 0.7 }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-18 sm:px-6 lg:px-8 lg:pb-24">
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-500">Everything in one place</p>
            <h2 className="mt-3 font-display text-3xl text-paper-100 sm:text-4xl">A calmer way to manage your money.</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {FEATURES.map(({ title, body, icon: Icon }, index) => (
              <div
                key={title}
                className="page-enter rounded-[24px] border border-ink-700/70 bg-ink-900/70 p-5 shadow-[0_16px_44px_rgba(4,13,10,0.12)]"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500/10 text-gold-500">
                  <Icon size={22} />
                </div>
                <h3 className="font-display text-xl text-paper-100">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-paper-400">{body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="pb-10 text-center text-sm text-paper-600">
        Built for everyday money decisions.
      </footer>
    </div>
  );
}