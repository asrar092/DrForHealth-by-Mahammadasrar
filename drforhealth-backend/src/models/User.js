const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // ==========================================================
    // BASIC USER INFORMATION
    // ==========================================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      select: false,
    },

    // ==========================================================
    // AUTHENTICATION PROVIDER
    // ==========================================================

    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },

    googleId: {
      type: String,
      default: null,
    },

    avatar: {
      type: String,
      default: '',
    },

    // ==========================================================
    // USER ROLE
    // ==========================================================

    role: {
      type: String,
      enum: [
        'user',
        'super_admin',
        'support_manager',
        'marketing_manager',
      ],
      default: 'user',
    },

    // ==========================================================
    // EMAIL VERIFICATION
    // ==========================================================

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerifyToken: {
      type: String,
      select: false,
    },

    emailVerifyExpires: {
      type: Date,
      select: false,
    },

    // ==========================================================
    // PASSWORD RESET
    // ==========================================================

    passwordResetToken: {
      type: String,
      select: false,
    },

    passwordResetExpires: {
      type: Date,
      select: false,
    },

    // ==========================================================
    // REFRESH TOKENS
    // Supports multiple devices + logout all
    // ==========================================================

    refreshTokens: [
      {
        type: String,
        select: false,
      },
    ],

    // ==========================================================
    // ACCOUNT SECURITY
    // ==========================================================

    isBanned: {
      type: Boolean,
      default: false,
    },

    failedLoginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: {
      type: Date,
      default: null,
    },

    // ==========================================================
    // TERMS & CONDITIONS / PRIVACY POLICY
    // ==========================================================

    termsAccepted: {
      type: Boolean,
      default: false,
    },

    termsAcceptedAt: {
      type: Date,
      default: null,
    },

    privacyPolicyAccepted: {
      type: Boolean,
      default: false,
    },

    privacyPolicyAcceptedAt: {
      type: Date,
      default: null,
    },

    // ==========================================================
    // WISHLIST
    // ==========================================================

    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ebook',
      },
    ],

    // ==========================================================
    // NOTIFICATION PREFERENCES
    // ==========================================================

    notificationPreferences: {
      email: {
        type: Boolean,
        default: true,
      },

      inApp: {
        type: Boolean,
        default: true,
      },
    },
  },

  {
    timestamps: true,
  }
);


// ============================================================
// ACCOUNT LOCK STATUS
// ============================================================

userSchema.virtual('isLocked').get(function () {
  return !!(
    this.lockUntil &&
    this.lockUntil > Date.now()
  );
});


// ============================================================
// PASSWORD HASHING
// ============================================================

userSchema.pre('save', async function (next) {

  // Don't hash if password was not modified
  // or user is a Google OAuth user without password.
  if (
    !this.isModified('password') ||
    !this.password
  ) {
    return next();
  }

  const rounds =
    Number(process.env.BCRYPT_SALT_ROUNDS) || 12;

  this.password =
    await bcrypt.hash(
      this.password,
      rounds
    );

  next();
});


// ============================================================
// PASSWORD COMPARISON
// ============================================================

userSchema.methods.comparePassword =
  function (candidate) {

    return bcrypt.compare(
      candidate,
      this.password
    );
  };


// ============================================================
// EXPORT MODEL
// ============================================================

module.exports =
  mongoose.model(
    'User',
    userSchema
  );