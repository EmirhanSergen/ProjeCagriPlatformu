const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export interface RegisterData {
  email: string;
  password: string;
  role: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export async function registerUser(data: RegisterData) {
  const res = await fetch(`${API_BASE}/users/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error('Failed to register');
  }
  return res.json();
}

export async function login(data: LoginData) {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error('Failed to login');
  }
  return res.json();
}

export function storeToken(token: string) {
  localStorage.setItem('token', token);
}

export function getToken() {
  return localStorage.getItem('token');
}

export interface Call {
  id: number;
  title: string;
  description?: string;
  is_open: boolean;
}

export async function fetchCalls(onlyOpen = false): Promise<Call[]> {
  const url = new URL(`${API_BASE}/calls/`);
  if (onlyOpen) url.searchParams.set('only_open', 'true');
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch calls');
  }
  return res.json();
}
