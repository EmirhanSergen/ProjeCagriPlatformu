import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  fetchCalls,
  deleteCall,
  type Call,
} from '../api'
import { useToast } from '../components/ToastProvider'

export default function CallManagementPage() {
  const [calls, setCalls] = useState<Call[]>([])
  const navigate = useNavigate()
  const [filterText, setFilterText] = useState('')
  const [sortField, setSortField] = useState<'title' | 'open' | null>(null)
  const [sortAsc, setSortAsc] = useState(true)
  const { showToast } = useToast()

  const loadCalls = () => {
    fetchCalls()
      .then(setCalls)
      .catch(() => showToast('Failed to load calls', 'error'))
  }

  useEffect(() => {
    loadCalls()
  }, [])

  const handleSort = (field: 'title' | 'open') => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(true)
    }
  }

  const onEdit = (id: number) => {
    navigate(`/admin/calls/${id}/edit`)
  }

  const onDelete = async (id: number) => {
    try {
      await deleteCall(id)
      showToast('Call deleted', 'success')
      loadCalls()
    } catch {
      showToast('Failed to delete call', 'error')
    }
  }

  const filtered = calls.filter(
    (c) =>
      c.title.toLowerCase().includes(filterText.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(filterText.toLowerCase()),
  )
  const sorted = [...filtered]
  if (sortField === 'title') {
    sorted.sort((a, b) =>
      sortAsc ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title),
    )
  } else if (sortField === 'open') {
    sorted.sort((a, b) => {
      if (a.is_open === b.is_open) return 0
      const res = a.is_open ? -1 : 1
      return sortAsc ? res : -res
    })
  }

  return (
    <section className="space-y-6">
      <h1 className="text-xl font-bold">Call Management</h1>
      <input
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        placeholder="Filter"
        className="border p-2 w-full"
      />
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th
              className="p-2 text-left cursor-pointer"
              onClick={() => handleSort('title')}
            >
              Title
            </th>
            <th className="p-2 text-left">Description</th>
            <th
              className="p-2 cursor-pointer"
              onClick={() => handleSort('open')}
            >
              Open
            </th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((c) => (
            <tr key={c.id} className="border-t">
              <td className="p-2">{c.title}</td>
              <td className="p-2">{c.description}</td>
              <td className="p-2 text-center">{c.is_open ? 'Yes' : 'No'}</td>
              <td className="p-2 space-x-2 text-center">
                <button onClick={() => onEdit(c)} className="text-blue-600 underline">
                  Edit
                </button>
                <button onClick={() => onDelete(c.id)} className="text-red-600 underline">
                  Delete
                </button>
                <Link
                  to={`/admin/calls/${c.id}/applications`}
                  className="text-green-600 underline"
                >
                  View Applications
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        <Link to="/admin/calls/new" className="underline text-blue-600">Create New Call</Link>
      </div>
    </section>
  )
}
