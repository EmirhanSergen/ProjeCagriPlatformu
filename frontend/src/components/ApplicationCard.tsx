import type { ApplicationDetail, User } from '../api'
import { assignReviewer, fetchReviewers } from '../api'
import { useEffect, useState } from 'react'
import { useToast } from './ToastProvider'
import { Link } from 'react-router-dom'
import { FileText } from 'lucide-react'

interface Props {
  application: ApplicationDetail
}

export default function ApplicationCard({ application }: Props) {
  const [reviewers, setReviewers] = useState<User[]>([])
  const [selectedReviewerId, setSelectedReviewerId] = useState<number | null>(null)
  const [assigning, setAssigning] = useState(false)
  const { showToast } = useToast()

  const isAdmin = localStorage.getItem('role') === 'admin'

  useEffect(() => {
    if (isAdmin) {
      fetchReviewers().then(setReviewers).catch(() => setReviewers([]))
    }
  }, [isAdmin])

  const handleAssign = async () => {
    if (!selectedReviewerId) return
    setAssigning(true)
    try {
      await assignReviewer(application.id, selectedReviewerId)
      showToast('Reviewer assigned successfully', 'success')
    } catch {
      showToast('Failed to assign reviewer', 'error')
    } finally {
      setAssigning(false)
    }
  }

  const confirmedCount = application.attachments?.filter(a => a.is_confirmed)
    .length || 0
  const totalCount = application.attachments?.length || 0

  return (
    <li className="border rounded-lg p-4 shadow-sm bg-white space-y-4">
      <div className="space-y-1">
        <p className="text-sm text-gray-500">Application ID: {application.id}</p>
        <h2 className="text-lg font-semibold text-gray-800">{application.user_email}</h2>
        <p className="text-sm text-gray-600">
          Documents Confirmed:{' '}
          <span
            className={
              confirmedCount === totalCount && totalCount > 0
                ? 'text-green-700'
                : 'text-red-600'
            }
          >
            {confirmedCount}/{totalCount}
          </span>
        </p>
      </div>

      <div className="flex justify-between items-center">
        <Link
          to={`/admin/calls/${application.call_id}/applications/${application.id}`}
          className="inline-flex items-center text-sm text-blue-600 hover:underline"
        >
          <FileText className="w-4 h-4 mr-1" /> View Full Application
        </Link>
      </div>

      {isAdmin && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Assign Reviewer:</p>
          <div className="flex gap-2 items-center">
            <select
              className="border rounded px-2 py-1 text-sm"
              onChange={(e) => setSelectedReviewerId(Number(e.target.value))}
            >
              <option value="">Select reviewer</option>
              {reviewers.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.first_name} {r.last_name}
                </option>
              ))}
            </select>
            <button
              onClick={handleAssign}
              className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700 transition"
              disabled={assigning || !selectedReviewerId}
            >
              {assigning ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        </div>
      )}
    </li>
  )
}
