const Cart     = require('../models/cart.model');
const Product  = require('../models/product.model');
const AppError = require('../utils/AppError');

const getCart = async (userId) => {
  let cart = await Cart.findOne({ user_id: userId });
  if (!cart) {
    // Return empty cart — don't create one until user actually adds something
    return { id: null, user_id: userId.toString(), items: [], total_amount: 0 };
  }
  return cart.toJSON();
};

const addItem = async (userId, { product_id, quantity }) => {
  if (quantity < 1) throw AppError.create('INVALID_QUANTITY', 'quantity');

  // Fetch product and validate
  const product = await Product.findById(product_id);
  if (!product || !product.isAvailable) throw AppError.create('PRODUCT_NOT_FOUND');
  if (product.stock < quantity) throw AppError.create('INSUFFICIENT_INVENTORY');

  let cart = await Cart.findOne({ user_id: userId });

  if (!cart) {
    // First item — create the cart
    cart = await Cart.create({
      user_id: userId,
      items: [{
        product_id:  product._id,
        name:        product.name,          // snapshot
        price:       product.price,         // snapshot — integer
        quantity,
        image_url:   product.images?.[0] || null,
      }],
    });
    return cart.toJSON();
  }

  const existingItem = cart.items.find(
    (i) => i.product_id.toString() === product_id.toString()
  );

  if (existingItem) {
    // Product already in cart — increment quantity
    const newQty = existingItem.quantity + quantity;
    if (product.stock < newQty) throw AppError.create('INSUFFICIENT_INVENTORY');

    await Cart.updateOne(
      { user_id: userId, 'items._id': existingItem._id },
      { $set: { 'items.$.quantity': newQty } }
    );
  } else {
    // New product — push to array
    await Cart.updateOne(
      { user_id: userId },
      {
        $push: {
          items: {
            product_id:  product._id,
            name:        product.name,
            price:       product.price,
            quantity,
            image_url:   product.images?.[0] || null,
          },
        },
      }
    );
  }

  return (await Cart.findOne({ user_id: userId })).toJSON();
};

const updateItem = async (userId, itemId, { quantity }) => {
  if (quantity < 1) throw AppError.create('INVALID_QUANTITY', 'quantity');

  const cart = await Cart.findOne({ user_id: userId });
  if (!cart) throw AppError.create('CART_ITEM_NOT_FOUND');

  const item = cart.items.id(itemId);
  if (!item) throw AppError.create('CART_ITEM_NOT_FOUND');

  // Re-validate inventory with new quantity
  const product = await Product.findById(item.product_id);
  if (!product || product.stock < quantity) {
    throw AppError.create('INSUFFICIENT_INVENTORY');
  }

  await Cart.updateOne(
    { user_id: userId, 'items._id': itemId },
    { $set: { 'items.$.quantity': quantity } }
  );

  return (await Cart.findOne({ user_id: userId })).toJSON();
};

const removeItem = async (userId, itemId) => {
  const cart = await Cart.findOne({ user_id: userId });
  if (!cart) throw AppError.create('CART_ITEM_NOT_FOUND');

  const item = cart.items.id(itemId);
  if (!item) throw AppError.create('CART_ITEM_NOT_FOUND');

  await Cart.updateOne(
    { user_id: userId },
    { $pull: { items: { _id: itemId } } }
  );

  return (await Cart.findOne({ user_id: userId }))?.toJSON()
    || { items: [], total_amount: 0 };
};

module.exports = { getCart, addItem, updateItem, removeItem };