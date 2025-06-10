import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerUser } from './api';
import type { RegisterData } from './api';
import { useToast } from './ToastProvider';


const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.string().min(1),
});

function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterData>({ resolver: zodResolver(schema) });
  const { showToast } = useToast();

  const onSubmit = async (data: RegisterData) => {
    await registerUser(data);
    showToast('Registered successfully', 'success');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      <h2 className="text-xl font-bold">Register</h2>
      <div>
        <input {...register('email')} placeholder="Email" className="border p-2 w-full" />
        {errors.email && <p className="text-red-600">{errors.email.message}</p>}
      </div>
      <div>
        <input {...register('password')} type="password" placeholder="Password" className="border p-2 w-full" />
        {errors.password && <p className="text-red-600">{errors.password.message}</p>}
      </div>
      <div>
        <select {...register('role')} className="border p-2 w-full">
          <option value="">Select role</option>
          <option value="applicant">Applicant</option>
          <option value="reviewer">Reviewer</option>
          <option value="admin">Admin</option>
        </select>
        {errors.role && <p className="text-red-600">{errors.role.message}</p>}
      </div>
      <button disabled={isSubmitting} className="bg-blue-500 text-white px-4 py-2 rounded">
        Register
      </button>
    </form>
  );
}

export default RegisterForm;
