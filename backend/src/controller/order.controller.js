const orderService = require('../services/order.service');
const asyncHandler = require('../utils/asyncHandler');
const { success }  = require('../utils/response');

const createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.user._id, req.body);
  return success(res, { order }, 201);
});

const getMyOrders = asyncHandler(async (req, res) => {
  const { page, per_page } = req.query;
  const result = await orderService.getUserOrders(req.user._id, { page, per_page });
  return success(res, { orders: result.orders }, 200, result.meta);
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.orderId, req.user._id);
  return success(res, { order });
});

// Admin only
const getAllOrders = asyncHandler(async (req, res) => {
  const { page, per_page, status } = req.query;
  const result = await orderService.getAllOrders({ page, per_page, status });
  return success(res, { orders: result.orders }, 200, result.meta);
});

// Admin only
const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrderStatus(
    req.params.orderId,
    req.body.status
  );
  return success(res, { order });
});

module.exports = { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus };