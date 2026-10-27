import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppShell from "./components/AppShell";

import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Salary from "./pages/Salary";
import Budget from "./pages/Budget";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";

function RouteMeta() {
  const location = useLocation();
  useEffect(() => {
    const labels = { "/": "Personal Finance", "/auth": "Sign in", "/dashboard": "Dashboard", "/transactions": "Transactions", "/salary": "Salary", "/budget": "Budget", "/reports": "Reports", "/settings": "Settings" };
    document.title = `${labels[location.pathname] || "Not found"} | Ledgerly`;
    const description = document.querySelector('meta[name="description"]') || document.createElement("meta");
    description.name = "description";
    description.content = "Ledgerly is a modern salary, expense, budget, and reporting workspace.";
    if (!description.parentNode) document.head.appendChild(description);
  }, [location.pathname]);
  return null;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <RouteMeta />
          <Toaster theme="dark" position="top-right" richColors />
          <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />

          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/salary" element={<Salary />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
