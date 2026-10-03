const rateLimit = require('express-rate-limit');


// ============================================================
// GENERAL API RATE LIMITER
// ============================================================

const apiLimiter = rateLimit({
  windowMs:
    Number(process.env.RATE_LIMIT_WINDOW_MS) ||
    15 * 60 * 1000,

  // Development ke liye 300 requests
  max:
    Number(process.env.RATE_LIMIT_MAX) ||
    300,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    success: false,
    message:
      'Too many requests. Please try again later.',
  },
});


// ============================================================
// AUTH RATE LIMITER
// Login / Register / Forgot Password / Reset Password
// ============================================================

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  // Development/testing ke liye 30 attempts
  max: 30,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    success: false,
    message:
      'Too many authentication attempts. Please try again later.',
  },
});


// ============================================================
// EXPORT
// ============================================================

module.exports = {
  apiLimiter,
  authLimiter,
};