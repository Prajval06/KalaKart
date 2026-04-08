const router      = require('express').Router();
const { register, login, refreshToken, forgotPassword, resetPassword } = require('../../controller/auth.controller');
const validate    = require('../../middlewares/validate.middleware');
const schemas     = require('../../validators/auth.validators');
const rateLimit   = require('express-rate-limit');

// Disable rate limiting in test environment
const isTest = process.env.NODE_ENV === 'test';

const loginLimiter = isTest ? (req, res, next) => next() : rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many attempts. Try again in 1 minute.' }
  },
});

const registerLimiter = isTest ? (req, res, next) => next() : rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: {
    success: false,
    error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many attempts. Try again in 1 minute.' }
  },
});

router.post('/register', registerLimiter, validate(schemas.register), register);
router.post('/login',    loginLimiter,    validate(schemas.login),    login);
router.post('/refresh',                  validate(schemas.refresh),   refreshToken);
router.post('/forgot-password',          validate(schemas.forgotPassword), forgotPassword);
router.post('/reset-password',           validate(schemas.resetPassword),  resetPassword);

module.exports = router;