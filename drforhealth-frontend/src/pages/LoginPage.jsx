import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

import { authApi } from '@/api/authApi';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ==========================================================
  // HANDLE INPUT CHANGE
  // ==========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================================
  // HANDLE LOGIN
  // ==========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error('Please enter your email and password.');
      return;
    }

    setLoading(true);

    try {
      // ------------------------------------------------------
      // LOGIN
      // ------------------------------------------------------

      const response = await authApi.login({
        email: form.email,
        password: form.password,
      });

      // ------------------------------------------------------
      // GET USER FROM RESPONSE
      // ------------------------------------------------------

      const user =
        response?.data?.user ||
        response?.data?.data?.user;

      if (!user) {
        throw new Error(
          'User information was not received.'
        );
      }

      // ------------------------------------------------------
      // SUCCESS MESSAGE
      // ------------------------------------------------------

      toast.success('Login successful.');

      // ------------------------------------------------------
      // ROLE-BASED REDIRECT
      // ------------------------------------------------------
      //
      // Admin-side users:
      //
      // super_admin
      // admin
      // content_manager
      //
      // -> /dashboard
      //
      // Normal users:
      //
      // normal_user
      //
      // -> /store
      //
      // ------------------------------------------------------

      const adminRoles = [
        'super_admin',
        'admin',
        'content_manager',
      ];

      if (adminRoles.includes(user.role)) {
        navigate('/dashboard');
      } else {
        navigate('/store');
      }

    } catch (err) {
      console.error(
        '[Login] Error:',
        err
      );

      toast.error(
        err.response?.data?.message ||
          err.message ||
          'Login failed. Please check your credentials.'
      );

    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // GOOGLE LOGIN
  // ==========================================================

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">

      <div className="glass-card w-full max-w-md p-8">

        {/* ==================================================
            TITLE
        =================================================== */}

        <h1 className="font-display text-2xl font-bold mb-1">
          Welcome back
        </h1>

        <p className="text-charcoal/60 text-sm mb-8">
          Log in to access your library.
        </p>


        {/* ==================================================
            GOOGLE LOGIN
        =================================================== */}

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="btn-secondary w-full mb-4"
        >
          Continue with Google
        </button>


        {/* ==================================================
            DIVIDER
        =================================================== */}

        <div className="flex items-center gap-3 mb-6">

          <div className="flex-1 h-px bg-border" />

          <span className="text-xs text-charcoal/40">
            OR
          </span>

          <div className="flex-1 h-px bg-border" />

        </div>


        {/* ==================================================
            LOGIN FORM
        =================================================== */}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* ==================================================
              EMAIL
          =================================================== */}

          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="Email address"
            className="input-field"
            value={form.email}
            onChange={handleChange}
          />


          {/* ==================================================
              PASSWORD
          =================================================== */}

          <div className="relative">

            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              placeholder="Password"
              className="input-field pr-12"
              value={form.password}
              onChange={handleChange}
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword((prev) => !prev)
              }
              className="
                absolute
                right-3
                top-1/2
                -translate-y-1/2
                text-charcoal/50
                hover:text-green-dark
                transition-colors
                p-1
              "
              aria-label={
                showPassword
                  ? 'Hide password'
                  : 'Show password'
              }
              title={
                showPassword
                  ? 'Hide password'
                  : 'Show password'
              }
            >

              {showPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}

            </button>

          </div>


          {/* ==================================================
              FORGOT PASSWORD
          =================================================== */}

          <div className="flex justify-end">

            <Link
              to="/forgot-password"
              className="
                text-sm
                text-green-dark
                font-medium
                hover:underline
              "
            >
              Forgot password?
            </Link>

          </div>


          {/* ==================================================
              LOGIN BUTTON
          =================================================== */}

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >

            {loading ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              'Log In'
            )}

          </Button>

        </form>


        {/* ==================================================
            REGISTER LINK
        =================================================== */}

        <p className="text-center text-sm text-charcoal/60 mt-6">

          Don't have an account?{' '}

          <Link
            to="/register"
            className="
              text-green-dark
              font-medium
              hover:underline
            "
          >
            Sign up
          </Link>

        </p>

      </div>

    </div>
  );
}