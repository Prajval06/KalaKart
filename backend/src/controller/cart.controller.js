const cartService = require('../services/Cart.service');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');

const getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.user._id);
  return success(res, { cart });
});

const addItem = asyncHandler(async (req, res) => {
  const cart = await cartService.addItem(req.user._id, req.body);
  return success(res, { cart });
});

const updateItem = asyncHandler(async (req, res) => {
  const cart = await cartService.updateItem(req.user._id, req.params.itemId, req.body);
  return success(res, { cart });
});

const removeItem = asyncHandler(async (req, res) => {
  const cart = await cartService.removeItem(req.user._id, req.params.itemId);
  return success(res, { cart });
});

module.exports = { getCart, addItem, updateItem, removeItem };