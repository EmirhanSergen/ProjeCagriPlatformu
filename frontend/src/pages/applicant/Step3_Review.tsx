import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  fetchAttachmentsByApplicationId,
  fetchDocumentDefinitions,
  confirmDocuments,
  fetchApplicationByUserAndCall,
  downloadAttachment,
  type Attachment,
  type DocumentDefinition,
  type Application,
} from '../../api'
import { Button } from '../../components/ui/Button'
import { useToast } from '../../components/ToastProvider'
import { downloadBlob } from '../../lib/download'
import { getDisplayFileName } from '../../lib/file'

export default function Step3_Review() {
  const { callId } = useParams<{ callId: string }>()
  const cid = Number(callId)
  const [documents, setDocuments] = useState<DocumentDefinition[]>([])
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    if (!cid) return

    Promise.all([
      fetchDocumentDefinitions(cid),
      fetchApplicationByUserAndCall(cid),
    ])
      .then(async ([docs, app]) => {
        setDocuments(docs)
        setApplication(app)
        const atts = await fetchAttachmentsByApplicationId(app.id)
        setAttachments(atts)
      })
      .catch(() => showToast('Failed to load data', 'error'))
      .finally(() => setLoading(false))
  }, [cid, showToast])

  const handleConfirm = async () => {
    if (!application) return
    setConfirming(true)
    try {
      await confirmDocuments(application.id)
      showToast('✅ Documents confirmed', 'success')
    } catch {
      showToast('❌ Failed to confirm documents', 'error')
    } finally {
      setConfirming(false)
    }
  }

  if (loading) return <p className="p-4">Loading...</p>

  if (documents.length === 0)
    return (
      <div className="p-4 space-y-4">
        <h1 className="text-xl font-bold">Review Your Uploaded Documents</h1>
        <p className="text-gray-600">This call does not require document uploads.</p>
      </div>
    )

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">📁 Review Uploaded Documents</h1>
      <p className="text-sm text-gray-600">
        Below are the documents required for this call. Ensure each one has an uploaded file.
      </p>

      {documents.map(doc => {
        const files = attachments.filter(att => att.document_id === doc.id)
        return (
          <div
            key={doc.id}
            className="border border-gray-200 rounded-lg shadow-sm bg-white p-5 space-y-2"
          >
            <h2 className="text-lg font-semibold text-gray-800">📌 {doc.name}</h2>
            <p className="text-sm text-gray-600">{doc.description}</p>

            {files.length > 0 ? (
              <ul className="list-disc list-inside text-sm text-blue-700">
                {files.map(file => (
                  <li key={file.id}>
                    <button
                      onClick={async () => {
                        try {
                          const blob = await downloadAttachment(file.id)
                          downloadBlob(blob, file.file_name)
                        } catch {
                          showToast('Failed to download file', 'error')
                        }
                      }}
                      className="hover:underline"
                    >
                      {getDisplayFileName(file.file_name)}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-red-600 italic">No file uploaded.</p>
            )}
          </div>
        )
      })}

      {documents.length > 0 && (
        <Button
          onClick={handleConfirm}
          className="mt-6"
          disabled={confirming}
        >
          {confirming ? 'Confirming…' : 'Confirm Documents'}
        </Button>
      )}
    </div>
  )
}
