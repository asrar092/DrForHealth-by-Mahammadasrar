import api from '@/api/axios';


// ============================================================
// CATEGORY API
// ============================================================

export const categoryApi = {

  // ----------------------------------------------------------
  // GET /api/categories
  // ----------------------------------------------------------

  list: () =>
    api.get('/categories'),


  // ----------------------------------------------------------
  // POST /api/categories
  // ----------------------------------------------------------

  create: (data) =>
    api.post('/categories', data),


  // ----------------------------------------------------------
  // PUT /api/categories/:id
  // ----------------------------------------------------------

  update: (id, data) =>
    api.put(`/categories/${id}`, data),


  // ----------------------------------------------------------
  // DELETE /api/categories/:id
  // ----------------------------------------------------------

  delete: (id) =>
    api.delete(`/categories/${id}`),

};


// ============================================================
// EBOOK API
// ============================================================

export const ebookApi = {

  // ==========================================================
  // PUBLIC EBOOK APIs
  // ==========================================================

  // ----------------------------------------------------------
  // GET /api/ebooks
  //
  // Public store.
  //
  // Search can search:
  // - title
  // - description
  // - tags
  // - private adminKeywords
  //
  // IMPORTANT:
  // adminKeywords are NOT returned by backend to normal users.
  //
  // ----------------------------------------------------------

  list: (params = {}) =>
    api.get('/ebooks', {
      params,
    }),


  // ----------------------------------------------------------
  // GET /api/ebooks/:slug
  // ----------------------------------------------------------

  getBySlug: (slug) =>
    api.get(`/ebooks/${slug}`),


  // ==========================================================
  // EBOOK PREVIEW
  // ==========================================================

  // ----------------------------------------------------------
  // GET /api/ebooks/:id/preview
  // ----------------------------------------------------------

  preview: (id) =>
    api.get(`/ebooks/${id}/preview`),


  // ----------------------------------------------------------
  // GET /api/ebooks/:id/preview
  //
  // Kept for backward compatibility with existing frontend
  // components that use getPreviewUrl().
  //
  // ----------------------------------------------------------

  getPreviewUrl: (id) =>
    api.get(`/ebooks/${id}/preview`),


  // ==========================================================
  // WISHLIST
  // ==========================================================

  // ----------------------------------------------------------
  // GET /api/ebooks/wishlist
  // ----------------------------------------------------------

  getWishlist: () =>
    api.get('/ebooks/wishlist'),


  // ----------------------------------------------------------
  // POST /api/ebooks/:id/wishlist
  // ----------------------------------------------------------

  addToWishlist: (id) =>
    api.post(`/ebooks/${id}/wishlist`),


  // ----------------------------------------------------------
  // DELETE /api/ebooks/:id/wishlist
  // ----------------------------------------------------------

  removeFromWishlist: (id) =>
    api.delete(`/ebooks/${id}/wishlist`),


  // ==========================================================
  // SUPER ADMIN EBOOK MANAGEMENT
  // ==========================================================
  //
  // Keywords belong to an individual eBook.
  //
  // Create:
  //   book + adminKeywords
  //
  // Update:
  //   book + adminKeywords
  //
  // Backend controls who can access these endpoints.
  //
  // ==========================================================

  // ----------------------------------------------------------
  // GET /api/ebooks/admin/all
  //
  // Protected Super Admin endpoint.
  //
  // ----------------------------------------------------------

  adminList: () =>
    api.get('/ebooks/admin/all'),


  // ----------------------------------------------------------
  // POST /api/ebooks/admin
  //
  // Create / Upload eBook
  //
  // FormData:
  //
  // title
  // description
  // category
  // priceINR
  // adminKeywords
  // coverImage
  // pdfFile
  // previewFile
  //
  // IMPORTANT:
  // Do NOT manually set Content-Type here.
  // Axios/browser will automatically generate:
  //
  // multipart/form-data; boundary=....
  //
  // ----------------------------------------------------------

  create: (formData) =>
    api.post(
      '/ebooks/admin',
      formData
    ),


  // ----------------------------------------------------------
  // PUT /api/ebooks/admin/:id
  //
  // Update eBook
  //
  // FormData:
  //
  // title
  // description
  // category
  // priceINR
  // adminKeywords
  // isActive
  // coverImage
  // pdfFile
  // previewFile
  //
  // IMPORTANT:
  // Do NOT manually set Content-Type here.
  //
  // ----------------------------------------------------------

  update: (id, formData) =>
    api.put(
      `/ebooks/admin/${id}`,
      formData
    ),


  // ----------------------------------------------------------
  // DELETE /api/ebooks/admin/:id
  // ----------------------------------------------------------

  delete: (id) =>
    api.delete(`/ebooks/admin/${id}`),

};


// ============================================================
// PURCHASE API
// ============================================================

export const purchaseApi = {

  // ----------------------------------------------------------
  // GET /api/purchases/my-library
  // ----------------------------------------------------------

  myLibrary: () =>
    api.get('/purchases/my-library'),


  // ----------------------------------------------------------
  // GET /api/purchases/download-history
  // ----------------------------------------------------------

  downloadHistory: () =>
    api.get('/purchases/download-history'),


  // ----------------------------------------------------------
  // GET /api/purchases/:ebookId/download
  // ----------------------------------------------------------

  getDownloadUrl: (ebookId) =>
    api.get(`/purchases/${ebookId}/download`),


  // ----------------------------------------------------------
  // PATCH /api/purchases/:ebookId/progress
  // ----------------------------------------------------------

  updateReadingProgress: (
    ebookId,
    data
  ) =>
    api.patch(
      `/purchases/${ebookId}/progress`,
      data
    ),

};


// ============================================================
// ORDER API
// ============================================================

export const orderApi = {

  // ----------------------------------------------------------
  // GET /api/orders/my-orders
  // ----------------------------------------------------------

  myOrders: () =>
    api.get('/orders/my-orders'),


  // ----------------------------------------------------------
  // POST /api/orders
  // ----------------------------------------------------------

  create: (data) =>
    api.post(
      '/orders',
      data
    ),


  // ----------------------------------------------------------
  // POST /api/orders/verify
  // ----------------------------------------------------------

  verify: (data) =>
    api.post(
      '/orders/verify',
      data
    ),

};