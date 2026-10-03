const passport = require('passport');

const {
  Strategy: JwtStrategy,
  ExtractJwt,
} = require('passport-jwt');

const {
  Strategy: GoogleStrategy,
} = require('passport-google-oauth20');

const User = require('../models/User');


// ============================================================
// JWT SECRET VALIDATION
// ============================================================

const getJwtAccessSecret = () => {

  const secret =
    process.env.JWT_ACCESS_SECRET;

  if (!secret) {

    throw new Error(
      'JWT_ACCESS_SECRET is missing from environment variables.'
    );

  }

  return secret;
};


// ============================================================
// JWT STRATEGY
// ============================================================
//
// Supports:
//
// 1. Authorization: Bearer <accessToken>
//
// 2. Cookie:
//    accessToken=<token>
//
// ============================================================

passport.use(

  new JwtStrategy(

    {

      jwtFromRequest:
        ExtractJwt.fromExtractors([

          // ----------------------------------------------------
          // Authorization Header
          // ----------------------------------------------------

          ExtractJwt.fromAuthHeaderAsBearerToken(),


          // ----------------------------------------------------
          // HTTP-only Cookie
          // ----------------------------------------------------

          (req) => {

            return (
              req?.cookies?.accessToken ||
              null
            );

          },

        ]),


      // --------------------------------------------------------
      // ACCESS TOKEN SECRET
      // --------------------------------------------------------

      secretOrKey:
        getJwtAccessSecret(),

    },


    // ========================================================
    // VERIFY JWT PAYLOAD
    // ========================================================

    async (payload, done) => {

      try {

        // ------------------------------------------------------
        // Validate payload
        // ------------------------------------------------------

        if (!payload?.sub) {

          return done(
            null,
            false
          );

        }


        // ------------------------------------------------------
        // Find user
        // ------------------------------------------------------

        const user =
          await User.findById(
            payload.sub
          ).select(
            '-password'
          );


        // ------------------------------------------------------
        // User does not exist
        // ------------------------------------------------------

        if (!user) {

          return done(
            null,
            false
          );

        }


        // ------------------------------------------------------
        // Banned user
        // ------------------------------------------------------

        if (user.isBanned) {

          return done(
            null,
            false
          );

        }


        // ------------------------------------------------------
        // ROLE CONSISTENCY CHECK
        // ------------------------------------------------------
        //
        // Role is also present in JWT.
        //
        // We use database user as the source of truth.
        //
        // This prevents authorization decisions from relying
        // only on an old JWT role.
        //
        // ------------------------------------------------------

        return done(
          null,
          user
        );

      } catch (error) {

        console.error(
          '[Passport JWT] User lookup failed:',
          error
        );

        return done(
          error,
          false
        );

      }

    }

  )

);


// ============================================================
// GOOGLE OAUTH
// ============================================================

if (
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CALLBACK_URL
) {

  passport.use(

    new GoogleStrategy(

      {

        clientID:
          process.env.GOOGLE_CLIENT_ID,

        clientSecret:
          process.env.GOOGLE_CLIENT_SECRET,

        callbackURL:
          process.env.GOOGLE_CALLBACK_URL,

      },


      // ======================================================
      // GOOGLE CALLBACK
      // ======================================================

      async (
        accessToken,
        refreshToken,
        profile,
        done
      ) => {

        try {

          const googleEmail =
            profile?.emails?.[0]?.value
              ?.trim()
              ?.toLowerCase();


          // --------------------------------------------------
          // Validate Google email
          // --------------------------------------------------

          if (!googleEmail) {

            return done(
              new Error(
                'Google account email was not provided.'
              ),
              null
            );

          }


          // --------------------------------------------------
          // Find existing user
          // --------------------------------------------------

          let user =
            await User.findOne({
              email: googleEmail,
            });


          // ==================================================
          // CREATE NEW GOOGLE USER
          // ==================================================

          if (!user) {

            user =
              await User.create({

                name:
                  profile.displayName ||
                  'Google User',

                email:
                  googleEmail,

                googleId:
                  profile.id,

                isEmailVerified:
                  true,

                authProvider:
                  'google',

                avatar:
                  profile.photos?.[0]?.value ||
                  null,

                // --------------------------------------------
                // Google OAuth users
                // --------------------------------------------

                agreedToTerms:
                  true,

                termsAcceptedAt:
                  new Date(),

              });

          }


          // ==================================================
          // EXISTING USER
          // ==================================================

          else {

            let changed = false;


            // ------------------------------------------------
            // Link Google account
            // ------------------------------------------------

            if (
              !user.googleId
            ) {

              user.googleId =
                profile.id;

              changed = true;

            }


            // ------------------------------------------------
            // Verify email
            // ------------------------------------------------

            if (
              !user.isEmailVerified
            ) {

              user.isEmailVerified =
                true;

              changed = true;

            }


            // ------------------------------------------------
            // Set auth provider if missing
            // ------------------------------------------------

            if (
              !user.authProvider
            ) {

              user.authProvider =
                'google';

              changed = true;

            }


            // ------------------------------------------------
            // Update avatar if available
            // ------------------------------------------------

            const googleAvatar =
              profile.photos?.[0]?.value;


            if (
              googleAvatar &&
              !user.avatar
            ) {

              user.avatar =
                googleAvatar;

              changed = true;

            }


            // ------------------------------------------------
            // Save only if changed
            // ------------------------------------------------

            if (changed) {

              await user.save();

            }

          }


          return done(
            null,
            user
          );

        } catch (error) {

          console.error(
            '[Passport Google] Authentication failed:',
            error
          );

          return done(
            error,
            null
          );

        }

      }

    )

  );

}


// ============================================================
// EXPORT
// ============================================================

module.exports = passport;