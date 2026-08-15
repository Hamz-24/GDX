import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['Pending', 'In Progress', 'Done'], default: 'Pending' },
  priority: { type: String, enum: ['P0', 'P1', 'P2', 'Low', 'Medium', 'High'], default: 'P1' },
  dueDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  time: { type: String, default: '20 min' },
  estimatedMinutes: { type: Number, default: 20 },
  completedAt: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);
