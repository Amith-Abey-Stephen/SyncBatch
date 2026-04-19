import mongoose from 'mongoose';

const OrganizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true, sparse: true }, // sparse because old orgs might not have it yet
  description: { type: String, default: '' },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  inviteToken: { type: String, unique: true },
  inviteExpiry: { type: Date },
}, { timestamps: true });

export default mongoose.models.Organization || mongoose.model('Organization', OrganizationSchema);
