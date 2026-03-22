const Joi = require('joi');

const register = Joi.object({
  email:     Joi.string().email().required(),
  password:  Joi.string().min(8).required()
             .messages({ 'string.min': 'Password must be at least 8 characters' }),
  full_name: Joi.string().min(2).max(100).required(),
});

const login = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().required(),
});

const refresh = Joi.object({
  refresh_token: Joi.string().required(),
});

const changePassword = Joi.object({
  current_password: Joi.string().required(),
  new_password:     Joi.string().min(8).required()
                    .messages({ 'string.min': 'New password must be at least 8 characters' }),
});

const updateProfile = Joi.object({
  full_name: Joi.string().min(2).max(100).optional(),
  email:     Joi.string().email().optional(),
});

module.exports = { register, login, refresh, changePassword, updateProfile };
