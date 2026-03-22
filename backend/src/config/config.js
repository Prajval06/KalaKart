require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  mongoUrl: process.env.MONGO_URI || 'mongodb://localhost:27017/kalakart',
  jwtSecret: process.env.JWT_SECRET || 'kalakart_secret',
  jwtExpireMinutes: 60,
  refreshExpireDays: 7,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  nodeEnv: process.env.NODE_ENV || 'development',
};