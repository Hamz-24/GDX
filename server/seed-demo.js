import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';
import RoadmapStep from './src/models/RoadmapStep.js';
import FocusLog from './src/models/FocusLog.js';
import VaultItem from './src/models/VaultItem.js';
import Task from './src/models/Task.js';

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const email = 'demo@student.com';
    await User.deleteMany({ email });
    
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
        phaseName: 'Foundation',
        dayName: 'React 19 & Hooks Refresher',
        context: 'We are starting with a deep dive into the latest features of React 19 and advanced hooks patterns. Focus on useTransition and useActionState.',
        completed: true,
        tasks: [
          { taskId: 't1_1', title: 'Read React 19 documentation on useTransition', completed: true },
          { taskId: 't1_2', title: 'Build a small form using useActionState', completed: true }
        ]
      },
      {
        userId: user._id,
        week: 1,
        day: 2,
        phaseName: 'Foundation',
        dayName: 'Next.js App Router Architecture',
        context: 'Explore the server-first architecture of Next.js App Router. Understand Server Components vs Client Components.',
        completed: true,
        tasks: [
          { taskId: 't2_1', title: 'Create a Next.js project using App Router', completed: true },
          { taskId: 't2_2', title: 'Convert a Client Component to a Server Component', completed: true },
          { taskId: 't2_3', title: 'Implement a nested layout', completed: true }
        ]
      },
      {
        userId: user._id,
        week: 1,
        day: 3,
        phaseName: 'Data Layer',
        dayName: 'Data Fetching & Caching',
        context: 'Today you will learn how Next.js handles data fetching natively with fetch() extensions, and how caching and ISR work.',
        completed: false,
        tasks: [
          { taskId: 't3_1', title: 'Fetch data from a public API in a Server Component', completed: false },
          { taskId: 't3_2', title: 'Implement revalidate tags for on-demand caching', completed: false }
        ]
      },
      {
        userId: user._id,
        week: 1,
        day: 4,
        phaseName: 'Data Layer',
        dayName: 'Server Actions & Mutations',
        context: 'Moving beyond fetching, let\'s look at mutating data securely from the Server using Next.js Server Actions.',
        completed: false,
        tasks: [
          { taskId: 't4_1', title: 'Create a Server Action to submit a form', completed: false },
          { taskId: 't4_2', title: 'Handle pending states with useFormStatus', completed: false }
        ]
      }
    ];

    await RoadmapStep.insertMany(steps);
    console.log('Roadmap seeded');

    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(today); twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    await FocusLog.insertMany([
      { userId: user._id, duration: 45, task: 'React 19 Forms', notes: 'Felt very productive.', createdAt: twoDaysAgo },
      { userId: user._id, duration: 25, task: 'Next.js Layouts', notes: 'Got stuck on nesting but figured it out.', createdAt: yesterday },
      { userId: user._id, duration: 60, task: 'Data Fetching', notes: 'Read the Next.js docs deeply.', createdAt: today },
    ]);
    console.log('Focus logs seeded');

    await VaultItem.insertMany([
      { userId: user._id, title: 'React 19 Docs', type: 'link', content: 'https://react.dev', tags: ['react', 'official'] },
      { userId: user._id, title: 'Server Components Rule', type: 'note', content: 'Always use server components by default to send less JS to the client.', tags: ['nextjs'] },
      { userId: user._id, title: 'Fetch Wrapper', type: 'code', content: 'export async function getData() { const res = await fetch("api"); return res.json(); }', tags: ['snippet'] }
    ]);
    console.log('Vault items seeded');

    await Task.insertMany([
      { userId: user._id, title: 'Update portfolio with Next.js', status: 'Pending', time: 'Tomorrow' },
      { userId: user._id, title: 'Review Tailwind Grid', status: 'Done', time: 'Yesterday' }
    ]);
    console.log('Tasks seeded');

    console.log('\n--- SUCCESS ---');
    console.log(`Email: ${email}`);
    console.log('Password: password123');
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
seed();
