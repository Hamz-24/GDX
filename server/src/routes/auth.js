import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, goal, level, timelineWeeks } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
    if (await User.findOne({ email })) return res.status(400).json({ message: 'User already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, goal, level, timelineWeeks: timelineWeeks || 1 });
    res.status(201).json({ token: generateToken(user._id), user: { id: user._id, name, email, goal, level, timelineWeeks: user.timelineWeeks, currentRoadmapDay: 1, streak: 0 } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.json({ token: generateToken(user._id), user: { id: user._id, name: user.name, email, goal: user.goal, level: user.level, timelineWeeks: user.timelineWeeks, currentRoadmapDay: user.currentRoadmapDay, streak: user.streak } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
import protect from '../middleware/auth.js';
router.get('/me', protect, (req, res) => res.json(req.user));

export default router;
