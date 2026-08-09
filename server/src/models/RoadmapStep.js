import mongoose from 'mongoose';

const roadmapStepSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  week: { type: Number, default: 1 },
  day: { type: Number, default: 1 },
  phaseName: { type: String, default: 'Module' },
  dayName: { type: String, default: 'Session' },
  tasks: [{
    taskId: { type: String, required: true },
    title: { type: String, required: true },
    completed: { type: Boolean, default: false }
  }],
  context: { type: String, default: '' }, // AI-generated day context/brief
  completed: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('RoadmapStep', roadmapStepSchema);
