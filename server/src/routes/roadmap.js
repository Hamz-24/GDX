import express from 'express';
import protect from '../middleware/auth.js';
import RoadmapStep from '../models/RoadmapStep.js';
import User from '../models/User.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();
router.use(protect);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── SCHEMA: Enforces structured JSON output from Gemini ───
const roadmapSchema = {
  type: "ARRAY",
  items: {
    type: "OBJECT",
    properties: {
      week: { type: "NUMBER", description: "Week number (1-based)" },
      day: { type: "NUMBER", description: "Absolute day number across entire roadmap (1-based)" },
      phaseName: { type: "STRING", description: "The overarching theme for this week" },
      dayName: { type: "STRING", description: "A descriptive title for this day's focus" },
      context: { type: "STRING", description: "A 1-2 sentence AI briefing for this specific day's mission" },
      tasks: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            taskId: { type: "STRING", description: "Unique slug e.g. w1-d3-t1" },
            title: { type: "STRING", description: "Specific actionable task" },
            completed: { type: "BOOLEAN", description: "Always false initially" }
          },
          required: ["taskId", "title", "completed"]
        }
      }
    },
    required: ["week", "day", "phaseName", "dayName", "context", "tasks"]
  }
};

// ─── PROMPT BUILDER ───
const buildRoadmapPrompt = (goal, level, weeks) => {
  return `You are GuideX, an elite personal mentor who creates deeply personalized, production-grade learning roadmaps.

## Context
- **User's Goal**: "${goal}"
- **User's Current Level**: "${level}"
- **Timeline**: ${weeks} week(s) (${weeks * 7} total days)

## Your Mission
Create a comprehensive, day-by-day learning roadmap that takes the user from their current level to mastery of their goal within exactly ${weeks} week(s).

## Rules
1. Generate EXACTLY ${weeks * 7} day objects, one for each day.
2. **STRICT NON-REPETITION (THEORY)**: Every single day MUST introduce a unique CONCEPT or TOPIC. DO NOT repeat the same conceptual lecture or theory across different days.
3. **NEURAL REINFORCEMENT (PRACTICE)**: While the *concept* must be unique, you *may* include "Practice" or "Build" tasks that reinforce previous concepts if they are part of a larger project.
4. **PROGRESSIVE DEPTH**: Ensure a logical flow where each day builds upon the previous one. Day 1: Setup → Day 2: Syntax → Day 3: Logic → etc.
5. Each day must include a **context** field: a brief, punchy mission briefing for that specific node.
6. Each day must have 2-4 **tasks** that are granular and verifiable.
7. All task **completed** fields must be set to **false**.
8. Task IDs must follow the pattern "w{week}-d{day}-t{taskNumber}" (e.g., "w1-d3-t2").
9. The **day** field is the ABSOLUTE day number (continuous from 1 to ${weeks * 7}). So Week 2, Day 1 = day 8.

## Quality Standards
- Use domain-specific terminology relevant to "${goal}".
- For programming goals: include specific technologies, frameworks, algorithms, and design patterns.
- For career/skill goals: include specific methodologies, tools, case studies, and practical exercises.
- Structure the roadmap with clear progression: fundamentals → intermediate concepts → advanced application → real-world projects.
- Include at least one "build/create something" task per week.
- Final week should include capstone project tasks and portfolio/review activities.

## Example Quality
Instead of: "Learn about arrays"
Write: "Implement dynamic array resizing with amortized O(1) insertion analysis"

Instead of: "Study React basics"  
Write: "Build a component tree with props drilling, then refactor using Context API"

Instead of: "Practice algorithms"
Write: "Solve 3 medium-difficulty graph traversal problems using BFS/DFS on LeetCode"`;
};

// ─── SMART FALLBACK GENERATOR ───
const generateSmartFallback = (goal, level, weeks) => {
  const phases = {
    beginner: [
      { theme: 'Foundation & Environment', tasks: ['Install core tooling', 'Configure workspace', 'Initial "Hello World"', 'CLI basics', 'Project structure', 'Mental models', 'Basic syntax'] },
      { theme: 'Core Language Concepts', tasks: ['Data types', 'Variables & scoping', 'Control flow', 'Functions', 'Basic IO', 'Error basics', 'Simple algorithms'] },
      { theme: 'Intermediate Patterns', tasks: ['Classes/Objects', 'Modules', 'Collections', 'Async patterns', 'Unit testing', 'Refactoring', 'API basics'] },
      { theme: 'Applied Implementation', tasks: ['Build mini-tool', 'Database basics', 'Debugging suite', 'Deployment prep', 'Documentation', 'Peer review', 'Performance basics'] },
    ],
    intermediate: [
      { theme: 'Architecture & Design', tasks: ['SOLID principles', 'Design patterns', 'Modularization', 'State management', 'API design', 'Middleware', 'Schema design'] },
      { theme: 'Scaling & Performance', tasks: ['Profiling', 'Caching', 'Concurrency', 'DB optimization', 'Network perf', 'Cold starts', 'Load balancing'] },
      { theme: 'Testing & Reliability', tasks: ['Integration tests', 'Mocking', 'CI/CD pipelines', 'Security audit', 'Error boundaries', 'Logging', 'Telemetry'] },
      { theme: 'Production Deployment', tasks: ['Dockerization', 'Cloud provider setup', 'Monitoring', 'Logging', 'Scale strategy', 'DR plan', 'Post-mortem'] },
    ],
  };

  const levelPhases = phases[level] || phases.beginner;
  const fallback = [];

  for (let d = 1; d <= weeks * 7; d++) {
    const weekNum = Math.ceil(d / 7);
    const phaseIndex = Math.min(weekNum - 1, levelPhases.length - 1);
    const phase = levelPhases[phaseIndex];
    const dayInWeek = ((d - 1) % 7) + 1;

    // Primary task is the one assigned to this specific day
    const primaryTask = phase.tasks[(dayInWeek - 1) % phase.tasks.length];
    
    // Reinforcements are chosen from PREVIOUS days in the cycle to avoid "future spoilers"
    const r1 = phase.tasks[(dayInWeek - 2 + phase.tasks.length) % phase.tasks.length];
    const r2 = phase.tasks[(dayInWeek - 3 + phase.tasks.length) % phase.tasks.length];

    const taskSet = [primaryTask, r1, r2];

    fallback.push({
      userId: null,
      week: weekNum,
      day: d,
      phaseName: `PHASE_${weekNum}: ${phase.theme}`,
      dayName: `${goal} - SEC_${d}: ${primaryTask}`,
      context: `Mission protocol engaged: Deep-diving into ${primaryTask} to establish cognitive dominance in ${goal}.`,
      tasks: [
        { taskId: `w${weekNum}-d${d}-t1`, title: `[PRIMARY MISSION] ${primaryTask} implementation`, completed: false },
        { taskId: `w${weekNum}-d${d}-t2`, title: `[NEURAL REINFORCEMENT] ${r1} optimized practice`, completed: false },
        { taskId: `w${weekNum}-d${d}-t3`, title: `[NEURAL REINFORCEMENT] ${r2} legacy review`, completed: false },
      ]
    });
  }

  return fallback;
};


// ─── AI GENERATION UTILITY ───
const generateAIContent = async (prompt) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt + `\n\nYou must ONLY output a valid JSON array. No markdown, no backticks, no explanation. Just the raw JSON array.` }] }],
      generationConfig: { responseMimeType: "application/json" },
    });
    
    let textStr = result.response.text();
    const jsonStart = textStr.indexOf('[');
    const jsonEnd = textStr.lastIndexOf(']');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      textStr = textStr.substring(jsonStart, jsonEnd + 1);
    }
    return JSON.parse(textStr);
  } catch (err) {
    console.error("❌ AI Generation Error:", err.message);
    return null;
  }
};

// ═══════════════════════════════════════════════════════════
// GET /api/roadmap — Generate with Gemini or return cached
// ═══════════════════════════════════════════════════════════
router.get('/', async (req, res) => {
  try {
    try { await RoadmapStep.collection.dropIndex('userId_1_day_1'); } catch (_) {}

    let steps = await RoadmapStep.find({ userId: req.user._id }).sort({ week: 1, day: 1 });
    
    if (steps.length === 0) {
      const user = await User.findById(req.user._id);
      const goal = user.goal || 'Learn Software Engineering';
      const level = user.level || 'beginner';
      const weeks = user.timelineWeeks || 1;

      console.log(`🧠 Generating AI roadmap for "${goal}" (${weeks} weeks, ${level} level)...`);
      const prompt = buildRoadmapPrompt(goal, level, weeks);
      const generatedSteps = await generateAIContent(prompt);
      
      if (generatedSteps && Array.isArray(generatedSteps) && generatedSteps.length > 0) {
        await RoadmapStep.insertMany(
          generatedSteps.map(s => ({
            userId: req.user._id,
            week: s.week || 1,
            day: s.day || 1,
            phaseName: s.phaseName || 'Module',
            dayName: s.dayName || 'Session',
            context: s.context || '', // Save mission context
            completed: false,
            tasks: (s.tasks || []).map(t => ({
              taskId: t.taskId || `auto-${Math.random().toString(36).substr(2, 8)}`,
              title: t.title || 'Complete task',
              completed: false
            }))
          }))
        );
      } else {
        console.log("⚠️ Using smart fallback generator...");
        const fallback = generateSmartFallback(goal, level, weeks);
        await RoadmapStep.insertMany(fallback.map(s => ({ ...s, userId: req.user._id })));
      }

      steps = await RoadmapStep.find({ userId: req.user._id }).sort({ week: 1, day: 1 });
    }
    res.json(steps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
// POST /api/roadmap/analyze-resume — Optimize roadmap via resume
// ═══════════════════════════════════════════════════════════
router.post('/analyze-resume', async (req, res) => {
  try {
    const { resumeText } = req.body;
    const user = await User.findById(req.user._id);
    const goal = user.goal || 'Learn Software Engineering';
    const weeks = user.timelineWeeks || 4;

    const prompt = `Analyze this resume against the goal: "${goal}". 
    1. Identify what skills the user ALREADY has.
    2. Identify the GAPS needed for the objective.
    3. Generate a refined, intensive learning roadmap for ${weeks} weeks focusing ONLY on the gaps.
    
    Resume: ${resumeText}
    
    Output format: STRICT JSON array matching the roadmap schema (week, day, phaseName, dayName, tasks).`;

    const generatedSteps = await generateAIContent(prompt);
    
    if (generatedSteps && Array.isArray(generatedSteps)) {
      await RoadmapStep.deleteMany({ userId: req.user._id });
      await RoadmapStep.insertMany(generatedSteps.map(s => ({ 
        ...s, 
        userId: req.user._id,
        context: s.context || '' // Persist mission briefing
      })));
      return res.json({ message: 'Roadmap optimized via resume analysis', count: generatedSteps.length });
    }
    res.status(400).json({ message: 'Could not analyze resume' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ═══════════════════════════════════════════════════════════
// POST /api/roadmap/analyze-assignment — Breakdown project
// ═══════════════════════════════════════════════════════════
router.post('/analyze-assignment', async (req, res) => {
  try {
    const { assignmentText } = req.body;
    
    const prompt = `Break this assignment/project into a step-by-step implementation roadmap for exactly 7 days (1 week).
    Assignment: ${assignmentText}
    
    Output format: STRICT JSON array matching the roadmap schema (week: 1, day: 1-7, phaseName: "Project Sprint", dayName, tasks).`;

    const generatedSteps = await generateAIContent(prompt);
    
    if (generatedSteps && Array.isArray(generatedSteps)) {
      await RoadmapStep.deleteMany({ userId: req.user._id });
      await RoadmapStep.insertMany(generatedSteps.map(s => ({ 
        ...s, 
        userId: req.user._id,
        context: s.context || '' // Persist mission briefing
      })));
      return res.json({ message: 'Assignment deconstructed successfully', count: generatedSteps.length });
    }
    res.status(400).json({ message: 'Could not deconstruct assignment' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ═══════════════════════════════════════════════════════════
// GET /api/roadmap/today — Get the current day's module
// ═══════════════════════════════════════════════════════════
router.get('/today', async (req, res) => {
  try {
     const user = await User.findById(req.user._id);
     const currentDay = user.currentRoadmapDay || 1;
     const step = await RoadmapStep.findOne({ userId: req.user._id, day: currentDay });
     const totalDays = await RoadmapStep.countDocuments({ userId: req.user._id });
     res.json({ currentDay, totalDays, step });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ═══════════════════════════════════════════════════════════
// PATCH /api/roadmap/:day/task/:taskId — Toggle task completion
// ═══════════════════════════════════════════════════════════
router.patch('/:day/task/:taskId', async (req, res) => {
  try {
    const dayNumeric = parseInt(req.params.day, 10);
    const step = await RoadmapStep.findOne({ userId: req.user._id, day: dayNumeric });
    if (!step) return res.status(404).json({ message: 'Roadmap step not found' });

    const task = step.tasks.find(t => t.taskId === req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.completed = req.body.completed;
    
    // Evaluate if all tasks in this day are clear
    const allCompleted = step.tasks.every(t => t.completed);
    step.completed = allCompleted;

    await step.save();

    // Auto-advance the user's timeline position when current day is fully completed
    if (allCompleted) {
      const user = await User.findById(req.user._id);
      if (user.currentRoadmapDay === dayNumeric) {
        user.currentRoadmapDay += 1;
        await user.save();
      }
    }

    res.json(step);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ═══════════════════════════════════════════════════════════
// DELETE /api/roadmap — Reset roadmap (for re-generation)
// ═══════════════════════════════════════════════════════════
router.delete('/', async (req, res) => {
  try {
    await RoadmapStep.deleteMany({ userId: req.user._id });
    await User.findByIdAndUpdate(req.user._id, { currentRoadmapDay: 1 });
    res.json({ message: 'Roadmap reset successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
