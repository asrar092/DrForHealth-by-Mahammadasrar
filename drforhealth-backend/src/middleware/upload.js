const multer = require('multer');

const ApiError = require('../utils/ApiError');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = {
    pdf: ['application/pdf'],
    image: ['image/jpeg', 'image/png', 'image/webp'],
  };

  // ==========================================
  // FULL EBOOK PDF
  // ==========================================
  if (
    file.fieldname === 'pdfFile' &&
    !allowed.pdf.includes(file.mimetype)
  ) {
    return cb(
      new ApiError(
        400,
        'Only PDF files are allowed for eBook uploads.'
      )
    );
  }

  // ==========================================
  // PREVIEW PDF
  // ==========================================
  if (
    file.fieldname === 'previewFile' &&
    !allowed.pdf.includes(file.mimetype)
  ) {
    return cb(
      new ApiError(
        400,
        'Only PDF files are allowed for the 2-page preview.'
      )
    );
  }

  // ==========================================
  // COVER IMAGE / AVATAR
  // ==========================================
  if (
    ['coverImage', 'avatar'].includes(file.fieldname) &&
    !allowed.image.includes(file.mimetype)
  ) {
    return cb(
      new ApiError(
        400,
        'Only JPG, PNG, or WEBP images are allowed.'
      )
    );
  }

  // ==========================================
  // ALLOW FILE
  // ==========================================
  cb(null, true);
};


// =====================================================
// MULTER UPLOAD CONFIGURATION
// =====================================================

const upload = multer({
  storage,
  fileFilter,

  limits: {
    // Maximum upload size: 500 MB
    fileSize: 500 * 1024 * 1024,
  },
});

module.exports = upload;