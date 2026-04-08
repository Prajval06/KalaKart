const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const smtpKeys = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
const configuredSmtpKeys = smtpKeys.filter((key) => Boolean(process.env[key]?.trim()));
const hasPartialSmtpConfig = configuredSmtpKeys.length > 0 && configuredSmtpKeys.length < smtpKeys.length;

if (hasPartialSmtpConfig) {
  console.warn('SMTP config is partial. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS to enable auth emails.');
}

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
  smtpHost: process.env.SMTP_HOST?.trim(),
  smtpPort: process.env.SMTP_PORT?.trim(),
  smtpSecure: process.env.SMTP_SECURE?.trim(),
  smtpUser: process.env.SMTP_USER?.trim(),
  smtpPass: process.env.SMTP_PASS?.trim(),
  smtpFrom: process.env.SMTP_FROM?.trim(),
  // ── Google OAuth ────────────────────────────────────────────────────────────
  googleClientId:     process.env.GOOGLE_CLIENT_ID?.trim(),
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET?.trim(),
  googleCallbackUrl:  process.env.GOOGLE_CALLBACK_URL?.trim() || 'http://localhost:5000/api/v1/auth/google/callback',
  frontendUrl:        process.env.FRONTEND_URL?.trim() || 'http://localhost:5173',
};