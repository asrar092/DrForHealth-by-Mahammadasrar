const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required.'],
      trim: true,
      maxlength: 200,
    },

    slug: {
      type: String,
      required: [true, 'Blog slug is required.'],
      unique: true,
      lowercase: true,
      trim: true,
    },

    excerpt: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },

    content: {
      type: String,
      required: [true, 'Blog content is required.'],
      default: '',
    },

    coverImage: {
      type: String,
      default: '',
      trim: true,
    },

    author: {
      type: String,
      default: 'Dr For Health',
      trim: true,
    },

    category: {
      type: String,
      default: 'Health',
      trim: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },

    publishedAt: {
      type: Date,
      default: null,
    },

    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);


// ============================================================
// AUTO-GENERATE SLUG IF NOT PROVIDED
// ============================================================

blogSchema.pre('validate', function (next) {
  if (this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  next();
});


module.exports = mongoose.model('Blog', blogSchema);