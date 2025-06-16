import { useForm } from 'react-hook-form'
import { useToast } from './ToastProvider'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerUser } from '../api'
import type { RegisterData } from '../api'
import type { Role } from './RoleSlider'
import { z } from 'zod'
import { Link } from 'react-router-dom'

// Validation schema
const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  organization: z.string().min(1, 'Organization is required'),
})


interface Props {
  role: Role
  onSuccess?: () => void
}

export default function RegisterForm({ role, onSuccess }: Props) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<Omit<RegisterData, 'role'>>({ resolver: zodResolver(schema) })
  const { showToast } = useToast()

  const onSubmit = async (data: Omit<RegisterData, 'role'>) => {
    try {
      await registerUser({ ...data, role })
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
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <input
          id="email"
          type="email"
          {...register('email')}
          disabled={isSubmitting}
          className="mt-1 block w-full border rounded px-4 py-3"
        />
        {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
        <input
          id="password"
          type="password"
          {...register('password')}
          disabled={isSubmitting}
          className="mt-1 block w-full border rounded px-4 py-3"
        />
        {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
      </div>

      {/* First Name */}
      <div>
        <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">First Name</label>
        <input
          id="first_name"
          {...register('first_name')}
          disabled={isSubmitting}
          className="mt-1 block w-full border rounded px-4 py-3"
        />
        {errors.first_name && (
          <p className="text-sm text-red-600">{errors.first_name.message}</p>
        )}
      </div>

      {/* Last Name */}
      <div>
        <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Last Name</label>
        <input
          id="last_name"
          {...register('last_name')}
          disabled={isSubmitting}
          className="mt-1 block w-full border rounded px-4 py-3"
        />
        {errors.last_name && (
          <p className="text-sm text-red-600">{errors.last_name.message}</p>
        )}
      </div>

      {/* Organization */}
      <div>
        <label htmlFor="organization" className="block text-sm font-medium text-gray-700">Organization</label>
        <input
          id="organization"
          {...register('organization')}
          disabled={isSubmitting}
          className="mt-1 block w-full border rounded px-4 py-3"
        />
        {errors.organization && <p className="text-sm text-red-600">{errors.organization.message}</p>}
      </div>


      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
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
