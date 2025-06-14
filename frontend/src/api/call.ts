import { authHeaders } from './auth'
import { API_BASE } from './config'

export interface Call { id: number; title: string; description?: string; is_open: boolean; start_date?: string; end_date?: string; category?: string; max_applications?: number; updated_at?: string }
export interface CallInput { title?: string; description?: string|null; is_open?: boolean; start_date?: string|null; end_date?: string|null; category?: string|null; max_applications?: number|null; status?: string }

export async function fetchCalls(onlyOpen = false): Promise<Call[]> {
  const url = new URL(`${API_BASE}/calls/`)
  if (onlyOpen) url.searchParams.set('only_open','true')
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('Failed to fetch calls')
  return res.json()
}

export async function fetchCall(callId: number): Promise<Call> {
  const res = await fetch(`${API_BASE}/calls/${callId}`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Failed to fetch call')
  return res.json()
}

export async function createCall(data: CallInput): Promise<Call> {
  const res = await fetch(`${API_BASE}/calls/`, {
    method: 'POST', headers: { 'Content-Type':'application/json', ...authHeaders() }, body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Failed to create call')
  return res.json()
}

export async function updateCall(id: number, data: CallInput): Promise<Call> {
  const res = await fetch(`${API_BASE}/calls/${id}`, {
    method: 'PUT', headers: { 'Content-Type':'application/json', ...authHeaders() }, body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Failed to update call')
  return res.json()
}

export async function deleteCall(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/calls/${id}`, { method:'DELETE', headers: authHeaders() })
  if (!res.ok) throw new Error('Failed to delete call')
}
