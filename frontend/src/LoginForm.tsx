import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { login, storeToken } from './api';
import type { LoginData } from './api';
import { useToast } from './ToastProvider';


const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({ resolver: zodResolver(schema) });
  const { showToast } = useToast();

  const onSubmit = async (data: LoginData) => {
    const res = await login(data);
    storeToken(res.access_token);
    showToast('Logged in!', 'success');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      <h2 className="text-xl font-bold">Login</h2>
      <div>
        <input {...register('email')} placeholder="Email" className="border p-2 w-full" />
        {errors.email && <p className="text-red-600">{errors.email.message}</p>}
      </div>
      <div>
        <input {...register('password')} type="password" placeholder="Password" className="border p-2 w-full" />
        {errors.password && <p className="text-red-600">{errors.password.message}</p>}
      </div>
      <div>
        <select className="border p-2 w-full">
          <option value="">Select role</option>
          <option value="applicant">Applicant</option>
          <option value="reviewer">Reviewer</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <button disabled={isSubmitting} className="bg-green-500 text-white px-4 py-2 rounded">
        Login
      </button>
    </form>
  );
}

export default LoginForm;
