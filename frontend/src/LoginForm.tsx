import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { login, storeToken } from './api';
import type { LoginData } from './api';
import { useToast } from './ToastProvider';
import RoleSlider from './RoleSlider';
import type { Role } from './RoleSlider';


const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Omit<LoginData, 'role'>>({ resolver: zodResolver(schema) });
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [credentials, setCredentials] = useState<Omit<LoginData, 'role'>>({ email: '', password: '' });
  const [role, setRole] = useState<Role>('applicant');

  const onSubmitCredentials = handleSubmit((data) => {
    setCredentials(data);
    setStep(2);
  });

  const submitLogin = async () => {
    const res = await login({ ...credentials, role });
    storeToken(res.access_token);
    showToast('Logged in!', 'success');
    setStep(1);
  };

  return step === 1 ? (
    <form onSubmit={onSubmitCredentials} className="space-y-2">
      <h2 className="text-xl font-bold">Login</h2>
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
      <button disabled={isSubmitting} className="bg-green-500 text-white px-4 py-2 rounded">
        Next
      </button>
    </form>
  ) : (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Select Role</h2>
      <RoleSlider value={role} onChange={setRole} />
      <div className="flex space-x-2">
        <button onClick={() => setStep(1)} className="border px-4 py-2 rounded">Back</button>
        <button onClick={submitLogin} disabled={isSubmitting} className="bg-green-500 text-white px-4 py-2 rounded flex-grow">
          Login
        </button>
      </div>
    </div>
  );
}

export default LoginForm;
