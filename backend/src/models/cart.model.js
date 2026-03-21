const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product_id:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:        { type: String, required: true },   // snapshot at time of adding
  price:       { type: Number, required: true },   // snapshot — integer
  quantity:    { type: Number, required: true, min: 1 },
  image_url:   { type: String },
}, { _id: true });

const cartSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items:   [cartItemSchema],
}, { timestamps: true });

// Virtual for server-calculated total — never store total, always calculate
cartSchema.virtual('total_amount').get(function () {
  return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

cartSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    ret.user_id = ret.user_id?.toString();
    ret.items = ret.items.map((item) => ({
      ...item,
      id:         item._id?.toString(),
      product_id: item.product_id?.toString(),
      _id:        undefined,
    }));
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Cart', cartSchema);