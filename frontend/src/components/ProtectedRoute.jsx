import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-ink-950 text-paper-400 font-display italic">
        Opening the ledger…
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  return children;
}
