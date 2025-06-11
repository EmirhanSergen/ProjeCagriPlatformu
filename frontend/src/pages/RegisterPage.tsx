import RegisterForm from '../components/RegisterForm'
import { useNavigate } from 'react-router-dom'

export default function RegisterPage() {
  const navigate = useNavigate()
  return (
    <div className="mt-8">
      <RegisterForm onSuccess={() => navigate('/login')} />
    </div>
  )
}
