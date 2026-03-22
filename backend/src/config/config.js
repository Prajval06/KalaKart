require('dotenv').config();

module.exports = {
<<<<<<< HEAD
  mongoUrl:          process.env.MONGO_URI,
  jwtSecret:         process.env.JWT_SECRET,
  jwtExpireMinutes:  60,
  refreshExpireDays: 7,
  port:              process.env.PORT || 5000,
  clientUrl:         process.env.CLIENT_URL || 'http://localhost:3000',
  nodeEnv:           process.env.NODE_ENV || 'development',
  stripeSecretKey:   process.env.STRIPE_SECRET_KEY,
  stripeWebhook:     process.env.STRIPE_WEBHOOK_SECRET,
=======
  port:               process.env.PORT || 8000,
  mongoUrl:           process.env.MONGODB_URL || 'mongodb://localhost:27017/ecommerce',
  jwtSecret:          process.env.JWT_SECRET || 'test-jwt-secret-for-jest-only',
  jwtExpireMinutes:   parseInt(process.env.JWT_EXPIRE_MINUTES || '30'),
  refreshExpireDays:  parseInt(process.env.REFRESH_EXPIRE_DAYS || '7'),
  stripeSecretKey:    process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder',
  stripeWebhookSecret:process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder',
  frontendUrl:        process.env.FRONTEND_URL || 'http://localhost:3000',
  nodeEnv:            process.env.NODE_ENV || 'development',
>>>>>>> 18162e28587c6135138c9c72550ea8a1837278f8
};