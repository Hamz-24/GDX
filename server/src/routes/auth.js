import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

const generateToken = (user) => jwt.sign(
  { id: user._id || user.id, name: user.name, email: user.email, goal: user.goal || '', level: user.level || 'Beginner' },
  process.env.JWT_SECRET || 'guidex_jwt_secret_key_2026',
  { expiresIn: '30d' }
);

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, goal, level, timelineWeeks } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
    if (await User.findOne({ email: email.toLowerCase().trim() })) return res.status(400).json({ message: 'User already exists' });

    const numericWeeks = parseInt(String(timelineWeeks || '4').replace(/\D/g, '')) || 4;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      goal: goal || 'DATA STRUCTURES',
      level: level || 'beginner',
      timelineWeeks: numericWeeks
    });

    res.status(201).json({
      token: generateToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        goal: user.goal,
        level: user.level,
        timelineWeeks: user.timelineWeeks,
        currentRoadmapDay: 1,
        streak: 0
      }
    });
  } catch (err) {
    console.error('Registration Error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.json({
      token: generateToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        goal: user.goal,
        level: user.level,
        timelineWeeks: user.timelineWeeks,
        currentRoadmapDay: user.currentRoadmapDay,
        streak: user.streak
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
import protect from '../middleware/auth.js';
router.get('/me', protect, (req, res) => res.json(req.user));

export default router;
