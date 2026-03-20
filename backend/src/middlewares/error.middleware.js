const config = require('../config/config');

const errorMiddleware = (err, req, res, next) => {
  // Log every error with context (use a proper logger like winston in production)
  console.error({
    error:   err.message,
    code:    err.code,
    path:    req.path,
    method:  req.method,
    stack:   config.nodeEnv === 'development' ? err.stack : undefined,
  });

  // Our own operational errors (AppError instances)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code:    err.code,
        message: err.message,
        ...(err.field && { field: err.field }),
      },
    });
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const field = Object.keys(err.errors)[0];
    return res.status(400).json({
      success: false,
      error: {
        code:    'VALIDATION_ERROR',
        message: err.errors[field]?.message || 'Validation failed',
        field,
      },
    });
  }

  // Mongoose duplicate key (e.g. unique email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      error: {
        code:    'DUPLICATE_VALUE',
        message: `${field} is already taken`,
        field,
      },
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: { code: 'TOKEN_INVALID', message: 'Token is invalid' },
    });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: { code: 'TOKEN_EXPIRED', message: 'Token has expired' },
    });
  }

  // Unknown / unexpected error — hide details in production
  return res.status(500).json({
    success: false,
    error: {
      code:    'INTERNAL_ERROR',
      message: config.nodeEnv === 'development' ? err.message : 'Something went wrong',
    },
  });
};

module.exports = errorMiddleware;