const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const config     = require('./config/config');
const v1Routes   = require('./Routes/v1');
const errorMiddleware = require('./middlewares/error.middleware');
const AppError   = require('./utils/AppError');

const app = express();

// Security headers
app.use(helmet());

// CORS — only allow your Next.js frontend
app.use(cors({
  origin:      config.frontendUrl,
  credentials: true,
}));

// Logging
app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));

// IMPORTANT: Raw body for Stripe webhook must come BEFORE express.json()
// Stripe needs the raw bytes to verify the signature
app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }));

// JSON body parser for everything else
app.use(express.json());

// Routes
app.use('/api/v1', v1Routes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// 404 handler — must come after all routes
app.use((req, res, next) => {
  next(AppError.create('NOT_FOUND'));
});

// Global error handler — must be last
app.use(errorMiddleware);

module.exports = app;