import { Link } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  fetchCall,
  fetchDocumentDefinitions,
  fetchApplicationByUserAndCall,
} from '../api'
import ApplicationDocumentsPage from './ApplicationDocumentsPage'
import ApplicationPreview from './ApplicationPreview'
import ApplicationList from '../components/ApplicationList'
import { useAuth } from '../components/AuthProvider'

export default function CallDetailPage() {
  const { role } = useAuth()
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
    enabled: !!callId && role === 'applicant',
  })

  const applicationQuery = useQuery({
    queryKey: ['application', id],
    queryFn: () => fetchApplicationByUserAndCall(id),
    enabled: !!callId && role === 'applicant',
    retry: false,
  })

  if (!callId) return <p>No call selected.</p>
  if (callQuery.isLoading) return <p>Loading...</p>
  if (callQuery.isError) return <p>Failed to load call.</p>

  const hasApplied = !applicationQuery.isError

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-bold">{callQuery.data?.title}</h1>
      {callQuery.data?.description && <p>{callQuery.data.description}</p>}
      {role === 'applicant' && (
        <>{hasApplied ? <ApplicationPreview /> : <ApplicationDocumentsPage />}</>
      )}
      {role === 'reviewer' && <ApplicationList callId={id} />}
      {role === 'admin' && (
        <div className="space-x-4">
          <Link
            to={`/admin/calls/${id}/edit`}
            className="underline text-blue-600"
          >
            Edit Call
          </Link>
          <Link
            to={`/admin/calls/${id}/applications`}
            className="underline text-blue-600"
          >
            View Applications
          </Link>
        </div>
      )}
    </section>
  )
}
