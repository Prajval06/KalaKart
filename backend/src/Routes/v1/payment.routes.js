const express = require('express');
const router  = express.Router();
const { createPaymentIntent, handleWebhook } = require('../../controller/payment.controller');
const { protect } = require('../../middlewares/auth.middleware');

// Stripe webhook — MUST use raw body (before json middleware is applied to this route)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Authenticated routes
router.post('/create-intent', protect, createPaymentIntent);

module.exports = router;