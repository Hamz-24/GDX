import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import RoadmapStep from '../models/RoadmapStep.js';
import FocusLog from '../models/FocusLog.js';
import VaultItem from '../models/VaultItem.js';
import Task from '../models/Task.js';

export async function seedDemoIfEmpty() {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) return;

    console.log('🌱 Seeding demo dataset for initial app run...');
    const email = 'demo@student.com';
    const passwordHash = await bcrypt.hash('password123', 10);
    const user = await User.create({
      name: 'Demo Student',
      email,
      passwordHash,
      goal: 'Master Advanced React & Next.js',
      level: 'intermediate',
      timelineWeeks: 4,
      currentRoadmapDay: 3,
      streak: 5,
      lastActive: new Date()
    });

    const weekPhases = [
      { week: 1, name: 'Foundation', topics: ['React 19 & Hooks Refresher', 'Next.js App Router Architecture', 'Data Fetching & Caching', 'Server Actions & Mutations', 'Optimistic UI Updates', 'Form Handling with useActionState', 'Week 1 Architecture Review'] },
      { week: 2, name: 'Architecture & State', topics: ['Context API vs Zustand', 'Server Components vs Client Components', 'Middleware & Authentication', 'Route Handlers & REST APIs', 'Zod Schema Validation', 'SSR Performance Tuning', 'Week 2 State & API Review'] },
      { week: 3, name: 'Database & Performance', topics: ['Mongoose & Prisma ORM Setup', 'Database Indexing & Query Optimization', 'Redis In-Memory Caching Layer', 'Connection Pooling Strategies', 'Edge Functions & Middleware', 'SSG & ISR Revalidation', 'Week 3 Performance Sprint'] },
      { week: 4, name: 'Production & Security', topics: ['Dockerization & Containerization', 'CI/CD Pipeline with GitHub Actions', 'OWASP Security Audit & Mitigations', 'Sentry Telemetry & Error Tracking', 'Load Testing & Benchmarks', 'Zero-Downtime Deployment', 'Week 4 Capstone Graduation'] }
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
            { taskId: `w${phase.week}-d${currentDay}-t1`, title: `Study documentation for ${topic}`, completed: isCompleted },
            { taskId: `w${phase.week}-d${currentDay}-t2`, title: `Implement hands-on code for ${topic}`, completed: isCompleted },
            { taskId: `w${phase.week}-d${currentDay}-t3`, title: `Complete verifiable exercise for ${topic}`, completed: false }
          ]
        });
      }
    }

    await RoadmapStep.insertMany(steps);

    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(today); twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    await FocusLog.insertMany([
      { userId: user._id, duration: 45, task: 'React 19 Forms', notes: 'Felt very productive.', createdAt: twoDaysAgo },
      { userId: user._id, duration: 25, task: 'Next.js Layouts', notes: 'Got stuck on nesting but figured it out.', createdAt: yesterday },
      { userId: user._id, duration: 60, task: 'Data Fetching', notes: 'Read the Next.js docs deeply.', createdAt: today },
    ]);

    await VaultItem.insertMany([
      { userId: user._id, title: 'React 19 Docs', type: 'link', content: 'https://react.dev', tags: ['react', 'official'] },
      { userId: user._id, title: 'Server Components Rule', type: 'note', content: 'Always use server components by default to send less JS to the client.', tags: ['nextjs'] },
      { userId: user._id, title: 'Fetch Wrapper', type: 'code', content: 'export async function getData() { const res = await fetch("api"); return res.json(); }', tags: ['snippet'] }
    ]);

    await Task.insertMany([
      { userId: user._id, title: 'Update portfolio with Next.js', status: 'Pending', time: 'Tomorrow' },
      { userId: user._id, title: 'Review Tailwind Grid', status: 'Done', time: 'Yesterday' }
    ]);

    console.log('✅ Demo data successfully seeded! Demo login: demo@student.com / password123');
  } catch (err) {
    console.error('⚠️ Demo seed error:', err.message);
  }
}
