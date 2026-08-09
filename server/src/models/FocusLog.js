import mongoose from 'mongoose';

const focusLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  duration: { type: Number, required: true }, // in minutes
  task: { type: String, default: '' },
  notes: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('FocusLog', focusLogSchema);
