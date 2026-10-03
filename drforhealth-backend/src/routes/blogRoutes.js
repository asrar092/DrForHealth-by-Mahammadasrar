const express = require('express');

const router = express.Router();

const {
  createBlog,
  getBlogs,
  getBlogBySlug,
  getAllBlogsAdmin,
  getBlogByIdAdmin,
  updateBlog,
  deleteBlog,
  publishBlog,
  unpublishBlog,
} = require('../controllers/blogController');

const { protect, authorize } = require('../middleware/auth');


// ============================================================
// PUBLIC BLOG ROUTES
// ============================================================

// Get all published blogs
// GET /api/blogs
router.get(
  '/',
  getBlogs
);


// Get single published blog by slug
// GET /api/blogs/:slug
router.get(
  '/:slug',
  getBlogBySlug
);


// ============================================================
// SUPER ADMIN BLOG ROUTES
// ============================================================
//
// Only authenticated users with role:
// super_admin
//
// can access these routes.
// ============================================================


// Get all blogs including drafts
// GET /api/blogs/admin/all
router.get(
  '/admin/all',
  protect,
  authorize('super_admin'),
  getAllBlogsAdmin
);


// Get single blog by ID
// GET /api/blogs/admin/:id
router.get(
  '/admin/:id',
  protect,
  authorize('super_admin'),
  getBlogByIdAdmin
);


// Create new blog
// POST /api/blogs
router.post(
  '/',
  protect,
  authorize('super_admin'),
  createBlog
);


// Update blog
// PUT /api/blogs/:id
router.put(
  '/:id',
  protect,
  authorize('super_admin'),
  updateBlog
);


// Delete blog
// DELETE /api/blogs/:id
router.delete(
  '/:id',
  protect,
  authorize('super_admin'),
  deleteBlog
);


// Publish blog
// PATCH /api/blogs/:id/publish
router.patch(
  '/:id/publish',
  protect,
  authorize('super_admin'),
  publishBlog
);


// Unpublish blog
// PATCH /api/blogs/:id/unpublish
router.patch(
  '/:id/unpublish',
  protect,
  authorize('super_admin'),
  unpublishBlog
);


module.exports = router;