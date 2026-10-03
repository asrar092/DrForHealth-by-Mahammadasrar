const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const emailService = require('../utils/emailService');

const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateRandomToken,
  hashToken,
  setAuthCookies,
  clearAuthCookies,
} = require('../utils/tokens');


// ============================================================
// SECURITY SETTINGS
// ============================================================

const MAX_FAILED_ATTEMPTS = 5;

const LOCK_TIME_MS =
  15 * 60 * 1000;

// Password reset link validity
const PASSWORD_RESET_EXPIRES_MS =
  60 * 60 * 1000;

// Email verification link validity
const EMAIL_VERIFY_EXPIRES_MS =
  24 * 60 * 60 * 1000;


// ============================================================
// REGISTER
// @route POST /api/auth/register
// ============================================================

exports.register = asyncHandler(async (req, res) => {

  const {
    name,
    email,
    password,
    agreeToTerms,
  } = req.body;


  // ----------------------------------------------------------
  // REQUIRED FIELDS
  // ----------------------------------------------------------

  if (!name || !email || !password) {
    throw new ApiError(
      400,
      'Name, email and password are required.'
    );
  }


  // ----------------------------------------------------------
  // TERMS & PRIVACY POLICY
  // ----------------------------------------------------------

  if (agreeToTerms !== true) {
    throw new ApiError(
      400,
      'You must agree to the Terms & Conditions and Privacy Policy.'
    );
  }


  // ----------------------------------------------------------
  // PASSWORD VALIDATION
  // ----------------------------------------------------------

  if (password.length < 8) {
    throw new ApiError(
      400,
      'Password must be at least 8 characters long.'
    );
  }


  // ----------------------------------------------------------
  // NORMALIZE EMAIL
  // ----------------------------------------------------------

  const normalizedEmail =
    email.trim().toLowerCase();


  // ----------------------------------------------------------
  // CHECK EXISTING USER
  // ----------------------------------------------------------

  const existing =
    await User.findOne({
      email: normalizedEmail,
    });


  if (existing) {
    throw new ApiError(
      409,
      'An account with this email already exists.'
    );
  }


  // ----------------------------------------------------------
  // GENERATE EMAIL VERIFICATION TOKEN
  // ----------------------------------------------------------

  const verifyToken =
    generateRandomToken();


  // ----------------------------------------------------------
  // CREATE USER
  // ----------------------------------------------------------

  const user = await User.create({

    name: name.trim(),

    email: normalizedEmail,

    password,

    // Terms & Privacy acceptance
    agreedToTerms: true,

    termsAcceptedAt: new Date(),

    emailVerifyToken:
      hashToken(verifyToken),

    emailVerifyExpires:
      Date.now() +
      EMAIL_VERIFY_EXPIRES_MS,

  });


  // ----------------------------------------------------------
  // VERIFICATION URL
  // ----------------------------------------------------------

  const verifyUrl =
    `${process.env.CLIENT_URL}/verify-email` +
    `?token=${verifyToken}` +
    `&email=${encodeURIComponent(
      normalizedEmail
    )}`;


  // ----------------------------------------------------------
  // SEND VERIFICATION EMAIL
  // ----------------------------------------------------------

  try {

    await emailService.sendVerification(
      normalizedEmail,
      name.trim(),
      verifyUrl
    );

    console.log(
      `[Email] Verification email sent to ${normalizedEmail}`
    );

  } catch (error) {

    console.error(
      '[Email] Verification email failed:',
      error.message
    );


    await User.findByIdAndDelete(
      user._id
    );


    throw new ApiError(
      500,
      'Registration failed because the verification email could not be sent. Please try again.'
    );
  }


  // ----------------------------------------------------------
  // WELCOME EMAIL
  // ----------------------------------------------------------

  emailService
    .sendWelcome(
      normalizedEmail,
      name.trim()
    )
    .then(() => {

      console.log(
        `[Email] Welcome email sent to ${normalizedEmail}`
      );

    })
    .catch((error) => {

      console.error(
        '[Email] Welcome email failed:',
        error.message
      );

    });


  // ----------------------------------------------------------
  // RESPONSE
  // ----------------------------------------------------------

  res.status(201).json({

    success: true,

    message:
      'Registration successful. Please check your email to verify your account.',

  });

});


// ============================================================
// VERIFY EMAIL
// @route GET /api/auth/verify-email?token=&email=
// ============================================================

exports.verifyEmail = asyncHandler(async (req, res) => {

  const {
    token,
    email,
  } = req.query;


  if (!token || !email) {
    throw new ApiError(
      400,
      'Invalid verification link.'
    );
  }


  const normalizedEmail =
    email.trim().toLowerCase();


  const user =
    await User.findOne({

      email: normalizedEmail,

      emailVerifyToken:
        hashToken(token),

      emailVerifyExpires: {
        $gt: Date.now(),
      },

    }).select(
      '+emailVerifyToken +emailVerifyExpires'
    );


  if (!user) {
    throw new ApiError(
      400,
      'Verification link is invalid or has expired.'
    );
  }


  user.isEmailVerified = true;

  user.emailVerifyToken =
    undefined;

  user.emailVerifyExpires =
    undefined;


  await user.save();


  res.json({

    success: true,

    message:
      'Email verified successfully. You can now log in.',

  });

});


// ============================================================
// LOGIN
// @route POST /api/auth/login
// ============================================================

exports.login = asyncHandler(async (req, res) => {

  const {
    email,
    password,
  } = req.body;


  if (!email || !password) {
    throw new ApiError(
      400,
      'Email and password are required.'
    );
  }


  const normalizedEmail =
    email.trim().toLowerCase();


  const user =
    await User.findOne({
      email: normalizedEmail,
    }).select(
      '+password +refreshTokens'
    );


  if (!user || !user.password) {
    throw new ApiError(
      401,
      'Invalid email or password.'
    );
  }


  // ----------------------------------------------------------
  // CHECK BANNED ACCOUNT
  // ----------------------------------------------------------

  if (user.isBanned) {
    throw new ApiError(
      403,
      'This account has been suspended.'
    );
  }


  // ----------------------------------------------------------
  // CHECK LOCKED ACCOUNT
  // ----------------------------------------------------------

  if (user.isLocked) {
    throw new ApiError(
      429,
      'Account temporarily locked due to failed login attempts. Try again later.'
    );
  }


  // ----------------------------------------------------------
  // CHECK PASSWORD
  // ----------------------------------------------------------

  const isMatch =
    await user.comparePassword(
      password
    );


  if (!isMatch) {

    user.failedLoginAttempts += 1;


    if (
      user.failedLoginAttempts >=
      MAX_FAILED_ATTEMPTS
    ) {

      user.lockUntil =
        Date.now() +
        LOCK_TIME_MS;

      user.failedLoginAttempts = 0;

    }


    await user.save();


    throw new ApiError(
      401,
      'Invalid email or password.'
    );
  }


  // ----------------------------------------------------------
  // CHECK EMAIL VERIFICATION
  // ----------------------------------------------------------

  if (!user.isEmailVerified) {
    throw new ApiError(
      403,
      'Please verify your email before logging in.'
    );
  }


  // ----------------------------------------------------------
  // RESET FAILED LOGIN INFORMATION
  // ----------------------------------------------------------

  user.failedLoginAttempts = 0;

  user.lockUntil = null;


  // ----------------------------------------------------------
  // GENERATE TOKENS
  // ----------------------------------------------------------

  const accessToken =
    generateAccessToken(user);


  const refreshToken =
    generateRefreshToken(user);


  // Make sure refreshTokens exists
  if (!Array.isArray(user.refreshTokens)) {
    user.refreshTokens = [];
  }


  // Store hashed refresh token
  user.refreshTokens.push(
    hashToken(refreshToken)
  );


  await user.save();


  // ----------------------------------------------------------
  // SET AUTH COOKIES
  // ----------------------------------------------------------

  setAuthCookies(
    res,
    accessToken,
    refreshToken
  );


  res.json({

    success: true,

    accessToken,

    user: {

      id: user._id,

      name: user.name,

      email: user.email,

      role: user.role,

      avatar: user.avatar,

    },

  });

});


// ============================================================
// REFRESH TOKEN
// @route POST /api/auth/refresh
// ============================================================

exports.refresh = asyncHandler(async (req, res) => {

  const token =
    req.cookies?.refreshToken ||
    req.body.refreshToken;


  if (!token) {
    throw new ApiError(
      401,
      'No refresh token provided.'
    );
  }


  let payload;


  try {

    payload =
      verifyRefreshToken(token);

  } catch {

    throw new ApiError(
      401,
      'Refresh token invalid or expired. Please log in again.'
    );

  }


  const user =
    await User.findById(
      payload.sub
    ).select(
      '+refreshTokens'
    );


  if (
    !user ||
    !Array.isArray(
      user.refreshTokens
    ) ||
    !user.refreshTokens.includes(
      hashToken(token)
    )
  ) {

    throw new ApiError(
      401,
      'Refresh token not recognized. Please log in again.'
    );

  }


  const newAccessToken =
    generateAccessToken(user);


  const newRefreshToken =
    generateRefreshToken(user);


  // ----------------------------------------------------------
  // REMOVE OLD REFRESH TOKEN
  // ----------------------------------------------------------

  const oldTokenHash =
    hashToken(token);


  user.refreshTokens =
    user.refreshTokens.filter(
      (t) =>
        t !== oldTokenHash
    );


  // ----------------------------------------------------------
  // ADD NEW REFRESH TOKEN
  // ----------------------------------------------------------

  user.refreshTokens.push(
    hashToken(newRefreshToken)
  );


  await user.save();


  // ----------------------------------------------------------
  // SET NEW COOKIES
  // ----------------------------------------------------------

  setAuthCookies(
    res,
    newAccessToken,
    newRefreshToken
  );


  res.json({

    success: true,

    accessToken:
      newAccessToken,

  });

});


// ============================================================
// LOGOUT
// @route POST /api/auth/logout
// ============================================================

exports.logout = asyncHandler(async (req, res) => {

  const token =
    req.cookies?.refreshToken;


  if (token && req.user) {

    if (
      !Array.isArray(
        req.user.refreshTokens
      )
    ) {

      req.user.refreshTokens = [];

    }


    const tokenHash =
      hashToken(token);


    req.user.refreshTokens =
      req.user.refreshTokens.filter(
        (t) =>
          t !== tokenHash
      );


    await req.user.save();

  }


  clearAuthCookies(res);


  res.json({

    success: true,

    message:
      'Logged out successfully.',

  });

});


// ============================================================
// LOGOUT ALL DEVICES
// @route POST /api/auth/logout-all
// ============================================================

exports.logoutAll = asyncHandler(async (req, res) => {

  req.user.refreshTokens = [];

  await req.user.save();

  clearAuthCookies(res);


  res.json({

    success: true,

    message:
      'Logged out from all devices.',

  });

});


// ============================================================
// FORGOT PASSWORD
// @route POST /api/auth/forgot-password
// ============================================================

exports.forgotPassword =
  asyncHandler(async (req, res) => {

    const { email } =
      req.body;


    if (!email) {
      throw new ApiError(
        400,
        'Please enter your email address.'
      );
    }


    const normalizedEmail =
      email.trim().toLowerCase();


    // Generic response prevents
    // account/email enumeration.
    const genericResponse = {

      success: true,

      message:
        'If that email exists, a reset link has been sent.',

    };


    const user =
      await User.findOne({
        email: normalizedEmail,
      });


    if (!user) {

      return res.json(
        genericResponse
      );

    }


    // --------------------------------------------------------
    // GENERATE PASSWORD RESET TOKEN
    // --------------------------------------------------------

    const resetToken =
      generateRandomToken();


    // Store only hashed token
    user.passwordResetToken =
      hashToken(resetToken);


    user.passwordResetExpires =
      Date.now() +
      PASSWORD_RESET_EXPIRES_MS;


    await user.save();


    // --------------------------------------------------------
    // PASSWORD RESET URL
    // --------------------------------------------------------

    const resetUrl =
      `${process.env.CLIENT_URL}/reset-password` +
      `?token=${resetToken}` +
      `&email=${encodeURIComponent(
        normalizedEmail
      )}`;


    console.log(
      `[Password Reset] Reset URL generated for ${normalizedEmail}`
    );


    // --------------------------------------------------------
    // SEND PASSWORD RESET EMAIL
    // --------------------------------------------------------

    try {

      await emailService.sendPasswordReset(
        normalizedEmail,
        user.name,
        resetUrl
      );


      console.log(
        `[Email] Password reset email sent to ${normalizedEmail}`
      );

    } catch (error) {

      console.error(
        '[Email] Password reset email failed:',
        error.message
      );


      user.passwordResetToken =
        undefined;

      user.passwordResetExpires =
        undefined;


      await user.save();

    }


    res.json(
      genericResponse
    );

  });


// ============================================================
// RESET PASSWORD
// @route POST /api/auth/reset-password
// ============================================================

exports.resetPassword =
  asyncHandler(async (req, res) => {

    const {
      email,
      token,
      newPassword,
    } = req.body;


    if (
      !email ||
      !token ||
      !newPassword
    ) {

      throw new ApiError(
        400,
        'Email, token and new password are required.'
      );

    }


    if (newPassword.length < 8) {

      throw new ApiError(
        400,
        'Password must be at least 8 characters long.'
      );

    }


    const normalizedEmail =
      email.trim().toLowerCase();


    const user =
      await User.findOne({

        email: normalizedEmail,

        passwordResetToken:
          hashToken(token),

        passwordResetExpires: {
          $gt: Date.now(),
        },

      }).select(
        '+passwordResetToken +passwordResetExpires +refreshTokens'
      );


    if (!user) {

      throw new ApiError(
        400,
        'Reset link is invalid or has expired.'
      );

    }


    // --------------------------------------------------------
    // UPDATE PASSWORD
    // --------------------------------------------------------

    user.password =
      newPassword;


    // --------------------------------------------------------
    // REMOVE RESET TOKEN
    // --------------------------------------------------------

    user.passwordResetToken =
      undefined;

    user.passwordResetExpires =
      undefined;


    // --------------------------------------------------------
    // INVALIDATE ALL SESSIONS
    // --------------------------------------------------------

    user.refreshTokens = [];


    // Reset failed login attempts
    user.failedLoginAttempts = 0;

    user.lockUntil = null;


    await user.save();


    // Clear authentication cookies
    clearAuthCookies(res);


    res.json({

      success: true,

      message:
        'Password reset successfully. Please log in with your new password.',

    });

  });


// ============================================================
// GET CURRENT USER
// @route GET /api/auth/me
// ============================================================

exports.getMe = asyncHandler(async (req, res) => {

  res.json({

    success: true,

    user: {

      id: req.user._id,

      name: req.user.name,

      email: req.user.email,

      role: req.user.role,

      avatar: req.user.avatar,

    },

  });

});


// ============================================================
// UPDATE PROFILE
// @route PUT /api/auth/profile
// ============================================================

exports.updateProfile =
  asyncHandler(async (req, res) => {

    const { name } =
      req.body;


    if (!name || !name.trim()) {

      throw new ApiError(
        400,
        'Name is required.'
      );

    }


    const trimmedName =
      name.trim();


    if (trimmedName.length < 2) {

      throw new ApiError(
        400,
        'Name must be at least 2 characters.'
      );

    }


    // Find logged-in user
    const user =
      await User.findById(
        req.user._id
      );


    if (!user) {

      throw new ApiError(
        404,
        'User account not found.'
      );

    }


    // Update name
    user.name =
      trimmedName;


    await user.save();


    res.json({

      success: true,

      message:
        'Profile updated successfully.',

      user: {

        id: user._id,

        name: user.name,

        email: user.email,

        role: user.role,

        avatar: user.avatar,

      },

    });

  });


// ============================================================
// CHANGE PASSWORD
// @route PUT /api/auth/change-password
// ============================================================

exports.changePassword =
  asyncHandler(async (req, res) => {

    const {
      currentPassword,
      newPassword,
    } = req.body;


    if (
      !currentPassword ||
      !newPassword
    ) {

      throw new ApiError(
        400,
        'Current password and new password are required.'
      );

    }


    if (newPassword.length < 8) {

      throw new ApiError(
        400,
        'New password must be at least 8 characters.'
      );

    }


    // Get password explicitly because
    // User.password uses select:false
    const user =
      await User.findById(
        req.user._id
      ).select(
        '+password +refreshTokens'
      );


    if (!user) {

      throw new ApiError(
        404,
        'User account not found.'
      );

    }


    // Google-only accounts may not have
    // a local password
    if (!user.password) {

      throw new ApiError(
        400,
        'Password change is not available for this account.'
      );

    }


    // --------------------------------------------------------
    // CHECK CURRENT PASSWORD
    // --------------------------------------------------------

    const isCurrentPasswordCorrect =
      await user.comparePassword(
        currentPassword
      );


    if (!isCurrentPasswordCorrect) {

      throw new ApiError(
        401,
        'Current password is incorrect.'
      );

    }


    // --------------------------------------------------------
    // MAKE SURE NEW PASSWORD IS DIFFERENT
    // --------------------------------------------------------

    const isSamePassword =
      await user.comparePassword(
        newPassword
      );


    if (isSamePassword) {

      throw new ApiError(
        400,
        'New password must be different from your current password.'
      );

    }


    // --------------------------------------------------------
    // UPDATE PASSWORD
    // --------------------------------------------------------

    user.password =
      newPassword;


    // Reset login security counters
    user.failedLoginAttempts = 0;

    user.lockUntil = null;


    // Invalidate all refresh tokens
    user.refreshTokens = [];


    await user.save();


    // Clear authentication cookies
    clearAuthCookies(res);


    res.json({

      success: true,

      message:
        'Password changed successfully. Please log in again.',

    });

  });


// ============================================================
// GOOGLE CALLBACK
// @route GET /api/auth/google/callback
// ============================================================

exports.googleCallback =
  asyncHandler(async (req, res) => {

    const user =
      req.user;


    if (!user) {
      throw new ApiError(
        401,
        'Google authentication failed.'
      );
    }


    // --------------------------------------------------------
    // ACCEPT TERMS FOR GOOGLE SIGNUP
    // --------------------------------------------------------
    //
    // Google signup is only reachable from the Register page
    // after the user accepts Terms & Conditions and Privacy Policy.
    //
    // If the OAuth flow creates a new user, passport/google
    // strategy should ideally also record these fields.
    //
    // We do not overwrite an existing acceptance timestamp.
    // --------------------------------------------------------

    if (user.agreedToTerms !== true) {

      user.agreedToTerms = true;

      user.termsAcceptedAt = new Date();

    }


    const accessToken =
      generateAccessToken(user);


    const refreshToken =
      generateRefreshToken(user);


    // Make sure refreshTokens exists
    if (
      !Array.isArray(
        user.refreshTokens
      )
    ) {

      user.refreshTokens = [];

    }


    user.refreshTokens.push(
      hashToken(refreshToken)
    );


    await user.save();


    // --------------------------------------------------------
    // SET AUTH COOKIES
    // --------------------------------------------------------

    setAuthCookies(
      res,
      accessToken,
      refreshToken
    );


    res.redirect(
      `${process.env.CLIENT_URL}/auth/callback?success=true`
    );

  });