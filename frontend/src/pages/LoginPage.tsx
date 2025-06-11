import LoginForm from '../components/LoginForm'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const navigate = useNavigate()
  return (
    <div className="mt-8">
      <LoginForm onSuccess={(role) => navigate(role === 'admin' ? '/admin/calls' : '/calls')} />
    </div>
  )
}
