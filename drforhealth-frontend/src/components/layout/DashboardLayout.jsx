import { Outlet, NavLink } from 'react-router-dom';

import {
  LayoutDashboard,
  Library,
  Package,
  Download,
  User,
  LogOut,
  Settings,
  FileText,
} from 'lucide-react';

import Navbar from './Navbar';
import { useAuthStore } from '@/store/authStore';


// ============================================================
// NORMAL DASHBOARD NAVIGATION
// ============================================================

const navItems = [
  {
    to: '/dashboard',
    label: 'Overview',
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: '/dashboard/library',
    label: 'My Library',
    icon: Library,
  },
  {
    to: '/dashboard/orders',
    label: 'Order History',
    icon: Package,
  },
  {
    to: '/dashboard/downloads',
    label: 'Download History',
    icon: Download,
  },
  {
    to: '/dashboard/profile',
    label: 'Profile Settings',
    icon: User,
  },
];


// ============================================================
// DASHBOARD LAYOUT
// ============================================================

export default function DashboardLayout() {

  const {
    user,
    logout,
  } = useAuthStore();


  // ==========================================================
  // CONTENT MANAGEMENT PERMISSION
  // ==========================================================

  const canManageContent =
    user?.role === 'content_manager' ||
    user?.role === 'super_admin';


  return (
    <div className="min-h-screen flex flex-col bg-surface">

      {/* ======================================================
          TOP NAVBAR
      ====================================================== */}

      <Navbar />


      {/* ======================================================
          DASHBOARD CONTENT
      ====================================================== */}

      <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">


        {/* ====================================================
            SIDEBAR
        ==================================================== */}

        <aside className="glass-card p-4 h-fit md:sticky md:top-24">

          <nav className="flex flex-col gap-1">


            {/* =================================================
                NORMAL DASHBOARD LINKS
            ================================================= */}

            {navItems.map(
              ({
                to,
                label,
                icon: Icon,
                end,
              }) => (

                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-gradient text-white'
                        : 'text-charcoal/70 hover:bg-black/5'
                    }`
                  }
                >

                  <Icon size={18} />

                  {label}

                </NavLink>

              )
            )}


            {/* =================================================
                CONTENT MANAGER
                ONLY:
                - content_manager
                - super_admin
            ================================================= */}

            {canManageContent && (

              <NavLink
                to="/dashboard/content"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-gradient text-white'
                      : 'text-charcoal/70 hover:bg-black/5'
                  }`
                }
              >

                <Settings size={18} />

                Content Manager

              </NavLink>

            )}


            {/* =================================================
                BLOG MANAGEMENT
                ONLY:
                - content_manager
                - super_admin
            ================================================= */}

            {canManageContent && (

              <NavLink
                to="/dashboard/blog"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-gradient text-white'
                      : 'text-charcoal/70 hover:bg-black/5'
                  }`
                }
              >

                <FileText size={18} />

                Blog Management

              </NavLink>

            )}


            {/* =================================================
                LOGOUT
            ================================================= */}

            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-danger hover:bg-danger/10 mt-2"
            >

              <LogOut size={18} />

              Log out

            </button>

          </nav>

        </aside>


        {/* ====================================================
            MAIN CONTENT
        ==================================================== */}

        <main>
          <Outlet />
        </main>

      </div>

    </div>
  );
}