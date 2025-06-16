import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchCalls } from '../api'
import type { Call } from '../api'
import { useToast } from './ToastProvider'
import CallCard from './CallCard'
import { ArrowUp, ArrowDown } from 'lucide-react'

export default function CallList() {
  const [calls, setCalls] = useState<Call[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [sortField, setSortField] = useState<'title' | 'start_date' | 'end_date' | 'max_applications' | null>('start_date')
  const [sortAsc, setSortAsc] = useState(true)
  const { showToast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
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
      .finally(() => setLoading(false))
  }, [showToast])

  const categories = Array.from(new Set(calls.map(c => c.category).filter(Boolean)))

  const sortedFiltered = [...calls]
    .filter(c => categoryFilter === 'All' || c.category === categoryFilter)
    .filter(c => c.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (!sortField) return 0
      const va = a[sortField] || ''
      const vb = b[sortField] || ''
      const cmp =
          typeof va === 'string' && typeof vb === 'string'
            ? va.localeCompare(vb)
            : Number(va) - Number(vb)
      return sortAsc ? cmp : -cmp
    })

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortAsc(prev => !prev)
    else {
      setSortField(field)
      setSortAsc(true)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500" />
      </div>
    )
  }

  if (error) return <p className="text-center text-red-600">{error}</p>

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search calls..."
          className="border px-3 py-2 rounded w-full md:w-1/3"
        />
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option>All</option>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <select
          value={sortField || ''}
          onChange={e => toggleSort(e.target.value as typeof sortField)}
          className="border px-3 py-2 rounded"
        >
          <option value="">Sort by</option>
          <option value="title">Title</option>
          <option value="start_date">Start Date</option>
          <option value="end_date">End Date</option>
          <option value="max_applications">Max Applications</option>
        </select>
        <button
          className="border px-3 py-2 rounded bg-white hover:bg-gray-100"
          onClick={() => setSortAsc(prev => !prev)}
        >
          {sortAsc ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
        </button>
      </div>

      <ul className="space-y-6">
        {sortedFiltered.map((c) => (
          <CallCard key={c.id} call={c} />
        ))}
      </ul>
    </div>
  )
}
