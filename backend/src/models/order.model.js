const mongoose = require('mongoose');

const shippingAddressSchema = new mongoose.Schema({
  full_name:   { type: String, required: true },
  line1:       { type: String, required: true },
  line2:       { type: String },
  city:        { type: String, required: true },
  state:       { type: String, required: true },
  postal_code: { type: String, required: true, maxlength: 10 },
  country:     { type: String, required: true, maxlength: 2 },  // ISO 3166-1 alpha-2
}, { _id: false });

const orderItemSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  name:       { type: String, required: true },   // snapshot
  price:      { type: Number, required: true },   // snapshot — integer
  quantity:   { type: Number, required: true, min: 1 },
  image_url:  { type: String },
}, { _id: true });

const ORDER_STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

const orderSchema = new mongoose.Schema({
  user_id:                  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items:                    [orderItemSchema],
  status:                   { type: String, enum: ORDER_STATUSES, default: 'pending' },
  shipping_address:         { type: shippingAddressSchema, required: true },
  total_amount:             { type: Number, required: true },  // integer
  stripe_payment_intent_id: { type: String },
  notes:                    { type: String, maxlength: 500 },
}, { timestamps: true });

// Indexes
orderSchema.index({ user_id: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ stripe_payment_intent_id: 1 });

orderSchema.set('toJSON', {
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

module.exports = mongoose.model('Order', orderSchema);