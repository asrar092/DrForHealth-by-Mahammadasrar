import { useState } from 'react';
import {
  Link,
  NavLink,
  useNavigate,
  useLocation,
} from 'react-router-dom';

import {
  Menu,
  X,
  User,
  LogOut,
  Heart,
} from 'lucide-react';

import { useAuthStore } from '@/store/authStore';


// ============================================================
// MAIN NAVIGATION LINKS
// ============================================================

const links = [
  {
    to: '/store',
    label: 'eBooks',
  },
  {
    to: '/blog',
    label: 'Blog',
  },
  {
    to: '/about',
    label: 'About',
  },
  {
    to: '/contact',
    label: 'Contact',
  },
];


// ============================================================
// NAVBAR
// ============================================================

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const {
    user,
    isAuthenticated,
    logout,
  } = useAuthStore();


  // ============================================================
  // LOGIN PAGE CHECK
  // ============================================================

  const isLoginPage =
    location.pathname === '/login';


  // ============================================================
  // CLOSE MOBILE MENU
  // ============================================================

  const closeMenu = () => {
    setOpen(false);
  };


  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      setOpen(false);

      navigate('/login', {
        replace: true,
      });
    }
  };


  // ============================================================
  // WISHLIST CLICK
  // ============================================================

  const handleWishlist = () => {
    closeMenu();
    navigate('/wishlist');
  };


  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-glass border-b border-border">

      {/* ========================================================
          MAIN NAVBAR
      ========================================================= */}

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">


        {/* ======================================================
            LOGO
        ======================================================= */}

        <Link
          to="/"
          onClick={closeMenu}
          className="flex items-center"
        >
          <img
            src="/drforhealth-logo.png"
            alt="Dr For Health"
            className="h-14 sm:h-16 md:h-[68px] w-auto object-contain"
          />
        </Link>


        {/* ======================================================
            DESKTOP CENTER MENU
            Hidden on Login page
        ======================================================= */}

        {!isLoginPage && (
          <div className="hidden md:flex items-center gap-8">

            {/* Main Links */}

            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-green-dark'
                      : 'text-charcoal/70 hover:text-green-dark'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}


            {/* ==================================================
                DASHBOARD
                ONLY FOR LOGGED-IN USER
            ================================================== */}

            {isAuthenticated && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-green-dark'
                      : 'text-charcoal/70 hover:text-green-dark'
                  }`
                }
              >
                Dashboard
              </NavLink>
            )}

          </div>
        )}


        {/* ======================================================
            DESKTOP RIGHT SIDE
        ======================================================= */}

        <div className="hidden md:flex items-center gap-3">


          {/* ====================================================
              LOGIN PAGE
              Login + Get Started
          ==================================================== */}

          {isLoginPage ? (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-green-dark"
              >
                Log in
              </Link>

              <Link
                to="/register"
                className="btn-primary !py-2 !px-5 text-sm"
              >
                Get Started
              </Link>
            </>
          ) : isAuthenticated ? (

            <>
              {/* =================================================
                  WISHLIST HEART
                  Dashboard ke baad
              ================================================= */}

              <button
                type="button"
                onClick={handleWishlist}
                className={`p-2 transition-colors ${
                  location.pathname === '/wishlist'
                    ? 'text-red-500'
                    : 'text-charcoal/60 hover:text-red-500'
                }`}
                aria-label="Wishlist"
                title="Wishlist"
              >
                <Heart
                  size={20}
                  className={
                    location.pathname === '/wishlist'
                      ? 'fill-current'
                      : ''
                  }
                />
              </button>


              {/* =================================================
                  USER NAME
                  Heart ke baad
                  Click → Dashboard
              ================================================= */}

              <Link
                to="/dashboard"
                className="btn-secondary !py-2 !px-4 text-sm flex items-center gap-2"
              >
                <User size={16} />

                <span>
                  {user?.name?.split(' ')[0] ||
                    'Dashboard'}
                </span>
              </Link>


              {/* =================================================
                  LOGOUT ICON
                  User name ke baad
              ================================================= */}

              <button
                type="button"
                onClick={handleLogout}
                className="p-2 text-charcoal/50 hover:text-danger transition-colors"
                aria-label="Log out"
                title="Log out"
              >
                <LogOut size={18} />
              </button>

            </>

          ) : (

            <>
              {/* =================================================
                  LOGGED-OUT USER
              ================================================= */}

              <Link
                to="/login"
                className="text-sm font-medium text-charcoal/70 hover:text-green-dark"
              >
                Log in
              </Link>

              <Link
                to="/register"
                className="btn-primary !py-2 !px-5 text-sm"
              >
                Get Started
              </Link>
            </>

          )}

        </div>


        {/* ======================================================
            MOBILE RIGHT SIDE
        ======================================================= */}

        <div className="flex md:hidden items-center gap-2">


          {/* ====================================================
              LOGIN PAGE MOBILE
          ==================================================== */}

          {isLoginPage ? (

            <>
              <Link
                to="/login"
                className="text-xs sm:text-sm font-medium text-green-dark"
              >
                Log in
              </Link>

              <Link
                to="/register"
                className="btn-primary !py-2 !px-3 text-xs sm:text-sm"
              >
                Get Started
              </Link>
            </>

          ) : (

            <>
              {/* =================================================
                  MOBILE WISHLIST
                  Always visible when logged in
              ================================================= */}

              {isAuthenticated && (
                <button
                  type="button"
                  onClick={handleWishlist}
                  className={`p-2 transition-colors ${
                    location.pathname === '/wishlist'
                      ? 'text-red-500'
                      : 'text-charcoal/60 hover:text-red-500'
                  }`}
                  aria-label="Wishlist"
                  title="Wishlist"
                >
                  <Heart
                    size={20}
                    className={
                      location.pathname === '/wishlist'
                        ? 'fill-current'
                        : ''
                    }
                  />
                </button>
              )}


              {/* =================================================
                  HAMBURGER
              ================================================= */}

              <button
                type="button"
                onClick={() =>
                  setOpen((prev) => !prev)
                }
                aria-label="Toggle menu"
                aria-expanded={open}
                className="p-2"
              >
                {open ? (
                  <X size={22} />
                ) : (
                  <Menu size={22} />
                )}
              </button>

            </>

          )}

        </div>

      </nav>


      {/* ========================================================
          MOBILE DROPDOWN MENU
          Not shown on Login page
      ========================================================= */}

      {!isLoginPage && open && (

        <div className="md:hidden bg-white border-t border-border px-6 py-5 flex flex-col gap-4">


          {/* ====================================================
              MAIN NAVIGATION LINKS
          ==================================================== */}

          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={closeMenu}
              className={({ isActive }) =>
                `text-sm font-medium py-1 ${
                  isActive
                    ? 'text-green-dark'
                    : 'text-charcoal/70 hover:text-green-dark'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}


          {/* ====================================================
              DASHBOARD
          ==================================================== */}

          {isAuthenticated && (
            <NavLink
              to="/dashboard"
              onClick={closeMenu}
              className={({ isActive }) =>
                `text-sm font-medium py-1 ${
                  isActive
                    ? 'text-green-dark'
                    : 'text-charcoal/70 hover:text-green-dark'
                }`
              }
            >
              Dashboard
            </NavLink>
          )}


          {/* Divider */}

          <div className="h-px bg-border" />


          {/* ====================================================
              LOGGED-IN MOBILE OPTIONS
          ==================================================== */}

          {isAuthenticated ? (

            <>
              {/* User */}

              <Link
                to="/dashboard"
                onClick={closeMenu}
                className="btn-primary text-sm justify-center flex items-center gap-2"
              >
                <User size={16} />

                {user?.name?.split(' ')[0] ||
                  'Dashboard'}
              </Link>


              {/* Wishlist */}

              <button
                type="button"
                onClick={handleWishlist}
                className="flex items-center gap-2 text-sm text-charcoal/70 py-2"
              >
                <Heart size={17} />

                Wishlist
              </button>


              {/* Logout */}

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-danger py-2"
              >
                <LogOut size={16} />

                Log out
              </button>

            </>

          ) : (

            <>
              {/* =================================================
                  LOGGED-OUT MOBILE
              ================================================= */}

              <Link
                to="/login"
                onClick={closeMenu}
                className="text-sm font-medium text-charcoal/70"
              >
                Log in
              </Link>

              <Link
                to="/register"
                onClick={closeMenu}
                className="btn-primary text-sm justify-center"
              >
                Get Started
              </Link>
            </>

          )}

        </div>

      )}

    </header>
  );
}