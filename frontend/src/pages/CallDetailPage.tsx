import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchCall, fetchDocumentDefinitions, fetchAttachments } from '../api'
import ApplicationDocumentsPage from './ApplicationDocumentsPage'
import ApplicationPreview from './ApplicationPreview'

export default function CallDetailPage() {
  const { callId } = useParams()
  const id = Number(callId)

  const callQuery = useQuery({
    queryKey: ['call', id],
    queryFn: () => fetchCall(id),
    enabled: !!callId,
  })

  useQuery({
    queryKey: ['docs', id],
    queryFn: () => fetchDocumentDefinitions(id),
    enabled: !!callId,
  })

  const attachmentsQuery = useQuery({
    queryKey: ['attachments', id],
    queryFn: () => fetchAttachments(id),
    enabled: !!callId,
    retry: false,
  })

  if (!callId) return <p>No call selected.</p>
  if (callQuery.isLoading) return <p>Loading...</p>
  if (callQuery.isError) return <p>Failed to load call.</p>

  const hasApplied = !attachmentsQuery.isError

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-bold">{callQuery.data?.title}</h1>
      {callQuery.data?.description && <p>{callQuery.data.description}</p>}
      {hasApplied ? <ApplicationPreview /> : <ApplicationDocumentsPage />}
    </section>
  )
}
