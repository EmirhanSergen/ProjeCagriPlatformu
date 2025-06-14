import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  fetchAttachmentsByApplicationId,
  fetchDocumentDefinitions,
  confirmDocuments,
  fetchApplicationByUserAndCall,
  type Attachment,
  type DocumentDefinition,
  type Application,
} from '../../api'
import { Button } from '../../components/ui/Button'
import { useToast } from '../../components/ToastProvider'

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
      showToast('Documents confirmed', 'success')
    } catch {
      showToast('Failed to confirm documents', 'error')
    } finally {
      setConfirming(false)
    }
  }

  if (loading) return <p className="p-4">Loading...</p>

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-xl font-bold">Review Your Uploaded Documents</h1>

      {documents.map(doc => {
        const files = attachments.filter(att => att.document_id === doc.id)
        return (
          <div key={doc.id} className="border p-4 rounded shadow-sm bg-white">
            <h2 className="font-semibold text-gray-800">{doc.name}</h2>
            <p className="text-sm text-gray-600">{doc.description}</p>
            <ul className="mt-2 list-disc list-inside text-sm">
              {files.length > 0 ? (
                files.map(file => (
                  <li key={file.id}>
                    <a
                      href={`${import.meta.env.VITE_API_BASE}/uploads/${file.file_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      {file.file_path.split('/').pop()}
                    </a>
                  </li>
                ))
              ) : (
                <li className="text-red-600">No file uploaded</li>
              )}
            </ul>
          </div>
        )
      })}

      <Button
        onClick={handleConfirm}
        className="mt-6"
        disabled={confirming}
      >
        {confirming ? 'Confirming…' : 'Confirm Documents'}
      </Button>
    </div>
  )
}