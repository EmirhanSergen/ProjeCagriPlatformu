// src/components/LoginForm.tsx
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
  email:    z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password cannot be empty'),
})

interface Props {
  onSuccess?: (role: Role) => void
}

export default function LoginForm({ onSuccess }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Omit<LoginData, 'role'>>({ resolver: zodResolver(schema) })
  const { showToast } = useToast()
  const [role, setRole] = useState<Role>('applicant')
  const { login } = useAuth()

  const onSubmit = handleSubmit(async (data) => {
    try {
      const res = await apiLogin({ ...data, role })
      login(res.access_token, role)
      showToast('Logged in successfully!', 'success')
      onSuccess?.(role)
    } catch (err: any) {
      let message: string
      if (err instanceof TypeError) {
        message = 'Cannot reach server. Please check your network or try again later.'
      } else if (err instanceof Error) {
        message = 'Invalid credentials or wrong role selected'
      } else {
        message = 'Something went wrong. Please try again.'
      }
      showToast(message, 'error')
    }
  })

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-center">Welcome Back</h2>
      <p className="text-center text-lg">Login</p>

      <RoleSlider value={role} onChange={setRole} />

      <div>
        <label htmlFor="login-email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          {...register('email')}
          disabled={isSubmitting}
          placeholder="you@example.com"
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm px-4 py-3 h-12 focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="login-password"
          type="password"
          {...register('password')}
          disabled={isSubmitting}
          placeholder="Enter your password"
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm px-4 py-3 h-12 focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-3 px-4 bg-green-500 text-white font-semibold rounded-md shadow hover:bg-green-600 disabled:opacity-50"
      >
        {isSubmitting ? 'Logging in…' : 'Login'}
      </button>

      <p className="text-center text-sm text-gray-600">
        <a href="/password-reset" className="text-blue-500 hover:underline">
          Forgot your password?
        </a>
      </p>
    </form>
  )
}
