const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ebook: { type: mongoose.Schema.Types.ObjectId, ref: 'Ebook', required: true },

    // Snapshot pricing at time of order (protects against later price changes)
    amount: { type: Number, required: true }, // in smallest currency unit (paise for INR)
    currency: { type: String, default: 'INR' },

    coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', default: null },
    discountApplied: { type: Number, default: 0 },

    razorpayOrderId: { type: String, required: true, unique: true },
    razorpayPaymentId: { type: String, default: null },
    razorpaySignature: { type: String, default: null },

    status: {
      type: String,
      enum: ['created', 'paid', 'failed', 'refunded'],
      default: 'created',
    },

    failureReason: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
