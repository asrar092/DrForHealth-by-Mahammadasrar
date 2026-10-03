const mongoose = require('mongoose');

/**
 * A Purchase record is created ONLY after a webhook-verified successful payment.
 * This is the single source of truth checked before granting any download access.
 */
const purchaseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ebook: { type: mongoose.Schema.Types.ObjectId, ref: 'Ebook', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },

    downloadCount: { type: Number, default: 0 },
    lastDownloadedAt: { type: Date, default: null },

    readingProgressPercent: { type: Number, default: 0 },
  },
  { timestamps: true }
);

purchaseSchema.index({ user: 1, ebook: 1 }, { unique: true });

module.exports = mongoose.model('Purchase', purchaseSchema);
