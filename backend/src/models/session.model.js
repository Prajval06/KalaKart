const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  user_id:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  refresh_token: { type: String, required: true },
  expires_at:    { type: Date, required: true },
}, { timestamps: true });

// TTL index — MongoDB auto-deletes expired sessions
sessionSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });
sessionSchema.index({ user_id: 1 });

module.exports = mongoose.model('Session', sessionSchema);