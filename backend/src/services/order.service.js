const mongoose = require('mongoose');
const Order   = require('../models/order.model');
const Cart    = require('../models/cart.model');
const Product = require('../models/product.model');
const AppError = require('../utils/AppError');

// Valid status transitions — what can follow what
const STATUS_TRANSITIONS = {
  pending:   ['paid', 'cancelled'],
  paid:      ['shipped', 'cancelled'],
  shipped:   ['delivered'],
  delivered: [],
  cancelled: [],
};

const createOrder = async (userId, { shipping_address, payment_intent_id, notes }) => {
  // Use a transaction to ensure inventory checks + order creation are atomic
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const cart = await Cart.findOne({ user_id: userId }).session(session);
  const STATUS_TRANSITIONS = {
    pending:   ['paid', 'cancelled'],
    paid:      ['shipped', 'cancelled'],
    shipped:   ['delivered'],
    delivered: [],
    cancelled: [],
  };
    if (!cart || cart.items.length === 0) throw AppError.create('CART_EMPTY');

    // Final inventory check before creating order
    const session = await Cart.db.startSession();
      const product = await Product.findById(item.product_id).session(session);
      if (!product || !product.isAvailable) {
        throw new (require('../utils/AppError'))(
          400, 'PRODUCT_NOT_FOUND', `Product "${item.name}" is no longer available`
        );
      }
      if (product.stock < item.quantity) {
        throw new (require('../utils/AppError'))(
          400, 'INSUFFICIENT_INVENTORY', `Insufficient stock for "${item.name}"`
        );
      }
    }

    // Calculate total server-side
    const total_amount = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity, 0
    );

    const orderDoc = new Order({
      user_id:                  userId,
      items:                    cart.items.map((i) => ({
        product_id: i.product_id,
        name:       i.name,
        price:      i.price,
        quantity:   i.quantity,
        image_url:  i.image_url,
      })),
      status:                   'pending',
      shipping_address,
      total_amount,
      stripe_payment_intent_id: payment_intent_id,
      notes:                    notes || null,
    });

    await orderDoc.save({ session });

    await session.commitTransaction();
    session.endSession();
    return orderDoc;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

// Called by Stripe webhook on payment_intent.succeeded
// MUST be idempotent — safe to call multiple times
const fulfillOrder = async (paymentIntentId) => {
  // Wrap fulfillment in a transaction to keep inventory and order state consistent
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const order = await Order.findOne({ stripe_payment_intent_id: paymentIntentId }).session(session);

    // No order found OR already fulfilled — no-op (idempotent)
    if (!order || order.status !== 'pending') {
    const session = await Order.db.startSession();
      session.endSession();
      return;
    }

    // Atomically decrement inventory for each item
    for (const item of order.items) {
      const result = await Product.findOneAndUpdate(
        {
          _id:             item.product_id,
          stock: { $gte: item.quantity }, // only update if enough stock
        },
        { $inc: { stock: -item.quantity } },
        { session }
      );

      // If result is null — inventory ran out between order creation and fulfillment
      if (!result) {
        console.error(`Inventory shortfall on fulfillment for product ${item.product_id}`);
      }
    }

    // Mark order as paid
    order.status = 'paid';
    await order.save({ session });

    // Clear the user's cart
    await Cart.findOneAndUpdate(
      { user_id: order.user_id },
      { $set: { items: [] } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

const getUserOrders = async (userId, { page = 1, per_page = 10 }) => {
  const skip  = (page - 1) * per_page;
  const limit = Math.min(parseInt(per_page), 50);

  const [orders, total] = await Promise.all([
    Order.find({ user_id: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments({ user_id: userId }),
  ]);

  return {
    orders,
    meta: {
      page:        parseInt(page),
      per_page:    limit,
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
};

const getOrderById = async (orderId, userId) => {
  const order = await Order.findById(orderId);

  // No order OR belongs to different user → same error (never leak existence)
  if (!order || order.user_id.toString() !== userId.toString()) {
    throw AppError.create('ORDER_NOT_FOUND');
  }

  return order;
};

const updateOrderStatus = async (orderId, newStatus) => {
  const order = await Order.findById(orderId);
  if (!order) throw AppError.create('ORDER_NOT_FOUND');

  const allowed = STATUS_TRANSITIONS[order.status] || [];
  if (!allowed.includes(newStatus)) {
    throw AppError.create('INVALID_ORDER_STATUS');
  }

  order.status = newStatus;
  await order.save();
  return order;
};

const getAllOrders = async ({ page = 1, per_page = 20, status }) => {
  const filter = {};
  if (status) filter.status = status;

  const skip  = (page - 1) * per_page;
  const limit = Math.min(parseInt(per_page), 100);

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(filter),
  ]);

  return {
    orders,
    meta: {
      page:        parseInt(page),
      per_page:    limit,
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
};

module.exports = {
  createOrder,
  fulfillOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
};