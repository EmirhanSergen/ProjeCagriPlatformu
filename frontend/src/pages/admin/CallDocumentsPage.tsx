import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  fetchDocumentDefinitions,
  createDocumentDefinition,
  updateDocumentDefinition,
  deleteDocumentDefinition,
  type DocumentDefinition,
} from '../../api'
import { useToast } from '../../components/ToastProvider'
import AddDocumentForm from '../../components/AddDocumentForm'

export default function CallDocumentsPage() {
  const { callId } = useParams<{ callId: string }>()
  const id = Number(callId)
  const [docs, setDocs] = useState<DocumentDefinition[]>([])
  const { showToast } = useToast()

  // 📥 Yükleme
  useEffect(() => {
    if (!id) return
    fetchDocumentDefinitions(id)
      .then(setDocs)
      .catch(() => showToast('Failed to load documents', 'error'))
  }, [id, showToast])

  // ➕ Ekleme
  const handleAdd = async (data: { name: string; allowed_formats: string }) => {
    try {
      const updated = await createDocumentDefinition(id, data)
      setDocs(updated)
      showToast('Document added', 'success')
    } catch (err: any) {
      showToast(err.message || 'Failed to add document', 'error')
    }
  }

  // ✏️ Güncelleme
  const handleUpdate = async (docId: number, data: { name: string; allowed_formats: string }) => {
    try {
      const updated = await updateDocumentDefinition(id, docId, data)
      setDocs((prev) => prev.map((d) => (d.id === docId ? updated : d)))
      showToast('Document updated', 'success')
    } catch (err: any) {
      showToast(err.message || 'Failed to update document', 'error')
    }
  }

  // 🗑️ Silme
  const handleDelete = async (docId: number) => {
    const confirmed = window.confirm('Are you sure you want to delete this document?')
    if (!confirmed) return

    try {
      await deleteDocumentDefinition(id, docId)
      setDocs((prev) => prev.filter((d) => d.id !== docId))
      showToast('Document deleted', 'success')
    } catch (err: any) {
      showToast(err.message || 'Failed to delete document', 'error')
    }
  }

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-bold">Required Documents</h1>

      <AddDocumentForm onAdd={handleAdd} />

      <ul className="space-y-2">
        {docs.length > 0 ? (
          docs.map((d) => (
            <li key={d.id} className="flex justify-between items-center p-2 border rounded">
              <div>
                <strong>{d.name}</strong> ({d.allowed_formats})
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    handleUpdate(d.id, { name: d.name, allowed_formats: d.allowed_formats })
                  }
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(d.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </li>
          ))
        ) : (
          <p className="text-gray-600">No documents defined for this call.</p>
        )}
      </ul>
    </section>
  )
}
