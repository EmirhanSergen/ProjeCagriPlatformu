import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { fetchApplicationDetails } from '../../api'
import type { ApplicationDetail, Attachment } from '../../api'
import { API_BASE } from '../../api/config'
import { useAuth } from '../../context/AuthContext' // yolu senin yapına göre `components/AuthProvider` da olabilir

export default function ApplicationDetailPage() {
  const { applicationId } = useParams<{ applicationId: string }>()
  const [application, setApplication] = useState<ApplicationDetail | null>(null)
  const { user } = useAuth()

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
                <a
                  href={`${API_BASE}/${doc.file_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Download Document #{doc.id}
                </a>
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
