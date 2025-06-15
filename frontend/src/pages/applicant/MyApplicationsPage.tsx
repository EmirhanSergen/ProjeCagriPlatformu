import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import {
  fetchMyApplications,
  fetchCall,
  fetchAttachmentsByApplicationId,
  type MyApplication,
  type Call,
  type Attachment,
  fetchDocumentDefinitions,
  type DocumentDefinition,
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
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge' // Badge bileşenini doğru kullanacağız

interface MyAppWithCall extends MyApplication {
  callTitle?: string
  callCategory?: string
  attachmentsCount?: number
  totalDocs?: number
}

const statusColorMap: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-800',
  submitted: 'bg-blue-100 text-blue-800',
  closed: 'bg-gray-200 text-gray-800',
  archived: 'bg-red-100 text-red-800',
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
            let attachments: Attachment[] = []
            let docs: DocumentDefinition[] = []
            try {
              call = await fetchCall(app.call_id)
            } catch {
              // ignore error
            }
            try {
              attachments = await fetchAttachmentsByApplicationId(app.id)
            } catch {
              // ignore error
            }
            try {
              docs = await fetchDocumentDefinitions(app.call_id)
            } catch {
              // ignore error
            }
            return {
              ...app,
              callTitle: call?.title,
              callCategory: call?.category,
              attachmentsCount: attachments.length,
              totalDocs: docs.length,
            }
          })
        )
        setApplications(appsWithCalls)
      })
      .catch(() => showToast('Failed to load applications', 'error'))
      .finally(() => setLoading(false))
  }, [showToast])

  if (loading) return <p className="p-4">Loading...</p>

  return (
    <section className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">My Applications</h1>
        <Link to="/calls">
          <Button>📂 Browse Calls</Button>
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="text-center mt-8 text-gray-600">
          <p className="mb-4">You haven’t started any applications yet.</p>
          <Link to="/calls">
            <Button>Browse Available Calls</Button>
          </Link>
        </div>
      ) : (
        <Table className="bg-white shadow rounded text-sm">
          <TableHeader>
            <TableRow className="text-gray-600 bg-gray-50">
              <TableHead className="py-3 px-4">Call</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead>Files</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map(app => (
              <TableRow key={app.id} className="hover:bg-gray-50 transition-all h-[60px]">
                <TableCell className="font-medium">{app.callTitle ?? `Call #${app.call_id}`}</TableCell>
                <TableCell>{app.callCategory ?? '-'}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      statusColorMap[app.status.toLowerCase()] ||
                      'bg-gray-100 text-gray-800'
                    }
                  >
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1).toLowerCase()}
                  </Badge>
                </TableCell>
                <TableCell>{format(new Date(app.created_at), 'yyyy-MM-dd')}</TableCell>
                <TableCell>{app.updated_at ? format(new Date(app.updated_at), 'yyyy-MM-dd') : '-'}</TableCell>
                <TableCell>
                  {app.attachmentsCount ?? 0}
                  {typeof app.totalDocs === 'number' ? ` / ${app.totalDocs}` : ''}
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    to={`/applicant/${app.call_id}/step1`}
                    className="text-blue-600 hover:underline"
                  >
                    {app.status.toLowerCase() === 'draft' ? 'Continue' : 'View'}
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </section>
  )
}
