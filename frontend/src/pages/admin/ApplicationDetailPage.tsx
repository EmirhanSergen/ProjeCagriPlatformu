import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  fetchApplicationDetails,
  downloadAttachment,
  downloadAttachmentForReview,
  fetchCall,
} from '../../api'
import type { ApplicationDetail, Attachment, Call } from '../../api'
import { downloadBlob } from '../../lib/download'
import { useToast } from '../../components/ToastProvider'
import { useAuth } from '../../components/AuthProvider'
import { FileIcon, DownloadIcon } from 'lucide-react'

export default function ApplicationDetailPage() {
  const { applicationId } = useParams<{ applicationId: string }>()
  const [application, setApplication] = useState<ApplicationDetail | null>(null)
  const [call, setCall] = useState<Call | null>(null)
  const { user } = useAuth()
  const { showToast } = useToast()

  useEffect(() => {
    if (!applicationId) return
    fetchApplicationDetails(Number(applicationId))
      .then(app => {
        setApplication(app)
        fetchCall(app.call_id).then(setCall).catch(() => setCall(null))
      })
      .catch(() => {
        setApplication(null)
        setCall(null)
      })
  }, [applicationId])

  const getReadableFileName = (filename: string) => {
    const parts = filename.split('_')
    return parts.slice(-1)[0] ?? filename
  }

  if (!application) {
    return (
      <div className="text-center py-10 text-gray-600 text-lg">
        Loading application details...
      </div>
    )
  }

  const confirmedCount = application.attachments?.filter(a => a.is_confirmed).length || 0
  const totalCount = application.attachments?.length || 0

  return (
    <section className="max-w-3xl mx-auto space-y-6 px-4">
      {/* Header */}
      <div className="border rounded-xl p-6 shadow bg-white space-y-3">
        <h1 className="text-2xl font-bold text-gray-800">Application #{application.id}</h1>
        <div className="space-y-1 text-gray-700">
          <div className="flex items-center gap-2">
            <span>🧑</span>
            <strong>Applicant:</strong>{' '}
            {application.user.first_name} {application.user.last_name} ({application.user.email})
          </div>
          <div className="flex items-center gap-2">
            <span>🗓️</span>
            <strong>Submitted:</strong>{' '}
            {new Date(application.created_at).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2">
            <span>📎</span><strong>Documents Confirmed:</strong>{' '}
            <span
              className={`ml-1 px-2 py-0.5 rounded text-white text-sm ${
                confirmedCount === totalCount && totalCount > 0
                  ? 'bg-green-500'
                  : 'bg-red-500'
              }`}
            >
              {confirmedCount}/{totalCount}
            </span>
          </div>
          {call && (
            <div className="flex items-center gap-2">
              <span>📅</span>
              <strong>Call:</strong>{' '}
              {call.start_date ? new Date(call.start_date).toLocaleDateString() : 'N/A'}
              {' - '}
              {call.end_date ? new Date(call.end_date).toLocaleDateString() : 'N/A'}
            </div>
          )}
          <div className="flex items-center gap-2">
            <span>📌</span><strong>Status:</strong>{' '}
            <span className="bg-gray-200 text-gray-800 px-2 py-0.5 rounded text-sm">{(application as any).status ?? 'Unknown'}</span>
          </div>
        </div>
      </div>

      {/* Attachments */}
      <div className="border rounded-xl p-6 shadow bg-white">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Uploaded Documents</h2>
        {application.attachments?.length > 0 ? (
          <ul className="space-y-3">
            {application.attachments.map((doc: Attachment) => (
              <li
                key={doc.id}
                className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 border px-4 py-3 rounded-md shadow-sm"
              >
                <div className="flex items-center gap-3 text-sm text-gray-700 truncate max-w-xs">
                  <FileIcon className="w-5 h-5 text-gray-500" />
                  <span className="truncate">{getReadableFileName(doc.file_name)}</span>
                </div>
                  <button
                    onClick={async () => {
                      try {
                        const blob =
                          user?.role === 'admin' || user?.role === 'reviewer'
                            ? await downloadAttachmentForReview(doc.id)
                            : await downloadAttachment(doc.id)
                        downloadBlob(blob, doc.file_name)
                      } catch {
                        showToast('Failed to download file', 'error')
                      }
                    }}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                >
                  <DownloadIcon className="w-4 h-4" />
                  Download
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No documents uploaded.</p>
        )}
      </div>
    </section>
  )
}
