import mongoose from 'mongoose';

const roadmapStepSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  roadmapType: { type: String, enum: ['core', 'project'], default: 'core', index: true },
  roadmapVersion: { type: Number, default: 1, index: true },
  isActive: { type: Boolean, default: true, index: true },
  source: { 
    type: String, 
    enum: ['initial', 'resume_optimization', 'goal_update', 'assignment_parser', 'manual_regeneration'], 
    default: 'initial' 
  },
  projectId: { type: String, default: null, index: true },
  projectName: { type: String, default: null },
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

roadmapStepSchema.index({ userId: 1, roadmapType: 1, isActive: 1 });
roadmapStepSchema.index({ userId: 1, roadmapType: 1, roadmapVersion: 1 });

export default mongoose.model('RoadmapStep', roadmapStepSchema);
