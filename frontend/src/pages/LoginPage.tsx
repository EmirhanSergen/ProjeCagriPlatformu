import LoginForm from '../components/LoginForm'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const navigate = useNavigate()

  return (
    <section className="w-full bg-gray-50 py-16 px-4">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Welcome Back</h1>
        <LoginForm onSuccess={(role) => navigate(role === 'admin' ? '/admin/calls' : '/calls')} />
      </div>
    </section>
  )
}
