const User     = require('../models/user.model');
const Product  = require('../models/product.model');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { success }  = require('../utils/response');

// GET /api/v1/users/me
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'name price images artisanName');
  return success(res, { user });
});

// PUT /api/v1/users/me
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

// PUT /api/v1/users/change-password
const changePassword = asyncHandler(async (req, res) => {
  const { current_password, new_password } = req.body;
  const user = await User.findById(req.user._id).select('+hashed_password');
  const isMatch = await user.comparePassword(current_password);
  if (!isMatch) throw AppError.create('INVALID_CREDENTIALS', 'current_password');
  user.hashed_password = new_password;
  await user.save();
  return success(res, { message: 'Password updated successfully' });
});

// POST /api/v1/users/wishlist/:productId — toggle wishlist
const toggleWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const productId = req.params.productId;

  const product = await Product.findById(productId);
  if (!product) throw AppError.create('PRODUCT_NOT_FOUND');

  const isWishlisted = user.wishlist.includes(productId);

  if (isWishlisted) {
    user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
  } else {
    user.wishlist.push(productId);
  }

  await user.save();
  return success(res, {
    message: isWishlisted ? 'Removed from wishlist' : 'Added to wishlist',
    wishlisted: !isWishlisted,
    wishlist: user.wishlist,
  });
});

// GET /api/v1/users/wishlist
const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('wishlist', 'name price images artisanName rating isAvailable');
  return success(res, { wishlist: user.wishlist });
});

// GET /api/v1/users/artisans — public list of artisan profiles
const getArtisans = asyncHandler(async (req, res) => {
  const artisans = await User.find({ role: 'artisan', is_active: true })
    .select('full_name profileImage specialty location bio email yearsOfExperience');
  return success(res, { artisans });
});

module.exports = { getMe, updateMe, changePassword, toggleWishlist, getWishlist, getArtisans };