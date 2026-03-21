const AppError = require('../utils/AppError');

// Usage: router.post('/register', validate(schema), controller)
// schema = a Joi schema object

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, {
    abortEarly: false,   // collect ALL errors, not just the first
    stripUnknown: true,  // remove fields not in schema silently
  });

  if (!error) return next();

  // Take the first validation error and return it in our standard shape
  const firstError = error.details[0];
  const field = firstError.path?.[0] || null;
  const message = firstError.message.replace(/['"]/g, '');

  return res.status(400).json({
    success: false,
    error: {
      code:    'VALIDATION_ERROR',
      message,
      ...(field && { field }),
    },
  });
};

module.exports = validate;