import express from 'express';
import protect from '../middleware/auth.js';
import Task from '../models/Task.js';
import FocusLog from '../models/FocusLog.js';
import User from '../models/User.js';

const router = express.Router();
router.use(protect);

// GET /api/insights/weekly
router.get('/weekly', async (req, res) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [tasksCompleted, focusSessions, user, totalTasks] = await Promise.all([
      Task.countDocuments({ userId: req.user._id, status: 'Done', updatedAt: { $gte: oneWeekAgo } }),
      FocusLog.find({ userId: req.user._id, createdAt: { $gte: oneWeekAgo } }),
      User.findById(req.user._id),
      Task.countDocuments({ userId: req.user._id }),
    ]);

    const totalFocusMinutes = focusSessions.reduce((sum, s) => sum + s.duration, 0);
    const missedTasks = await Task.countDocuments({
      userId: req.user._id,
      status: 'Pending',
      date: { $lt: new Date().toISOString().split('T')[0] }
    });

    res.json({
      tasksCompleted,
      totalFocusHours: (totalFocusMinutes / 60).toFixed(1),
      missedTasks,
      streak: user.streak,
      totalTasks,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
