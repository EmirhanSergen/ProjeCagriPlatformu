import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import {
  fetchCall,
  fetchApplicationByUserAndCall,
  fetchDocumentDefinitions,
  uploadDocuments,
  deleteAttachment,
  fetchAttachmentsByApplicationId,
  downloadAttachment,
  type Call,
  type Application,
  type DocumentDefinition,
  type Attachment,
} from '../../api'
import { useToast } from '../../components/ToastProvider'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import ConfirmModal from '../../components/ui/ConfirmModal'
import { downloadBlob } from '../../lib/download'

export default function Step2_Upload() {
  const { callId } = useParams<{ callId: string }>()
  const cid = Number(callId)
  const [call, setCall] = useState<Call | null>(null)
  const [application, setApplication] = useState<Application | null>(null)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [documents, setDocuments] = useState<DocumentDefinition[]>([])
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingAttachment, setPendingAttachment] = useState<Attachment | null>(null)
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

  const performUpload = async () => {
    if (!application?.id || !selectedDocId || !selectedFiles.length) return

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

  const handleUpload = async () => {
    if (!application?.id || !selectedDocId || !selectedFiles.length) return

    const existing = attachments.find(a => a.document_id === selectedDocId)
    if (existing) {
      setPendingAttachment(existing)
      setConfirmOpen(true)
      return
    }

    await performUpload()
  }

  const confirmReplace = async () => {
    if (!pendingAttachment) return
    try {
      await deleteAttachment(pendingAttachment.id)
      setAttachments(prev => prev.filter(a => a.id !== pendingAttachment.id))
    } catch (e) {
      showToast('Failed to remove old file', 'error')
      setConfirmOpen(false)
      setPendingAttachment(null)
      return
    }
    setConfirmOpen(false)
    setPendingAttachment(null)
    await performUpload()
  }

  const closeModal = () => {
    setConfirmOpen(false)
    setPendingAttachment(null)
  }

  return (
    <>
      <ConfirmModal
        open={confirmOpen}
        onClose={closeModal}
        onConfirm={confirmReplace}
        title="Confirm Replacement"
        description="This document already has a file. Uploading again will replace the existing one. Continue?"
        confirmLabel="Replace"
        cancelLabel="Cancel"
        danger
      />
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
              key={selectedDocId}
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
                    <button
                      onClick={async () => {
                        try {
                          const blob = await downloadAttachment(a.id)
                          downloadBlob(blob, a.file_name)
                        } catch {
                          showToast('Failed to download file', 'error')
                        }
                      }}
                      className="text-blue-600 underline text-sm"
                    >
                      {a.file_name}
                    </button>
                  </div>
                ))}
            </div>
          </>
        )}
      </main>
    </div>
    </>
  )
}