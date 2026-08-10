import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  goal: { type: String, default: 'DATA STRUCTURES' },
  level: { type: String, default: 'beginner' },
  timelineWeeks: { type: Number, default: 4 },
  currentRoadmapDay: { type: Number, default: 1 },
  streak: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
