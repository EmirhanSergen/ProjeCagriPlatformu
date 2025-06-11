import React, { createContext, useContext, useEffect, useState } from 'react'
import { getToken, logout as apiLogout, storeToken } from '../api'
import type { Role } from './RoleSlider';

interface AuthContextType {
  token: string | null;
  role: Role | null;
  login: (token: string, role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [role, setRole] = useState<Role | null>(null)

  // Restore auth state from localStorage. Navigation after login
  // is handled in LoginPage via the onSuccess callback.
  useEffect(() => {
    const t = getToken();
    const r = localStorage.getItem('role') as Role | null;
    if (t) setToken(t);
    if (r) setRole(r);
  }, []);

  const login = (tok: string, r: Role) => {
    storeToken(tok);
    localStorage.setItem('role', r);
    setToken(tok);
    setRole(r);
  };

  const logout = () => {
    apiLogout();
    localStorage.removeItem('role');
    setToken(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
