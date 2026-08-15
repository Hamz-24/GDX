import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  projectId: { type: String, required: true, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  totalDays: { type: Number, default: 7 },
  completedDays: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);
