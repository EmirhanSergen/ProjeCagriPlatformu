import { useForm } from 'react-hook-form'
import { useToast } from './ToastProvider'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerUser } from '../api'
import type { RegisterData } from '../api'
import { z } from 'zod'
import { Link } from 'react-router-dom'

// Validation schema
const schema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role:     z.enum(['applicant', 'reviewer', 'admin']),
})

interface Props { onSuccess?: () => void }
export default function RegisterForm({ onSuccess }: Props) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<RegisterData>({ resolver: zodResolver(schema) })
  const { showToast } = useToast()

  const onSubmit = async (data: RegisterData) => {
    try {
      await registerUser(data)
      showToast('Registration successful! Check your email to verify.', 'success')
      onSuccess?.()
    } catch {
      showToast('Registration failed. Please try again.', 'error')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          disabled={isSubmitting}
          placeholder="you@example.com"
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm px-4 py-3 h-12 focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          {...register('password')}
          disabled={isSubmitting}
          placeholder="Minimum 6 characters"
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm px-4 py-3 h-12 focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
      </div>

      {/* Role */}
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
          Role
        </label>
        <select
          id="role"
          {...register('role')}
          disabled={isSubmitting}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm px-4 py-3 h-12 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select role</option>
          <option value="applicant">Applicant</option>
          <option value="reviewer">Reviewer</option>
          <option value="admin">Administrator</option>
        </select>
        {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 px-4 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Registering…' : 'Register'}
      </button>

      {/* Login Link */}
      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 hover:underline">Log in</Link>
      </p>
    </form>
  )
}