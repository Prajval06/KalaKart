const Joi = require('joi');

const addItem = Joi.object({
  product_id: Joi.string().hex().length(24).required()
              .messages({ 'string.length': 'Invalid product ID format' }),
  quantity:   Joi.number().integer().min(1).required()
              .messages({ 'number.min': 'Quantity must be at least 1' }),
});

const updateItem = Joi.object({
  quantity: Joi.number().integer().min(1).required()
            .messages({ 'number.min': 'Quantity must be at least 1' }),
});

module.exports = { addItem, updateItem };