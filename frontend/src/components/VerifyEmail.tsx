import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { verifyEmail } from '../api';
import { useToast } from './ToastProvider';

export default function VerifyEmail() {
  const { token } = useParams<{ token: string }>();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Invalid verification link');
      setIsVerifying(false);
      return;
    }

    verifyEmail(token)
      .then(() => {
        showToast('Email verified successfully!', 'success');
        navigate('/login');
      })
      .catch((err) => {
        setError(err.message);
        showToast('Failed to verify email', 'error');
      })
      .finally(() => {
        setIsVerifying(false);
      });
  }, [token, navigate, showToast]);

  if (isVerifying) {
    return (
      <div className="text-center mt-8">
        <h2 className="text-xl font-bold mb-4">Verifying your email...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-8">
        <h2 className="text-xl font-bold mb-4">Verification Failed</h2>
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => navigate('/login')}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return null;
}
