import api from './axios';


// ============================================================
// WISHLIST API
// ============================================================

export const wishlistApi = {

  // ==========================================================
  // GET USER WISHLIST
  // GET /api/wishlist
  // ==========================================================

  getWishlist: () =>
    api.get('/wishlist'),


  // ==========================================================
  // ADD EBOOK TO WISHLIST
  // POST /api/wishlist/:ebookId
  // ==========================================================

  addToWishlist: (ebookId) =>
    api.post(
      `/wishlist/${ebookId}`
    ),


  // ==========================================================
  // REMOVE EBOOK FROM WISHLIST
  // DELETE /api/wishlist/:ebookId
  // ==========================================================

  removeFromWishlist: (ebookId) =>
    api.delete(
      `/wishlist/${ebookId}`
    ),


  // ==========================================================
  // TOGGLE WISHLIST
  // POST /api/wishlist/:ebookId/toggle
  // ==========================================================

  toggleWishlist: (ebookId) =>
    api.post(
      `/wishlist/${ebookId}/toggle`
    ),


  // ==========================================================
  // CHECK WISHLIST STATUS
  // GET /api/wishlist/:ebookId/status
  // ==========================================================

  checkStatus: (ebookId) =>
    api.get(
      `/wishlist/${ebookId}/status`
    ),

};