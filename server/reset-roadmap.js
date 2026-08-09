import 'dotenv/config';
import mongoose from 'mongoose';
import RoadmapStep from './src/models/RoadmapStep.js';

async function reset() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await RoadmapStep.deleteMany({});
    console.log('✅ Cleared all mock roadmap steps successfully.');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

reset();
