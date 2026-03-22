const Stripe = require('stripe');
const config = require('../config/config');
const stripe = new Stripe(config.stripeSecretKey);

const createPaymentIntent = async ({ amount, currency = 'inr', metadata = {} }) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    metadata,
  });
  return paymentIntent;
};

const constructWebhookEvent = (payload, signature) => {
  return stripe.webhooks.constructEvent(payload, signature, config.stripeWebhookSecret);
};

module.exports = { createPaymentIntent, constructWebhookEvent };