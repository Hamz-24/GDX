import express from 'express';
import protect from '../middleware/auth.js';
import Task from '../models/Task.js';

const router = express.Router();
router.use(protect);

// GET /api/tasks
router.get('/', async (req, res) => {
  try {
    const { date } = req.query;
    const filter = { userId: req.user._id };
    if (date) filter.date = date;
    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/tasks
router.post('/', async (req, res) => {
  try {
    const { title, time, date } = req.body;
    if (!title) return res.status(400).json({ message: 'Title required' });
    const task = await Task.create({ userId: req.user._id, title, time, date });
    res.status(201).json(task);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH /api/tasks/:id
router.patch('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Task deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
