import { useNavigate } from 'react-router-dom'
import RegisterForm from '../components/RegisterForm'

export default function RegisterPage() {
  const navigate = useNavigate()
  return (
    <section className="w-full bg-gray-50 py-16 px-4">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Create Your Account</h1>
        <RegisterForm onSuccess={() => navigate('/login')} />
      </div>
    </section>
  )
}