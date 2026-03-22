const Joi = require('joi');

const shippingAddress = Joi.object({
  full_name:   Joi.string().min(2).max(100).required(),
  line1:       Joi.string().min(5).max(200).required(),
  line2:       Joi.string().max(200).optional().allow(''),
  city:        Joi.string().min(2).max(100).required(),
  state:       Joi.string().min(2).max(100).required(),
  postal_code: Joi.string().max(10).required(),
  country:     Joi.string().length(2).uppercase().required()
               .messages({ 'string.length': 'Country must be a 2-letter ISO code e.g. IN' }),
});

const createOrder = Joi.object({
  shipping_address:  shippingAddress.required(),
  payment_intent_id: Joi.string().required(),
  notes:             Joi.string().max(500).optional().allow(''),
});

const updateStatus = Joi.object({
  status: Joi.string()
             .valid('shipped', 'delivered', 'cancelled')
             .required()
             .messages({ 'any.only': 'Status must be shipped, delivered, or cancelled' }),
});

module.exports = { createOrder, updateStatus }; 