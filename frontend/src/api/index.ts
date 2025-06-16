export * from './config'
export * from './storage'
export * from './auth'
export * from './application'
export * from './call'
export * from './document'
export * from './review'
import { API_BASE } from './config'
import { authHeaders } from './auth'

export async function acceptReviewerInvite(code: string): Promise<void> {
  const res = await fetch(`${API_BASE}/reviewer/invites/accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ code }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => null)
    throw new Error(err?.detail || 'Failed to accept invite')
  }
}
