import mongoose from 'mongoose';

const vaultItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['code', 'link', 'book', 'note'], default: 'note' },
  content: { type: String, default: '' }, // URL or code snippet or note text
  tags: [{ type: String }],
}, { timestamps: true });

export default mongoose.model('VaultItem', vaultItemSchema);
