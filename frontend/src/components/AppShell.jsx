import { useEffect, useState } from "react";
import { NavLink, Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeftRight, BarChart3, ChevronLeft, ChevronRight, LayoutGrid, LogOut, Menu, Moon, PiggyBank, Search, Settings as SettingsIcon, Sun, UserRound, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/budget", label: "Budget", icon: PiggyBank },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export default function AppShell() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [light, setLight] = useState(() => localStorage.getItem("ledgerly_theme") === "light");

  useEffect(() => {
    const theme = light ? "light" : "dark";
    localStorage.setItem("ledgerly_theme", theme);
    document.documentElement.dataset.theme = theme;
  }, [light]);

  useEffect(() => setDrawerOpen(false), [location.pathname]);

  function toggleTheme() {
    const nextTheme = light ? "dark" : "light";
    setLight(nextTheme === "light");
    localStorage.setItem("ledgerly_theme", nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  }

  const navigation = (mobile = false) => (
    <nav className="flex flex-1 flex-col gap-1 px-2 py-4">
      {NAV.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl border-l-4 px-3 py-2.5 text-sm transition-colors ${
              isActive
                ? "border-gold-500 bg-gold-500/12 font-medium text-gold-400 shadow-[inset_0_0_18px_rgb(var(--gold-500)/0.04)]"
                : "border-transparent text-paper-400 hover:bg-ink-800/70 hover:text-paper-100"
            }`
          }
        >
          <Icon size={18} />
          {(!collapsed || mobile) && <span>{label}</span>}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-ink-950 text-paper-200">
      <aside className={`${collapsed ? "w-[72px]" : "w-60"} hidden shrink-0 flex-col border-r border-ink-700/60 bg-ink-950/80 transition-all duration-200 md:flex`}>
        <div className="flex h-16 items-center border-b border-ink-700/60 px-4">
          <Link to="/dashboard" className="font-display text-xl text-gold-500">{collapsed ? "L" : "Ledgerly"}</Link>
        </div>
        {navigation()}
        <button
          onClick={() => setCollapsed((value) => !value)}
          className="m-2 flex items-center justify-center gap-2 rounded-xl border border-ink-700/60 bg-ink-900/60 py-2 text-xs text-paper-400 transition hover:bg-ink-800 hover:text-paper-100"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
        >
          {collapsed ? <ChevronRight size={14} /> : <><ChevronLeft size={14} /> Collapse</>}
        </button>
        <p className="px-4 pb-4 text-[10px] uppercase tracking-[0.18em] text-paper-600">Ledgerly</p>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className={`sticky top-0 z-30 flex h-16 items-center justify-between border-b border-ink-700/60 bg-ink-950/85 px-4 backdrop-blur-md transition-shadow sm:px-6 ${
            scrolled ? "shadow-[0_8px_20px_rgba(0,0,0,0.12)]" : ""
          }`}
        >
          <button onClick={() => setDrawerOpen(true)} className="rounded-xl p-2 text-paper-400 transition hover:bg-ink-800 hover:text-paper-100 md:hidden" aria-label="Open navigation" aria-expanded={drawerOpen} aria-controls="mobile-navigation">
            <Menu size={20} />
          </button>

          <div className="hidden font-display text-lg text-paper-100 md:block">
            {NAV.find((item) => location.pathname.startsWith(item.to))?.label || "Ledgerly"}
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-4">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                navigate(`/transactions?search=${encodeURIComponent(event.currentTarget.elements.search.value)}`);
              }}
              className="relative hidden lg:block"
            >
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-paper-600" />
              <input
                name="search"
                aria-label="Search transactions"
                placeholder="Search transactions"
                className="h-9 w-56 rounded-xl border border-ink-700/70 bg-ink-900 pl-9 pr-3 text-xs text-paper-200 outline-none transition-colors focus:border-gold-500"
              />
            </form>

            <button
              onClick={toggleTheme}
              className="rounded-xl p-2 text-paper-400 transition hover:bg-ink-800 hover:text-paper-100"
              title="Toggle theme"
              aria-label={`Switch to ${light ? "dark" : "light"} theme`}
            >
              {light ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            <div className="relative">
              <button onClick={() => setMenuOpen((value) => !value)} className="flex items-center gap-2 rounded-xl p-1.5 text-sm transition hover:bg-ink-800" aria-expanded={menuOpen}>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-500/15 font-display text-gold-400">
                  {(user?.displayName || "?")[0]?.toUpperCase()}
                </div>
                <span className="hidden text-paper-200 sm:inline">{user?.displayName}</span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-12 z-50 w-48 rounded-2xl border border-ink-700/70 bg-ink-900 p-1.5 shadow-2xl">
                  <div className="border-b border-ink-700/60 px-3 py-2">
                    <p className="truncate text-sm font-medium text-paper-100">{user?.displayName}</p>
                    <p className="truncate text-xs text-paper-400">{user?.email}</p>
                  </div>
                  <Link to="/settings" onClick={() => setMenuOpen(false)} className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-paper-400 transition hover:bg-ink-800 hover:text-paper-100">
                    <UserRound size={15} /> Settings
                  </Link>
                  <button onClick={signOut} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-brick-400 transition hover:bg-ink-800">
                    <LogOut size={15} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main onScroll={(event) => setScrolled(event.currentTarget.scrollTop > 4)} className="flex-1 overflow-y-auto px-4 py-5 pb-24 sm:px-6 md:pb-6 lg:px-8">
          <div className="page-enter"><Outlet /></div>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t border-ink-700/60 bg-ink-900/95 px-1 py-2 backdrop-blur md:hidden">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `flex min-w-0 flex-col items-center gap-1 px-1 py-1 text-[10px] ${isActive ? "text-gold-500" : "text-paper-400"}`}>
            <Icon size={18} />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </nav>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button className="absolute inset-0 bg-black/60" onClick={() => setDrawerOpen(false)} aria-label="Close navigation" />
          <aside id="mobile-navigation" className="relative flex h-full w-72 max-w-[85vw] flex-col border-r border-ink-700/60 bg-ink-900 shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-ink-700/60 px-4">
              <span className="font-display text-xl text-gold-500">Ledgerly</span>
              <button onClick={() => setDrawerOpen(false)} className="rounded-xl p-2 text-paper-400 transition hover:bg-ink-800" aria-label="Close navigation">
                <X size={20} />
              </button>
            </div>
            {navigation(true)}
          </aside>
        </div>
      )}
    </div>
  );
}