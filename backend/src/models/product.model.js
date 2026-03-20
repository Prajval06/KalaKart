const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:            { type: String, required: true, trim: true },
  slug:            { type: String, required: true, unique: true, lowercase: true },
  description:     { type: String, required: true },
  price:           { type: Number, required: true, min: 0 }, // INTEGER — paise/cents only
  compare_price:   { type: Number, min: 0 },                 // original price for "sale" display
  images:          [{ type: String }],
  category_id:     { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  tags:            [{ type: String }],
  inventory_count: { type: Number, required: true, min: 0, default: 0 },
  is_active:       { type: Boolean, default: true },
}, { timestamps: true });

// Indexes
productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ category_id: 1, is_active: 1 });
productSchema.index({ is_active: 1, createdAt: -1 });
productSchema.index({ name: 'text', description: 'text' }); // for search

productSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    ret.category_id = ret.category_id?.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Product', productSchema);