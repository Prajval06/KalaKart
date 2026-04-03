const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  port: process.env.PORT || 5000,
  mongoUrl: process.env.MONGODB_URL || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kalakart',
  jwtSecret: process.env.JWT_SECRET || 'kalakart_secret',
  jwtExpireMinutes: 60,
  refreshExpireDays: 7,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  nodeEnv: process.env.NODE_ENV || 'development',
  // ── Google OAuth ────────────────────────────────────────────────────────────
  googleClientId:     process.env.GOOGLE_CLIENT_ID?.trim(),
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET?.trim(),
  googleCallbackUrl:  process.env.GOOGLE_CALLBACK_URL?.trim() || 'http://localhost:5000/api/v1/auth/google/callback',
  frontendUrl:        process.env.FRONTEND_URL?.trim() || 'http://localhost:5173',
};