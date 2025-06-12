import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { requestPasswordReset } from '../api';
import { useToast } from './ToastProvider';

const schema = z.object({
  email: z.string().email(),
});

type FormValues = z.infer<typeof schema>;

export default function PasswordResetRequest() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const { showToast } = useToast();

  const onSubmit = async (data: FormValues) => {
    try {
      await requestPasswordReset(data.email);
      showToast(
        'If an account exists with this email, you will receive password reset instructions.',
        'success'
      );
    } catch (error) {
      showToast('Something went wrong', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold">Reset Password</h2>
      <p className="text-gray-600">
        Enter your email address and we'll send you instructions to reset your password.
      </p>
      
      <div>
        <label htmlFor="email" className="block">
          Email
          <input
            id="email"
            type="email"
            {...register('email')}
            className="border p-2 w-full rounded"
            placeholder="Enter your email"
          />
        </label>
        {errors.email && (
          <p className="text-red-600 text-sm">{errors.email.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {isSubmitting ? 'Sending...' : 'Send Reset Instructions'}
      </button>

      <p className="text-center text-gray-600">
        Remember your password?{' '}
        <a href="/login" className="text-blue-500 hover:underline">
          Log in
        </a>
      </p>
    </form>
  );
}
