import type { ApplicationDetail, User, ReviewerShort } from '../api'
import { assignReviewer, fetchReviewers } from '../api'
import { useEffect, useState } from 'react'
import { useToast } from './ToastProvider'
import { Link } from 'react-router-dom'
import { FileText, Loader2, PlusCircle } from 'lucide-react'

interface Props {
  application: ApplicationDetail
}

export default function ApplicationCard({ application }: Props) {
  const [reviewers, setReviewers] = useState<User[]>([])
  const [assigned, setAssigned] = useState<ReviewerShort[]>(application.reviewers || [])
  const [selectedReviewerId, setSelectedReviewerId] = useState<number | null>(null)
  const [assigning, setAssigning] = useState(false)
  const { showToast } = useToast()
  const isAdmin = localStorage.getItem('role') === 'admin'

  useEffect(() => {
    if (isAdmin) {
      fetchReviewers().then(setReviewers).catch(() => setReviewers([]))
    }
  }, [isAdmin])

  useEffect(() => {
    setAssigned(application.reviewers || [])
  }, [application.reviewers])

  const handleAssign = async () => {
    if (!selectedReviewerId) return
    setAssigning(true)
    try {
      await assignReviewer(application.id, selectedReviewerId)
      const newReviewer = reviewers.find(r => r.id === selectedReviewerId)
      if (newReviewer) {
        const short: ReviewerShort = {
          id: newReviewer.id,
          first_name: newReviewer.first_name,
          last_name: newReviewer.last_name,
        }
        setAssigned(prev => [...prev, short])
      }
      showToast('Reviewer assigned successfully', 'success')
    } catch (e: any) {
      showToast(e.message || 'Failed to assign reviewer', 'error')
    } finally {
      setAssigning(false)
    }
  }

  const confirmedCount = application.attachments?.filter(a => a.is_confirmed).length || 0
  const totalCount = application.attachments?.length || 0

  return (
    <li className="border rounded-xl p-5 shadow-sm bg-white space-y-4">
      {/* Üst bilgi */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="space-y-1 text-sm text-gray-800">
          <p><span className="text-gray-500">📄 ID:</span> {application.id}</p>
          <p><span className="text-gray-500">👤 Name:</span> {application.user.first_name} {application.user.last_name}</p>
          <p><span className="text-gray-500">🏢 Org:</span> {application.user.organization || '—'}</p>
          <p><span className="text-gray-500">✉️ Email:</span> {application.user.email}</p>
          <p>
            <span className="text-gray-500">📎 Confirmed:</span>{' '}
            <span className={`font-semibold ${confirmedCount === totalCount ? 'text-green-600' : 'text-red-600'}`}>
              {confirmedCount}/{totalCount}
            </span>
          </p>
        </div>

        <Link
          to={`/admin/calls/${application.call_id}/applications/${application.id}`}
          className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm"
        >
          <FileText className="w-4 h-4" />
          View Details
        </Link>
      </div>

      {/* Reviewer listesi + atama */}
      {isAdmin && (
        <div className="space-y-2 pt-2">
          <p className="text-sm font-medium">Assigned Reviewers:</p>
          <div className="flex flex-wrap gap-2">
            {assigned.length > 0 ? (
              assigned.map(r => (
                <span key={r.id} className="inline-block bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
                  {r.first_name} {r.last_name}
                </span>
              ))
            ) : (
              <p className="text-sm text-gray-500">None</p>
            )}
          </div>

          {assigned.length < 3 && (
            <div className="flex gap-2 items-center pt-2">
              <select
                className="border rounded px-2 py-1 text-sm"
                onChange={e => setSelectedReviewerId(Number(e.target.value))}
                value={selectedReviewerId ?? ''}
              >
                <option value="">Select reviewer</option>
                {reviewers
                  .filter(r => !assigned.some(a => a.id === r.id))
                  .map(r => (
                    <option key={r.id} value={r.id}>
                      {r.first_name} {r.last_name}
                    </option>
                  ))}
              </select>
              <button
                onClick={handleAssign}
                className="flex items-center gap-1 bg-blue-600 text-white text-sm px-3 py-1.5 rounded hover:bg-blue-700 transition disabled:opacity-50"
                disabled={assigning || !selectedReviewerId}
              >
                {assigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                Assign
              </button>
            </div>
          )}
        </div>
      )}
    </li>
  )
}
