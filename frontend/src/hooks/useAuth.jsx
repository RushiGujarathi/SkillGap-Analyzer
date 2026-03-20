import { createContext, useContext, useState } from "react";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("oae_user")); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem("oae_token"));

  const login = (userData, tok) => {
    setUser(userData); setToken(tok);
    localStorage.setItem("oae_user", JSON.stringify(userData));
    localStorage.setItem("oae_token", tok);
  };

  const logout = () => {
    setUser(null); setToken(null);
    localStorage.removeItem("oae_user"); localStorage.removeItem("oae_token");
  };

  return <AuthCtx.Provider value={{ user, token, login, logout }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
