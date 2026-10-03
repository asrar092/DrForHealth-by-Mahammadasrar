const jwt = require('jsonwebtoken');
const crypto = require('crypto');


// ============================================================
// JWT ACCESS SECRET
// ============================================================

function getAccessTokenSecret() {

  const secret =
    process.env.JWT_ACCESS_SECRET;


  if (
    !secret ||
    typeof secret !== 'string' ||
    secret.trim().length < 32
  ) {

    throw new Error(
      'JWT_ACCESS_SECRET is missing or too short. It must be at least 32 characters.'
    );

  }


  return secret.trim();

}


// ============================================================
// JWT REFRESH SECRET
// ============================================================

function getRefreshTokenSecret() {

  const secret =
    process.env.JWT_REFRESH_SECRET;


  if (
    !secret ||
    typeof secret !== 'string' ||
    secret.trim().length < 32
  ) {

    throw new Error(
      'JWT_REFRESH_SECRET is missing or too short. It must be at least 32 characters.'
    );

  }


  return secret.trim();

}


// ============================================================
// ACCESS TOKEN
// ============================================================

function generateAccessToken(user) {

  if (
    !user ||
    !user._id
  ) {

    throw new Error(
      'Cannot generate access token: invalid user.'
    );

  }


  return jwt.sign(

    {

      sub:
        user._id.toString(),

      role:
        user.role,

    },

    getAccessTokenSecret(),

    {

      expiresIn:
        process.env.JWT_ACCESS_EXPIRES ||
        '15m',

    }

  );

}


// ============================================================
// REFRESH TOKEN
// ============================================================

function generateRefreshToken(user) {

  if (
    !user ||
    !user._id
  ) {

    throw new Error(
      'Cannot generate refresh token: invalid user.'
    );

  }


  return jwt.sign(

    {

      sub:
        user._id.toString(),

    },

    getRefreshTokenSecret(),

    {

      expiresIn:
        process.env.JWT_REFRESH_EXPIRES ||
        '30d',

    }

  );

}


// ============================================================
// VERIFY ACCESS TOKEN
// ============================================================
//
// This function is useful if another part of the backend
// needs to manually verify an access token.
//
// Passport normally handles access-token verification.
//

function verifyAccessToken(token) {

  if (!token) {

    throw new Error(
      'Access token is required.'
    );

  }


  return jwt.verify(

    token,

    getAccessTokenSecret()

  );

}


// ============================================================
// VERIFY REFRESH TOKEN
// ============================================================

function verifyRefreshToken(token) {

  if (!token) {

    throw new Error(
      'Refresh token is required.'
    );

  }


  return jwt.verify(

    token,

    getRefreshTokenSecret()

  );

}


// ============================================================
// RANDOM TOKEN
// ============================================================

function generateRandomToken() {

  return crypto
    .randomBytes(32)
    .toString('hex');

}


// ============================================================
// HASH TOKEN
// ============================================================

function hashToken(token) {

  if (!token) {

    throw new Error(
      'Token is required for hashing.'
    );

  }


  return crypto

    .createHash('sha256')

    .update(token)

    .digest('hex');

}


// ============================================================
// COOKIE OPTIONS
// ============================================================

function getCookieOptions() {

  const isProduction =
    process.env.NODE_ENV === 'production';


  return {

    httpOnly:
      true,


    // --------------------------------------------------------
    // HTTPS only in production
    // --------------------------------------------------------

    secure:
      isProduction,


    // --------------------------------------------------------
    // SameSite
    // --------------------------------------------------------

    sameSite:
      isProduction
        ? 'strict'
        : 'lax',


    // --------------------------------------------------------
    // Cookie available everywhere
    // --------------------------------------------------------

    path:
      '/',

  };

}


// ============================================================
// SET AUTH COOKIES
// ============================================================

function setAuthCookies(

  res,

  accessToken,

  refreshToken

) {

  const cookieOptions =
    getCookieOptions();


  // ==========================================================
  // ACCESS TOKEN COOKIE
  // ==========================================================

  res.cookie(

    'accessToken',

    accessToken,

    {

      ...cookieOptions,

      maxAge:
        15 * 60 * 1000,

    }

  );


  // ==========================================================
  // REFRESH TOKEN COOKIE
  // ==========================================================

  res.cookie(

    'refreshToken',

    refreshToken,

    {

      ...cookieOptions,

      maxAge:
        30 * 24 * 60 * 60 * 1000,

    }

  );

}


// ============================================================
// CLEAR AUTH COOKIES
// ============================================================

function clearAuthCookies(res) {

  const cookieOptions =
    getCookieOptions();


  res.clearCookie(

    'accessToken',

    cookieOptions

  );


  res.clearCookie(

    'refreshToken',

    cookieOptions

  );

}


// ============================================================
// EXPORT
// ============================================================

module.exports = {

  generateAccessToken,

  generateRefreshToken,

  verifyAccessToken,

  verifyRefreshToken,

  generateRandomToken,

  hashToken,

  setAuthCookies,

  clearAuthCookies,

  getCookieOptions,

};