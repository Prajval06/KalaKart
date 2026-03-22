const Joi = require('joi');

const createProduct = Joi.object({
  name:            Joi.string().min(2).max(200).required(),
  description:     Joi.string().min(10).required(),
  price:           Joi.number().integer().min(0).required()
                   .messages({ 'number.base': 'Price must be an integer in paise/cents' }),
  images:          Joi.array().items(Joi.string().uri()).optional(),
  category:        Joi.string().hex().length(24).required(),
  artisanName:     Joi.string().required(),
  specialty:       Joi.string().optional(),
  rating:          Joi.number().min(0).max(5).optional(),
  numReviews:      Joi.number().integer().min(0).optional(),
  isAvailable:     Joi.boolean().optional(),
  tags:            Joi.array().items(Joi.string()).optional(),
  stock:           Joi.number().integer().min(0).required(),
  dateListed:      Joi.date().optional(),
});

const updateProduct = Joi.object({
  name:            Joi.string().min(2).max(200).optional(),
  description:     Joi.string().min(10).optional(),
  price:           Joi.number().integer().min(0).optional(),
  images:          Joi.array().items(Joi.string().uri()).optional(),
  category:        Joi.string().hex().length(24).optional(),
  artisanName:     Joi.string().optional(),
  specialty:       Joi.string().optional(),
  rating:          Joi.number().min(0).max(5).optional(),
  numReviews:      Joi.number().integer().min(0).optional(),
  isAvailable:     Joi.boolean().optional(),
  tags:            Joi.array().items(Joi.string()).optional(),
  stock:           Joi.number().integer().min(0).optional(),
  dateListed:      Joi.date().optional(),
});

module.exports = { createProduct, updateProduct };