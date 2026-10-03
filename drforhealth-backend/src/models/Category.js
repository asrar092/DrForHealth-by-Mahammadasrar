const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema(
  {
    // ==========================================================
    // CATEGORY NAME
    // ==========================================================

    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // ==========================================================
    // SLUG
    // ==========================================================

    slug: {
      type: String,
      unique: true,
      index: true,
    },

    // ==========================================================
    // ICON
    // ==========================================================

    icon: {
      type: String,
      default: '',
      trim: true,
    },

    // ==========================================================
    // DESCRIPTION
    // ==========================================================

    description: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);


// ============================================================
// AUTO SLUG
// ============================================================

categorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
    });
  }

  next();
});


// ============================================================
// EXPORT
// ============================================================

module.exports = mongoose.model(
  'Category',
  categorySchema
);