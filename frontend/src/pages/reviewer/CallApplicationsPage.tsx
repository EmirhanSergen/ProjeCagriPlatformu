import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchApplications } from '../../api'
import type { ApplicationDetail, User } from '../../api'
import ApplicationCard from '../../components/ApplicationCard'

export default function CallApplicationsPage() {
  const { callId } = useParams<{ callId: string }>()
  const [applications, setApplications] = useState<ApplicationDetail[]>([])
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!callId) return

      const role = localStorage.getItem('role')
      setUserRole(role)

      try {
        const apps = await fetchApplications(Number(callId))

        if (role === 'reviewer') {
          const token = localStorage.getItem('token')
          if (!token) return
          const myId = JSON.parse(atob(token.split('.')[1])).sub
          setApplications(
            apps.filter((app) =>
              app.reviewers?.some((r: User) => r.id == myId)
            )
          )
        } else {
          setApplications(apps)
        }
      } catch {
        console.error('Failed to load applications')
      }
    }

    fetchData()
  }, [callId])

  if (!callId) return <p>No call selected.</p>

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-bold">
        {userRole === 'admin' ? 'All Applications' : 'Assigned Applications'}
      </h1>
      {applications.map((app) => (
        <ApplicationCard key={app.id} application={app} />
      ))}
    </section>
  )
}
