import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { fetchApplicationDetails, downloadAttachment } from '../../api'
import type { ApplicationDetail, Attachment } from '../../api'
import { downloadBlob } from '../../lib/download'
import { useToast } from '../../components/ToastProvider'
import { useAuth } from '../../components/AuthProvider'

export default function ApplicationDetailPage() {
  const { applicationId } = useParams<{ applicationId: string }>()
  const [application, setApplication] = useState<ApplicationDetail | null>(null)
  const { user } = useAuth()
  const { showToast } = useToast()

  useEffect(() => {
    if (!applicationId) return
    fetchApplicationDetails(Number(applicationId))
      .then(setApplication)
      .catch(() => setApplication(null))
  }, [applicationId])

  if (!application) {
    return (
      <div className="text-center py-10 text-gray-600 text-lg">
        Loading application details...
      </div>
    )
  }

  return (
    <section className="max-w-3xl mx-auto space-y-6 px-4">
      <div className="border rounded-xl p-5 shadow-sm bg-white">
        <h1 className="text-2xl font-bold mb-4">Application #{application.id}</h1>
        <div className="space-y-2 text-gray-800">
          <p><span className="font-semibold">📧 Applicant Email:</span> {application.user_email}</p>
          <p>
            <span className="font-semibold">📎 Documents Confirmed:</span>{' '}
            <span className={`inline-block px-2 py-0.5 rounded text-white text-sm ${application.documents_confirmed ? 'bg-green-500' : 'bg-red-500'}`}>
              {application.documents_confirmed ? 'Yes' : 'No'}
            </span>
          </p>
          <p>
            <span className="font-semibold">📌 Status:</span>{' '}
            <span className="inline-block bg-gray-200 text-gray-800 px-2 py-0.5 rounded text-sm">
              {(application as any).status ?? 'Unknown'}
            </span>
          </p>
          <p><span className="font-semibold">🕵️ Viewed by:</span> {user?.role ?? 'Unknown role'}</p>
        </div>
      </div>

      <div className="border rounded-xl p-5 shadow-sm bg-white">
        <h2 className="text-xl font-semibold mb-3">Uploaded Documents</h2>
        {application.attachments?.length > 0 ? (
          <ul className="space-y-2">
            {application.attachments.map((doc: Attachment) => (
              <li key={doc.id}>
                <button
                  onClick={async () => {
                    try {
                      const blob = await downloadAttachment(doc.id)
                      downloadBlob(blob, doc.file_name)
                    } catch {
                      showToast('Failed to download file', 'error')
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm shadow"
                >
                  📄 {doc.file_name}
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
