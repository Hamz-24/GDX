import express from 'express';
import protect from '../middleware/auth.js';
import FocusLog from '../models/FocusLog.js';
import Task from '../models/Task.js';

const router = express.Router();
router.use(protect);

// POST /api/focus — Log a completed focus session
router.post('/', async (req, res) => {
  try {
    const { duration, durationMinutes, task, taskId, notes } = req.body;
    const durVal = durationMinutes !== undefined ? durationMinutes : duration;
    const durNum = parseInt(durVal, 10);

    if (isNaN(durNum) || durNum <= 0) {
      return res.status(400).json({ message: 'Focus duration must be a positive integer' });
    }

    if (durNum > 1440) {
      return res.status(400).json({ message: 'Focus duration cannot exceed 24 hours (1440 minutes)' });
    }

    let taskTitle = task || 'Focus Session';
    let validTaskId = null;

    if (taskId) {
      const existingTask = await Task.findOne({ _id: taskId, userId: req.user._id });
      if (existingTask) {
        validTaskId = existingTask._id;
        taskTitle = existingTask.title;
      }
    }

    const log = await FocusLog.create({
      userId: req.user._id,
      duration: durNum,
      durationMinutes: durNum,
      task: taskTitle,
      taskId: validTaskId,
      notes: notes || ''
    });

    res.status(201).json(log);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/focus — Retrieve user's focus session history & summary
router.get('/', async (req, res) => {
  try {
    const logs = await FocusLog.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50);
    const totalMinutes = logs.reduce((acc, log) => acc + (log.duration || log.durationMinutes || 0), 0);
    res.json({ logs, totalMinutes, totalHours: Number((totalMinutes / 60).toFixed(2)) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/focus/summary — Aggregated focus stats for dashboard & insights
router.get('/summary', async (req, res) => {
  try {
    const logs = await FocusLog.find({ userId: req.user._id });
    const totalMinutes = logs.reduce((acc, log) => acc + (log.duration || log.durationMinutes || 0), 0);
    res.json({
      count: logs.length,
      totalMinutes,
      totalHours: Number((totalMinutes / 60).toFixed(2))
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
