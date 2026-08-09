import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['user', 'ai'], required: true },
  content: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('ChatMessage', chatMessageSchema);
