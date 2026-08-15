import express from 'express';
import protect from '../middleware/auth.js';
import Task from '../models/Task.js';
import FocusLog from '../models/FocusLog.js';
import User from '../models/User.js';
import RoadmapStep from '../models/RoadmapStep.js';
import ChatMessage from '../models/ChatMessage.js';

const router = express.Router();
router.use(protect);

// GET /api/insights/weekly — Full live dashboard metrics
router.get('/weekly', async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);

    const [
      user,
      tasksCompleted,
      totalTasks,
      focusSessions,
      roadmapSteps,
      recentChats,
      todayTasks
    ] = await Promise.all([
      User.findById(userId),
      Task.countDocuments({ userId, status: 'Done', updatedAt: { $gte: oneWeekAgo } }),
      Task.countDocuments({ userId }),
      FocusLog.find({ userId, createdAt: { $gte: oneWeekAgo } }).sort({ createdAt: -1 }),
      RoadmapStep.find({ userId }).sort({ week: 1, day: 1 }),
      ChatMessage.find({ userId }).sort({ createdAt: -1 }).limit(5),
      Task.find({ userId, date: new Date().toISOString().split('T')[0] })
    ]);

    const totalFocusMinutes = focusSessions.reduce((sum, s) => sum + s.duration, 0);
    const missedTasks = await Task.countDocuments({
      userId,
      status: 'Pending',
      date: { $lt: new Date().toISOString().split('T')[0] }
    });

    // 1. Weekly activity breakdown (Mon - Sun)
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyMap = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    focusSessions.forEach(s => {
      const dName = dayNames[new Date(s.createdAt).getDay()];
      if (weeklyMap[dName] !== undefined) {
        weeklyMap[dName] += s.duration;
      }
    });

    const weeklyData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(label => ({
      label,
      v: weeklyMap[label] || 0
    }));

    // 2. Career Readiness / Mastery Index Calculation
    const totalStepsCount = roadmapSteps.length || 1;
    const completedStepsCount = roadmapSteps.filter(s => s.completed).length;
    let completedTasksCount = 0;
    let totalRoadmapTasks = 0;
    roadmapSteps.forEach(s => {
      s.tasks.forEach(t => {
        totalRoadmapTasks++;
        if (t.completed) completedTasksCount++;
      });
    });

    const stepRatio = completedStepsCount / totalStepsCount;
    const taskRatio = totalRoadmapTasks > 0 ? completedTasksCount / totalRoadmapTasks : 0;
    const streakBonus = Math.min(20, (user.streak || 0) * 2);
    const careerReadiness = Math.min(100, Math.round((stepRatio * 50) + (taskRatio * 30) + streakBonus));

    // 3. Skill Node Breakdown (Derived from Roadmap Phases & Steps)
    const phasesMap = {};
    roadmapSteps.forEach(s => {
      const pName = s.phaseName || 'Core Fundamentals';
      if (!phasesMap[pName]) phasesMap[pName] = { total: 0, completed: 0 };
      phasesMap[pName].total += s.tasks.length || 1;
      phasesMap[pName].completed += s.tasks.filter(t => t.completed).length;
    });

    const skillNodes = Object.keys(phasesMap).slice(0, 5).map((phase, idx) => {
      const p = phasesMap[phase];
      const pct = p.total > 0 ? Math.round((p.completed / p.total) * 100) : 0;
      return {
        id: `node-${idx}`,
        label: phase.replace(/^PHASE_\d+:\s*/, ''),
        mastery: pct,
        status: pct >= 80 ? 'Mastered' : (pct > 0 ? 'Learning' : 'Pending')
      };
    });

    // 4. Next Best Action
    let nextBestAction = null;
    const pendingTask = todayTasks.find(t => t.status !== 'Done');
    const currentStep = roadmapSteps.find(s => s.day === (user.currentRoadmapDay || 1));

    if (pendingTask) {
      nextBestAction = {
        title: pendingTask.title,
        description: `Scheduled for today. Complete this task to advance your daily progress.`,
        durationMinutes: 25,
        signals: [
          { label: 'Priority', value: 'High', status: 'good' },
          { label: 'Scheduled', value: 'Today', status: 'normal' }
        ]
      };
    } else if (currentStep && currentStep.tasks && currentStep.tasks.some(t => !t.completed)) {
      const incTask = currentStep.tasks.find(t => !t.completed);
      nextBestAction = {
        title: incTask.title,
        description: `${currentStep.phaseName} — ${currentStep.dayName}. Focus on this node for primary objective capture.`,
        durationMinutes: 45,
        signals: [
          { label: 'Current Focus', value: currentStep.dayName, status: 'good' },
          { label: 'Roadmap Day', value: `Day ${currentStep.day}`, status: 'normal' }
        ]
      };
    } else {
      nextBestAction = {
        title: `Explore Day ${(user.currentRoadmapDay || 1)} Concept Module`,
        description: `Review technical intuition, interactive visualizer, and code playground.`,
        durationMinutes: 30,
        signals: [
          { label: 'Concept', value: 'Ready', status: 'good' },
          { label: 'Streak', value: `${user.streak || 0} Days`, status: 'good' }
        ]
      };
    }

    // 5. AI Activity Log Feed
    const aiActivity = [];
    recentChats.forEach(c => {
      const tStr = new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      aiActivity.push({
        time: tStr,
        title: c.role === 'user' ? `User Query` : `Mentor Guidance`,
        desc: c.content.length > 60 ? c.content.slice(0, 60) + '...' : c.content
      });
    });

    if (aiActivity.length === 0) {
      aiActivity.push({
        time: 'Just now',
        title: 'Guidex AI Active',
        desc: `Monitoring roadmap progress for goal "${user.goal}".`
      });
    }

    res.json({
      tasksCompleted,
      totalTasks,
      totalFocusHours: (totalFocusMinutes / 60).toFixed(1),
      totalFocusMinutes,
      missedTasks,
      streak: user.streak || 0,
      careerReadiness,
      weeklyData,
      skillNodes,
      nextBestAction,
      aiActivity,
      currentRoadmapDay: user.currentRoadmapDay || 1,
      totalRoadmapDays: roadmapSteps.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

