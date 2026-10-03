import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';

import { authApi } from '@/api/authApi';
import Button from '@/components/ui/Button';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    agreeToTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ==========================================================
  // HANDLE INPUT CHANGE
  // ==========================================================

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : value,
    }));
  };

  // ==========================================================
  // HANDLE FORM SUBMIT
  // ==========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // --------------------------------------------------------
    // CHECK TERMS & PRIVACY POLICY
    // --------------------------------------------------------

    if (form.agreeToTerms !== true) {
      toast.error(
        'Please agree to the Terms & Conditions and Privacy Policy.'
      );
      return;
    }

    // --------------------------------------------------------
    // CHECK PASSWORD
    // --------------------------------------------------------

    if (form.password.length < 8) {
      toast.error(
        'Password must be at least 8 characters.'
      );
      return;
    }

    setLoading(true);

    try {
      // ------------------------------------------------------
      // SEND REGISTRATION DATA
      // ------------------------------------------------------

      await authApi.register({
        name: form.name,
        email: form.email,
        password: form.password,
        agreeToTerms: form.agreeToTerms,
      });

      toast.success(
        'Check your email to verify your account.'
      );

      navigate('/login');

    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Registration failed.'
      );

    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // GOOGLE SIGNUP
  // ==========================================================

  const handleGoogleSignup = (e) => {
    if (form.agreeToTerms !== true) {
      e.preventDefault();

      toast.error(
        'Please agree to the Terms & Conditions and Privacy Policy first.'
      );
    }
  };

  // ==========================================================
  // TOGGLE PASSWORD VISIBILITY
  // ==========================================================

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">

      <div className="glass-card w-full max-w-md p-8">

        {/* ==================================================
            TITLE
        =================================================== */}

        <h1 className="font-display text-2xl font-bold mb-1">
          Create your account
        </h1>

        <p className="text-charcoal/60 text-sm mb-8">
          Start reading in minutes.
        </p>


        {/* ==================================================
            GOOGLE SIGNUP
        =================================================== */}

        <a
          href="/api/auth/google"
          onClick={handleGoogleSignup}
          className="btn-secondary w-full mb-4"
        >
          Continue with Google
        </a>


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
            REGISTRATION FORM
        =================================================== */}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* ==================================================
              FULL NAME
          =================================================== */}

          <input
            name="name"
            type="text"
            required
            placeholder="Full name"
            className="input-field"
            value={form.name}
            onChange={handleChange}
          />


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
              type={
                showPassword
                  ? 'text'
                  : 'password'
              }
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Password (min. 8 characters)"
              className="input-field pr-12"
              value={form.password}
              onChange={handleChange}
            />

            {/* ------------------------------------------------
                SHOW / HIDE PASSWORD BUTTON
            ------------------------------------------------- */}

            <button
              type="button"
              onClick={togglePasswordVisibility}
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
              TERMS & PRIVACY CHECKBOX
          =================================================== */}

          <div className="flex items-start gap-3 pt-2">

            <input
              id="agreeToTerms"
              name="agreeToTerms"
              type="checkbox"
              checked={form.agreeToTerms}
              onChange={handleChange}
              className="
                mt-1
                h-4
                w-4
                shrink-0
                cursor-pointer
                accent-green
              "
            />

            <label
              htmlFor="agreeToTerms"
              className="
                text-sm
                text-charcoal/70
                leading-relaxed
                cursor-pointer
              "
            >

              I agree to the DrForHealth{' '}

              <Link
                to="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="
                  text-green-dark
                  font-medium
                  hover:underline
                "
              >
                Terms & Conditions
              </Link>

              {' '}and{' '}

              <Link
                to="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="
                  text-green-dark
                  font-medium
                  hover:underline
                "
              >
                Privacy Policy
              </Link>

              .

            </label>

          </div>


          {/* ==================================================
              CREATE ACCOUNT BUTTON
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
              'Create Account'
            )}

          </Button>

        </form>


        {/* ==================================================
            LOGIN LINK
        =================================================== */}

        <p className="text-center text-sm text-charcoal/60 mt-6">

          Already have an account?{' '}

          <Link
            to="/login"
            className="
              text-green-dark
              font-medium
              hover:underline
            "
          >
            Log in
          </Link>

        </p>

      </div>

    </div>
  );
}