import mongoose from 'mongoose';

const ContactListSchema = new mongoose.Schema({
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
  title: { type: String, required: true },
  contacts: [{
    name: { type: String, required: true },
    phone: { type: String, required: true },
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default mongoose.models.ContactList || mongoose.model('ContactList', ContactListSchema);
