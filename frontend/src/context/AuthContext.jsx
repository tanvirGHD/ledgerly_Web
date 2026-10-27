import { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthToken = params.get("token");
    if (oauthToken) {
      localStorage.setItem("ledgerly_token", oauthToken);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    const token = oauthToken || localStorage.getItem("ledgerly_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem("ledgerly_token"))
      .finally(() => setLoading(false));
  }, []);

  async function signIn(email, password) {
    const res = await api.post("/auth/signin", { email, password });
    localStorage.setItem("ledgerly_token", res.data.token);
    setUser(res.data.user);
  }

  async function signUp(displayName, email, password) {
    const res = await api.post("/auth/signup", { displayName, email, password });
    localStorage.setItem("ledgerly_token", res.data.token);
    setUser(res.data.user);
  }

  function signOut() {
    localStorage.removeItem("ledgerly_token");
    setUser(null);
  }

  function signInWithGoogle() {
    window.location.href = "/api/auth/google";
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
