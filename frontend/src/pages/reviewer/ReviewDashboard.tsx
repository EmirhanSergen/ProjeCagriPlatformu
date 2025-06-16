import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Link } from 'react-router-dom'
import {
  fetchCalls,
  fetchApplications,
  fetchMyReviews,
  type Call,
  type ApplicationDetail,
  type ReviewOut,
  type User,
  type ReviewerShort,
} from '../../api'
import { useToast } from '../../components/ToastProvider'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '../../components/ui/Table'

interface ReviewApp extends ApplicationDetail {
  callTitle: string
}

export default function ReviewDashboard() {
  const [apps, setApps] = useState<ReviewApp[]>([])
  const [reviewedIds, setReviewedIds] = useState<number[]>([])
  const [filter, setFilter] = useState<'needs' | 'reviewed' | 'all'>('needs')
  const [search, setSearch] = useState('')
  const { showToast } = useToast()

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return
        const myId = JSON.parse(atob(token.split('.')[1])).sub

        const [calls, myReviews] = await Promise.all([
          fetchCalls(),
          fetchMyReviews().catch(() => [] as ReviewOut[]),
        ])
        setReviewedIds(myReviews.map(r => r.application_id))

        const results: ReviewApp[] = []
        for (const call of calls) {
          try {
            const list = await fetchApplications(call.id)
            list.forEach(app => {
              if (app.reviewers?.some((r: ReviewerShort) => r.id == myId)) {
                results.push({ ...app, callTitle: call.title })
              }
            })
          } catch {
            // ignore per-call errors
          }
        }
        setApps(results)
      } catch {
        showToast('Failed to load data', 'error')
      }
    }
    load()
  }, [showToast])

  const filtered = apps
    .filter(a => {
      if (filter === 'needs') return !reviewedIds.includes(a.id)
      if (filter === 'reviewed') return reviewedIds.includes(a.id)
      return true
    })
    .filter(
      a =>
        a.callTitle.toLowerCase().includes(search.toLowerCase()) ||
        a.user.email.toLowerCase().includes(search.toLowerCase())
    )

  return (
    <section className="space-y-6">
      <h1 className="text-xl font-bold">Review Dashboard</h1>
      <div className="flex flex-wrap gap-2 items-center">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search..."
          className="border p-2 rounded flex-1 max-w-md"
        />
        <select
          value={filter}
          onChange={e => setFilter(e.target.value as any)}
          className="border p-2 rounded"
        >
          <option value="needs">Needs review</option>
          <option value="reviewed">Reviewed</option>
          <option value="all">All</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <Table className="min-w-[600px]">
          <TableHeader>
            <TableRow>
              <TableHead>Call</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((app, idx) => (
              <TableRow key={app.id} className={idx % 2 ? 'bg-gray-50' : ''}>
                <TableCell>{app.callTitle}</TableCell>
                <TableCell>
                  {app.user.first_name || app.user.last_name
                    ? `${app.user.first_name ?? ''} ${app.user.last_name ?? ''}`.trim()
                    : '-'}
                </TableCell>
                <TableCell>{app.user.email}</TableCell>
                <TableCell>
                  {app.created_at ? format(new Date(app.created_at), 'yyyy-MM-dd') : '-'}
                </TableCell>
                <TableCell className="text-center">
                  {reviewedIds.includes(app.id) ? 'Reviewed' : 'Needs review'}
                </TableCell>
                <TableCell className="text-center">
                  <Link
                    to={`/reviewer/applications/${app.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}
