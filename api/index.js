import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dns from 'dns';

// Configure DNS for MongoDB Atlas SRV resolution
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  /* Ignore DNS override if unsupported */
}

// Routes
import authRoutes from '../server/src/routes/auth.js';
import taskRoutes from '../server/src/routes/tasks.js';
import roadmapRoutes from '../server/src/routes/roadmap.js';
import vaultRoutes from '../server/src/routes/vault.js';
import intakeRoutes from '../server/src/routes/intake.js';
import focusRoutes from '../server/src/routes/focus.js';
import insightsRoutes from '../server/src/routes/insights.js';
import mentorRoutes from '../server/src/routes/mentor.js';
import profileRoutes from '../server/src/routes/profile.js';

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Lazily connect to Mongo Atlas on serverless invocation
let isConnected = false;
async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) return;
  const uri = process.env.MONGO_URI || "mongodb+srv://hamzkhan24_db_user:7nrGPx2HIpwQIOkD@cluster0.cjju6xw.mongodb.net/guidex?retryWrites=true&w=majority";
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    isConnected = true;
  } catch (err) {
    console.warn('Vercel Mongo connect warning:', err.message);
  }
}

app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/vault', vaultRoutes);
app.use('/api/intake', intakeRoutes);
app.use('/api/focus', focusRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/profile', profileRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

export default app;
