import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { login as apiLogin } from '../api'
import type { LoginData } from '../api'
import { useToast } from './ToastProvider'
import RoleSlider from './RoleSlider'
import type { Role } from './RoleSlider'
import { useAuth } from './AuthProvider'


const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Omit<LoginData, 'role'>>({ resolver: zodResolver(schema) })
  const { showToast } = useToast()
  const [role, setRole] = useState<Role>('applicant')
  const { login } = useAuth()

  const onSubmit = handleSubmit(async (data) => {
    const res = await apiLogin({ ...data, role })
    login(res.access_token, role)
    showToast('Logged in!', 'success')
  })

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h2 className="text-xl font-bold">Login</h2>
      <RoleSlider value={role} onChange={setRole} />
      <div>
        <label htmlFor="login-email" className="block">
          Email
          <input
            id="login-email"
            {...register('email')}
            placeholder="Email"
            className="border p-2 w-full"
          />
        </label>
        {errors.email && <p className="text-red-600">{errors.email.message}</p>}
      </div>
      <div>
        <label htmlFor="login-password" className="block">
          Password
          <input
            id="login-password"
            {...register('password')}
            type="password"
            placeholder="Password"
            className="border p-2 w-full"
          />
        </label>
        {errors.password && <p className="text-red-600">{errors.password.message}</p>}
      </div>
      <button
        disabled={isSubmitting}
        className="bg-green-500 text-white px-4 py-2 rounded mt-4"
      >
        Login
      </button>
    </form>
  )
}

export default LoginForm;
