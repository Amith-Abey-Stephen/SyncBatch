import mongoose from 'mongoose';

const OrgLogSchema = new mongoose.Schema({
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  action: { type: String, enum: ['sync', 'delete', 'broadcast'], required: true },
  method: { type: String, default: 'google' },
  contactsCount: { type: Number, default: 0 },
  creditsUsed: { type: Number, default: 1 },
  details: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.models.OrgLog || mongoose.model('OrgLog', OrgLogSchema);
