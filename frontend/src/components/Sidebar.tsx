import { Link, useParams } from 'react-router-dom'

const steps = [
  { path: 'step1', label: 'Call Info' },
  { path: 'step2', label: 'Upload Files' },
  { path: 'step3', label: 'Review' },
  { path: 'step4', label: 'Submit' },
]

export default function Sidebar() {
  const { callId } = useParams()

  return (
    <nav className="w-48 flex-shrink-0 space-y-2">
      {steps.map((step, idx) => (
        <Link
          key={step.path}
          to={`/applicant/${callId}/${step.path}`}
          className="block px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 text-sm font-medium"
        >
          {idx + 1}. {step.label}
        </Link>
      ))}
    </nav>
  )
}
