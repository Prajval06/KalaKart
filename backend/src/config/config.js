require('dotenv').config();

module.exports = {
  mongoUrl:            process.env.MONGO_URI,
  jwtSecret:           process.env.JWT_SECRET,
  jwtExpireMinutes:    60,
  refreshExpireDays:   7,
  port:                process.env.PORT || 5000,
  clientUrl:           process.env.CLIENT_URL || 'http://localhost:3000',
  stripeSecretKey:     process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  nodeEnv:             process.env.NODE_ENV || 'development',
};