import express from 'express';
import protect from '../middleware/auth.js';
import User from '../models/User.js';
import RoadmapStep from '../models/RoadmapStep.js';

const router = express.Router();
router.use(protect);

// GET /api/profile
router.get('/', (req, res) => res.json(req.user));

// PUT & PATCH /api/profile
const updateProfileHandler = async (req, res) => {
  try {
    const { name, goal, level, timelineWeeks } = req.body;
    const updatePayload = {};
    if (name) updatePayload.name = name;
    if (goal) updatePayload.goal = goal;
    if (level) updatePayload.level = level;
    if (timelineWeeks) updatePayload.timelineWeeks = parseInt(timelineWeeks, 10) || 4;
    
    // Check if goal has fundamentally changed
    if (goal && goal !== req.user.goal) {
       await RoadmapStep.deleteMany({ userId: req.user._id });
       updatePayload.currentRoadmapDay = 1;
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      updatePayload,
      { new: true, runValidators: true }
    ).select('-passwordHash');
    res.json(updated);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

router.put('/', updateProfileHandler);
router.patch('/', updateProfileHandler);

export default router;
