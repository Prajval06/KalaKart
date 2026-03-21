require('dotenv').config();

const required = (key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return process.env[key];
};

module.exports = {
  port:                 process.env.PORT || 8000,
  mongoUrl:             required('MONGODB_URL'),
  jwtSecret:            required('JWT_SECRET'),
  jwtExpireMinutes:     parseInt(process.env.JWT_EXPIRE_MINUTES || '30'),
  refreshExpireDays:    parseInt(process.env.REFRESH_EXPIRE_DAYS || '7'),
  stripeSecretKey:      required('STRIPE_SECRET_KEY'),
  stripeWebhookSecret:  required('STRIPE_WEBHOOK_SECRET'),
  frontendUrl:          process.env.FRONTEND_URL || 'http://localhost:3000',
  nodeEnv:              process.env.NODE_ENV || 'development',
};
