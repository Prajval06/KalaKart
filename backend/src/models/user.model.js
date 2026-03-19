const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email:          { type: String, required: true, unique: true, lowercase: true, trim: true },
  hashed_password:{ type: String, required: true, select: false }, // select:false = never returned by default
  full_name:      { type: String, required: true, trim: true },
  role:           { type: String, enum: ['customer', 'admin'], default: 'customer' },
  is_active:      { type: Boolean, default: true },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('hashed_password')) return next();
  this.hashed_password = await bcrypt.hash(this.hashed_password, 12);
  next();
});

// Compare password helper
userSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.hashed_password);
};

// Always map _id to id, remove __v and hashed_password from output
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.hashed_password;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);