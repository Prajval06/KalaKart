const AppError = require('../utils/AppError');

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    throw AppError.create('FORBIDDEN');
  }
  next();
};

module.exports = adminOnly;