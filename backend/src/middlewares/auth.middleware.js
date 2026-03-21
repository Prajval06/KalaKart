const jwt        = require('jsonwebtoken');
const User       = require('../models/user.model');
const AppError  = require('../utils/AppError');
const config     = require('../config/config');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  // 1. Get token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw AppError.create('UNAUTHORIZED');
  }

  const token = authHeader.split(' ')[1];

  // 2. Verify JWT
  let decoded;
  try {
    decoded = jwt.verify(token, config.jwtSecret);
  } catch {
    throw AppError.create('UNAUTHORIZED');
  }

  // 3. Check user still exists and is active
  const user = await User.findById(decoded.sub);
  if (!user || !user.is_active) {
    throw AppError.create('UNAUTHORIZED');
  }

  // 4. Attach user to request
  req.user = user;
  next();
});

const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    throw AppError.create('FORBIDDEN');
  }
  next();
};

module.exports = { protect, isAdmin };