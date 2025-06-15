import type { ApplicationDetail, User } from '../api'
import { assignReviewer, fetchReviewers } from '../api'
import { useEffect, useState } from 'react'
import { useToast } from './ToastProvider'
import { Link } from 'react-router-dom'
import { FileText, UserCheck } from 'lucide-react'

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

  const confirmedCount = application.attachments?.filter(a => a.is_confirmed).length || 0
  const totalCount = application.attachments?.length || 0
  const assignedReviewers = application.reviewers || []

  return (
    <div className="border rounded-lg p-5 shadow-md bg-white space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <p className="text-xs text-gray-500">Application ID: {application.id}</p>
          <h2 className="text-base font-semibold text-gray-800">
            {application.user?.first_name} {application.user?.last_name}
          </h2>
          <p className="text-sm text-gray-600">{application.user?.organization}</p>
          <p className="text-xs text-gray-500">{application.user_email}</p>
          <h2 className="text-base font-semibold text-gray-800">{application.user_email}</h2>
          <p className="text-sm text-gray-600">
            Documents Confirmed:{' '}
            <span
              className={
                confirmedCount === totalCount && totalCount > 0
                  ? 'text-green-700 font-medium'
                  : 'text-red-600 font-medium'
              }
            >
              {confirmedCount}/{totalCount}
            </span>
          </p>
        </div>

        <Link
          to={`/admin/calls/${application.call_id}/applications/${application.id}`}
          className="inline-flex items-center text-sm text-blue-600 hover:underline"
        >
          <FileText className="w-4 h-4 mr-1" /> View Full
        </Link>
      </div>

      {isAdmin && (
        <div className="space-y-3">
          {assignedReviewers.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
              <UserCheck className="w-4 h-4 text-green-700" />
              <span>Assigned Reviewers:</span>
              {assignedReviewers.map(r => (
                <span
                  key={r.id}
                  className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs"
                >
                  {r.first_name} {r.last_name}
                </span>
              ))}
            </div>
          )}

          <div>
            <p className="text-sm font-medium mb-1">Assign Reviewer:</p>
            <div className="flex flex-wrap gap-2 items-center">
              <select
                className="border rounded px-2 py-1 text-sm min-w-[150px]"
                value={selectedReviewerId ?? ''}
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
                className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded hover:bg-blue-700 transition disabled:opacity-50"
                disabled={assigning || !selectedReviewerId}
              >
                {assigning ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
