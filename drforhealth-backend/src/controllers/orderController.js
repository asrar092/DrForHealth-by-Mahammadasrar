const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const Order = require('../models/Order');
const Purchase = require('../models/Purchase');
const Ebook = require('../models/Ebook');
const Coupon = require('../models/Coupon');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const emailService = require('../utils/emailService');

// @route POST /api/orders  (create a Razorpay order for checkout)
exports.createOrder = asyncHandler(async (req, res) => {
  const { ebookId, couponCode } = req.body;

  const ebook = await Ebook.findById(ebookId);
  if (!ebook || !ebook.isActive) throw new ApiError(404, 'eBook not available for purchase.');

  const alreadyOwned = await Purchase.exists({ user: req.user._id, ebook: ebook._id });
  if (alreadyOwned) throw new ApiError(409, 'You already own this eBook.');

  let finalAmount = ebook.finalPrice;
  let coupon = null;
  let discountApplied = 0;

  if (couponCode) {
    coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (!coupon || !coupon.isValid()) throw new ApiError(400, 'Coupon is invalid or expired.');
    if (coupon.applicableEbooks.length && !coupon.applicableEbooks.includes(ebook._id)) {
      throw new ApiError(400, 'Coupon is not applicable to this eBook.');
    }
    discountApplied =
      coupon.type === 'percentage' ? Math.round(finalAmount * (coupon.value / 100)) : coupon.value;
    finalAmount = Math.max(0, finalAmount - discountApplied);
  }

  // Razorpay expects amount in paise
  const amountInPaise = finalAmount * 100;

  const razorpayOrder = await razorpay.orders.create({
    amount: amountInPaise,
    currency: 'INR',
    receipt: `rcpt_${Date.now()}`,
    notes: { ebookId: ebook._id.toString(), userId: req.user._id.toString() },
  });

  const order = await Order.create({
    user: req.user._id,
    ebook: ebook._id,
    amount: amountInPaise,
    coupon: coupon?._id || null,
    discountApplied,
    razorpayOrderId: razorpayOrder.id,
  });

  res.status(201).json({
    success: true,
    data: {
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID,
      ebookTitle: ebook.title,
    },
  });
});

// @route POST /api/orders/verify  (called from frontend after Razorpay checkout completes)
// NOTE: This confirms the signature but the WEBHOOK below is the authoritative source
// of truth for granting access, since client-side calls can be spoofed or interrupted.
exports.verifyPayment = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpaySignature) {
    throw new ApiError(400, 'Payment verification failed. Invalid signature.');
  }

  const order = await Order.findOne({ razorpayOrderId });
  if (!order) throw new ApiError(404, 'Order not found.');

  res.json({ success: true, message: 'Payment verified. Access will be granted shortly.' });
});

// @route POST /api/orders/webhook  (Razorpay server-to-server webhook - AUTHORITATIVE)
exports.razorpayWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(req.rawBody) // requires raw body capture - see server.js
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(400).json({ success: false, message: 'Invalid webhook signature.' });
  }

  const event = req.body.event;
  const payload = req.body.payload.payment.entity;

  if (event === 'payment.captured') {
    const order = await Order.findOne({ razorpayOrderId: payload.order_id }).populate('user ebook');
    if (order && order.status !== 'paid') {
      order.status = 'paid';
      order.razorpayPaymentId = payload.id;
      await order.save();

      await Purchase.create({ user: order.user._id, ebook: order.ebook._id, order: order._id });

      order.ebook.salesCount += 1;
      await order.ebook.save();

      if (order.coupon) {
        await Coupon.findByIdAndUpdate(order.coupon, { $inc: { usedCount: 1 } });
      }

      await emailService.sendOrderConfirmation(order.user.email, order.user.name, order.ebook.title, order.amount / 100);
      await emailService.sendPurchaseSuccess(
        order.user.email,
        order.user.name,
        order.ebook.title,
        `${process.env.CLIENT_URL}/dashboard/library`
      );
    }
  }

  if (event === 'payment.failed') {
    const order = await Order.findOne({ razorpayOrderId: payload.order_id }).populate('user ebook');
    if (order) {
      order.status = 'failed';
      order.failureReason = payload.error_description || 'Payment failed';
      await order.save();
      await emailService.sendPaymentFailed(order.user.email, order.user.name, order.ebook.title);
    }
  }

  res.json({ success: true });
});

// @route GET /api/orders/my-orders
exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).populate('ebook', 'title coverImageKey slug').sort('-createdAt');
  res.json({ success: true, data: orders });
});
