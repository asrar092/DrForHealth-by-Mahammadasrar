const express = require('express');

const router = express.Router();

const purchaseController = require('../controllers/purchaseController');
const { protect } = require('../middleware/auth');


// ============================================================
// PURCHASE / LIBRARY ROUTES
// ============================================================


// ------------------------------------------------------------
// MY LIBRARY
// GET /api/purchases/my-library
// ------------------------------------------------------------
// Requires authenticated user
// ------------------------------------------------------------

router.get(
  '/my-library',
  protect,
  purchaseController.getMyLibrary
);


// ------------------------------------------------------------
// DOWNLOAD HISTORY
// GET /api/purchases/download-history
// ------------------------------------------------------------
// Requires authenticated user
// ------------------------------------------------------------

router.get(
  '/download-history',
  protect,
  purchaseController.getDownloadHistory
);


// ------------------------------------------------------------
// DOWNLOAD EBOOK
// GET /api/purchases/:ebookId/download
// ------------------------------------------------------------
// Requires authenticated user
// User must own the eBook
// ------------------------------------------------------------

router.get(
  '/:ebookId/download',
  protect,
  purchaseController.getDownloadUrl
);


// ------------------------------------------------------------
// UPDATE READING PROGRESS
// PATCH /api/purchases/:ebookId/progress
// ------------------------------------------------------------
// Requires authenticated user
// ------------------------------------------------------------

router.patch(
  '/:ebookId/progress',
  protect,
  purchaseController.updateReadingProgress
);


module.exports = router;