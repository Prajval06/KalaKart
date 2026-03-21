const User         = require('../models/user.model');
const AppError     = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { success }  = require('../utils/response');

const getMe = asyncHandler(async (req, res) => {
  // req.user is already attached by auth middleware
  return success(res, { user: req.user });
});

const updateMe = asyncHandler(async (req, res) => {
  const { full_name, email } = req.body;
  const updates = {};

  if (full_name) updates.full_name = full_name;

  if (email && email !== req.user.email) {
    const taken = await User.findOne({ email: email.toLowerCase(), _id: { $ne: req.user._id } });
    if (taken) throw AppError.create('EMAIL_ALREADY_EXISTS', 'email');
    updates.email = email.toLowerCase();
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
  return success(res, { user });
});

const changePassword = asyncHandler(async (req, res) => {
  const { current_password, new_password } = req.body;

  // Fetch with password (select:false means it's excluded by default)
  const user = await User.findById(req.user._id).select('+hashed_password');

  const isMatch = await user.comparePassword(current_password);
  if (!isMatch) throw AppError.create('INVALID_CREDENTIALS', 'current_password');

  user.hashed_password = new_password; // pre-save hook will hash it
  await user.save();

  return success(res, { message: 'Password updated successfully' });
});

module.exports = { getMe, updateMe, changePassword };