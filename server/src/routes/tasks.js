import express from 'express';
import protect from '../middleware/auth.js';
import Task from '../models/Task.js';

const router = express.Router();
router.use(protect);

// GET /api/tasks — List user's tasks with search & filters
router.get('/', async (req, res) => {
  try {
    const { date, status, priority, q } = req.query;
    const filter = { userId: req.user._id };

    if (date) filter.dueDate = date;
    if (status) {
      if (status === 'Completed' || status === 'Done') filter.status = 'Done';
      else if (status === 'Pending') filter.status = 'Pending';
    }
    if (priority) filter.priority = priority;
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/tasks/:id — Fetch single task details
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/tasks — Create a new task
router.post('/', async (req, res) => {
  try {
    const { title, description, priority, dueDate, time, estimatedMinutes, status } = req.body;
    
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    const cleanTitle = title.trim();
    if (cleanTitle.length > 500) {
      return res.status(400).json({ message: 'Task title exceeds maximum length of 500 characters' });
    }

    const taskStatus = (status === 'Done' || status === 'Completed' || req.body.completed) ? 'Done' : 'Pending';
    const completedAt = taskStatus === 'Done' ? new Date() : null;

    const task = await Task.create({
      userId: req.user._id,
      title: cleanTitle,
      description: description || '',
      priority: priority || 'P1',
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      time: time || `${estimatedMinutes || 20} min`,
      estimatedMinutes: parseInt(estimatedMinutes, 10) || 20,
      status: taskStatus,
      completedAt
    });

    res.status(201).json(task);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT & PATCH /api/tasks/:id — Update existing task
const updateTaskHandler = async (req, res) => {
  try {
    const { title, description, priority, dueDate, time, estimatedMinutes, status, completed } = req.body;
    const updatePayload = {};

    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ message: 'Task title cannot be empty' });
      }
      updatePayload.title = title.trim();
    }
    if (description !== undefined) updatePayload.description = description;
    if (priority !== undefined) updatePayload.priority = priority;
    if (dueDate !== undefined) updatePayload.dueDate = dueDate;
    if (time !== undefined) updatePayload.time = time;
    if (estimatedMinutes !== undefined) updatePayload.estimatedMinutes = parseInt(estimatedMinutes, 10) || 20;

    if (completed !== undefined || status !== undefined) {
      const isDone = completed === true || status === 'Done' || status === 'Completed';
      updatePayload.status = isDone ? 'Done' : 'Pending';
      updatePayload.completedAt = isDone ? new Date() : null;
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updatePayload,
      { new: true, runValidators: true }
    );

    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

router.put('/:id', updateTaskHandler);
router.patch('/:id', updateTaskHandler);

// DELETE /api/tasks/:id — Delete task
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!deleted) return res.status(404).json({ message: 'Task not found or unauthorized' });
    res.json({ message: 'Task deleted successfully', id: req.params.id });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
