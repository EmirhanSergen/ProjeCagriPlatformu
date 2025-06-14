import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../components/AuthProvider'

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    switch (user.role) {
      case 'admin':
        navigate('/admin/calls')
        break
      case 'reviewer':
        navigate('/reviewer/reviews')
        break
      case 'applicant':
        navigate('/calls')
        break
      default:
        navigate('/login')
    }
  }, [user, navigate])

  return (
    <section className="py-20 text-center text-gray-600">
      <p>Redirecting to your dashboard...</p>
    </section>
  )
}