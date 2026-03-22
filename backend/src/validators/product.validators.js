const Joi = require('joi');

const createProduct = Joi.object({
  name:            Joi.string().min(2).max(200).required(),
  slug:            Joi.string().lowercase().optional(),
  description:     Joi.string().min(10).required(),
  price:           Joi.number().integer().min(0).required()
                   .messages({ 'number.base': 'Price must be an integer in paise/cents' }),
  compare_price:   Joi.number().integer().min(0).optional(),
  images:          Joi.array().items(Joi.string().uri()).optional(),
  category_id:     Joi.string().hex().length(24).required(),
  tags:            Joi.array().items(Joi.string()).optional(),
  inventory_count: Joi.number().integer().min(0).required(),
});

const updateProduct = Joi.object({
  name:            Joi.string().min(2).max(200).optional(),
  slug:            Joi.string().lowercase().optional(),
  description:     Joi.string().min(10).optional(),
  price:           Joi.number().integer().min(0).optional(),
  compare_price:   Joi.number().integer().min(0).optional(),
  images:          Joi.array().items(Joi.string().uri()).optional(),
  category_id:     Joi.string().hex().length(24).optional(),
  tags:            Joi.array().items(Joi.string()).optional(),
  inventory_count: Joi.number().integer().min(0).optional(),
  is_active:       Joi.boolean().optional(),
});

module.exports = { createProduct, updateProduct };