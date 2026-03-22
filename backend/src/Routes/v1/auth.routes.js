const router    = require('express').Router();
const { register, login, refreshToken } = require('../../controller/auth.controller');
const validate  = require('../../middlewares/validate.middleware');
const schemas   = require('../../validators/auth.validators');
const rateLimit = require('express-rate-limit');

const isTest = process.env.NODE_ENV === 'test';
const passThrough = (req, res, next) => next();

const loginLimiter = isTest ? passThrough : rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many attempts. Try again in 1 minute.' }
  },
});

const registerLimiter = isTest ? passThrough : rateLimit({
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

module.exports = router;
