import mongoose from 'mongoose';

// Global intake cards (not per-user), seeded once
const intakeCardSchema = new mongoose.Schema({
  concept: { type: String, required: true },
  body: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD — which day this card appears
}, { timestamps: true });

export default mongoose.model('IntakeCard', intakeCardSchema);
