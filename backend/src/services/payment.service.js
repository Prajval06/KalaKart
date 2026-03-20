const Stripe   = require('stripe');
const Cart     = require('../models/cart.model');
const AppError = require('../utils/AppError');
const config   = require('../config/config');
const orderService = require('./order.service');

const stripe = new Stripe(config.stripeSecretKey);

const createPaymentIntent = async (userId) => {
  const cart = await Cart.findOne({ user_id: userId });
  if (!cart || cart.items.length === 0) throw AppError.create('CART_EMPTY');

  // Calculate total server-side — NEVER trust client-sent amount
  const amount = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity, 0
  );

  try {
    const intent = await stripe.paymentIntents.create({
      amount,
      currency: 'inr',
      metadata: {
        user_id: userId.toString(),
        cart_id: cart._id.toString(),
      },
    });

    return {
      client_secret:       intent.client_secret,
      payment_intent_id:   intent.id,
      amount,
    };
  } catch (err) {
    console.error('Stripe PaymentIntent failed:', err);
    throw AppError.create('PAYMENT_INTENT_FAILED');
  }
};

const handleWebhook = async (payload, signature) => {
  let event;

  // Verify Stripe signature — this is critical for security
  try {
    event = stripe.webhooks.constructEvent(payload, signature, config.stripeWebhookSecret);
  } catch (err) {
    throw AppError.create('WEBHOOK_SIGNATURE_INVALID');
  }

  // Handle events
  switch (event.type) {
    case 'payment_intent.succeeded':
      await orderService.fulfillOrder(event.data.object.id);
      break;

    case 'payment_intent.payment_failed':
      console.error('Payment failed for intent:', event.data.object.id);
      break;

    default:
      // Ignore events we don't handle
  }

  // ALWAYS return success to Stripe even if our processing fails
  // Stripe will retry if we return a non-2xx status
  return { received: true };
};

module.exports = { createPaymentIntent, handleWebhook };