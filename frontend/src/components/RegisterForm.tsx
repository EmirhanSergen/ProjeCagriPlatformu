import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerUser } from '../api';
import type { RegisterData } from '../api';
import { useToast } from './ToastProvider';


const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.string().min(1),
});

interface Props {
  onSuccess?: () => void
}

function RegisterForm({ onSuccess }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterData>({ resolver: zodResolver(schema) });
  const { showToast } = useToast();
  const [isRegistered, setIsRegistered] = useState(false);

  const onSubmit = async (data: RegisterData) => {
    try {
      await registerUser(data);
      setIsRegistered(true);
      showToast('Registration successful!', 'success');
    } catch (error) {
      showToast('Registration failed', 'error');
    }
  }
  if (isRegistered) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-xl font-bold text-green-600">Registration Successful!</h2>
        <p>Please check your email to verify your account.</p>
        <p>After verification, you can <a href="/login" className="text-blue-500 hover:underline">log in</a>.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h2 className="text-xl font-bold">Register</h2>
      <div>
        <label htmlFor="register-email" className="block">
          Email
          <input
            id="register-email"
            {...register('email')}
            type="email"
            placeholder="Email"
            className="border p-2 w-full rounded"
          />
        </label>
        {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
      </div>
      <div>
        <label htmlFor="register-password" className="block">
          Password
          <input
            id="register-password"
            {...register('password')}
            type="password"
            placeholder="Password (minimum 6 characters)"
            className="border p-2 w-full rounded"
          />
        </label>
        {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}
      </div>
      <div>
        <label htmlFor="register-role" className="block">
          Role
          <select
            id="register-role"
            {...register('role')}
            className="border p-2 w-full rounded"
          >
            <option value="">Select role</option>
            <option value="applicant">Applicant</option>
            <option value="reviewer">Reviewer</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        {errors.role && <p className="text-red-600 text-sm">{errors.role.message}</p>}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {isSubmitting ? 'Registering...' : 'Register'}
      </button>
      <p className="text-center text-gray-600">
        Already have an account?{' '}
        <a href="/login" className="text-blue-500 hover:underline">
          Log in
        </a>
      </p>
    </form>
  );
}

export default RegisterForm;
