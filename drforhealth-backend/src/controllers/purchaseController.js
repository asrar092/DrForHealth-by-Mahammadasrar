const Purchase = require('../models/Purchase');
const Ebook = require('../models/Ebook');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { getSignedDownloadUrl } = require('../config/s3');

// @route GET /api/purchases/my-library
exports.getMyLibrary = asyncHandler(async (req, res) => {
  const purchases = await Purchase.find({ user: req.user._id })
    .populate({ path: 'ebook', populate: { path: 'category', select: 'name' } })
    .sort('-createdAt');

  res.json({ success: true, data: purchases });
});

// @route GET /api/purchases/:ebookId/download
// CRITICAL SECURITY PATH: only issues a short-lived signed URL if a Purchase
// record exists for this exact user + ebook pair. Purchase records are only
// ever created by the webhook-verified payment.captured event.
exports.getDownloadUrl = asyncHandler(async (req, res) => {
  const { ebookId } = req.params;

  const purchase = await Purchase.findOne({ user: req.user._id, ebook: ebookId });
  if (!purchase) {
    throw new ApiError(403, 'You have not purchased this eBook.');
  }

  const ebook = await Ebook.findById(ebookId);
  if (!ebook) throw new ApiError(404, 'eBook not found.');

  const signedUrl = getSignedDownloadUrl(ebook.pdfFileKey, 300); // 5-minute expiry

  purchase.downloadCount += 1;
  purchase.lastDownloadedAt = new Date();
  await purchase.save();

  ebook.downloadsCount += 1;
  await ebook.save();

  res.json({ success: true, downloadUrl: signedUrl, expiresInSeconds: 300 });
});

// @route GET /api/purchases/download-history
exports.getDownloadHistory = asyncHandler(async (req, res) => {
  const purchases = await Purchase.find({ user: req.user._id, downloadCount: { $gt: 0 } })
    .populate('ebook', 'title coverImageKey slug')
    .sort('-lastDownloadedAt');

  res.json({ success: true, data: purchases });
});

// @route PATCH /api/purchases/:ebookId/progress  (reading progress tracking)
exports.updateReadingProgress = asyncHandler(async (req, res) => {
  const { percent } = req.body;
  const purchase = await Purchase.findOneAndUpdate(
    { user: req.user._id, ebook: req.params.ebookId },
    { readingProgressPercent: Math.min(100, Math.max(0, percent)) },
    { new: true }
  );
  if (!purchase) throw new ApiError(403, 'You have not purchased this eBook.');
  res.json({ success: true, data: purchase });
});
