import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchApplications } from '../../api'
import type { ApplicationDetail, User } from '../../api'
import ApplicationCard from '../../components/ApplicationCard'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'

export default function CallApplicationsPage() {
  const { callId } = useParams<{ callId: string }>()
  const [applications, setApplications] = useState<ApplicationDetail[]>([])
  const [filtered, setFiltered] = useState<ApplicationDetail[]>([])
  const [userRole, setUserRole] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'newest' | 'unassigned' | 'confirmed'>('newest')
  const [search, setSearch] = useState('')

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
          const filtered = apps.filter((app) =>
            app.reviewers?.some((r: User) => r.id == myId)
          )
          setApplications(filtered)
          setFiltered(filtered)
        } else {
          setApplications(apps)
          setFiltered(apps)
        }
      } catch {
        console.error('Failed to load applications')
      }
    }
    fetchData()
  }, [callId])

  useEffect(() => {
    const lower = search.toLowerCase()
    const filteredList = applications.filter((app) =>
      app.user.email.toLowerCase().includes(lower) ||
      app.user?.first_name?.toLowerCase().includes(lower) ||
      app.user?.last_name?.toLowerCase().includes(lower) ||
      app.user?.organization?.toLowerCase().includes(lower)
    )
    setFiltered(filteredList)
  }, [search, applications])

  const total = applications.length
  const unassigned = applications.filter(app => (app.reviewers?.length || 0) === 0).length

  const sortedApps = [...filtered].sort((a, b) => {
    if (sortBy === 'newest') return b.id - a.id
    if (sortBy === 'unassigned') return (a.reviewers?.length || 0) - (b.reviewers?.length || 0)
    if (sortBy === 'confirmed') {
      const aConfirmed = a.attachments?.filter(x => x.is_confirmed).length || 0
      const bConfirmed = b.attachments?.filter(x => x.is_confirmed).length || 0
      return bConfirmed - aConfirmed
    }
    return 0
  })

  return (
    <section className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-2xl font-bold">
          {userRole === 'admin' ? 'All Applications' : 'Assigned Applications'}
        </h1>
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-700">
            🗂️ Total: <strong>{total}</strong> | 👤 Unassigned: <strong>{unassigned}</strong>
          </p>
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
            <option value="newest">Sort: Newest</option>
            <option value="unassigned">Unassigned First</option>
            <option value="confirmed">Most Confirmed</option>
          </Select>
        </div>
      </div>

      <Input
        placeholder="Search by email, name or organization..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md"
      />

      {sortedApps.length > 0 ? (
        sortedApps.map((app) => (
          <ApplicationCard key={app.id} application={app} />
        ))
      ) : (
        <p className="text-gray-500 italic">No matching applications.</p>
      )}
    </section>
  )
}
