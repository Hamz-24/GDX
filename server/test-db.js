import 'dotenv/config';
import mongoose from 'mongoose';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {}

import User from './src/models/User.js';
import Task from './src/models/Task.js';
import IntakeCard from './src/models/IntakeCard.js';

async function runTests() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to Live MongoDB Atlas Database.');

    console.log('\n--- Running DB Validation Tests ---');

    // 1. Create a dummy user
    console.log('Creating test user...');
    const dummyUser = await User.create({
      name: 'Test Setup User',
      email: `test_${Date.now()}@guidex.local`,
      passwordHash: 'dummyhash',
      goal: 'Testing DB Integration',
    });
    console.log('✅ User created:', dummyUser._id);

    // 2. Create a dummy task for the user
    console.log('Creating test task...');
    const dummyTask = await Task.create({
      userId: dummyUser._id,
      title: 'Initialize production environment',
      status: 'Pending',
    });
    console.log('✅ Task created:', dummyTask._id);

    // 3. Setup dummy IntakeCard
    console.log('Creating test intake card...');
    const dummyCard = await IntakeCard.create({
      concept: 'SYSTEM CHECK',
      body: 'All backend databases are connected and functioning properly.',
      date: new Date().toISOString().split('T')[0],
    });
    console.log('✅ Intake card created:', dummyCard._id);

    // Cleanup
    console.log('\n--- Cleaning up test data ---');
    await User.findByIdAndDelete(dummyUser._id);
    await Task.findByIdAndDelete(dummyTask._id);
    await IntakeCard.findByIdAndDelete(dummyCard._id);
    console.log('✅ Cleanup complete.');

    console.log('\n🚀 ALL TESTS PASSED. The Live MongoDB Atlas setup is solid and ready for production!');
    process.exit(0);

  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
    process.exit(1);
  }
}

runTests();
