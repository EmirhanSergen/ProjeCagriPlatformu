import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import {
  fetchCall,
  fetchApplicationByUserAndCall,
  fetchDocumentDefinitions,
  uploadDocuments,
  deleteAttachment,
  fetchAttachmentsByApplicationId,
  type Call,
  type Application,
  type DocumentDefinition,
  type Attachment,
} from '../../api'
import { useToast } from '../../components/ToastProvider'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

export default function Step2_Upload() {
  const { callId } = useParams<{ callId: string }>()
  const cid = Number(callId)
  const [call, setCall] = useState<Call | null>(null)
  const [application, setApplication] = useState<Application | null>(null)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [documents, setDocuments] = useState<DocumentDefinition[]>([])
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const { showToast } = useToast()
  const init = useRef(false)

  useEffect(() => {
    if (!cid || init.current) return
    init.current = true

    fetchCall(cid)
      .then(setCall)
      .catch(() => showToast('Failed to load call', 'error'))

    fetchApplicationByUserAndCall(cid)
      .then(setApplication)
      .catch(() => showToast('Failed to init application', 'error'))

    fetchDocumentDefinitions(cid)
      .then(setDocuments)
      .catch(() => showToast('Failed to load documents', 'error'))
  }, [cid, showToast])

  useEffect(() => {
    if (!application?.id) return
      fetchAttachmentsByApplicationId(application.id)
        .then(setAttachments)
        .catch((e: any) => {
          if (e.message.includes('404')) setAttachments([])
          else showToast('Failed to load attachments', 'error')
        })
    }, [application?.id, showToast])

  // Clear selected files when switching documents
  useEffect(() => {
    setSelectedFiles([])
  }, [selectedDocId])

  const handleUpload = async () => {
    if (!application?.id || !selectedDocId || !selectedFiles.length) return

    const existing = attachments.find(a => a.document_id === selectedDocId)
    if (existing) {
      const confirmed = window.confirm(
        'This document already has a file. Uploading again will replace the existing one. Continue?'
      )
      if (!confirmed) return
      try {
        await deleteAttachment(existing.id)
        setAttachments(prev => prev.filter(a => a.id !== existing.id))
      } catch (e) {
        showToast('Failed to remove old file', 'error')
        return
      }
    }

    try {
      const newAtts = await uploadDocuments(
        cid,
        selectedDocId,
        [selectedFiles[0]]
      )
      showToast('Upload successful', 'success')
      setSelectedFiles([])

      if (Array.isArray(newAtts)) {
        setAttachments(prev => [...prev, ...newAtts])
      } else if (newAtts && typeof newAtts === 'object') {
        setAttachments(prev => [...prev, newAtts])
      } else {
        console.error('Unexpected upload response:', newAtts)
        showToast('Unexpected upload response', 'error')
      }
    } catch (err: any) {
      console.error(err)
      showToast(err.message || 'Upload failed', 'error')
    }
  }

  return (
    <div className="flex">
      <aside className="w-60 border-r p-4 bg-gray-50 space-y-2">
        {documents.map(doc => (
          <button
            key={doc.id}
            onClick={() => setSelectedDocId(doc.id)}
            className={`w-full text-left p-2 rounded hover:bg-blue-100 ${
              selectedDocId === doc.id ? 'bg-blue-200 font-semibold' : 'text-gray-700'
            }`}
          >
            {doc.name}
          </button>
        ))}
      </aside>
      <main className="flex-1 p-6">
        {!selectedDocId ? (
          <p className="text-gray-600">Select a document to upload.</p>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-800">
              Upload: {documents.find(d => d.id === selectedDocId)!.name}
            </h2>
            <p className="text-gray-600 text-sm">
              {documents.find(d => d.id === selectedDocId)?.description}
            </p>
            <Input
              type="file"
              onChange={e => setSelectedFiles(Array.from(e.target.files || []))}
            />
            <Button onClick={handleUpload} className="mt-2">
              Save
            </Button>
            <div className="mt-4 space-y-2">
              <h3 className="font-medium text-gray-700 text-sm">Uploaded Files:</h3>
              {attachments
                .filter(a => a.document_id === selectedDocId)
                .map(a => (
                  <div key={a.id}>
                    <a
                      href={`${import.meta.env.VITE_API_BASE}/applications/attachments/${a.id}/download`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-sm"
                    >
                      {a.file_name}
                    </a>
                  </div>
                ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}