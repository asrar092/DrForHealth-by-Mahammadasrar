import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  // Prevent React StrictMode from sending the verification request twice
  const verificationStarted = useRef(false);

  useEffect(() => {
    if (verificationStarted.current) {
      return;
    }

    verificationStarted.current = true;

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      setStatus('error');
      setMessage('Invalid verification link.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await api.get('/auth/verify-email', {
          params: {
            token,
            email,
          },
        });

        setStatus('success');

        setMessage(
          response.data?.message ||
            'Email verified successfully.'
        );
      } catch (error) {
        console.error('Email verification error:', error);

        setStatus('error');

        setMessage(
          error.response?.data?.message ||
            'Verification link is invalid or expired.'
        );
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">

        {/* VERIFYING */}
        {status === 'verifying' && (
          <>
            <h1 className="text-2xl font-bold mb-3">
              Verifying your email...
            </h1>

            <p className="text-gray-600">
              Please wait while we verify your email address.
            </p>
          </>
        )}

        {/* SUCCESS */}
        {status === 'success' && (
          <>
            <h1 className="text-2xl font-bold text-green-600 mb-3">
              Email Verified! ✅
            </h1>

            <p className="text-gray-600 mb-6">
              {message}
            </p>

            <Link
              to="/login"
              className="inline-block bg-green-500 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Go to Login
            </Link>
          </>
        )}

        {/* ERROR */}
        {status === 'error' && (
          <>
            <h1 className="text-2xl font-bold text-red-500 mb-3">
              Verification Failed
            </h1>

            <p className="text-gray-600 mb-6">
              {message}
            </p>

            <Link
              to="/register"
              className="inline-block bg-green-500 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Back to Register
            </Link>
          </>
        )}

      </div>
    </div>
  );
}