import express from 'express';
import protect from '../middleware/auth.js';
import FocusLog from '../models/FocusLog.js';

const router = express.Router();
router.use(protect);

// POST /api/focus  — log a completed session
router.post('/', async (req, res) => {
  try {
    const { duration, task, notes } = req.body;
    if (!duration) return res.status(400).json({ message: 'Duration required' });
    const log = await FocusLog.create({ userId: req.user._id, duration, task, notes });
    res.status(201).json(log);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/focus  — get past sessions
router.get('/', async (req, res) => {
  try {
    const logs = await FocusLog.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(20);
    res.json(logs);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
