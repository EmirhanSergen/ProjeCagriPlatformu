import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search as SearchIcon, Pencil, Trash2, Eye } from '../../components/icons'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader, CardContent } from '../../components/ui/Card'
import ConfirmModal from '../../components/ui/ConfirmModal'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '../../components/ui/Table'
import { fetchCalls, deleteCall, type Call } from '../../api'
import { useToast } from '../../components/ToastProvider'
import { format } from 'date-fns'

interface ExtendedCall extends Call {
  start_date?: string
  end_date?: string
  category?: string
  max_applications?: number
  updated_at?: string
}

export default function CallManagementPage() {
  const [calls, setCalls] = useState<ExtendedCall[]>([])
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [searchText, setSearchText] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortField, setSortField] = useState<keyof ExtendedCall | null>('updated_at')
  const [sortAsc, setSortAsc] = useState(true)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)
  const { showToast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    fetchCalls()
      .then(data => setCalls(data as ExtendedCall[]))
      .catch(() => showToast('Failed to load calls', 'error'))
  }, [showToast])

  const processed = [...calls]
    .filter(c => categoryFilter === 'All' || c.category === categoryFilter)
    .filter(c => statusFilter === 'All' || (statusFilter === 'Open' ? c.is_open : !c.is_open))
    .filter(
      c =>
        c.title.toLowerCase().includes(searchText.toLowerCase()) ||
        (c.description || '').toLowerCase().includes(searchText.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortField) return 0
      const va = a[sortField] ?? ''
      const vb = b[sortField] ?? ''
      let cmp = 0
      if (typeof va === 'string' && typeof vb === 'string') cmp = va.localeCompare(vb)
      else if (typeof va === 'number' && typeof vb === 'number') cmp = va - vb
      return sortAsc ? cmp : -cmp
    })

  const categories = Array.from(new Set(calls.map(c => c.category).filter(Boolean)))

  const toggleSort = (field: keyof ExtendedCall) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(true)
    }
  }

  const onEdit = (id: number) => navigate(`/admin/calls/${id}/edit`)

  const onDeleteClick = (id: number) => {
    setPendingDeleteId(id)
    setConfirmOpen(true)
  }

  const onConfirmDelete = async () => {
    if (pendingDeleteId === null) return
    setDeletingId(pendingDeleteId)
    setConfirmOpen(false)
    try {
      await deleteCall(pendingDeleteId)
      showToast('Call deleted', 'success')
      setCalls(prev => prev.filter(c => c.id !== pendingDeleteId))
    } catch (e: any) {
      showToast(e.message || 'Failed to delete call', 'error')
    } finally {
      setDeletingId(null)
      setPendingDeleteId(null)
    }
  }

  const sortableFields: (keyof ExtendedCall)[] = [
    'title',
    'start_date',
    'end_date',
    'max_applications',
    'updated_at'
  ]

  const labels: Partial<Record<keyof ExtendedCall, string>> = {
    title: 'Title',
    description: 'Description',
    start_date: 'Start Date',
    end_date: 'End Date',
    category: 'Category',
    max_applications: 'Max Applications',
    is_open: 'Is Open',
    updated_at: 'Updated At'
  }

  return (
    <section className="space-y-6">
      <h1 className="text-xl font-bold">Call Management</h1>
      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={onConfirmDelete}
        title="Are you sure?"
        description="This action will permanently delete the call."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        danger
      />
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h2 className="font-semibold text-lg">Calls</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                placeholder="Search calls..."
                className="pl-7"
              />
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="border p-2 rounded"
              >
                <option>All</option>
                {categories.map(cat => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="border p-2 rounded"
              >
                <option>All</option>
                <option>Open</option>
                <option>Closed</option>
              </select>
              <select
                value={sortField ?? ''}
                onChange={e => setSortField(e.target.value as keyof ExtendedCall)}
                className="border p-2 rounded"
              >
                <option value="">Sort by</option>
                {sortableFields.map(field => (
                  <option key={field} value={field}>{labels[field]}</option>
                ))}
              </select>
              <Button
                variant="outline"
                onClick={() => setSortAsc(prev => !prev)}
                className="px-2"
              >
                {sortAsc ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              </Button>
              <Link
                to="/admin/calls/new"
                className="inline-block ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                + Create New Call
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table className="min-w-max w-full">
              <TableHeader>
                <TableRow>
                  {(
                    ['title','description','start_date','end_date','category','max_applications','is_open','updated_at'] as (keyof ExtendedCall)[]
                  ).map(field => {
                    const isSortable = sortableFields.includes(field)
                    const isActive = sortField === field
                    return (
                      <TableHead
                        key={field}
                        className={`
                          ${field === 'description' ? 'hidden md:table-cell' : 'text-center'}
                          ${isSortable ? 'cursor-pointer hover:underline hover:text-primary' : ''}`}
                        onClick={isSortable ? () => toggleSort(field) : undefined}
                      >
                        <div className="inline-flex items-center gap-1 justify-center">
                          {labels[field]}
                          {isActive && (sortAsc ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                        </div>
                      </TableHead>
                    )
                  })}
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processed.map((c, idx) => (
                  <TableRow
                    key={c.id}
                    className={`${idx % 2 ? 'bg-gray-50' : ''} hover:bg-gray-50`}
                  >
                    <TableCell>{c.title}</TableCell>
                    <TableCell className="hidden md:table-cell max-w-[200px] truncate whitespace-nowrap overflow-hidden">{c.description}</TableCell>
                    <TableCell className="text-center">{c.start_date ? format(new Date(c.start_date),'yyyy-MM-dd') : '-'}</TableCell>
                    <TableCell className="text-center">{c.end_date ? format(new Date(c.end_date),'yyyy-MM-dd') : '-'}</TableCell>
                    <TableCell className="text-center">{c.category || '-'}</TableCell>
                    <TableCell className="text-center">{c.max_applications ?? '-'}</TableCell>
                    <TableCell className="text-center">{c.is_open ? 'Yes' : 'No'}</TableCell>
                    <TableCell className="text-center">{c.updated_at ? format(new Date(c.updated_at),'yyyy-MM-dd HH:mm') : '-'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2 justify-center">
                        <Button
                          variant="outline"
                          onClick={() => onEdit(c.id)}
                          className="flex items-center text-sm px-2 py-1"
                        >
                          <Pencil className="h-4 w-4 mr-1" />Edit
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => onDeleteClick(c.id)}
                          disabled={deletingId === c.id}
                          className="flex items-center text-sm px-2 py-1 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          {deletingId === c.id ? 'Deleting…' : 'Delete'}
                        </Button>
                        <Link
                          to={`/admin/calls/${c.id}/applications`}
                          className="flex items-center text-sm px-2 py-1 underline hover:no-underline"
                        >
                          <Eye className="h-4 w-4 mr-1" />View
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
