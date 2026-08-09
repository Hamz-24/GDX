import mongoose from 'mongoose';

// Tracks which user acknowledged which card
const intakeLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'IntakeCard', required: true },
  acknowledgedAt: { type: Date, default: Date.now },
});

export default mongoose.model('IntakeLog', intakeLogSchema);
