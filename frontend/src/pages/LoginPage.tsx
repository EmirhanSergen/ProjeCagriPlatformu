import LoginForm from '../components/LoginForm'
import { useNavigate, useParams } from 'react-router-dom'
import type { Role } from '../components/RoleSlider'

export default function LoginPage() {
  const navigate = useNavigate()
  const { role } = useParams<{ role: Role }>()

  return (
    <section className="w-full bg-gray-50 py-16 px-4">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Welcome Back</h1>
        {role && (
          <p className="text-center mb-4 capitalize text-gray-700">Role: {role}</p>
        )}
        {role && (
          <LoginForm
            role={role}
            onSuccess={() => navigate(role === 'admin' ? '/admin/calls' : '/calls')}
          />
        )}
      </div>
    </section>
  )
}
