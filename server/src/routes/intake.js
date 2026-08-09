import express from 'express';
import protect from '../middleware/auth.js';
import IntakeCard from '../models/IntakeCard.js';
import IntakeLog from '../models/IntakeLog.js';
import User from '../models/User.js';

const router = express.Router();
router.use(protect);

// GET /api/intake/today
router.get('/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    let card = await IntakeCard.findOne({ date: today });
    
    // If no card for today, create a placeholder
    if (!card) {
      const CONCEPTS = [
        { concept: 'CLOSURES IN JAVASCRIPT', body: 'A closure is a function that retains access to its outer scope variables even after the outer function has returned. This enables data encapsulation and private state in JavaScript.' },
        { concept: 'EVENT BUBBLING', body: 'DOM events propagate upwards from the target element to the document root. Use e.stopPropagation() to halt this mechanical propagation within a handler.' },
        { concept: 'REACT RECONCILIATION', body: 'React\'s diffing algorithm compares virtual DOM trees to determine the minimum set of real DOM updates. Key props are critical for efficient list reconciliation.' },
        { concept: 'PROMISES VS ASYNC/AWAIT', body: 'Both handle asynchronous operations. async/await is syntactic sugar over Promises, making asynchronous code read like synchronous code with less nesting.' },
        { concept: 'CSS SPECIFICITY', body: 'Specificity is calculated as: inline styles (1000) > IDs (100) > classes/pseudo-classes (10) > elements (1). Higher specificity always wins in cascade resolution.' },
      ];
      const dayIndex = new Date().getDay();
      card = await IntakeCard.create({ ...CONCEPTS[dayIndex % CONCEPTS.length], date: today });
    }

    const alreadyAcknowledged = await IntakeLog.findOne({ userId: req.user._id, cardId: card._id });
    const archived = await IntakeLog.find({ userId: req.user._id })
      .populate('cardId')
      .sort({ acknowledgedAt: -1 })
      .limit(10);

    res.json({ card, acknowledged: !!alreadyAcknowledged, archived });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/intake/:id/acknowledge
router.post('/:id/acknowledge', async (req, res) => {
  try {
    const existing = await IntakeLog.findOne({ userId: req.user._id, cardId: req.params.id });
    if (existing) return res.json({ message: 'Already acknowledged' });

    await IntakeLog.create({ userId: req.user._id, cardId: req.params.id });
    // Increment streak
    await User.findByIdAndUpdate(req.user._id, { $inc: { streak: 1 }, lastActive: new Date() });
    res.json({ message: 'Acknowledged! Streak updated.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
