const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

const runValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ApiError(400, 'Validation failed.', errors.array()));
  }
  next();
};

module.exports = runValidation;
