const express = require('express');

const router = express.Router();

const ctrl =
  require('../controllers/ebookController');

const {
  protect,
  authorize,
  optionalAuth,
} = require('../middleware/auth');

const upload =
  require('../middleware/upload');


// ============================================================
// UPLOAD FIELDS
// ============================================================
//
// Maximum file size is controlled by:
//
// src/middleware/upload.js
//
// Current maximum:
// 500 MB
//
// Supported fields:
//
// coverImage
// pdfFile
// previewFile
//
// ============================================================

const uploadFields =
  upload.fields([

    {
      name: 'coverImage',
      maxCount: 1,
    },

    {
      name: 'pdfFile',
      maxCount: 1,
    },

    {
      name: 'previewFile',
      maxCount: 1,
    },

  ]);


// ============================================================
// PUBLIC EBOOK ROUTES
// ============================================================
//
// GET /api/ebooks
//
// optionalAuth:
//
// Guest:
//   Public response
//
// normal_user:
//   Public response
//
// Admin-side:
//   adminKeywords can be visible
//
// ============================================================

router.get(
  '/',
  optionalAuth,
  ctrl.getEbooks
);


// ============================================================
// WISHLIST
// ============================================================

// GET /api/ebooks/wishlist

router.get(
  '/wishlist',
  protect,
  ctrl.getWishlist
);


// ============================================================
// ADD TO WISHLIST
// ============================================================

// POST /api/ebooks/:id/wishlist

router.post(
  '/:id/wishlist',
  protect,
  ctrl.addToWishlist
);


// ============================================================
// REMOVE FROM WISHLIST
// ============================================================

// DELETE /api/ebooks/:id/wishlist

router.delete(
  '/:id/wishlist',
  protect,
  ctrl.removeFromWishlist
);


// ============================================================
// ADMIN EBOOK MANAGEMENT
// ============================================================
//
// ADMIN-SIDE ROLES:
//
// super_admin
// admin
// content_manager
//
// ============================================================


// ============================================================
// GET ALL EBOOKS - ADMIN SIDE
// ============================================================
//
// GET /api/ebooks/admin/all
//
// adminKeywords visible.
//
// ============================================================

router.get(
  '/admin/all',

  protect,

  authorize(
    'super_admin',
    'admin',
    'content_manager'
  ),

  ctrl.getAllEbooksAdmin
);


// ============================================================
// CREATE EBOOK
// ============================================================
//
// POST /api/ebooks/admin
//
// Upload fields:
//
// coverImage
// pdfFile
// previewFile
//
// Maximum file size:
// 500 MB
//
// The actual file-size limit is configured in:
//
// src/middleware/upload.js
//
// ============================================================

router.post(
  '/admin',

  protect,

  authorize(
    'super_admin',
    'admin',
    'content_manager'
  ),

  uploadFields,

  ctrl.createEbook
);


// ============================================================
// UPDATE EBOOK
// ============================================================
//
// PUT /api/ebooks/admin/:id
//
// Upload fields:
//
// coverImage
// pdfFile
// previewFile
//
// Maximum file size:
// 500 MB
//
// ============================================================

router.put(
  '/admin/:id',

  protect,

  authorize(
    'super_admin',
    'admin',
    'content_manager'
  ),

  uploadFields,

  ctrl.updateEbook
);


// ============================================================
// DELETE EBOOK
// ============================================================
//
// DELETE /api/ebooks/admin/:id
//
// ============================================================

router.delete(
  '/admin/:id',

  protect,

  authorize(
    'super_admin',
    'admin',
    'content_manager'
  ),

  ctrl.deleteEbook
);


// ============================================================
// PUBLIC PREVIEW
// ============================================================
//
// GET /api/ebooks/:id/preview
//
// ============================================================

router.get(
  '/:id/preview',
  ctrl.getEbookPreview
);


// ============================================================
// PUBLIC EBOOK DETAIL
// ============================================================
//
// GET /api/ebooks/:slug
//
// optionalAuth allows:
//
// Admin-side user:
//   adminKeywords visible
//
// Normal user:
//   adminKeywords hidden
//
// Guest:
//   adminKeywords hidden
//
// ============================================================

router.get(
  '/:slug',
  optionalAuth,
  ctrl.getEbookBySlug
);


// ============================================================
// EXPORT
// ============================================================

module.exports = router;