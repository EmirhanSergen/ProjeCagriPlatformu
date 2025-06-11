import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import DocumentSlider from '../components/DocumentSlider'
import UploadPanel from '../components/UploadPanel'
import { fetchDocumentDefinitions, type DocumentDefinition } from '../api'
import { useToast } from '../components/ToastProvider'

export default function ApplicationDocumentsPage() {
  const { callId } = useParams()
  const [docs, setDocs] = useState<DocumentDefinition[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    if (!callId) return
    fetchDocumentDefinitions(Number(callId))
      .then((d) => {
        setDocs(d)
        if (d.length > 0) setSelected(d[0].id)
      })
      .catch(() => showToast('Failed to load documents', 'error'))
  }, [callId, showToast])

  if (!callId) return <p>No call selected</p>

  const current = docs.find((d) => d.id === selected)

  return (
    <div className="flex space-x-4">
      <DocumentSlider documents={docs} selected={selected} onSelect={setSelected} />
      {current && (
        <div className="flex-1">
          <UploadPanel callId={Number(callId)} documentId={current.id} description={`Upload ${current.name}`} />
        </div>
      )}
    </div>
  )
}
