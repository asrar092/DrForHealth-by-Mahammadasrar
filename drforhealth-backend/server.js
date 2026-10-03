require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const passport = require('./src/config/passport');

const connectDB = require('./src/config/db');

// ============================================================
// REDIS DISABLED TEMPORARILY
// ============================================================

// const { connectRedis } = require('./src/config/redis');

// ============================================================
// ERROR HANDLERS
// ============================================================

const {
  notFound,
  errorHandler,
} = require('./src/middleware/errorHandler');

// ============================================================
// RATE LIMITER
// ============================================================

const {
  apiLimiter,
} = require('./src/middleware/rateLimiter');

// ============================================================
// ROUTES
// ============================================================

const authRoutes =
  require('./src/routes/authRoutes');

const ebookRoutes =
  require('./src/routes/ebookRoutes');

const categoryRoutes =
  require('./src/routes/categoryRoutes');

const orderRoutes =
  require('./src/routes/orderRoutes');

const purchaseRoutes =
  require('./src/routes/purchaseRoutes');

const blogRoutes =
  require('./src/routes/blogRoutes');

// ============================================================
// WISHLIST ROUTES
// ============================================================

const wishlistRoutes =
  require('./src/routes/wishlistRoutes');

// ============================================================
// RAZORPAY WEBHOOK
// ============================================================

const {
  razorpayWebhook,
} = require('./src/controllers/orderController');

// ============================================================
// CREATE EXPRESS APP
// ============================================================

const app = express();

// ============================================================
// SECURITY
// ============================================================

app.use(
  helmet()
);

// ============================================================
// CORS
// ============================================================

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// ============================================================
// LOGGER
// ============================================================

app.use(
  morgan(
    process.env.NODE_ENV === 'production'
      ? 'combined'
      : 'dev'
  )
);

// ============================================================
// COOKIE PARSER
// ============================================================

app.use(
  cookieParser()
);

// ============================================================
// PASSPORT
// ============================================================

app.use(
  passport.initialize()
);

// ============================================================
// RAZORPAY WEBHOOK
// ============================================================
//
// IMPORTANT:
// express.raw() must come before express.json()
// for Razorpay webhook signature verification.
//
// ============================================================

app.post(
  '/api/orders/webhook',

  express.raw({
    type: 'application/json',
  }),

  (req, res, next) => {
    try {
      req.rawBody = req.body;

      req.body =
        JSON.parse(
          req.body.toString('utf8')
        );

      next();

    } catch (error) {
      next(error);
    }
  },

  razorpayWebhook
);

// ============================================================
// BODY PARSER
// ============================================================
//
// JSON requests are limited to 10 MB.
// This does NOT limit multipart/form-data uploads
// handled by Multer.
//
// ============================================================

app.use(
  express.json({
    limit: '10mb',
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '10mb',
  })
);

// ============================================================
// GLOBAL API RATE LIMITER
// ============================================================
//
// Auth routes have their own authLimiter.
//
// ============================================================

app.use(
  '/api',

  (req, res, next) => {
    if (
      req.path.startsWith('/auth')
    ) {
      return next();
    }

    return apiLimiter(
      req,
      res,
      next
    );
  }
);

// ============================================================
// HEALTH CHECK
// ============================================================

app.get(
  '/api/health',

  (req, res) => {
    res.json({
      success: true,
      status: 'ok',
      time: new Date().toISOString(),
    });
  }
);

// ============================================================
// AUTH ROUTES
// ============================================================
//
// /api/auth/register
// /api/auth/login
// /api/auth/refresh
// /api/auth/logout
// /api/auth/me
//
// ============================================================

app.use(
  '/api/auth',
  authRoutes
);

// ============================================================
// EBOOK ROUTES
// ============================================================
//
// /api/ebooks
//
// eBook PDF uploads are handled by Multer.
// Maximum upload size is configured in:
//
// src/middleware/upload.js
//
// Current limit:
// 500 MB
//
// ============================================================

app.use(
  '/api/ebooks',
  ebookRoutes
);

// ============================================================
// CATEGORY ROUTES
// ============================================================

app.use(
  '/api/categories',
  categoryRoutes
);

// ============================================================
// ORDER ROUTES
// ============================================================

app.use(
  '/api/orders',
  orderRoutes
);

// ============================================================
// PURCHASE ROUTES
// ============================================================

app.use(
  '/api/purchases',
  purchaseRoutes
);

// ============================================================
// WISHLIST ROUTES
// ============================================================
//
// GET    /api/wishlist
// POST   /api/wishlist/:ebookId
// DELETE /api/wishlist/:ebookId
// POST   /api/wishlist/:ebookId/toggle
// GET    /api/wishlist/:ebookId/status
//
// ============================================================

app.use(
  '/api/wishlist',
  wishlistRoutes
);

// ============================================================
// BLOG ROUTES
// ============================================================
//
// Public:
//
// GET /api/blogs
// GET /api/blogs/:slug
//
// Admin:
//
// GET    /api/blogs/admin/all
// GET    /api/blogs/admin/:id
// POST   /api/blogs
// PUT    /api/blogs/:id
// DELETE /api/blogs/:id
// PATCH  /api/blogs/:id/publish
// PATCH  /api/blogs/:id/unpublish
//
// ============================================================

app.use(
  '/api/blogs',
  blogRoutes
);

// ============================================================
// 404 HANDLER
// ============================================================

app.use(
  notFound
);

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use(
  errorHandler
);

// ============================================================
// SERVER PORT
// ============================================================

const PORT =
  process.env.PORT || 5000;

// ============================================================
// START SERVER
// ============================================================

async function start() {
  try {

    // ========================================================
    // CONNECT MONGODB
    // ========================================================

    await connectDB();

    console.log(
      '[MongoDB] Database connection successful'
    );

    // ========================================================
    // REDIS
    // ========================================================

    console.log(
      '[Redis] Disabled temporarily'
    );

    // ========================================================
    // START EXPRESS SERVER
    // ========================================================

    const server =
      app.listen(
        PORT,

        () => {
          console.log(
            `[Server] Dr For Health API running on port ${PORT} (${process.env.NODE_ENV || 'development'})`
          );

          console.log(
            '[Upload] Maximum eBook upload size: 500 MB'
          );
        }
      );

    // ========================================================
    // LARGE FILE UPLOAD SUPPORT
    // ========================================================
    //
    // Allow enough time for large PDF uploads.
    //
    // 500 MB files can take considerable time depending
    // on the user's internet connection.
    //
    // ========================================================

    server.requestTimeout = 15 * 60 * 1000;

    server.headersTimeout = 16 * 60 * 1000;

    server.keepAliveTimeout = 65 * 1000;

    // ========================================================
    // GRACEFUL SHUTDOWN
    // ========================================================

    process.on(
      'SIGTERM',

      () => {
        console.log(
          'SIGTERM received. Closing server gracefully...'
        );

        server.close(
          () => {
            console.log(
              '[Server] Closed'
            );

            process.exit(0);
          }
        );
      }
    );

    process.on(
      'SIGINT',

      () => {
        console.log(
          'SIGINT received. Closing server gracefully...'
        );

        server.close(
          () => {
            console.log(
              '[Server] Closed'
            );

            process.exit(0);
          }
        );
      }
    );

  } catch (error) {

    console.error(
      '[Server] Failed to start:',
      error
    );

    process.exit(1);
  }
}

// ============================================================
// START APPLICATION
// ============================================================

start();

// ============================================================
// EXPORT APP
// ============================================================

module.exports = app;