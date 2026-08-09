import express from 'express';
import protect from '../middleware/auth.js';
import VaultItem from '../models/VaultItem.js';

const router = express.Router();
router.use(protect);

// GET /api/vault
router.get('/', async (req, res) => {
  try {
    const items = await VaultItem.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/vault
router.post('/', async (req, res) => {
  try {
    const { title, type, content, tags } = req.body;
    if (!title) return res.status(400).json({ message: 'Title required' });
    const item = await VaultItem.create({ userId: req.user._id, title, type, content, tags });
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/vault/:id
router.delete('/:id', async (req, res) => {
  try {
    await VaultItem.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Removed from vault' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
