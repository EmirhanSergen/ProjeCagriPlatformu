import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search as SearchIcon, Pencil, Trash2, Eye } from 'lucide-react'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '../components/ui/Table'
import {
  fetchCalls,
  deleteCall,
  type Call,
} from '../api'
import { useToast } from '../components/ToastProvider'

export default function CallManagementPage() {
  const [calls, setCalls] = useState<Call[]>([])
  const navigate = useNavigate()
  const [searchText, setSearchText] = useState('')
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
      c.title.toLowerCase().includes(searchText.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(searchText.toLowerCase()),
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
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h2 className="font-semibold text-lg">Calls</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-w-xs">
            <div className="relative">
              <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search"
                className="pl-7"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('title')}>
                    Title
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead className="cursor-pointer text-center" onClick={() => handleSort('open')}>
                    Open
                  </TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((c, idx) => (
                  <TableRow
                    key={c.id}
                    className={`${idx % 2 ? 'bg-gray-50' : ''} hover:bg-gray-50`}
                  >
                    <TableCell className="font-medium">{c.title}</TableCell>
                    <TableCell className="hidden md:table-cell">{c.description}</TableCell>
                    <TableCell className="text-center">{c.is_open ? 'Yes' : 'No'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2 justify-center">
                        <Button variant="outline" size="sm" onClick={() => onEdit(c.id)}>
                          <Pencil className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => onDelete(c.id)}>
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                        <Button variant="link" size="sm" asChild>
                          <Link to={`/admin/calls/${c.id}/applications`} className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div>
        <Link to="/admin/calls/new" className="underline text-blue-600">Create New Call</Link>
      </div>
    </section>
  )
}
