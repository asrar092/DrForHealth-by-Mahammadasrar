const User = require('../models/User');
const Ebook = require('../models/Ebook');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const {
  getSignedImageUrl,
} = require('../config/s3');


// ============================================================
// GET WISHLIST
// GET /api/wishlist
// Protected
// ============================================================

exports.getWishlist = asyncHandler(async (req, res) => {

  const user = await User.findById(req.user._id)
    .populate({
      path: 'wishlist',
      match: { isActive: true },
      populate: {
        path: 'category',
        select: 'name slug',
      },
    });

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }


  // ==========================================================
  // GENERATE SIGNED COVER IMAGE URLS
  // ==========================================================

  const wishlist = (user.wishlist || []).map((ebook) => {

    const ebookData = ebook.toObject();

    ebookData.coverImageUrl = getSignedImageUrl(
      ebook.coverImageKey,
      3600
    );

    return ebookData;
  });


  res.json({
    success: true,
    data: wishlist,
  });

});


// ============================================================
// ADD EBOOK TO WISHLIST
// POST /api/wishlist/:ebookId
// Protected
// ============================================================

exports.addToWishlist = asyncHandler(async (req, res) => {

  const { ebookId } = req.params;


  // ==========================================================
  // CHECK EBOOK
  // ==========================================================

  const ebook = await Ebook.findOne({
    _id: ebookId,
    isActive: true,
  });

  if (!ebook) {
    throw new ApiError(
      404,
      'eBook not found.'
    );
  }


  // ==========================================================
  // CHECK ALREADY EXISTS
  // ==========================================================

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(
      404,
      'User not found.'
    );
  }


  const alreadyExists = user.wishlist.some(
    (id) => id.toString() === ebookId.toString()
  );


  if (alreadyExists) {

    return res.json({
      success: true,
      message: 'eBook is already in your wishlist.',
      wishlisted: true,
    });

  }


  // ==========================================================
  // ADD
  // ==========================================================

  user.wishlist.push(ebook._id);

  await user.save();


  res.status(201).json({
    success: true,
    message: 'eBook added to wishlist.',
    wishlisted: true,
  });

});


// ============================================================
// REMOVE EBOOK FROM WISHLIST
// DELETE /api/wishlist/:ebookId
// Protected
// ============================================================

exports.removeFromWishlist = asyncHandler(
  async (req, res) => {

    const { ebookId } = req.params;


    const user = await User.findById(
      req.user._id
    );

    if (!user) {
      throw new ApiError(
        404,
        'User not found.'
      );
    }


    // ========================================================
    // REMOVE EBOOK
    // ========================================================

    const oldLength =
      user.wishlist.length;


    user.wishlist =
      user.wishlist.filter(
        (id) =>
          id.toString() !==
          ebookId.toString()
      );


    if (
      user.wishlist.length ===
      oldLength
    ) {

      throw new ApiError(
        404,
        'eBook is not in your wishlist.'
      );

    }


    await user.save();


    res.json({
      success: true,
      message:
        'eBook removed from wishlist.',
      wishlisted: false,
    });

  }
);


// ============================================================
// TOGGLE WISHLIST
// POST /api/wishlist/:ebookId/toggle
// Protected
// ============================================================

exports.toggleWishlist = asyncHandler(
  async (req, res) => {

    const { ebookId } = req.params;


    // ========================================================
    // CHECK EBOOK
    // ========================================================

    const ebook = await Ebook.findOne({
      _id: ebookId,
      isActive: true,
    });

    if (!ebook) {
      throw new ApiError(
        404,
        'eBook not found.'
      );
    }


    const user = await User.findById(
      req.user._id
    );

    if (!user) {
      throw new ApiError(
        404,
        'User not found.'
      );
    }


    // ========================================================
    // CHECK CURRENT STATUS
    // ========================================================

    const index =
      user.wishlist.findIndex(
        (id) =>
          id.toString() ===
          ebookId.toString()
      );


    // ========================================================
    // REMOVE
    // ========================================================

    if (index !== -1) {

      user.wishlist.splice(
        index,
        1
      );

      await user.save();


      return res.json({
        success: true,
        message:
          'eBook removed from wishlist.',
        wishlisted: false,
      });

    }


    // ========================================================
    // ADD
    // ========================================================

    user.wishlist.push(
      ebook._id
    );

    await user.save();


    res.json({
      success: true,
      message:
        'eBook added to wishlist.',
      wishlisted: true,
    });

  }
);


// ============================================================
// CHECK WISHLIST STATUS
// GET /api/wishlist/:ebookId/status
// Protected
// ============================================================

exports.checkWishlistStatus =
  asyncHandler(async (req, res) => {

    const { ebookId } =
      req.params;


    const user =
      await User.findById(
        req.user._id
      ).select('wishlist');


    if (!user) {
      throw new ApiError(
        404,
        'User not found.'
      );
    }


    const wishlisted =
      user.wishlist.some(
        (id) =>
          id.toString() ===
          ebookId.toString()
      );


    res.json({
      success: true,
      wishlisted,
    });

  });