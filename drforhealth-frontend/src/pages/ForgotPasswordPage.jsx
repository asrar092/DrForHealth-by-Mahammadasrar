import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Please enter your email address.');
      return;
    }

    try {
      setLoading(true);

      const response = await api.post('/auth/forgot-password', {
        email: email.trim(),
      });

      setSubmitted(true);

      toast.success(
        response.data.message ||
          'If that email exists, a reset link has been sent.'
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        {!submitted ? (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">
                Forgot Password?
              </h1>

              <p className="text-gray-600 mt-2">
                Enter your email address and we'll send you a
                password reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  autoComplete="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  disabled={loading}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition"
              >
                {loading
                  ? 'Sending...'
                  : 'Send Reset Link'}
              </button>

            </form>

            <div className="text-center mt-6">
              <Link
                to="/login"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                ← Back to Login
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center">

            <div className="text-5xl mb-4">
              📧
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Check Your Email
            </h1>

            <p className="text-gray-600 mb-2">
              If an account exists with:
            </p>

            <p className="font-semibold text-gray-900 mb-4">
              {email}
            </p>

            <p className="text-gray-600 mb-6">
              A password reset link has been sent.
              Please check your inbox and spam folder.
            </p>

            <Link
              to="/login"
              className="inline-block bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Back to Login
            </Link>

          </div>
        )}

      </div>
    </div>
  );
}