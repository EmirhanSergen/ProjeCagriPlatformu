import { authHeaders } from './auth'
import { API_BASE } from './config'

export interface DocumentDefinition { id: number; call_id: number; name: string; description?: string|null; allowed_formats: string }

export async function fetchDocumentDefinitions(callId: number): Promise<DocumentDefinition[]> {
  const res = await fetch(`${API_BASE}/calls/${callId}/documents`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Failed to load document definitions')
  const docs: DocumentDefinition[] = await res.json()
  return docs.sort((a, b) => a.id - b.id)
}

export async function createDocumentDefinition(callId: number, data: Omit<DocumentDefinition,'id'|'call_id'>): Promise<DocumentDefinition[]> {
  const res = await fetch(`${API_BASE}/admin/calls/${callId}/documents`, {
    method:'POST', headers:{'Content-Type':'application/json', ...authHeaders()}, body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Failed to save document definition')
  return res.json()
}

export async function updateDocumentDefinition(callId: number, docId: number, data: Omit<DocumentDefinition,'id'|'call_id'>): Promise<DocumentDefinition> {
  const res = await fetch(`${API_BASE}/admin/calls/${callId}/documents/${docId}`, {
    method:'PUT', headers:{'Content-Type':'application/json', ...authHeaders()}, body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Failed to update document definition')
  return res.json()
}

export async function deleteDocumentDefinition(callId: number, docId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/calls/${callId}/documents/${docId}`, { method:'DELETE', headers: authHeaders() })
  if (!res.ok) throw new Error('Failed to delete document definition')
}
