import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { useAuthStore } from '@/store/authStore';

import MainLayout from '@/components/layout/MainLayout';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

import HomePage from '@/pages/HomePage';
import StorePage from '@/pages/StorePage';
import EbookDetailPage from '@/pages/EbookDetailPage';

import BlogPage from '@/pages/BlogPage';
import BlogDetailPage from '@/pages/BlogDetailPage';

import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';

import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage';
import TermsPage from '@/pages/TermsPage';
import RefundPolicyPage from '@/pages/RefundPolicyPage';

import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import VerifyEmailPage from '@/pages/VerifyEmailPage';

import WishlistPage from '@/pages/WishlistPage';

import NotFoundPage from '@/pages/NotFoundPage';

import DashboardHome from '@/pages/dashboard/DashboardHome';
import MyLibrary from '@/pages/dashboard/MyLibrary';
import OrderHistory from '@/pages/dashboard/OrderHistory';
import ProfileSettings from '@/pages/dashboard/ProfileSettings';
import ContentManager from '@/pages/dashboard/ContentManager';
import BlogManagement from '@/pages/dashboard/BlogManagement';


export default function App() {

  const init = useAuthStore((s) => s.init);


  // ==========================================================
  // INITIALIZE AUTHENTICATION
  // ==========================================================

  useEffect(() => {
    init();
  }, [init]);


  return (
    <>

      {/* =====================================================
          TOASTER
      ====================================================== */}

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontFamily: 'Inter, sans-serif',
          },
        }}
      />


      {/* =====================================================
          APPLICATION ROUTES
      ====================================================== */}

      <Routes>


        {/* =====================================================
            PUBLIC / MAIN LAYOUT ROUTES
        ====================================================== */}

        <Route element={<MainLayout />}>


          {/* HOME */}

          <Route
            path="/"
            element={<HomePage />}
          />


          {/* STORE */}

          <Route
            path="/store"
            element={<StorePage />}
          />


          {/* EBOOK DETAIL */}

          <Route
            path="/ebooks/:slug"
            element={<EbookDetailPage />}
          />


          {/* BLOG */}

          <Route
            path="/blog"
            element={<BlogPage />}
          />


          {/* BLOG DETAIL */}

          <Route
            path="/blog/:slug"
            element={<BlogDetailPage />}
          />


          {/* ABOUT */}

          <Route
            path="/about"
            element={<AboutPage />}
          />


          {/* CONTACT */}

          <Route
            path="/contact"
            element={<ContactPage />}
          />


          {/* PRIVACY */}

          <Route
            path="/privacy"
            element={<PrivacyPolicyPage />}
          />


          {/* PRIVACY POLICY */}

          <Route
            path="/privacy-policy"
            element={<PrivacyPolicyPage />}
          />


          {/* TERMS */}

          <Route
            path="/terms"
            element={<TermsPage />}
          />


          {/* REFUND POLICY */}

          <Route
            path="/refund-policy"
            element={<RefundPolicyPage />}
          />


          {/* LOGIN */}

          <Route
            path="/login"
            element={<LoginPage />}
          />


          {/* REGISTER */}

          <Route
            path="/register"
            element={<RegisterPage />}
          />


          {/* FORGOT PASSWORD */}

          <Route
            path="/forgot-password"
            element={<ForgotPasswordPage />}
          />


          {/* RESET PASSWORD */}

          <Route
            path="/reset-password"
            element={<ResetPasswordPage />}
          />


          {/* WISHLIST */}

          <Route
            path="/wishlist"
            element={<WishlistPage />}
          />

        </Route>


        {/* =====================================================
            EMAIL VERIFICATION
        ====================================================== */}

        <Route
          path="/verify-email"
          element={<VerifyEmailPage />}
        />


        {/* =====================================================
            PROTECTED DASHBOARD ROUTES
        ====================================================== */}

        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >


          {/* =================================================
              DASHBOARD HOME
              /dashboard
          ================================================== */}

          <Route
            path="/dashboard"
            element={<DashboardHome />}
          />


          {/* =================================================
              MY LIBRARY
              /dashboard/library
          ================================================== */}

          <Route
            path="/dashboard/library"
            element={<MyLibrary />}
          />


          {/* =================================================
              ORDER HISTORY
              /dashboard/orders
          ================================================== */}

          <Route
            path="/dashboard/orders"
            element={<OrderHistory />}
          />


          {/* =================================================
              DOWNLOAD HISTORY
              /dashboard/downloads
          ================================================== */}

          <Route
            path="/dashboard/downloads"
            element={
              <div className="p-6">

                <h1 className="text-2xl font-bold">
                  Download History
                </h1>

                <p className="text-charcoal/60 mt-2">
                  Download history will be available here.
                </p>

              </div>
            }
          />


          {/* =================================================
              PROFILE SETTINGS
              /dashboard/profile
          ================================================== */}

          <Route
            path="/dashboard/profile"
            element={<ProfileSettings />}
          />


          {/* =================================================
              CONTENT MANAGER
              /dashboard/content
          ================================================== */}

          <Route
            path="/dashboard/content"
            element={<ContentManager />}
          />


          {/* =================================================
              BLOG MANAGEMENT
              /dashboard/blog
          ================================================== */}

          <Route
            path="/dashboard/blog"
            element={<BlogManagement />}
          />

        </Route>


        {/* =====================================================
            404 PAGE
        ====================================================== */}

        <Route
          path="*"
          element={<NotFoundPage />}
        />

      </Routes>

    </>
  );
}