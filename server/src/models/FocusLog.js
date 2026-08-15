import mongoose from 'mongoose';

const focusLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  duration: { type: Number, required: true, min: 1 }, // in minutes
  durationMinutes: { type: Number },
  task: { type: String, default: 'Focus Session' },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
  notes: { type: String, default: '' }
}, { timestamps: true });

focusLogSchema.pre('save', function(next) {
  if (this.duration && !this.durationMinutes) {
    this.durationMinutes = this.duration;
  } else if (this.durationMinutes && !this.duration) {
    this.duration = this.durationMinutes;
  }
  next();
});

export default mongoose.model('FocusLog', focusLogSchema);
