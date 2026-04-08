const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email:           { type: String, required: true, unique: true, lowercase: true, trim: true },
  hashed_password: { type: String, required: false, select: false },
  full_name:       { type: String, required: true, trim: true },
  role:            { type: String, enum: ['customer', 'admin', 'artisan'], default: 'customer' },
  is_active:       { type: Boolean, default: true },
  passwordResetTokenHash: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },
  // ── Google OAuth ─────────────────────────────────────────────
  googleId:        { type: String, unique: true, sparse: true },
  profileImage:    { type: String },
  authMethod:      { type: String, enum: ['email', 'google'], default: 'email' },
  // ── Artisan Profile (optional) ───────────────────────────────
  specialty:       { type: String },
  location:        { type: String },
  bio:             { type: String },
  yearsOfExperience: { type: Number, default: 0 },
  // ── Wishlist ─────────────────────────────────────────────────
  wishlist:        [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('hashed_password')) return next();
  this.hashed_password = await bcrypt.hash(this.hashed_password, 12);
  next();
});

userSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.hashed_password);
};

userSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.hashed_password;
    delete ret.passwordResetTokenHash;
    delete ret.passwordResetExpires;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);