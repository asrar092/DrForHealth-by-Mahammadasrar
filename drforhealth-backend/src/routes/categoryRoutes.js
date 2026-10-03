const express = require('express');

const router = express.Router();

const ctrl = require('../controllers/categoryController');

const {
  protect,
  authorize,
} = require('../middleware/auth');


// ============================================================
// GET ALL CATEGORIES
// PUBLIC
// ============================================================

router.get(
  '/',
  ctrl.getCategories
);


// ============================================================
// CREATE CATEGORY
// SUPER ADMIN + CONTENT MANAGER
// ============================================================

router.post(
  '/',
  protect,
  authorize(
    'super_admin',
    'content_manager'
  ),
  ctrl.createCategory
);


// ============================================================
// UPDATE CATEGORY
// SUPER ADMIN + CONTENT MANAGER
// ============================================================

router.put(
  '/:id',
  protect,
  authorize(
    'super_admin',
    'content_manager'
  ),
  ctrl.updateCategory
);


// ============================================================
// DELETE CATEGORY
// SUPER ADMIN + CONTENT MANAGER
// ============================================================

router.delete(
  '/:id',
  protect,
  authorize(
    'super_admin',
    'content_manager'
  ),
  ctrl.deleteCategory
);


module.exports = router;