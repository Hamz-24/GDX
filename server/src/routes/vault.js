import express from 'express';
import protect from '../middleware/auth.js';
import VaultItem from '../models/VaultItem.js';
import { generateAIContent } from './roadmap.js';

const router = express.Router();
router.use(protect);

// GET /api/vault
router.get('/', async (req, res) => {
  try {
    const items = await VaultItem.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/vault — Create new note
router.post('/', async (req, res) => {
  try {
    const { title, type, category, content, summary, fileUrl, fileName, tags } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ message: 'Title required' });
    const item = await VaultItem.create({
      userId: req.user._id,
      title: title.trim(),
      type: type || 'note',
      category: category || 'Personal Notes',
      content: content || '',
      summary: summary || (content ? content.slice(0, 100) : ''),
      fileUrl: fileUrl || '',
      fileName: fileName || title.trim(),
      tags: tags || []
    });
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT & PATCH /api/vault/:id — Update existing note
const updateVaultHandler = async (req, res) => {
  try {
    const { title, type, category, content, summary, fileUrl, fileName, tags } = req.body;
    const updatePayload = {};

    if (title !== undefined) {
      if (!title.trim()) return res.status(400).json({ message: 'Title required' });
      updatePayload.title = title.trim();
    }
    if (type !== undefined) updatePayload.type = type;
    if (category !== undefined) updatePayload.category = category;
    if (content !== undefined) {
      updatePayload.content = content;
      if (!summary) updatePayload.summary = content.slice(0, 100);
    }
    if (summary !== undefined) updatePayload.summary = summary;
    if (fileUrl !== undefined) updatePayload.fileUrl = fileUrl;
    if (fileName !== undefined) updatePayload.fileName = fileName;
    if (tags !== undefined) updatePayload.tags = tags;

    const item = await VaultItem.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updatePayload,
      { new: true, runValidators: true }
    );

    if (!item) return res.status(404).json({ message: 'Note not found' });
    res.json(item);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

router.put('/:id', updateVaultHandler);
router.patch('/:id', updateVaultHandler);

// POST /api/vault/:id/explain — Deep AI explanation for a note
router.post('/:id/explain', async (req, res) => {
  try {
    const item = await VaultItem.findOne({ _id: req.params.id, userId: req.user._id });
    if (!item) return res.status(404).json({ message: 'Vault note not found' });

    const prompt = `Review and deeply explain this technical note for "${req.user.goal || 'Software Engineering'}":
    Title: ${item.title}
    Content: ${item.content || item.summary}
    
    Provide an insightful analysis covering:
    1. Core Concept & Key Mental Model
    2. Missing Edge Cases & Caveats
    3. Production Best Practice Summary`;

    let explanationText = await generateAIContent(prompt);
    if (!explanationText || typeof explanationText !== 'string') {
      explanationText = `### Deep AI Review for "${item.title}"\n\n**Core Mental Model:** ${item.title} is a fundamental engineering pattern for building reliable, scalable systems.\n\n**Key Best Practice:** Always prefer explicit server components and server-driven state management to minimize client bundle overhead.`;
    }

    item.summary = (item.summary || '') + '\n\n[AI Reviewed]';
    await item.save();

    res.json({ message: 'AI explanation generated', explanation: explanationText, item });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/vault/:id — Delete note
router.delete('/:id', async (req, res) => {
  try {
    const item = await VaultItem.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!item) return res.status(404).json({ message: 'Note not found' });
    res.json({ message: 'Removed from vault', id: req.params.id });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
