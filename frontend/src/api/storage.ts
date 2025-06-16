/**
 * Token ve role saklama/okuma/temizleme işlemleri
 */
export function storeToken(token: string): void {
  localStorage.setItem('token', token)
}

export function getToken(): string | null {
  return localStorage.getItem('token')
}

export function storeRole(role: string): void {
  localStorage.setItem('role', role)
}

export function getRole(): string | null {
  return localStorage.getItem('role')
}

export function clearAllTokens(): void {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
}
