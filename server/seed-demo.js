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

    const weekPhases = [
      { week: 1, name: 'Arrays & Memory Layout', topics: ['Array Memory Layout & Base Addressing', 'Two-Pointer Technique & Array Reversal', 'Sliding Window Pattern (Fixed & Variable)', '2D Matrix Storage & Grid Traversals', 'Prefix Sums & Range Queries', 'Binary Search Space Reduction', 'Week 1 Problem Sprint & Review'] },
      { week: 2, name: 'Linked Lists & Stacks', topics: ['Singly Linked List Node Allocation', 'Reversing Linked Lists & Fast/Slow Pointers', 'Doubly Linked Lists & Sentinel Nodes', 'Stack LIFO & Call Stack Mechanics', 'Monotonic Stack Pattern', 'Queue FIFO & Circular Queue Arrays', 'Week 2 Sprint: Valid Parentheses'] },
      { week: 3, name: 'Trees & Graph Traversals', topics: ['Recursion & Call Stack Frames', 'Binary Tree DFS (Pre, In, Post)', 'BST Invariant & Balanced Search', 'Level-Order Traversal (BFS)', 'Graph Adjacency List vs Matrix', 'Graph DFS vs BFS Traversal', 'Week 3 Sprint: Invert Tree & Graph Cycles'] },
      { week: 4, name: 'Heaps, Sorting & DP', topics: ['Hash Tables & Collision Resolution', 'Binary Heap & Priority Queue Operations', 'O(N log N) Sorting (Merge vs Quick)', 'Intro to DP: Top-Down Memoization', 'Bottom-Up DP Tabulation', 'Full Big-O Complexity Cheat Sheet', 'Week 4 Capstone Mock Interview'] }
    ];

    const steps = [];
    let absoluteDay = 1;

    for (const phase of weekPhases) {
      for (let dayInWeek = 1; dayInWeek <= 7; dayInWeek++) {
        const currentDay = absoluteDay++;
        const topic = phase.topics[dayInWeek - 1];
        const isCompleted = currentDay <= 2;

        steps.push({
          userId: user._id,
          week: phase.week,
          day: currentDay,
          phaseName: phase.name,
          dayName: topic,
          context: `Mastering ${topic} in ${user.goal}.`,
          completed: isCompleted,
          tasks: [
            { taskId: `w${phase.week}-d${currentDay}-t1`, title: `Study ${topic}`, completed: isCompleted },
            { taskId: `w${phase.week}-d${currentDay}-t2`, title: `Solve practice problems for ${topic}`, completed: isCompleted },
            { taskId: `w${phase.week}-d${currentDay}-t3`, title: `Review edge cases for ${topic}`, completed: false }
          ]
        });
      }
    }

    await RoadmapStep.insertMany(steps);
    console.log('✅ 4-Week Roadmap collection seeded (28 Days)');

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
