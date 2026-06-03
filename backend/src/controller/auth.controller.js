const authService  = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');
const { success }  = require('../utils/response');
const config       = require('../config/config');

// Cookie name for refresh tokens
const REFRESH_COOKIE = 'kk_refresh';
const refreshCookieOptions = {
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: 'lax',
  maxAge: config.refreshExpireDays * 24 * 60 * 60 * 1000,
};

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);

  // Set refresh token in HttpOnly cookie and return access token & user in response body
  if (result && result.refresh_token) {
    res.cookie(REFRESH_COOKIE, result.refresh_token, refreshCookieOptions);
  }

  return success(res, { user: result.user, access_token: result.access_token }, 201);
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);

  if (result && result.refresh_token) {
    res.cookie(REFRESH_COOKIE, result.refresh_token, refreshCookieOptions);
  }

  return success(res, { user: result.user, access_token: result.access_token });
});

const refreshToken = asyncHandler(async (req, res) => {
  // Prefer refresh token from HttpOnly cookie, fallback to body (for compatibility/test)
  const token = req.cookies?.[REFRESH_COOKIE] || req.body?.refresh_token;
  const result = await authService.refresh({ refresh_token: token });
  return success(res, result);
});

const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body);
  return success(res, result);
});

const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(req.body);
  return success(res, result);
});

module.exports = { register, login, refreshToken, forgotPassword, resetPassword };