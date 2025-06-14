import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { fetchMyApplications, fetchCall, type MyApplication, type Call } from '../../api'
import { useToast } from '../../components/ToastProvider'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '../../components/ui/Table'

interface MyAppWithCall extends MyApplication {
  callTitle?: string
}

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<MyAppWithCall[]>([])
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  useEffect(() => {
    fetchMyApplications()
      .then(async apps => {
        const appsWithCalls = await Promise.all(
          apps.map(async app => {
            let call: Call | null = null
            try {
              call = await fetchCall(app.call_id)
            } catch {
              // ignore - call title will be fallback
            }
            return { ...app, callTitle: call?.title }
          })
        )
        setApplications(appsWithCalls)
      })
      .catch(() => showToast('Failed to load applications', 'error'))
      .finally(() => setLoading(false))
  }, [showToast])

  if (loading) return <p className="p-4">Loading...</p>

  if (applications.length === 0)
    return <p className="p-4">You have no applications yet.</p>

  return (
    <section className="p-4 space-y-4">
      <h1 className="text-xl font-bold">My Applications</h1>
      <Table className="bg-white shadow rounded">
        <TableHeader>
          <TableRow>
            <TableHead>Call</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map(app => (
            <TableRow key={app.id}>
              <TableCell>{app.callTitle ?? `Call #${app.call_id}`}</TableCell>
              <TableCell>{app.status}</TableCell>
              <TableCell>{format(new Date(app.created_at), 'yyyy-MM-dd')}</TableCell>
              <TableCell className="text-right">
                <Link
                  to={`/applicant/${app.call_id}/step1`}
                  className="text-blue-600 hover:underline"
                >
                  {app.status === 'DRAFT' ? 'Continue' : 'View'}
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  )
}

