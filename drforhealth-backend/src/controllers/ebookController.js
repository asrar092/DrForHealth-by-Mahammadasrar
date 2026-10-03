const { v4: uuid } = require('uuid');

const Ebook = require('../models/Ebook');
const Purchase = require('../models/Purchase');
const User = require('../models/User');

const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const {
  uploadToS3,
  getSignedImageUrl,
  getSignedPreviewUrl,
  deleteFromS3,
} = require('../config/s3');


// ============================================================
// PERMISSION HELPERS
// ============================================================
//
// ADMIN-SIDE USERS:
//
// super_admin
// admin
// content_manager
//
// These users can VIEW admin-side eBooks.
//
// IMPORTANT:
//
// Only super_admin can:
// - Add adminKeywords
// - Remove adminKeywords
// - Replace adminKeywords
//
// admin/content_manager:
// - Can view adminKeywords
// - Cannot modify adminKeywords
//
// normal_user:
// - Cannot see adminKeywords
//
// ============================================================

const ADMIN_ROLES = [
  'super_admin',
  'admin',
  'content_manager',
];


const isAdminUser = (user) => {
  return ADMIN_ROLES.includes(
    user?.role
  );
};


const isSuperAdmin = (user) => {
  return user?.role === 'super_admin';
};


// ============================================================
// NORMALIZE ARRAY
// ============================================================

const normalizeArray = (value) => {

  if (
    value === undefined ||
    value === null
  ) {
    return [];
  }


  if (Array.isArray(value)) {

    return value
      .map((item) =>
        String(item).trim()
      )
      .filter(Boolean);

  }


  return String(value)
    .split(',')
    .map((item) =>
      item.trim()
    )
    .filter(Boolean);
};


// ============================================================
// NORMALIZE NORMAL TAGS
// ============================================================

const normalizeTags = (value) => {

  return [
    ...new Set(
      normalizeArray(value)
    ),
  ];

};


// ============================================================
// NORMALIZE ADMIN KEYWORDS
// ============================================================
//
// Example:
//
// "Diabetes, Blood Sugar, GLUCOSE"
//
// becomes:
//
// [
//   "diabetes",
//   "blood sugar",
//   "glucose"
// ]
//
// ============================================================

const normalizeAdminKeywords = (value) => {

  const keywords =
    normalizeArray(value)
      .map((keyword) =>
        keyword
          .trim()
          .toLowerCase()
      )
      .filter(Boolean);


  return [
    ...new Set(keywords),
  ];

};


// ============================================================
// PUBLIC SANITIZATION
// ============================================================
//
// adminKeywords are NEVER returned to normal users / guests.
//
// ============================================================

const sanitizeEbookForPublic = (ebook) => {

  const ebookData =
    ebook?.toObject
      ? ebook.toObject()
      : { ...ebook };


  delete ebookData.adminKeywords;


  return ebookData;

};


// ============================================================
// PREPARE EBOOK RESPONSE
// ============================================================
//
// ADMIN SIDE:
//
// super_admin
// admin
// content_manager
//
// => adminKeywords visible
//
// PUBLIC:
//
// normal_user
// guest
//
// => adminKeywords hidden
//
// ============================================================

const prepareEbookResponse = (
  ebook,
  user
) => {

  if (
    isAdminUser(user)
  ) {

    return ebook?.toObject
      ? ebook.toObject()
      : { ...ebook };

  }


  return sanitizeEbookForPublic(
    ebook
  );

};


// ============================================================
// ADD SIGNED COVER URL
// ============================================================

const addCoverImageUrl = (
  ebookData
) => {

  if (
    ebookData &&
    ebookData.coverImageKey
  ) {

    ebookData.coverImageUrl =
      getSignedImageUrl(
        ebookData.coverImageKey,
        3600
      );

  }


  return ebookData;

};


// ============================================================
// ESCAPE REGEX
// ============================================================
//
// Prevents special regex characters from affecting search.
//
// Example:
//
// "blood sugar"
// => "blood sugar"
//
// ============================================================

const escapeRegex = (value) => {

  return String(value)
    .replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&'
    );

};


// ============================================================
// GET ALL ACTIVE EBOOKS
// ============================================================
//
// GET /api/ebooks
//
// PUBLIC
//
// Search works on:
//
// - title
// - description
// - tags
// - adminKeywords
//
// IMPORTANT:
//
// adminKeywords are SEARCHABLE by everyone.
//
// adminKeywords are VISIBLE only to admin-side users.
//
// ============================================================

exports.getEbooks =
  asyncHandler(async (req, res) => {

    const {
      category,
      search,
      featured,
      page = 1,
      limit = 12,
      sort = '-createdAt',
    } = req.query;


    // ----------------------------------------------------------
    // BASE FILTER
    // ----------------------------------------------------------

    const filter = {
      isActive: true,
    };


    // ----------------------------------------------------------
    // CATEGORY
    // ----------------------------------------------------------

    if (category) {

      filter.category =
        category;

    }


    // ----------------------------------------------------------
    // FEATURED
    // ----------------------------------------------------------

    if (
      featured === 'true'
    ) {

      filter.isFeatured = true;

    }


    // ----------------------------------------------------------
    // SEARCH
    // ----------------------------------------------------------
    //
    // IMPORTANT:
    //
    // Do NOT use only MongoDB $text here.
    //
    // We use case-insensitive regex so:
    //
    // "diabetes"
    //
    // can match:
    //
    // adminKeywords:
    // [
    //   "diabetes",
    //   "diabetes management"
    // ]
    //
    // Normal users do NOT receive adminKeywords
    // in the response.
    //
    // ----------------------------------------------------------

    if (
      search &&
      search.trim()
    ) {

      const searchTerm =
        search.trim();


      const safeSearch =
        escapeRegex(
          searchTerm
        );


      const searchRegex =
        new RegExp(
          safeSearch,
          'i'
        );


      filter.$or = [

        {
          title:
            searchRegex,
        },

        {
          description:
            searchRegex,
        },

        {
          tags:
            searchRegex,
        },

        {
          adminKeywords:
            searchRegex,
        },

      ];

    }


    // ----------------------------------------------------------
    // PAGINATION
    // ----------------------------------------------------------

    const pageNumber =
      Math.max(
        Number(page) || 1,
        1
      );


    const limitNumber =
      Math.min(
        Math.max(
          Number(limit) || 12,
          1
        ),
        100
      );


    const skip =
      (pageNumber - 1) *
      limitNumber;


    // ----------------------------------------------------------
    // DATABASE QUERY
    // ----------------------------------------------------------

    const [
      ebooks,
      total,
    ] = await Promise.all([

      Ebook.find(filter)

        .populate(
          'category',
          'name slug'
        )

        .sort(sort)

        .skip(skip)

        .limit(limitNumber),

      Ebook.countDocuments(
        filter
      ),

    ]);


    // ----------------------------------------------------------
    // RESPONSE
    // ----------------------------------------------------------

    const ebooksWithCoverUrls =
      ebooks.map((ebook) => {

        const ebookData =
          prepareEbookResponse(
            ebook,
            req.user
          );


        addCoverImageUrl(
          ebookData
        );


        return ebookData;

      });


    res.json({

      success: true,

      data:
        ebooksWithCoverUrls,

      pagination: {

        total,

        page:
          pageNumber,

        pages:
          Math.ceil(
            total /
            limitNumber
          ),

      },

    });

  });


// ============================================================
// GET EBOOK BY SLUG
// ============================================================
//
// GET /api/ebooks/:slug
//
// ============================================================

exports.getEbookBySlug =
  asyncHandler(async (req, res) => {

    const ebook =
      await Ebook.findOne({

        slug:
          req.params.slug,

        isActive:
          true,

      }).populate(
        'category',
        'name slug'
      );


    if (!ebook) {

      throw new ApiError(
        404,
        'eBook not found.'
      );

    }


    // ----------------------------------------------------------
    // RESPONSE DATA
    // ----------------------------------------------------------

    const ebookData =
      prepareEbookResponse(
        ebook,
        req.user
      );


    addCoverImageUrl(
      ebookData
    );


    // ----------------------------------------------------------
    // PURCHASE CHECK
    // ----------------------------------------------------------

    let owned = false;


    if (req.user) {

      owned = !!(
        await Purchase.exists({

          user:
            req.user._id,

          ebook:
            ebook._id,

        })
      );

    }


    // ----------------------------------------------------------
    // WISHLIST CHECK
    // ----------------------------------------------------------

    let isWishlisted = false;


    if (req.user) {

      isWishlisted = !!(
        await User.exists({

          _id:
            req.user._id,

          wishlist:
            ebook._id,

        })
      );

    }


    // ----------------------------------------------------------
    // RESPONSE
    // ----------------------------------------------------------

    res.json({

      success: true,

      data:
        ebookData,

      owned,

      isWishlisted,

    });

  });


// ============================================================
// CREATE EBOOK
// ============================================================
//
// POST /api/ebooks/admin
//
// ADMIN-SIDE USERS:
//
// super_admin
// admin
// content_manager
//
// KEYWORD PERMISSION:
//
// Only super_admin can add keywords.
//
// ============================================================

exports.createEbook =
  asyncHandler(async (req, res) => {

    // ----------------------------------------------------------
    // PERMISSION
    // ----------------------------------------------------------

    if (
      !isAdminUser(req.user)
    ) {

      throw new ApiError(
        403,
        'Only admin-side users can create eBooks.'
      );

    }


    // ----------------------------------------------------------
    // REQUEST DATA
    // ----------------------------------------------------------

    const {
      title,
      subtitle,
      description,
      category,
      priceINR,
      discountPercent,
      tags,
      adminKeywords,
      saleEndsAt,
      isFeatured,
      isActive,
    } = req.body;


    // ----------------------------------------------------------
    // REQUIRED FILES
    // ----------------------------------------------------------

    if (
      !req.files?.pdfFile ||
      !req.files?.coverImage
    ) {

      throw new ApiError(
        400,
        'Both a cover image and PDF file are required.'
      );

    }


    // ----------------------------------------------------------
    // S3 KEYS
    // ----------------------------------------------------------

    const pdfKey =
      `ebooks/pdf/${uuid()}.pdf`;


    const coverKey =
      `ebooks/covers/${uuid()}.jpg`;


    // ----------------------------------------------------------
    // UPLOAD PDF
    // ----------------------------------------------------------

    await uploadToS3(
      req.files.pdfFile[0].buffer,
      pdfKey,
      'application/pdf'
    );


    // ----------------------------------------------------------
    // UPLOAD COVER
    // ----------------------------------------------------------

    await uploadToS3(
      req.files.coverImage[0].buffer,
      coverKey,
      req.files.coverImage[0].mimetype
    );


    // ----------------------------------------------------------
    // OPTIONAL PREVIEW
    // ----------------------------------------------------------

    let previewKey = null;


    if (
      req.files.previewFile?.[0]
    ) {

      previewKey =
        `ebooks/previews/${uuid()}.pdf`;


      await uploadToS3(
        req.files.previewFile[0].buffer,
        previewKey,
        'application/pdf'
      );

    }


    // ----------------------------------------------------------
    // NORMAL TAGS
    // ----------------------------------------------------------

    const normalizedTags =
      normalizeTags(tags);


    // ----------------------------------------------------------
    // ADMIN KEYWORDS
    // ----------------------------------------------------------
    //
    // ONLY SUPER ADMIN.
    //
    // If admin/content_manager sends adminKeywords,
    // they will NOT be saved.
    //
    // ----------------------------------------------------------

    let normalizedAdminKeywords = [];


    if (
      isSuperAdmin(req.user)
    ) {

      normalizedAdminKeywords =
        normalizeAdminKeywords(
          adminKeywords
        );

    }


    // ----------------------------------------------------------
    // CREATE EBOOK
    // ----------------------------------------------------------

    const ebook =
      await Ebook.create({

        title,

        subtitle,

        description,

        category,

        priceINR,

        discountPercent:
          discountPercent || 0,

        saleEndsAt:
          saleEndsAt || null,

        isFeatured:
          isFeatured === true ||
          isFeatured === 'true',

        isActive:
          isActive === false ||
          isActive === 'false'
            ? false
            : true,

        tags:
          normalizedTags,

        adminKeywords:
          normalizedAdminKeywords,

        pdfFileKey:
          pdfKey,

        coverImageKey:
          coverKey,

        previewFileKey:
          previewKey,

      });


    // ----------------------------------------------------------
    // RESPONSE
    // ----------------------------------------------------------

    const responseData =
      prepareEbookResponse(
        ebook,
        req.user
      );


    addCoverImageUrl(
      responseData
    );


    res.status(201).json({

      success: true,

      data:
        responseData,

    });

  });


// ============================================================
// UPDATE EBOOK
// ============================================================
//
// PUT /api/ebooks/admin/:id
//
// ADMIN-SIDE USERS:
//
// Can edit normal eBook fields.
//
// ONLY SUPER ADMIN:
//
// Can modify adminKeywords.
//
// ============================================================

exports.updateEbook =
  asyncHandler(async (req, res) => {

    // ----------------------------------------------------------
    // PERMISSION
    // ----------------------------------------------------------

    if (
      !isAdminUser(req.user)
    ) {

      throw new ApiError(
        403,
        'Only admin-side users can update eBooks.'
      );

    }


    // ----------------------------------------------------------
    // FIND BOOK
    // ----------------------------------------------------------

    const ebook =
      await Ebook.findById(
        req.params.id
      );


    if (!ebook) {

      throw new ApiError(
        404,
        'eBook not found.'
      );

    }


    // ==========================================================
    // NORMAL FIELDS
    // ==========================================================

    const fields = [

      'title',

      'subtitle',

      'description',

      'category',

      'priceINR',

      'discountPercent',

      'saleEndsAt',

      'isFeatured',

      'isActive',

    ];


    fields.forEach((field) => {

      if (
        req.body[field] !==
        undefined
      ) {

        ebook[field] =
          req.body[field];

      }

    });


    // ==========================================================
    // NORMAL TAGS
    // ==========================================================

    if (
      req.body.tags !==
      undefined
    ) {

      ebook.tags =
        normalizeTags(
          req.body.tags
        );

    }


    // ==========================================================
    // ADMIN KEYWORDS
    // ==========================================================
    //
    // ONLY SUPER ADMIN.
    //
    // Super Admin can completely replace the keyword list.
    //
    // Existing:
    //
    // [
    //   "diabetes",
    //   "sugar",
    //   "health"
    // ]
    //
    // New:
    //
    // [
    //   "diabetes",
    //   "blood sugar"
    // ]
    //
    // Final:
    //
    // [
    //   "diabetes",
    //   "blood sugar"
    // ]
    //
    // ==========================================================

    if (
      req.body.adminKeywords !==
      undefined
    ) {

      if (
        !isSuperAdmin(req.user)
      ) {

        throw new ApiError(
          403,
          'Only super admin can add, remove or change eBook keywords.'
        );

      }


      ebook.adminKeywords =
        normalizeAdminKeywords(
          req.body.adminKeywords
        );

    }


    // ==========================================================
    // REPLACE COVER
    // ==========================================================

    if (
      req.files?.coverImage?.[0]
    ) {

      const newKey =
        `ebooks/covers/${uuid()}.jpg`;


      await uploadToS3(
        req.files.coverImage[0].buffer,
        newKey,
        req.files.coverImage[0].mimetype
      );


      if (
        ebook.coverImageKey
      ) {

        await deleteFromS3(
          ebook.coverImageKey
        ).catch(() => {});

      }


      ebook.coverImageKey =
        newKey;

    }


    // ==========================================================
    // REPLACE PDF
    // ==========================================================

    if (
      req.files?.pdfFile?.[0]
    ) {

      const newKey =
        `ebooks/pdf/${uuid()}.pdf`;


      await uploadToS3(
        req.files.pdfFile[0].buffer,
        newKey,
        'application/pdf'
      );


      if (
        ebook.pdfFileKey
      ) {

        await deleteFromS3(
          ebook.pdfFileKey
        ).catch(() => {});

      }


      ebook.pdfFileKey =
        newKey;

    }


    // ==========================================================
    // REPLACE PREVIEW
    // ==========================================================

    if (
      req.files?.previewFile?.[0]
    ) {

      const newPreviewKey =
        `ebooks/previews/${uuid()}.pdf`;


      await uploadToS3(
        req.files.previewFile[0].buffer,
        newPreviewKey,
        'application/pdf'
      );


      if (
        ebook.previewFileKey
      ) {

        await deleteFromS3(
          ebook.previewFileKey
        ).catch(() => {});

      }


      ebook.previewFileKey =
        newPreviewKey;

    }


    // ==========================================================
    // SAVE
    // ==========================================================

    await ebook.save();


    // ==========================================================
    // RESPONSE
    // ==========================================================

    const responseData =
      prepareEbookResponse(
        ebook,
        req.user
      );


    addCoverImageUrl(
      responseData
    );


    res.json({

      success: true,

      data:
        responseData,

    });

  });


// ============================================================
// DELETE EBOOK
// ============================================================
//
// ADMIN-SIDE USERS ONLY
//
// ============================================================

exports.deleteEbook =
  asyncHandler(async (req, res) => {

    if (
      !isAdminUser(req.user)
    ) {

      throw new ApiError(
        403,
        'Only admin-side users can delete eBooks.'
      );

    }


    const ebook =
      await Ebook.findById(
        req.params.id
      );


    if (!ebook) {

      throw new ApiError(
        404,
        'eBook not found.'
      );

    }


    // ----------------------------------------------------------
    // DELETE S3 FILES
    // ----------------------------------------------------------

    await Promise.all([

      ebook.pdfFileKey
        ? deleteFromS3(
            ebook.pdfFileKey
          ).catch(() => {})
        : Promise.resolve(),

      ebook.coverImageKey
        ? deleteFromS3(
            ebook.coverImageKey
          ).catch(() => {})
        : Promise.resolve(),

      ebook.previewFileKey
        ? deleteFromS3(
            ebook.previewFileKey
          ).catch(() => {})
        : Promise.resolve(),

    ]);


    // ----------------------------------------------------------
    // DELETE DATABASE RECORD
    // ----------------------------------------------------------

    await ebook.deleteOne();


    // ----------------------------------------------------------
    // REMOVE FROM WISHLISTS
    // ----------------------------------------------------------

    await User.updateMany(

      {
        wishlist:
          ebook._id,
      },

      {
        $pull: {
          wishlist:
            ebook._id,
        },
      }

    );


    // ----------------------------------------------------------
    // RESPONSE
    // ----------------------------------------------------------

    res.json({

      success: true,

      message:
        'eBook deleted successfully.',

    });

  });


// ============================================================
// GET ALL EBOOKS - ADMIN
// ============================================================
//
// GET /api/ebooks/admin/all
//
// ADMIN-SIDE USERS ONLY
//
// adminKeywords visible.
//
// ============================================================

exports.getAllEbooksAdmin =
  asyncHandler(async (req, res) => {

    if (
      !isAdminUser(req.user)
    ) {

      throw new ApiError(
        403,
        'Only admin-side users can view admin eBooks.'
      );

    }


    const ebooks =
      await Ebook.find()

        .populate(
          'category',
          'name'
        )

        .sort('-createdAt');


    const ebooksWithCoverUrls =
      ebooks.map((ebook) => {

        const ebookData =
          ebook.toObject();


        addCoverImageUrl(
          ebookData
        );


        return ebookData;

      });


    res.json({

      success: true,

      data:
        ebooksWithCoverUrls,

    });

  });


// ============================================================
// GET EBOOK PREVIEW
// ============================================================
//
// GET /api/ebooks/:id/preview
//
// PUBLIC
//
// ============================================================

exports.getEbookPreview =
  asyncHandler(async (req, res) => {

    const ebook =
      await Ebook.findOne({

        _id:
          req.params.id,

        isActive:
          true,

      });


    if (!ebook) {

      throw new ApiError(
        404,
        'eBook not found.'
      );

    }


    if (
      !ebook.previewFileKey
    ) {

      throw new ApiError(
        404,
        'Preview is not available for this eBook.'
      );

    }


    const previewUrl =
      getSignedPreviewUrl(
        ebook.previewFileKey,
        600
      );


    res.json({

      success: true,

      data: {

        previewUrl,

        expiresIn:
          600,

      },

    });

  });


// ============================================================
// GET WISHLIST
// ============================================================

exports.getWishlist =
  asyncHandler(async (req, res) => {

    const user =
      await User.findById(
        req.user._id
      ).populate({

        path:
          'wishlist',

        match: {
          isActive: true,
        },

        populate: {

          path:
            'category',

          select:
            'name slug',

        },

      });


    if (!user) {

      throw new ApiError(
        404,
        'User not found.'
      );

    }


    const wishlist =
      (user.wishlist || [])
        .map((ebook) => {

          const ebookData =
            sanitizeEbookForPublic(
              ebook
            );


          addCoverImageUrl(
            ebookData
          );


          return ebookData;

        });


    res.json({

      success: true,

      data:
        wishlist,

    });

  });


// ============================================================
// ADD TO WISHLIST
// ============================================================

exports.addToWishlist =
  asyncHandler(async (req, res) => {

    const ebook =
      await Ebook.findOne({

        _id:
          req.params.id,

        isActive:
          true,

      });


    if (!ebook) {

      throw new ApiError(
        404,
        'eBook not found.'
      );

    }


    const user =
      await User.findById(
        req.user._id
      );


    if (!user) {

      throw new ApiError(
        404,
        'User not found.'
      );

    }


    await User.findByIdAndUpdate(

      req.user._id,

      {
        $addToSet: {
          wishlist:
            ebook._id,
        },
      }

    );


    res.json({

      success: true,

      message:
        'eBook added to wishlist.',

      data: {

        ebookId:
          ebook._id,

        isWishlisted:
          true,

      },

    });

  });


// ============================================================
// REMOVE FROM WISHLIST
// ============================================================

exports.removeFromWishlist =
  asyncHandler(async (req, res) => {

    const ebook =
      await Ebook.findById(
        req.params.id
      );


    if (!ebook) {

      throw new ApiError(
        404,
        'eBook not found.'
      );

    }


    const user =
      await User.findById(
        req.user._id
      );


    if (!user) {

      throw new ApiError(
        404,
        'User not found.'
      );

    }


    await User.findByIdAndUpdate(

      req.user._id,

      {
        $pull: {
          wishlist:
            ebook._id,
        },
      }

    );


    res.json({

      success: true,

      message:
        'eBook removed from wishlist.',

      data: {

        ebookId:
          ebook._id,

        isWishlisted:
          false,

      },

    });

  });


// ============================================================
// EXPORT
// ============================================================

module.exports = exports;