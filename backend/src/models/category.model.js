const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  slug:          { type: String, required: true, unique: true, lowercase: true },
  description:   { type: String },
  display_order: { type: Number, default: 0 },
  is_active:     { type: Boolean, default: true },
}, { timestamps: true });

categorySchema.index({ display_order: 1 });

categorySchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Category', categorySchema);