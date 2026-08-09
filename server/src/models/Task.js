import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  time: { type: String, default: '' },
  status: { type: String, enum: ['Pending', 'Done'], default: 'Pending' },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);
