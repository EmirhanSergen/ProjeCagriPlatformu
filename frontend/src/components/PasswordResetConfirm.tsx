import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { confirmPasswordReset } from '../api';
import { useToast } from './ToastProvider';

const schema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof schema>;

export default function PasswordResetConfirm() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    if (!token) {
      showToast('Invalid reset token', 'error');
      return;
    }

    try {
      await confirmPasswordReset(token, data.newPassword);
      showToast('Password reset successfully!', 'success');
      navigate('/login');
    } catch (error) {
      showToast('Failed to reset password', 'error');
    }
  };

  if (!token) {
    return (
      <div className="text-center mt-8">
        <h2 className="text-xl font-bold text-red-600">Invalid Reset Link</h2>
        <p className="mt-4">
          The password reset link is invalid. Please request a new one.
        </p>
        <button
          onClick={() => navigate('/password-reset')}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Request New Link
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold">Reset Password</h2>
      <p className="text-gray-600">Please enter your new password.</p>

      <div>
        <label htmlFor="newPassword" className="block">
          New Password
          <input
            id="newPassword"
            type="password"
            {...register('newPassword')}
            className="border p-2 w-full rounded"
            placeholder="Enter new password"
          />
        </label>
        {errors.newPassword && (
          <p className="text-red-600 text-sm">{errors.newPassword.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block">
          Confirm Password
          <input
            id="confirmPassword"
            type="password"
            {...register('confirmPassword')}
            className="border p-2 w-full rounded"
            placeholder="Confirm new password"
          />
        </label>
        {errors.confirmPassword && (
          <p className="text-red-600 text-sm">{errors.confirmPassword.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {isSubmitting ? 'Resetting...' : 'Reset Password'}
      </button>
    </form>
  );
}
