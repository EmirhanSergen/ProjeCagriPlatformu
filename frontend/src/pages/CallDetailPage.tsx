import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { fetchCall, fetchDocumentDefinitions, type DocumentDefinition } from '../api'
import { useAuth } from '../components/AuthProvider'
import { CalendarDays, Users, FileText, Pencil } from 'lucide-react'
import { Button } from '../components/ui/Button'

export default function CallDetailPage() {
  const { callId } = useParams<{ callId: string }>()
  const id = Number(callId)
  const navigate = useNavigate()
  const { role, token } = useAuth()

  const { data: call, isLoading, isError } = useQuery({
    queryKey: ['call', id],
    queryFn: () => fetchCall(id),
    enabled: !!id,
  })

  const [documents, setDocuments] = useState<DocumentDefinition[]>([])

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    if (id && (role === 'admin' || role === 'applicant')) {
      fetchDocumentDefinitions(id)
        .then(setDocuments)
        .catch(() => setDocuments([]))
    }
  }, [id, token, navigate, role])

  if (!callId) return <p>No call selected.</p>
  if (isLoading) return <p>Loading call details…</p>
  if (isError || !call) return <p className="text-red-600">Failed to load call info.</p>

  return (
    <section className="space-y-8 max-w-4xl mx-auto px-4 py-8">
      <header className="space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">{call.title}</h1>

        {call.category && (
          <span className="inline-block text-sm px-3 py-1 bg-gray-100 rounded-full text-gray-800">
            {call.category}
          </span>
        )}

        <p className="text-gray-700 text-lg whitespace-pre-line">{call.description}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700 mt-4">
          {call.start_date && (
            <p className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" /> Start: {new Date(call.start_date).toLocaleDateString()}
            </p>
          )}
          {call.end_date && (
            <p className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" /> End: {new Date(call.end_date).toLocaleDateString()}
            </p>
          )}
          {call.max_applications && (
            <p className="flex items-center gap-2">
              <Users className="h-4 w-4" /> Max Applications: {call.max_applications}
            </p>
          )}
        </div>
      </header>

      {(role === 'applicant' || role === 'admin') && (
        <section className="border p-4 rounded bg-gray-50">
          <h2 className="text-lg font-semibold mb-2">📎 Required Documents</h2>
          {documents.length > 0 ? (
            <ul className="list-disc list-inside text-sm space-y-1">
              {documents.map((doc) => (
                <li key={doc.id}>
                  <strong>{doc.name}</strong>
                  {doc.description && <> – {doc.description}</>}
                  <span className="text-gray-500"> ({doc.allowed_formats})</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 text-sm italic">No document requirements defined for this call.</p>
          )}
        </section>
      )}

      {role === 'applicant' && (
        <Link
          to={`/applicant/${call.id}`}
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Apply Now →
        </Link>
      )}

      {role === 'admin' && (
        <div className="flex gap-4 mt-4">
          <Link to={`/admin/calls/${id}/edit`}>
            <Button variant="outline" className="flex items-center gap-2">
              <Pencil className="w-4 h-4" />
              Edit Call
            </Button>
          </Link>
          <Link to={`/admin/calls/${id}/applications`}>
            <Button variant="default" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              View Applications
            </Button>
          </Link>
        </div>
      )}
    </section>
  )
}
