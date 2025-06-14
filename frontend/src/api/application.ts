import { authHeaders } from './auth'
import { API_BASE } from './config'

export interface ApplicationData {
  call_id: number
  content: string
}

export interface Application {
  id: number
  user_id: number
  call_id: number
  content: string
}

export interface MyApplication extends Application {
  status: 'DRAFT' | 'SUBMITTED' | 'CLOSED' | 'ARCHIVED'
  created_at: string
}

export interface Attachment {
  id: number
  file_name: string
  document_id: number
}

export interface User {
  id: number
  email: string
  firstName?: string
  lastName?: string
  organization?: string
}

export interface ApplicationDetail extends Application {
  user_email: string
  documents_confirmed: boolean
  attachments: Attachment[]
  reviewers?: User[]
}

// 1. Başvuru oluştur
export async function submitApplication(data: ApplicationData): Promise<Application> {
  const res = await fetch(`${API_BASE}/applications/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to submit application')
  return res.json()
}

// 2. Belirli çağrı için kullanıcının başvurusunu getir veya oluştur
export async function fetchApplicationByUserAndCall(callId: number): Promise<Application> {
  const res = await fetch(`${API_BASE}/applications/by_call/${callId}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Failed to fetch or create application')
  return res.json()
}

// 3. Kullanıcıya ait tüm başvuruları getir
export async function fetchMyApplications(): Promise<MyApplication[]> {
  const res = await fetch(`${API_BASE}/applications/me`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Failed to fetch my applications')
  return res.json()
}

// 4. Admin/Reviewer için tüm başvuruları getir
export async function fetchApplications(callId: number): Promise<ApplicationDetail[]> {
  const res = await fetch(`${API_BASE}/calls/${callId}/applications`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Failed to fetch applications')
  return res.json()
}

// 5. Admin/Reviewer için başvuru detaylarını getir
export async function fetchApplicationDetails(applicationId: number): Promise<ApplicationDetail> {
  const res = await fetch(`${API_BASE}/applications/${applicationId}/details`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Failed to fetch application details')
  return res.json()
}

// 6. Başvuruya ait yüklenmiş belgeleri getir
export async function fetchAttachmentsByApplicationId(appId: number): Promise<Attachment[]> {
  const res = await fetch(`${API_BASE}/applications/${appId}/attachments`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Failed to fetch attachments')
  return res.json()
}

export async function downloadAttachment(attachmentId: number): Promise<Blob> {
  const res = await fetch(
    `${API_BASE}/applications/attachments/${attachmentId}/download`,
    {
      headers: authHeaders(),
    }
  )
  if (!res.ok) throw new Error('Failed to download attachment')
  return res.blob()
}

export async function deleteAttachment(attachmentId: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/applications/attachments/${attachmentId}`,
    {
      method: 'DELETE',
      headers: authHeaders(),
    }
  )
  if (!res.ok) throw new Error('Failed to delete attachment')
}

// 7. Dosya(lar) yükle (multi-file legacy; doküman bazlı tekil isimlendirme için, 
//    ayrıca create_attachment kullanan /upload endpoint’iniz de çalışır)
export async function uploadDocuments(
  callId: number,
  documentId: number,
  files: File[]
): Promise<Attachment[] | Attachment> {
  const formData = new FormData()
  files.forEach(file => formData.append('files', file)) // backend çoklu destekliyorsa

  const res = await fetch(
    `${API_BASE}/applications/${callId}/upload?document_id=${documentId}`,
    {
      method: 'POST',
      headers: {
        Authorization: authHeaders().Authorization, // Content-Type elle verilmez
      },
      body: formData,
    }
  )

  if (!res.ok) {
    const err = await res.json().catch(() => null)
    throw new Error(err?.detail || 'Failed to upload documents')
  }

  return res.json() // tek objeyse Attachment, listeyse Attachment[]
}


// 8. Belgeleri onayla
export async function confirmDocuments(applicationId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/applications/${applicationId}/confirm`, {
    method: 'POST',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Failed to confirm documents')
}

// 9. Başvuruyu SUBMITTED yap
export async function submitApplicationStatus(applicationId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/applications/${applicationId}/submit`, {
    method: 'PATCH',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Failed to submit application')
}

// 10. Hakem ataması yap
export async function assignReviewer(applicationId: number, reviewerId: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/applications/admin/applications/${applicationId}/assign-reviewer?reviewer_id=${reviewerId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
    }
  )
  if (!res.ok) throw new Error('Failed to assign reviewer')
}

// 11. Hakem listesini getir (admin için)
export async function fetchReviewers(): Promise<User[]> {
  const res = await fetch(`${API_BASE}/admin/reviewers`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Failed to fetch reviewers')
  return res.json()
}
