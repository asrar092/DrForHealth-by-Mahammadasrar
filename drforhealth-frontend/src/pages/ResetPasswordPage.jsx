import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token || !email) {
      toast.error('Invalid or expired reset link.');
      return;
    }

    if (!newPassword || !confirmPassword) {
      toast.error('Please enter both password fields.');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);

      const response = await api.post('/auth/reset-password', {
        email,
        token,
        newPassword,
      });

      setSuccess(true);

      toast.success(
        response.data.message ||
          'Password reset successfully.'
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Reset link is invalid or has expired.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Invalid link
  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">

          <div className="text-5xl mb-4">
            ⚠️
          </div>

          <h1 className="text-2xl font-bold text-red-500 mb-3">
            Invalid Reset Link
          </h1>

          <p className="text-gray-600 mb-6">
            This password reset link is invalid or incomplete.
          </p>

          <Link
            to="/forgot-password"
            className="inline-block bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Request New Link
          </Link>

        </div>
      </div>
    );
  }

  // Success
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">

          <div className="text-5xl mb-4">
            ✅
          </div>

          <h1 className="text-2xl font-bold text-green-600 mb-3">
            Password Reset Successful
          </h1>

          <p className="text-gray-600 mb-6">
            Your password has been changed successfully.
            You can now login with your new password.
          </p>

          <button
            onClick={() => navigate('/login')}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Go to Login
          </button>

        </div>
      </div>
    );
  }

  // Reset form
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        <div className="text-center mb-8">

          <div className="text-5xl mb-4">
            🔐
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            Reset Password
          </h1>

          <p className="text-gray-600 mt-2">
            Enter your new password below.
          </p>

        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* New Password */}
          <div>

            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              New Password
            </label>

            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value)
              }
              placeholder="Enter new password"
              autoComplete="new-password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              disabled={loading}
              required
              minLength={8}
            />

          </div>

          {/* Confirm Password */}
          <div>

            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              placeholder="Confirm new password"
              autoComplete="new-password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              disabled={loading}
              required
              minLength={8}
            />

          </div>

          {/* Password requirement */}
          <p className="text-sm text-gray-500">
            Password must be at least 8 characters.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition"
          >
            {loading
              ? 'Resetting Password...'
              : 'Reset Password'}
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

      </div>
    </div>
  );
}