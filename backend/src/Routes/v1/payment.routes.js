const router     = require('express').Router();
const controller = require('../../controllers/payment.controller');
const protect    = require('../../middlewares/auth.middleware');

// Webhook: NO auth — but raw body + Stripe signature verification
// express.raw() is already applied in app.js specifically for this route
router.post('/webhook', controller.handleWebhook);

// Payment intent: requires auth
router.post('/intent', protect, controller.createPaymentIntent);

module.exports = router;