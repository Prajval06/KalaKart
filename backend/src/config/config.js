const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const Joi = require('joi');

// Validate environment variables. In production, missing critical vars will cause startup failure.
const schema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().port().default(5000),
  MONGODB_URL: Joi.when('NODE_ENV', { is: 'production', then: Joi.string().uri().required(), otherwise: Joi.string().uri().default('mongodb://127.0.0.1:27017/kalakart') }),
  MONGO_URI: Joi.string().uri().optional(),
  JWT_SECRET: Joi.when('NODE_ENV', { is: 'production', then: Joi.string().min(16).required(), otherwise: Joi.string().default('kalakart_secret') }),
  JWT_EXPIRE_MINUTES: Joi.number().default(60),
  REFRESH_EXPIRE_DAYS: Joi.number().default(7),
  STRIPE_SECRET_KEY: Joi.string().optional().allow('', null),
  STRIPE_WEBHOOK_SECRET: Joi.string().optional().allow('', null),
  CLIENT_URL: Joi.string().uri().default('http://localhost:3000'),
  FRONTEND_URL: Joi.string().uri().default('http://localhost:5173'),
  CORS_ORIGINS: Joi.string().optional(), // comma-separated
  SMTP_HOST: Joi.string().optional().allow('', null),
  SMTP_PORT: Joi.string().optional().allow('', null),
  SMTP_USER: Joi.string().optional().allow('', null),
  SMTP_PASS: Joi.string().optional().allow('', null),
  SMTP_SECURE: Joi.string().optional().allow('', null),
  SMTP_FROM: Joi.string().optional().allow('', null),
  GOOGLE_CLIENT_ID: Joi.string().optional().allow('', null),
  GOOGLE_CLIENT_SECRET: Joi.string().optional().allow('', null),
  GOOGLE_CALLBACK_URL: Joi.string().uri().optional(),
});

const { value: env, error } = schema.validate(process.env, { abortEarly: false, allowUnknown: true });
if (error) {
  console.error('Environment validation error:');
  for (const e of error.details) console.error(`  - ${e.message}`);
  if ((env && env.NODE_ENV) === 'production') {
    throw new Error('Invalid environment configuration. Aborting startup.');
  }
}

const smtpKeys = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
const configuredSmtpKeys = smtpKeys.filter((key) => Boolean(process.env[key]?.trim()));
const hasPartialSmtpConfig = configuredSmtpKeys.length > 0 && configuredSmtpKeys.length < smtpKeys.length;
if (hasPartialSmtpConfig) {
  console.warn('SMTP config is partial. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS to enable auth emails.');
}

// Build CORS origins array: prefer explicit CORS_ORIGINS comma-separated var, otherwise use FRONTEND_URL
let corsOrigins = [];
if (env.CORS_ORIGINS) {
  corsOrigins = env.CORS_ORIGINS.split(',').map(s => s.trim()).filter(Boolean);
} else {
  corsOrigins = [
    env.FRONTEND_URL, 
    env.CLIENT_URL, 
    'http://localhost:3000', 
    'http://localhost:3001', 
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173'
  ].filter(Boolean);
}

module.exports = {
  port: env.PORT,
  mongoUrl: env.MONGODB_URL || env.MONGO_URI || 'mongodb://127.0.0.1:27017/kalakart',
  jwtSecret: env.JWT_SECRET,
  jwtExpireMinutes: env.JWT_EXPIRE_MINUTES,
  refreshExpireDays: env.REFRESH_EXPIRE_DAYS,
  stripeSecretKey: env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET,
  clientUrl: env.CLIENT_URL,
  nodeEnv: env.NODE_ENV,
  smtpHost: env.SMTP_HOST?.trim(),
  smtpPort: env.SMTP_PORT?.trim(),
  smtpSecure: env.SMTP_SECURE?.trim(),
  smtpUser: env.SMTP_USER?.trim(),
  smtpPass: env.SMTP_PASS?.trim(),
  smtpFrom: env.SMTP_FROM?.trim(),
  // Google OAuth
  googleClientId:     env.GOOGLE_CLIENT_ID?.trim(),
  googleClientSecret: env.GOOGLE_CLIENT_SECRET?.trim(),
  googleCallbackUrl:  env.GOOGLE_CALLBACK_URL?.trim() || 'http://localhost:5000/api/v1/auth/google/callback',
  frontendUrl:        env.FRONTEND_URL?.trim() || 'http://localhost:5173',
  // CORS origins array
  corsOrigins,
};