const paymentService = require('../services/payment.service');
const asyncHandler   = require('../utils/asyncHandler');
const { success }    = require('../utils/response');

const createPaymentIntent = asyncHandler(async (req, res) => {
  const result = await paymentService.createPaymentIntent(req.user._id);
  return success(res, result);
});

// NOTE: No asyncHandler here — webhook must always return 200
// We handle errors internally and log them
const handleWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];

  try {
    const result = await paymentService.handleWebhook(req.body, signature);
    return res.status(200).json(result);
  } catch (err) {
    console.error('Webhook processing error:', err.message);
    // Return 400 only for signature failures — Stripe won't retry
    if (err.code === 'WEBHOOK_SIGNATURE_INVALID') {
      return res.status(400).json({ success: false, error: { code: err.code, message: err.message } });
    }
    // For any other error — return 200 so Stripe doesn't retry endlessly
    // Log it and handle manually
    return res.status(200).json({ received: true, warning: 'Processing error logged' });
  }
};

module.exports = { createPaymentIntent, handleWebhook };