import { API_BASE } from './config'
import { authHeaders } from './auth'

export interface ReviewCreate {
  application_id: number
  score: number
  comment: string
}

export interface ReviewOut {
  id: number
  application_id: number
  reviewer_id: number
  score: number
  comment: string
  created_at: string
  updated_at: string
}

// Reviewer kendi değerlendirmesini gönderir
export async function submitReview(payload: ReviewCreate): Promise<ReviewOut> {
  const res = await fetch(`${API_BASE}/reviews/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to submit review')
  return res.json()
}

// Reviewer kendi yaptığı değerlendirmeleri alır
export async function fetchMyReviews(): Promise<ReviewOut[]> {
  const res = await fetch(`${API_BASE}/reviews/me`, {
    headers: { ...authHeaders() },
  })
  if (!res.ok) throw new Error('Failed to fetch my reviews')
  return res.json()
}

// Reviewer bir başvuruya ait tüm reviewları görür
export async function fetchReviewsForApplication(appId: number): Promise<ReviewOut[]> {
  const res = await fetch(`${API_BASE}/applications/${appId}/reviews`, {
    headers: { ...authHeaders() },
  })
  if (!res.ok) throw new Error('Failed to fetch reviews for application')
  return res.json()
}

// Reviewer değerlendirmesini günceller
export async function updateReview(id: number, data: Partial<ReviewCreate>): Promise<ReviewOut> {
  const res = await fetch(`${API_BASE}/reviews/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update review')
  return res.json()
}

// Reviewer değerlendirmesini siler
export async function deleteReview(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/reviews/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  })
  if (!res.ok) throw new Error('Failed to delete review')
}
