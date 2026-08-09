import 'dotenv/config';
import mongoose from 'mongoose';
import RoadmapStep from './src/models/RoadmapStep.js';
import User from './src/models/User.js';

async function reset() {
  await mongoose.connect(process.env.MONGO_URI);
  const u = await User.findOne({ name: 'Demo Student' });
  if (u) {
    await RoadmapStep.updateMany(
      { userId: u._id },
      { $set: { completed: false, 'tasks.$[].completed': false } }
    );
    console.log('Successfully reset all tasks for Demo Student');
  }
  process.exit(0);
}
reset();
