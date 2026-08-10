import mongoose from 'mongoose';

const vaultItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  type: { type: String, default: 'note' },
  category: { type: String, default: 'Personal Notes' },
  content: { type: String, default: '' },
  summary: { type: String, default: '' },
  tags: [{ type: String }],
}, { timestamps: true });

export default mongoose.model('VaultItem', vaultItemSchema);
