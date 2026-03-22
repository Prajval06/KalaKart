const router = require('express').Router();
const { protect, isAdmin } = require('../../middlewares/auth.middleware');

router.use(protect);

router.post('/create-intent', async (req, res) => {
  try {
    const { createPaymentIntent } = require('../../services/payment.service');
    const paymentIntent = await createPaymentIntent(req.body);
    res.json({ success: true, data: paymentIntent });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;