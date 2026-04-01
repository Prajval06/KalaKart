const Joi = require('joi');

const addItem = Joi.object({
  product_id: Joi.string().hex().length(24).required(),
  quantity:   Joi.number().integer().min(1).default(1),
});

const updateItem = Joi.object({
  quantity: Joi.number().integer().min(1).required(),
});

module.exports = { addItem, updateItem };