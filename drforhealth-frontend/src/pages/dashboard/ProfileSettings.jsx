import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { Lock, User, Mail, Save } from 'lucide-react';

import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/authApi';

export default function ProfileSettings() {
  const {
    user,
    isAuthenticated,
  } = useAuthStore();

  // ============================================================
  // PROFILE STATE
  // ============================================================

  const [name, setName] = useState('');

  const [profileLoading, setProfileLoading] =
    useState(false);


  // ============================================================
  // PASSWORD STATE
  // ============================================================

  const [currentPassword, setCurrentPassword] =
    useState('');

  const [newPassword, setNewPassword] =
    useState('');

  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [passwordLoading, setPasswordLoading] =
    useState(false);


  // ============================================================
  // LOAD USER DATA
  // ============================================================

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);


  // ============================================================
  // UPDATE PROFILE
  // ============================================================

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      toast.error('Name is required.');
      return;
    }

    if (trimmedName.length < 2) {
      toast.error('Name must be at least 2 characters.');
      return;
    }

    try {
      setProfileLoading(true);

      const response =
        await authApi.updateProfile({
          name: trimmedName,
        });

      // --------------------------------------------------------
      // Update Zustand user state
      // --------------------------------------------------------

      const updatedUser =
        response.data?.user;

      if (updatedUser) {
        useAuthStore.setState({
          user: updatedUser,
        });
      }

      toast.success(
        response.data?.message ||
        'Profile updated successfully.'
      );

    } catch (error) {
      console.error(
        '[Profile] Update error:',
        error
      );

      toast.error(
        error.response?.data?.message ||
        'Failed to update profile.'
      );

    } finally {
      setProfileLoading(false);
    }
  };


  // ============================================================
  // CHANGE PASSWORD
  // ============================================================

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error(
        'Please enter your current password.'
      );
      return;
    }

    if (!newPassword) {
      toast.error(
        'Please enter your new password.'
      );
      return;
    }

    if (newPassword.length < 8) {
      toast.error(
        'New password must be at least 8 characters.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(
        'New password and confirm password do not match.'
      );
      return;
    }

    if (currentPassword === newPassword) {
      toast.error(
        'New password must be different from your current password.'
      );
      return;
    }

    try {
      setPasswordLoading(true);

      const response =
        await authApi.changePassword({
          currentPassword,
          newPassword,
        });

      toast.success(
        response.data?.message ||
        'Password changed successfully.'
      );

      // --------------------------------------------------------
      // Clear password fields
      // --------------------------------------------------------

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

    } catch (error) {
      console.error(
        '[Profile] Password change error:',
        error
      );

      toast.error(
        error.response?.data?.message ||
        'Failed to change password.'
      );

    } finally {
      setPasswordLoading(false);
    }
  };


  // ============================================================
  // AUTH CHECK
  // ============================================================

  if (!isAuthenticated || !user) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-2xl border border-border p-6">
          <h1 className="text-xl font-bold text-charcoal">
            Profile Settings
          </h1>

          <p className="text-charcoal/60 mt-2">
            Please log in to access your profile settings.
          </p>
        </div>
      </div>
    );
  }


  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* ======================================================
          PAGE HEADER
      ======================================================= */}

      <div className="mb-8">

        <h1 className="text-2xl md:text-3xl font-bold text-charcoal">
          Profile Settings
        </h1>

        <p className="text-charcoal/60 mt-2">
          Manage your account information and password.
        </p>

      </div>


      {/* ======================================================
          PROFILE INFORMATION
      ======================================================= */}

      <div className="bg-white rounded-2xl border border-border shadow-sm p-6 mb-6">

        <div className="flex items-center gap-3 mb-6">

          <div className="bg-brand-gradient p-3 rounded-xl">
            <User
              size={22}
              className="text-white"
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-charcoal">
              Profile Information
            </h2>

            <p className="text-sm text-charcoal/60">
              Update your personal information.
            </p>
          </div>

        </div>


        <form onSubmit={handleProfileUpdate}>

          {/* ==================================================
              NAME
          =================================================== */}

          <div className="mb-5">

            <label
              htmlFor="profile-name"
              className="block text-sm font-medium text-charcoal mb-2"
            >
              Full Name
            </label>

            <div className="relative">

              <User
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40"
              />

              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Enter your name"
                className="w-full border border-border rounded-xl pl-10 pr-4 py-3 outline-none focus:border-green-dark focus:ring-2 focus:ring-green-dark/10"
                disabled={profileLoading}
              />

            </div>

          </div>


          {/* ==================================================
              EMAIL
          =================================================== */}

          <div className="mb-6">

            <label
              htmlFor="profile-email"
              className="block text-sm font-medium text-charcoal mb-2"
            >
              Email Address
            </label>

            <div className="relative">

              <Mail
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40"
              />

              <input
                id="profile-email"
                type="email"
                value={user.email || ''}
                disabled
                className="w-full border border-border rounded-xl pl-10 pr-4 py-3 bg-gray-50 text-charcoal/60 cursor-not-allowed"
              />

            </div>

            <p className="text-xs text-charcoal/50 mt-2">
              Email address cannot be changed here.
            </p>

          </div>


          {/* ==================================================
              UPDATE BUTTON
          =================================================== */}

          <button
            type="submit"
            disabled={profileLoading}
            className="btn-primary flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >

            <Save size={17} />

            {profileLoading
              ? 'Updating...'
              : 'Update Profile'}

          </button>

        </form>

      </div>


      {/* ======================================================
          CHANGE PASSWORD
      ======================================================= */}

      <div className="bg-white rounded-2xl border border-border shadow-sm p-6">

        <div className="flex items-center gap-3 mb-6">

          <div className="bg-brand-gradient p-3 rounded-xl">
            <Lock
              size={22}
              className="text-white"
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-charcoal">
              Change Password
            </h2>

            <p className="text-sm text-charcoal/60">
              Change your account password securely.
            </p>
          </div>

        </div>


        <form onSubmit={handlePasswordChange}>

          {/* ==================================================
              CURRENT PASSWORD
          =================================================== */}

          <div className="mb-5">

            <label
              htmlFor="current-password"
              className="block text-sm font-medium text-charcoal mb-2"
            >
              Current Password
            </label>

            <div className="relative">

              <Lock
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40"
              />

              <input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) =>
                  setCurrentPassword(
                    e.target.value
                  )
                }
                placeholder="Enter current password"
                className="w-full border border-border rounded-xl pl-10 pr-4 py-3 outline-none focus:border-green-dark focus:ring-2 focus:ring-green-dark/10"
                disabled={passwordLoading}
              />

            </div>

          </div>


          {/* ==================================================
              NEW PASSWORD
          =================================================== */}

          <div className="mb-5">

            <label
              htmlFor="new-password"
              className="block text-sm font-medium text-charcoal mb-2"
            >
              New Password
            </label>

            <div className="relative">

              <Lock
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40"
              />

              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(
                    e.target.value
                  )
                }
                placeholder="Enter new password"
                className="w-full border border-border rounded-xl pl-10 pr-4 py-3 outline-none focus:border-green-dark focus:ring-2 focus:ring-green-dark/10"
                disabled={passwordLoading}
              />

            </div>

            <p className="text-xs text-charcoal/50 mt-2">
              Password must be at least 8 characters.
            </p>

          </div>


          {/* ==================================================
              CONFIRM PASSWORD
          =================================================== */}

          <div className="mb-6">

            <label
              htmlFor="confirm-password"
              className="block text-sm font-medium text-charcoal mb-2"
            >
              Confirm New Password
            </label>

            <div className="relative">

              <Lock
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40"
              />

              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                placeholder="Confirm new password"
                className="w-full border border-border rounded-xl pl-10 pr-4 py-3 outline-none focus:border-green-dark focus:ring-2 focus:ring-green-dark/10"
                disabled={passwordLoading}
              />

            </div>

          </div>


          {/* ==================================================
              CHANGE PASSWORD BUTTON
          =================================================== */}

          <button
            type="submit"
            disabled={passwordLoading}
            className="btn-primary flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >

            <Lock size={17} />

            {passwordLoading
              ? 'Changing Password...'
              : 'Change Password'}

          </button>

        </form>

      </div>

    </div>
  );
}