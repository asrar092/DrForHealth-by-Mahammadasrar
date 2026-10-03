const express = require('express');
const { body } = require('express-validator');
const passport = require('passport');

const router = express.Router();

const ctrl = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const runValidation = require('../middleware/validate');


// ============================================================
// REGISTER
// POST /api/auth/register
// ============================================================

router.post(
  '/register',
  authLimiter,
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required.'),

    body('email')
      .isEmail()
      .withMessage('Valid email is required.'),

    body('password')
      .isLength({ min: 8 })
      .withMessage(
        'Password must be at least 8 characters.'
      ),
  ],
  runValidation,
  ctrl.register
);


// ============================================================
// VERIFY EMAIL
// GET /api/auth/verify-email
// ============================================================

router.get(
  '/verify-email',
  ctrl.verifyEmail
);


// ============================================================
// LOGIN
// POST /api/auth/login
// ============================================================

router.post(
  '/login',
  authLimiter,
  [
    body('email')
      .isEmail()
      .withMessage('Valid email is required.'),

    body('password')
      .notEmpty()
      .withMessage('Password is required.'),
  ],
  runValidation,
  ctrl.login
);


// ============================================================
// REFRESH ACCESS TOKEN
// POST /api/auth/refresh
// ============================================================

router.post(
  '/refresh',
  ctrl.refresh
);


// ============================================================
// LOGOUT
// POST /api/auth/logout
// ============================================================

router.post(
  '/logout',
  protect,
  ctrl.logout
);


// ============================================================
// LOGOUT ALL DEVICES
// POST /api/auth/logout-all
// ============================================================

router.post(
  '/logout-all',
  protect,
  ctrl.logoutAll
);


// ============================================================
// FORGOT PASSWORD
// POST /api/auth/forgot-password
// ============================================================

router.post(
  '/forgot-password',
  authLimiter,
  [
    body('email')
      .isEmail()
      .withMessage('Valid email is required.'),
  ],
  runValidation,
  ctrl.forgotPassword
);


// ============================================================
// RESET PASSWORD
// POST /api/auth/reset-password
// ============================================================

router.post(
  '/reset-password',
  authLimiter,
  [
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage(
        'New password must be at least 8 characters.'
      ),
  ],
  runValidation,
  ctrl.resetPassword
);


// ============================================================
// GET CURRENT USER
// GET /api/auth/me
// ============================================================

router.get(
  '/me',
  protect,
  ctrl.getMe
);


// ============================================================
// UPDATE PROFILE
// PUT /api/auth/profile
// ============================================================

router.put(
  '/profile',
  protect,
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required.')
      .isLength({ min: 2 })
      .withMessage(
        'Name must be at least 2 characters.'
      ),
  ],
  runValidation,
  ctrl.updateProfile
);


// ============================================================
// CHANGE PASSWORD
// PUT /api/auth/change-password
// ============================================================

router.put(
  '/change-password',
  protect,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage(
        'Current password is required.'
      ),

    body('newPassword')
      .isLength({ min: 8 })
      .withMessage(
        'New password must be at least 8 characters.'
      ),
  ],
  runValidation,
  ctrl.changePassword
);


// ============================================================
// GOOGLE OAUTH
// ============================================================

router.get(
  '/google',
  passport.authenticate(
    'google',
    {
      scope: ['profile', 'email'],
      session: false,
    }
  )
);


// ============================================================
// GOOGLE OAUTH CALLBACK
// GET /api/auth/google/callback
// ============================================================

router.get(
  '/google/callback',
  passport.authenticate(
    'google',
    {
      session: false,

      failureRedirect:
        `${process.env.CLIENT_URL}/login?error=google`,
    }
  ),
  ctrl.googleCallback
);


module.exports = router;