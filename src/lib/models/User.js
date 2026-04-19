import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: '' },
  image: { type: String, default: '' },
  googleId: { type: String, unique: true },
  credits: { type: Number, default: 0 },
  freeUsed: { type: Boolean, default: false },
  plan: { type: String, enum: ['free', 'paid'], default: 'free' },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  maxContactsLimit: { type: Number, default: 50 },
  maxOrgsLimit: { type: Number, default: 0 },
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
  syncPreference: { type: String, enum: ['google', 'iphone'], default: 'google' },
  googleAccessToken: { type: String, default: '' },
  googleRefreshToken: { type: String, default: '' },
  deletionScheduledAt: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
