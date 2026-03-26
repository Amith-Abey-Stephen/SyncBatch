import mongoose from 'mongoose';

const SyncRequestSchema = new mongoose.Schema({
  listId: { type: mongoose.Schema.Types.ObjectId, ref: 'ContactList', required: true },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetUsers: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'done', 'ignored'], default: 'pending' },
    syncedAt: { type: Date, default: null },
  }],
}, { timestamps: true });

export default mongoose.models.SyncRequest || mongoose.model('SyncRequest', SyncRequestSchema);
