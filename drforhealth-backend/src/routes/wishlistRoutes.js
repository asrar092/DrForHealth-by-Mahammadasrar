const express = require('express');

const router = express.Router();

const {
  protect,
} = require('../middleware/auth');

const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  checkWishlistStatus,
} = require('../controllers/wishlistController');


// ============================================================
// ALL WISHLIST ROUTES REQUIRE LOGIN
// ============================================================

router.use(protect);


// GET /api/wishlist
router.get(
  '/',
  getWishlist
);


// POST /api/wishlist/:ebookId
router.post(
  '/:ebookId',
  addToWishlist
);


// DELETE /api/wishlist/:ebookId
router.delete(
  '/:ebookId',
  removeFromWishlist
);


// POST /api/wishlist/:ebookId/toggle
router.post(
  '/:ebookId/toggle',
  toggleWishlist
);


// GET /api/wishlist/:ebookId/status
router.get(
  '/:ebookId/status',
  checkWishlistStatus
);


module.exports = router;