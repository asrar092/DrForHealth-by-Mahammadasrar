const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['percentage', 'fixed'], required: true },
    value: { type: Number, required: true, min: 0 },

    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date, default: null },

    usageLimit: { type: Number, default: null }, // null = unlimited
    usedCount: { type: Number, default: 0 },

    minOrderValue: { type: Number, default: 0 },
    applicableEbooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ebook' }], // empty = all eBooks
  },
  { timestamps: true }
);

couponSchema.methods.isValid = function () {
  if (!this.isActive) return false;
  if (this.expiresAt && this.expiresAt < new Date()) return false;
  if (this.usageLimit !== null && this.usedCount >= this.usageLimit) return false;
  return true;
};

module.exports = mongoose.model('Coupon', couponSchema);
