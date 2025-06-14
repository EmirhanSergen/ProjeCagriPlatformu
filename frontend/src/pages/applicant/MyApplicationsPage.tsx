import { useParams, useLocation, Link, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { fetchCall, type Call } from '../../api'
import { useToast } from '../../components/ToastProvider'
import { cn } from '../../lib/utils'

const steps = [
  { key: 'step1', path: 'step1', label: 'Call Info' },
  { key: 'step2', path: 'step2', label: 'Upload Documents' },
  { key: 'step3', path: 'step3', label: 'Review' },
  { key: 'step4', path: 'step4', label: 'Submit' },
]

export default function ApplicationLayout() {
  const { callId } = useParams()
  const location = useLocation()
  const [call, setCall] = useState<Call | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    if (!callId) return
    fetchCall(Number(callId))
      .then(setCall)
      .catch(() => showToast('Failed to load call info', 'error'))
  }, [callId, showToast])

  if (!call) return <p className="p-4">Loading...</p>

  return (
    <div className="flex min-h-[80vh]">
      <aside className="w-64 p-4 border-r bg-gray-50">
        <h2 className="text-lg font-semibold mb-4">Application Steps</h2>
        <nav className="space-y-2">
          {steps.map((step) => (
            <Link
              key={step.key}
              to={`/applicant/${callId}/${step.path}`}
              className={cn(
                'block px-3 py-2 rounded text-sm hover:bg-blue-100',
                location.pathname.includes(step.path)
                  ? 'bg-blue-100 font-medium text-blue-800'
                  : 'text-gray-700'
              )}
            >
              {step.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}
