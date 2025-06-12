import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchCalls } from '../api'
import type { Call } from '../api'
import { useToast } from './ToastProvider'

export default function CallList() {
  const [calls, setCalls] = useState<Call[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    setLoading(true)
    fetchCalls(true)
      .then((data) => {
        setCalls(data)
        setError(null)
      })
      .catch((err) => {
        console.error(err)
        setError('Failed to load calls.')
        showToast('Unable to load project calls.', 'error')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [showToast])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500" />
      </div>
    )
  }

  if (error) {
    return <p className="text-center text-red-600">{error}</p>
  }

  if (calls.length === 0) {
    return <p className="text-center text-gray-600">No open calls at the moment.</p>
  }

  return (
    <ul className="grid sm:grid-cols-2 gap-6">
      {calls.map((c) => (
        <li
          key={c.id}
          className="border rounded-lg p-6 shadow-sm hover:shadow-md transition"
        >
          <h3 className="text-xl font-semibold mb-2">
            <Link to={`/calls/${c.id}`} className="hover:underline">
              {c.title}
            </Link>
          </h3>
          {c.description && (
            <p className="text-gray-700 mb-4">{c.description}</p>
          )}
          <Link
            to={`/calls/${c.id}`}
            className="inline-block text-blue-600 hover:underline"
          >
            View details →
          </Link>
        </li>
      ))}
    </ul>
  )
}
