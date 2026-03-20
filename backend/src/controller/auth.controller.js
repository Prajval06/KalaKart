const authService  = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');
const { success }  = require('../utils/response');

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  return success(res, result, 201);
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  return success(res, result);
});

const refreshToken = asyncHandler(async (req, res) => {
  const result = await authService.refresh(req.body);
  return success(res, result);
});

module.exports = { register, login, refreshToken };