import 'dotenv/config';
import mongoose from 'mongoose';

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const db = mongoose.connection.db;
  
  // Drop ALL non-_id indexes from roadmapsteps
  const indexes = await db.collection('roadmapsteps').indexes();
  for (const idx of indexes) {
    if (idx.name !== '_id_') {
      try {
        await db.collection('roadmapsteps').dropIndex(idx.name);
        console.log(`✅ Dropped index: ${idx.name}`);
      } catch(e) {
        console.log(`⚠️ Could not drop ${idx.name}:`, e.message);
      }
    }
  }
  
  // Also clear all documents so fresh generation happens
  const result = await db.collection('roadmapsteps').deleteMany({});
  console.log(`🗑️ Cleared ${result.deletedCount} roadmap documents`);
  
  const remaining = await db.collection('roadmapsteps').indexes();
  console.log('Remaining indexes:', remaining.map(i => i.name).join(', '));
  
  await mongoose.disconnect();
  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
