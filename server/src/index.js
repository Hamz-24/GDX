import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { seedDemoIfEmpty } from './utils/seed.js';

// Routes
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import roadmapRoutes from './routes/roadmap.js';
import vaultRoutes from './routes/vault.js';
import intakeRoutes from './routes/intake.js';
import focusRoutes from './routes/focus.js';
import insightsRoutes from './routes/insights.js';
import mentorRoutes from './routes/mentor.js';
import profileRoutes from './routes/profile.js';

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json());

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/vault', vaultRoutes);
app.use('/api/intake', intakeRoutes);
app.use('/api/focus', focusRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/profile', profileRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// --- DB + Server Start ---
async function startServer() {
  let connected = false;
  
  // 1. Try MongoDB Atlas URI if present
  if (process.env.MONGO_URI) {
    try {
      console.log('🔄 Connecting to MongoDB Atlas...');
      await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 3000 });
      console.log('✅ Connected to MongoDB Atlas');
      connected = true;
    } catch (err) {
      console.warn('⚠️ Atlas connection failed (likely IP whitelist or network issue). Attempting In-Memory MongoDB fallback...');
    }
  }

  // 2. Try In-Memory MongoDB fallback
  if (!connected) {
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log('✅ Connected to In-Memory MongoDB Server');
      connected = true;
    } catch (err) {
      console.warn('⚠️ In-Memory MongoDB Server unavailable:', err.message);
    }
  }

  if (connected) {
    try {
      await seedDemoIfEmpty();
    } catch (seedErr) {
      console.warn('⚠️ Seeding note:', seedErr.message);
    }
  }

  app.listen(PORT, () => {
    console.log(`🚀 Guidex API server running on http://localhost:${PORT}`);
  });
}

startServer();
