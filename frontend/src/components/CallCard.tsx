import { Link } from 'react-router-dom'
import type { Call } from '../api'

interface CallCardProps {
  call: Call
}

function formatDate(dateString?: string) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB')
}

export default function CallCard({ call }: CallCardProps) {
  return (
    <li className="border rounded-xl p-6 shadow-sm hover:shadow transition bg-white flex flex-col justify-between">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          <Link to={`/calls/${call.id}`} className="hover:underline">
            {call.title}
          </Link>
        </h2>

        {call.description && (
          <p className="text-gray-700 mb-4 whitespace-pre-line">{call.description}</p>
        )}

        <div className="text-sm text-gray-600 space-y-1 mb-4">
          {call.start_date && call.end_date && (
            <p>
              <span className="font-semibold">Dates:</span>{' '}
              {formatDate(call.start_date)} → {formatDate(call.end_date)}
            </p>
          )}
          {call.category && (
            <p>
              <span className="font-semibold">Category:</span> {call.category}
            </p>
          )}
          {call.max_applications && (
            <p>
              <span className="font-semibold">Max Applications:</span> {call.max_applications}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <Link
          to={`/calls/${call.id}`}
          className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          View Full Details →
        </Link>
      </div>
    </li>
  )
}
