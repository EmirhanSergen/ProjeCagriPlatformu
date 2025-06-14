import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchCall, type Call } from '../../api'
import { format } from 'date-fns'

export default function Step1_CallInfo() {
  const { callId } = useParams<{ callId: string }>()
  const id = Number(callId)

  const { data: call, isLoading, isError } = useQuery({
    queryKey: ['call', id],
    queryFn: () => fetchCall(id),
    enabled: !!id,
  })

  if (!id) return <p>No call selected.</p>
  if (isLoading) return <p>Loading call information…</p>
  if (isError || !call) return <p className="text-red-600">Failed to load call.</p>

  return (
    <div className="max-w-3xl mx-auto bg-white shadow rounded p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">{call.title}</h1>
      {call.description && <p className="text-gray-700">{call.description}</p>}
      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mt-4">
        <div>
          <strong>Start Date:</strong>{' '}
          {call.start_date ? format(new Date(call.start_date), 'yyyy-MM-dd') : '—'}
        </div>
        <div>
          <strong>End Date:</strong>{' '}
          {call.end_date ? format(new Date(call.end_date), 'yyyy-MM-dd') : '—'}
        </div>
        <div>
          <strong>Category:</strong> {call.category ?? '—'}
        </div>
        <div>
          <strong>Max Applications:</strong> {call.max_applications ?? '—'}
        </div>
      </div>
    </div>
  )
}
