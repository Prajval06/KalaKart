const router     = require('express').Router();
const controller = require('../../controllers/auth.controller');
const rateLimit  = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 5,
  message: {
    success: false,
    error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many attempts. Try again in 1 minute.' }
  },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: {
    success: false,
    error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many attempts. Try again in 1 minute.' }
  },
});

router.post('/register', registerLimiter, controller.register);
router.post('/login',    loginLimiter,    controller.login);
router.post('/refresh',                  controller.refreshToken);

module.exports = router;