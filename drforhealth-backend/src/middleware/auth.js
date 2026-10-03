const passport = require('passport');

const ApiError = require('../utils/ApiError');


// ============================================================
// ADMIN-SIDE ROLES
// ============================================================
//
// These roles are allowed to access admin-side functionality.
//
// super_admin
// admin
// content_manager
//
// normal_user is NOT included.
//
// ============================================================

const ADMIN_ROLES = [
  'admin',
  'super_admin',
  'content_manager',
];


// ============================================================
// CHECK ADMIN-SIDE USER
// ============================================================

const isAdminUser = (user) => {
  return ADMIN_ROLES.includes(
    user?.role
  );
};


// ============================================================
// PROTECT
// ============================================================
//
// Requires a valid access token.
//
// Authentication can come from:
// - Authorization: Bearer <token>
// - Cookie
//
// ============================================================

const protect = (req, res, next) => {

  passport.authenticate(
    'jwt',
    {
      session: false,
    },
    (err, user) => {

      // --------------------------------------------------------
      // PASSPORT ERROR
      // --------------------------------------------------------

      if (err) {
        return next(err);
      }


      // --------------------------------------------------------
      // USER NOT AUTHENTICATED
      // --------------------------------------------------------

      if (!user) {
        return next(
          new ApiError(
            401,
            'Not authenticated. Please log in.'
          )
        );
      }


      // --------------------------------------------------------
      // TEMPORARY AUTH DEBUG LOG
      // --------------------------------------------------------
      //
      // This will help us verify:
      //
      // email
      // role
      // user ID
      //
      // After everything works, we can remove this log.
      //
      // --------------------------------------------------------

      console.log(
        '[AUTH] User:',
        user.email,
        '| Role:',
        user.role,
        '| ID:',
        user._id
      );


      // --------------------------------------------------------
      // ATTACH USER TO REQUEST
      // --------------------------------------------------------

      req.user = user;


      next();
    }
  )(req, res, next);
};


// ============================================================
// AUTHORIZE
// ============================================================
//
// Restricts access to specific roles.
//
// Example:
//
// authorize('admin', 'super_admin')
//
// Allowed:
// admin
// super_admin
//
// Denied:
// normal_user
//
// ============================================================

const authorize = (...allowedRoles) => (
  req,
  res,
  next
) => {

  // ----------------------------------------------------------
  // AUTHENTICATION CHECK
  // ----------------------------------------------------------

  if (!req.user) {
    return next(
      new ApiError(
        401,
        'Not authenticated.'
      )
    );
  }


  // ----------------------------------------------------------
  // ROLE CHECK
  // ----------------------------------------------------------

  if (
    !allowedRoles.includes(
      req.user.role
    )
  ) {

    return next(
      new ApiError(
        403,
        'You do not have permission to perform this action.'
      )
    );

  }


  next();
};


// ============================================================
// AUTHORIZE ADMIN SIDE
// ============================================================
//
// Allows:
//
// admin
// super_admin
// content_manager
//
// Denies:
//
// normal_user
//
// ============================================================

const authorizeAdmin = (
  req,
  res,
  next
) => {

  // ----------------------------------------------------------
  // AUTHENTICATION CHECK
  // ----------------------------------------------------------

  if (!req.user) {
    return next(
      new ApiError(
        401,
        'Not authenticated.'
      )
    );
  }


  // ----------------------------------------------------------
  // ADMIN ROLE CHECK
  // ----------------------------------------------------------

  if (
    !isAdminUser(req.user)
  ) {

    return next(
      new ApiError(
        403,
        'Only admin-side users can perform this action.'
      )
    );

  }


  next();
};


// ============================================================
// OPTIONAL AUTH
// ============================================================
//
// Populates req.user if a valid token exists.
//
// Does NOT block guests.
//
// Guest:
//
// req.user = null
//
// Logged-in user:
//
// req.user = user object
//
// ============================================================

const optionalAuth = (
  req,
  res,
  next
) => {

  passport.authenticate(
    'jwt',
    {
      session: false,
    },
    (err, user) => {

      // --------------------------------------------------------
      // PASSPORT ERROR
      // --------------------------------------------------------

      if (err) {
        return next(err);
      }


      // --------------------------------------------------------
      // ATTACH USER OR NULL
      // --------------------------------------------------------

      req.user =
        user || null;


      next();
    }
  )(req, res, next);
};


// ============================================================
// EXPORT
// ============================================================

module.exports = {

  protect,

  authorize,

  authorizeAdmin,

  isAdminUser,

  ADMIN_ROLES,

  optionalAuth,

};