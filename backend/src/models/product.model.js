const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, default: null },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  images: [{ type: String }],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  artisanName: { type: String, required: true },
  artisan_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  specialty: { type: String },
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  isAvailable: { type: Boolean, default: true },
  tags: [{ type: String }],
  dateListed: { type: Date, default: Date.now },
}, { timestamps: true });

// Note: Re-adding search and activity indexes if needed
productSchema.index({ category: 1, isAvailable: 1 });
productSchema.index({ isAvailable: 1, createdAt: -1 });
productSchema.index({ name: 'text', description: 'text', artisanName: 'text' }); // for search

productSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    ret.category = ret.category?.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Product', productSchema);