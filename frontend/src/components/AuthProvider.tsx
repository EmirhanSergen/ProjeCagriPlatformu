import React, { createContext, useContext, useState } from 'react'
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
  const [token, setToken] = useState<string | null>(() => getToken())
  const [role, setRole] = useState<Role | null>(() => {
    const r = localStorage.getItem('role')
    return r as Role | null
  })

  const login = (tok: string, r: Role) => {
    storeToken(tok);
    localStorage.setItem('role', r);
    setToken(tok);
    setRole(r);
  };

  const logout = () => {
    apiLogout(); // This internally calls clearAllTokens
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
