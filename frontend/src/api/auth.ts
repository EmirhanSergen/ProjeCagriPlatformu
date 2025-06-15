import { getToken, storeToken, clearAllTokens, storeRole } from './storage'
import { API_BASE } from './config'

export interface RegisterData {
  email: string
  password: string
  role: string
  first_name?: string
  last_name?: string
  organization?: string
}

export interface LoginData {
  email: string
  password: string
  role: string
}

interface AuthResponse {
  access_token: string
}

export function authHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function registerUser(data: RegisterData) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || 'Failed to register')
  }
  return res.json()
}

export async function login(data: LoginData) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || 'Failed to login')
  }
  const result: AuthResponse = await res.json()
  storeToken(result.access_token)
  storeRole(data.role)
  return result
}

export function logout() {
  clearAllTokens()
}

export async function verifyEmail(token: string) {
  const res = await fetch(`${API_BASE}/users/verify/${token}`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed to verify email')
}

export async function requestPasswordReset(email: string) {
  const res = await fetch(`${API_BASE}/users/password-reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  if (!res.ok) throw new Error('Failed to request password reset')
}

export async function confirmPasswordReset(token: string, newPassword: string) {
  const res = await fetch(`${API_BASE}/users/password-reset/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, new_password: newPassword }),
  })
  if (!res.ok) throw new Error('Failed to reset password')
}
