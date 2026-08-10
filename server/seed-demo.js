import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {}

import User from './src/models/User.js';
import RoadmapStep from './src/models/RoadmapStep.js';
import FocusLog from './src/models/FocusLog.js';
import VaultItem from './src/models/VaultItem.js';
import Task from './src/models/Task.js';

async function seed() {
  try {
    console.log('Connecting to Live MongoDB Atlas Database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const email = 'demo@student.com';
    await User.deleteMany({ email });
    
    const passwordHash = await bcrypt.hash('password123', 10);
    const user = await User.create({
      name: 'Demo Student',
      email,
      passwordHash,
      goal: 'DATA STRUCTURES',
      level: 'Basic / Beginner',
      timelineWeeks: 4,
      currentRoadmapDay: 3,
      streak: 7,
      lastActive: new Date()
    });

    console.log(`Created User: ${user._id}`);
    
    await RoadmapStep.deleteMany({ userId: user._id });
    await FocusLog.deleteMany({ userId: user._id });
    await VaultItem.deleteMany({ userId: user._id });
    await Task.deleteMany({ userId: user._id });

    const steps = [
      {
        userId: user._id,
        week: 1,
        day: 1,
        phaseName: 'Arrays & Memory',
        dayName: 'Day 1: Array Fundamentals & Memory Layout',
        context: 'Contiguous RAM allocation, base address offset arithmetic, O(1) index access.',
        completed: true,
        tasks: [
          { taskId: 't1_1', title: 'Learn array indexing formula: base + index * size', completed: true },
          { taskId: 't1_2', title: 'Implement static vs dynamic array in Python', completed: true }
        ]
      },
      {
        userId: user._id,
        week: 1,
        day: 2,
        phaseName: 'Arrays & Memory',
        dayName: 'Day 2: Two-Pointer Technique (In-Place Swaps)',
        context: 'Left/right pointer convergence, array reversal in O(1) auxiliary space.',
        completed: true,
        tasks: [
          { taskId: 't2_1', title: 'Reverse an array in-place using left and right pointers', completed: true },
          { taskId: 't2_2', title: 'Solve Two Sum in a sorted array', completed: true }
        ]
      },
      {
        userId: user._id,
        week: 1,
        day: 3,
        phaseName: 'Arrays & Memory',
        dayName: 'Day 3: Sliding Window Pattern (Fixed & Variable)',
        context: 'Master sub-array optimization without O(N^2) nested loops.',
        completed: false,
        tasks: [
          { taskId: 't3_1', title: 'Implement fixed size sliding window sum', completed: false },
          { taskId: 't3_2', title: 'Solve LeetCode #209: Minimum Size Subarray Sum', completed: false }
        ]
      }
    ];

    await RoadmapStep.insertMany(steps);
    console.log('✅ Roadmap collection seeded');

    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);

    await FocusLog.insertMany([
      { userId: user._id, duration: 45, task: 'Array Memory Alignment', notes: 'Mastered contiguous memory offsets.', createdAt: yesterday },
      { userId: user._id, duration: 60, task: 'Sliding Window Subarray', notes: 'Implemented left/right pointer window.', createdAt: today },
    ]);
    console.log('✅ Focus logs collection seeded');

    await VaultItem.insertMany([
      { userId: user._id, title: 'Arrays & Memory Notes.md', category: 'Personal Notes', content: 'Contiguous memory allocation ensures base_address + index * element_size access in O(1) time.', summary: 'Handwritten notes on RAM layout and cache lines.' },
      { userId: user._id, title: 'Sliding Window Optimization.md', category: 'Personal Notes', content: 'The sliding window technique avoids redundant nested loop computation.', summary: 'Intuition on window expansion and contraction.' }
    ]);
    console.log('✅ Vault items collection seeded');

    await Task.insertMany([
      { userId: user._id, title: 'Day 3: Sliding Window Implementation', priority: 'P0', completed: false, estimatedMinutes: 20 },
      { userId: user._id, title: 'LeetCode #209: Minimum Size Subarray Sum', priority: 'P1', completed: false, estimatedMinutes: 25 },
      { userId: user._id, title: 'Day 3 AI Mentor Q&A Session', priority: 'P2', completed: false, estimatedMinutes: 15 }
    ]);
    console.log('✅ Tasks collection seeded');

    console.log('\n🎉 ALL MONGODB COLLECTIONS SEEDED SUCCESSFULLY IN ATLAS!');
    console.log(`Demo User Email: ${email}`);
    console.log('Demo User Password: password123');
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
seed();
