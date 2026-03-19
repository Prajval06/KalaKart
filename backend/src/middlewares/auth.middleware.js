const jwt      = require('jsonwebtoken');
const User     = require('../models/User.model');
const AppError = require('../utils/AppError');
const config   = require('../config/config');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  // 1. Get token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw AppError.create('UNAUTHORIZED');
  }

  const token = authHeader.split(' ')[1];

  // 2. Verify JWT
  const decoded = jwt.verify(token, config.jwtSecret);
  // If invalid: jwt.verify throws JsonWebTokenError or TokenExpiredError
  // Those are caught by error.middleware.js automatically

  // 3. Check user still exists and is active
  const user = await User.findById(decoded.sub);
  if (!user || !user.is_active) {
    throw AppError.create('UNAUTHORIZED');
  }

  // 4. Attach user to request
  req.user = user;
  next();
});

module.exports = protect;