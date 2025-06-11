import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import DocumentSlider from '../components/DocumentSlider'
import UploadPanel from '../components/UploadPanel'
import {
  fetchDocumentDefinitions,
  fetchApplicationByUserAndCall,
  submitApplication,
  type DocumentDefinition,
} from '../api'
import { useToast } from '../components/ToastProvider'

export default function ApplicationDocumentsPage() {
  const { callId } = useParams()
  const [docs, setDocs] = useState<DocumentDefinition[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [hasApplication, setHasApplication] = useState<boolean | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    if (!callId) return
    fetchDocumentDefinitions(Number(callId))
      .then((d) => {
        setDocs(d)
        if (d.length > 0) setSelected(d[0].id)
      })
      .catch(() => showToast('Failed to load documents', 'error'))
    fetchApplicationByUserAndCall(Number(callId))
      .then(() => setHasApplication(true))
      .catch(() => setHasApplication(false))
  }, [callId, showToast])

  if (!callId) return <p>No call selected</p>
  if (hasApplication === null) return <p>Loading...</p>

  const current = docs.find((d) => d.id === selected)

  const startApplication = async () => {
    if (!callId) return
    try {
      await submitApplication({ call_id: Number(callId), content: '' })
      setHasApplication(true)
      showToast('Application started', 'success')
    } catch {
      showToast('Failed to start application', 'error')
    }
  }

  return (
    <div className="flex space-x-4">
      <DocumentSlider documents={docs} selected={selected} onSelect={setSelected} />
      {current && hasApplication && (
        <div className="flex-1">
          <UploadPanel callId={Number(callId)} documentId={current.id} description={`Upload ${current.name}`} />
        </div>
      )}
      {current && !hasApplication && (
        <div className="flex-1 flex items-center">
          <button onClick={startApplication} className="bg-blue-600 text-white px-4 py-2 rounded">
            Start Application
          </button>
        </div>
      )}
    </div>
  )
}
