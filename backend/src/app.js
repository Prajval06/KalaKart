const express = require('express');
const cors    = require('cors');
const config  = require('./config/config');

const app = express();

app.use(cors({ origin: config.clientUrl, credentials: true }));

// Stripe webhook must receive raw body — mount BEFORE express.json()
app.use('/api/v1/payment/webhook', express.raw({ type: 'application/json' }));

// Global JSON parser for all other routes
app.use(express.json());

app.get('/', (req, res) => res.json({ message: 'KalaKart API is running!' }));

app.use('/api/v1', require('./Routes/v1/index'));

// Global error handler
app.use(require('./middlewares/error.middleware'));

module.exports = app;

