import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { fetchApplicationDetails, downloadAttachment } from '../../api'
import type { ApplicationDetail, Attachment } from '../../api'
import { useToast } from '../../components/ToastProvider'
import { useAuth } from '../../context/AuthContext' // yolu senin yapına göre `components/AuthProvider` da olabilir

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

  if (!application) return <p>Loading application details...</p>

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Application #{application.id}</h1>

      <div className="space-y-2">
        <p><strong>Applicant Email:</strong> {application.user_email}</p>
        <p><strong>Documents Confirmed:</strong> {application.documents_confirmed ? 'Yes' : 'No'}</p>
        <p><strong>Status:</strong> {(application as any).status ?? 'Unknown'}</p>
        <p><strong>Viewed by:</strong> {user?.role ?? 'Unknown role'}</p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mt-4 mb-2">Uploaded Documents</h2>
        {application.attachments?.length > 0 ? (
          <ul className="list-disc ml-5 space-y-1">
            {application.attachments.map((doc: Attachment) => (
              <li key={doc.id}>
                <button
                  onClick={async () => {
                    try {
                      const blob = await downloadAttachment(doc.id)
                      const url = URL.createObjectURL(blob)
                      window.open(url, '_blank')
                    } catch {
                      showToast('Failed to download file', 'error')
                    }
                  }}
                  className="text-blue-600 hover:underline"
                >
                  {doc.file_name}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No documents uploaded.</p>
        )}
      </div>
    </section>
  )
}
