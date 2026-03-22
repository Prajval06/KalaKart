const jwt       = require('jsonwebtoken');
const User      = require('../models/user.model');
const Session   = require('../models/session.model');
const AppError  = require('../utils/AppError');
const config    = require('../config/config');

const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { sub: userId, role },
    config.jwtSecret,
    { expiresIn: `${config.jwtExpireMinutes}m` }
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    { sub: userId, type: 'refresh' },
    config.jwtSecret,
    { expiresIn: `${config.refreshExpireDays}d` }
  );
};

const register = async ({ email, password, full_name }) => {
  // Check duplicate email
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw AppError.create('EMAIL_ALREADY_EXISTS', 'email');

  // Create user (password hashed by pre-save hook)
  const user = await User.create({
    email,
    full_name,
    hashed_password: password,
  });

  const access_token  = generateAccessToken(user._id, user.role);
  const refresh_token = generateRefreshToken(user._id);

  // Store refresh token
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + config.refreshExpireDays);
  await Session.create({ user_id: user._id, refresh_token, expires_at: expiresAt });

  return { user, access_token, refresh_token };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+hashed_password');
  console.log('LOGIN DEBUG — user found:', !!user);
  if (!user) throw AppError.create('INVALID_CREDENTIALS');

  const isMatch = await user.comparePassword(password);
  console.log('LOGIN DEBUG — password match:', isMatch);
  if (!isMatch) throw AppError.create('INVALID_CREDENTIALS');

  if (!user.is_active) throw AppError.create('ACCOUNT_DISABLED');

  const access_token  = generateAccessToken(user._id, user.role);
  const refresh_token = generateRefreshToken(user._id);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + config.refreshExpireDays);

  try {
    await Session.create({ user_id: user._id, refresh_token, expires_at: expiresAt });
    console.log('LOGIN DEBUG — session created');
  } catch (err) {
    console.log('LOGIN DEBUG — session error:', err.message);
  }

  return { user, access_token, refresh_token };
};


const refresh = async ({ refresh_token }) => {
  // Verify JWT
  let decoded;
  try {
    decoded = jwt.verify(refresh_token, config.jwtSecret);
  } catch {
    throw AppError.create('INVALID_REFRESH_TOKEN');
  }

  // Check it exists in DB and isn't expired
  const session = await Session.findOne({
    refresh_token,
    expires_at: { $gt: new Date() },
  });
  if (!session) throw AppError.create('INVALID_REFRESH_TOKEN');

  const user = await User.findById(decoded.sub);
  if (!user || !user.is_active) throw AppError.create('INVALID_REFRESH_TOKEN');

  const access_token = generateAccessToken(user._id, user.role);
  return { access_token };
};

module.exports = { register, login, refresh };