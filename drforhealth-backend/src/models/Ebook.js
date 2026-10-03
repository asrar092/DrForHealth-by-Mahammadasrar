const mongoose = require('mongoose');
const slugify = require('slugify');


// ============================================================
// EBOOK SCHEMA
// ============================================================

const ebookSchema = new mongoose.Schema(
  {
    // ==========================================================
    // BASIC INFORMATION
    // ==========================================================

    title: {
      type: String,
      required: true,
      trim: true,
    },

    subtitle: {
      type: String,
      default: '',
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    author: {
      type: String,
      default: 'Dr. Sibtain',
      trim: true,
    },


    // ==========================================================
    // CATEGORY
    // ==========================================================

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },


    // ==========================================================
    // PUBLIC TAGS
    // ==========================================================

    tags: [
      {
        type: String,
        trim: true,
      },
    ],


    // ==========================================================
    // PRIVATE ADMIN KEYWORDS
    // ==========================================================
    //
    // IMPORTANT:
    //
    // - Only super_admin can ADD / REMOVE / CHANGE keywords.
    // - admin and content_manager can VIEW keywords.
    // - normal users CANNOT see keywords.
    // - guests CANNOT see keywords.
    // - Keywords CAN be used for public search.
    //
    // Example:
    //
    // [
    //   "diabetes",
    //   "blood sugar",
    //   "glucose control"
    // ]
    //
    // ==========================================================

    adminKeywords: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],


    // ==========================================================
    // FILES / AWS S3
    // ==========================================================

    coverImageKey: {
      type: String,
      required: true,
    },

    previewFileKey: {
      type: String,
      default: null,
    },

    pdfFileKey: {
      type: String,
      required: true,
    },


    // ==========================================================
    // PRICING
    // ==========================================================

    priceINR: {
      type: Number,
      required: true,
      min: 0,
    },

    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    saleEndsAt: {
      type: Date,
      default: null,
    },


    // ==========================================================
    // STATUS
    // ==========================================================

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },


    // ==========================================================
    // STATISTICS
    // ==========================================================

    salesCount: {
      type: Number,
      default: 0,
    },

    downloadsCount: {
      type: Number,
      default: 0,
    },

    averageRating: {
      type: Number,
      default: 0,
    },

    reviewsCount: {
      type: Number,
      default: 0,
    },


    // ==========================================================
    // SEO
    // ==========================================================

    seo: {
      metaTitle: {
        type: String,
        default: '',
      },

      metaDescription: {
        type: String,
        default: '',
      },

      ogImage: {
        type: String,
        default: '',
      },
    },
  },

  {
    timestamps: true,
  }
);


// ============================================================
// FINAL PRICE VIRTUAL
// ============================================================

ebookSchema.virtual('finalPrice').get(function () {

  if (
    this.discountPercent > 0 &&
    (
      !this.saleEndsAt ||
      this.saleEndsAt > new Date()
    )
  ) {

    return Math.round(
      this.priceINR *
      (1 - this.discountPercent / 100)
    );

  }

  return this.priceINR;

});


// ============================================================
// JSON / OBJECT VIRTUALS
// ============================================================

ebookSchema.set('toJSON', {
  virtuals: true,
});

ebookSchema.set('toObject', {
  virtuals: true,
});


// ============================================================
// AUTO SLUG
// ============================================================

ebookSchema.pre('save', function (next) {

  if (this.isModified('title')) {

    this.slug =
      slugify(
        this.title,
        {
          lower: true,
          strict: true,
        }
      ) +
      '-' +
      Date.now().toString(36);

  }

  next();

});


// ============================================================
// TEXT SEARCH INDEX
// ============================================================
//
// Kept as an additional index.
//
// Public search itself is handled by ebookController.js
// using case-insensitive regex search so that:
//
// - keyword search works reliably
// - partial keyword search works
// - existing MongoDB text-index problems do not affect search
//
// ============================================================

ebookSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text',
  adminKeywords: 'text',
});


// ============================================================
// CATEGORY + ACTIVE INDEX
// ============================================================

ebookSchema.index({
  category: 1,
  isActive: 1,
});


// ============================================================
// ACTIVE + CREATED INDEX
// ============================================================

ebookSchema.index({
  isActive: 1,
  createdAt: -1,
});


// ============================================================
// EXPORT
// ============================================================

module.exports = mongoose.model(
  'Ebook',
  ebookSchema
);