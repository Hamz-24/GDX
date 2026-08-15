import express from 'express';
import protect from '../middleware/auth.js';
import RoadmapStep from '../models/RoadmapStep.js';
import User from '../models/User.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const router = express.Router();
router.use(protect);

// Lazy factory — reads GEMINI_API_KEY at call-time (after dotenv has loaded)
let _genAI = null;
const getGenAI = () => {
  if (!_genAI) _genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return _genAI;
};

// ═══════════════════════════════════════════════════════════
// POST /api/roadmap/parse-document — Server-side PDF/DOCX/TXT/JSON Text Extraction
// ═══════════════════════════════════════════════════════════
router.post('/parse-document', async (req, res) => {
  try {
    const { fileBase64, fileName } = req.body;
    if (!fileBase64 || typeof fileBase64 !== 'string') {
      return res.status(400).json({ message: 'No file data provided' });
    }

    const base64Data = fileBase64.replace(/^data:.*?;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const ext = (fileName || '').split('.').pop().toLowerCase();

    let extractedText = '';

    if (ext === 'pdf') {
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text || '';
    } else if (ext === 'docx') {
      const docxData = await mammoth.extractRawText({ buffer });
      extractedText = docxData.value || '';
    } else if (ext === 'txt' || ext === 'md' || ext === 'json') {
      extractedText = buffer.toString('utf-8');
      if (ext === 'json') {
        try {
          const parsedObj = JSON.parse(extractedText);
          extractedText = typeof parsedObj === 'string' ? parsedObj : JSON.stringify(parsedObj, null, 2);
        } catch (_) {
          /* use raw UTF-8 string */
        }
      }
    } else {
      try {
        const pdfData = await pdfParse(buffer);
        extractedText = pdfData.text || buffer.toString('utf-8');
      } catch (_) {
        extractedText = buffer.toString('utf-8');
      }
    }

    extractedText = extractedText.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F]/g, ' ').trim();

    if (!extractedText || extractedText.length < 5) {
      return res.status(422).json({ message: 'Could not extract readable text from this document. Please ensure it is not an image-only PDF.' });
    }

    const wordCount = extractedText.split(/\s+/).length;

    res.json({
      success: true,
      text: extractedText,
      wordCount,
      fileName
    });
  } catch (err) {
    console.error('❌ Document parse error:', err.message);
    res.status(500).json({ message: `Document extraction failed: ${err.message}` });
  }
});

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
2. Every single day MUST introduce a unique CONCEPT or TOPIC.
3. Each day must include a context field: a brief mission briefing.
4. Each day must have 2-4 tasks that are granular and verifiable.
5. Task IDs must follow the pattern "w{week}-d{day}-t{taskNumber}".`;
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

    const primaryTask = phase.tasks[(dayInWeek - 1) % phase.tasks.length];
    const r1 = phase.tasks[(dayInWeek - 2 + phase.tasks.length) % phase.tasks.length];
    const r2 = phase.tasks[(dayInWeek - 3 + phase.tasks.length) % phase.tasks.length];

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
export const generateAIContent = async (prompt) => {
  try {
    const model = getGenAI().getGenerativeModel({ model: 'gemini-2.5-flash' });
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
    
    let needsSave = false;
    for (const s of steps) {
      const correctWeek = Math.ceil((s.day || 1) / 7);
      if (s.week !== correctWeek) {
        s.week = correctWeek;
        await RoadmapStep.updateOne({ _id: s._id }, { $set: { week: correctWeek } });
        needsSave = true;
      }
    }
    if (needsSave) {
      steps = await RoadmapStep.find({ userId: req.user._id }).sort({ week: 1, day: 1 });
    }

    const user = await User.findById(req.user._id);
    const weeks = user ? (user.timelineWeeks || 4) : 4;
    const expectedTotalDays = weeks * 7;
    
    // If roadmap steps exist (including 7-day sprints), return them directly!
    if (steps.length === 0) {
      const goal = user?.goal || 'DATA STRUCTURES';
      const level = user?.level || 'intermediate';

      console.log(`🧠 Generating AI roadmap for "${goal}" (${weeks} weeks, ${level} level)...`);
      const prompt = buildRoadmapPrompt(goal, level, weeks);
      const generatedSteps = await generateAIContent(prompt);
      
      if (generatedSteps && Array.isArray(generatedSteps) && generatedSteps.length > 0) {
        await RoadmapStep.insertMany(
          generatedSteps.map((s, idx) => {
            const dayNum = s.day || (idx + 1);
            const weekNum = s.week && s.week > 0 ? s.week : Math.ceil(dayNum / 7);
            const rawTasks = Array.isArray(s.tasks) && s.tasks.length > 0 ? s.tasks : [
              { title: `[PRIMARY MISSION] Master ${s.dayName || 'Day Focus'}`, completed: false }
            ];
            return {
              userId: req.user._id,
              week: weekNum,
              day: dayNum,
              phaseName: s.phaseName || `Week ${weekNum} Phase`,
              dayName: s.dayName || `Day ${dayNum}: ${goal}`,
              context: s.context || '',
              completed: false,
              tasks: rawTasks.map((t, tidx) => ({
                taskId: t.taskId || `w${weekNum}-d${dayNum}-t${tidx + 1}`,
                title: typeof t === 'string' ? t : (t.title || `Task ${tidx + 1}`),
                completed: Boolean(t.completed)
              }))
            };
          })
        );
      } else {
        console.log("⚠️ Using smart fallback generator for multi-week roadmap...");
        const fallback = generateSmartFallback(goal, level, weeks);
        await RoadmapStep.insertMany(fallback.map((s, idx) => {
          const dayNum = s.day || (idx + 1);
          const weekNum = s.week && s.week > 0 ? s.week : Math.ceil(dayNum / 7);
          return {
            userId: req.user._id,
            week: weekNum,
            day: dayNum,
            phaseName: s.phaseName,
            dayName: s.dayName,
            context: s.context,
            completed: false,
            tasks: s.tasks
          };
        }));
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
    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 5) {
      return res.status(400).json({ message: 'Please upload a resume or paste your resume text.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(401).json({ message: 'Authenticated user not found' });

    const goal = user.goal || 'Software Engineering';
    const weeks = user.timelineWeeks || 4;

    const prompt = `Analyze this resume against the target career goal: "${goal}". 
    1. Identify what skills the user ALREADY has.
    2. Identify the GAPS needed for the objective.
    3. Generate a refined, intensive learning roadmap for ${weeks} weeks (${weeks * 7} total days) focusing ONLY on the gaps.
    
    Resume: ${resumeText.trim()}
    
    Output format: STRICT JSON array matching the roadmap schema (week, day, phaseName, dayName, context, tasks).`;

    let generatedSteps = await generateAIContent(prompt);
    if (!generatedSteps || !Array.isArray(generatedSteps) || generatedSteps.length === 0) {
      console.log('⚠️ Resume analysis using smart fallback generator...');
      generatedSteps = generateSmartFallback(goal, user.level || 'intermediate', weeks);
    }

    await RoadmapStep.deleteMany({ userId: req.user._id });
    await RoadmapStep.insertMany(generatedSteps.map((s, idx) => {
      const dayNum = s.day || (idx + 1);
      const weekNum = s.week && s.week > 0 ? s.week : Math.ceil(dayNum / 7);
      const rawTasks = Array.isArray(s.tasks) && s.tasks.length > 0 ? s.tasks : [
        { title: `[PRIMARY MISSION] Master ${s.dayName || 'Day Focus'}`, completed: false }
      ];
      return {
        userId: req.user._id,
        week: weekNum,
        day: dayNum,
        phaseName: s.phaseName || `Phase ${weekNum}`,
        dayName: s.dayName || `Day ${dayNum}: ${goal}`,
        context: s.context || `Resume Gap Optimization Day ${dayNum}`,
        completed: false,
        tasks: rawTasks.map((t, tidx) => ({
          taskId: t.taskId || `w${weekNum}-d${dayNum}-t${tidx + 1}`,
          title: typeof t === 'string' ? t : (t.title || `Task ${tidx + 1}`),
          completed: false
        }))
      };
    }));

    await User.findByIdAndUpdate(req.user._id, { currentRoadmapDay: 1 });

    return res.json({ success: true, message: 'Roadmap optimized via resume analysis', count: generatedSteps.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ═══════════════════════════════════════════════════════════
// POST /api/roadmap/analyze-assignment — Breakdown project
// ═══════════════════════════════════════════════════════════
router.post('/analyze-assignment', async (req, res) => {
  try {
    const { assignmentText } = req.body;
    if (!assignmentText || typeof assignmentText !== 'string' || assignmentText.trim().length < 5) {
      return res.status(400).json({ message: 'Please provide assignment specifications or upload a project file.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(401).json({ message: 'Authenticated user not found' });

    const prompt = `Break this assignment/project specification into a step-by-step implementation sprint roadmap for exactly 7 days (1 week).
    Assignment Specification: ${assignmentText.trim()}
    
    Output format: STRICT JSON array matching the roadmap schema (week: 1, day: 1-7, phaseName: "Project Sprint", dayName, context, tasks).`;

    let generatedSteps = await generateAIContent(prompt);
    if (!generatedSteps || !Array.isArray(generatedSteps) || generatedSteps.length === 0) {
      console.log('⚠️ Assignment parser using smart fallback generator...');
      generatedSteps = generateSmartFallback('Project Sprint', 'intermediate', 1);
    }

    // Ensure 7 days
    if (generatedSteps.length > 7) generatedSteps = generatedSteps.slice(0, 7);
    while (generatedSteps.length < 7) {
      const idx = generatedSteps.length + 1;
      generatedSteps.push({
        week: 1,
        day: idx,
        phaseName: 'Project Sprint',
        dayName: `Day ${idx}: Integration & Final Polish`,
        context: `Sprint Day ${idx} completion milestone.`,
        tasks: [
          { taskId: `w1-d${idx}-t1`, title: `[SPRINT TASK] Complete Sprint Day ${idx} module`, completed: false }
        ]
      });
    }

    await RoadmapStep.deleteMany({ userId: req.user._id });
    await RoadmapStep.insertMany(generatedSteps.map((s, idx) => {
      const dayNum = s.day || (idx + 1);
      const weekNum = 1;
      const rawTasks = Array.isArray(s.tasks) && s.tasks.length > 0 ? s.tasks : [
        { title: `[PRIMARY MISSION] Master ${s.dayName || 'Day Focus'}`, completed: false }
      ];
      return {
        userId: req.user._id,
        week: weekNum,
        day: dayNum,
        phaseName: s.phaseName || 'Project Sprint',
        dayName: s.dayName || `Day ${dayNum}: Sprint Implementation`,
        context: s.context || `Project Sprint Day ${dayNum}`,
        completed: false,
        tasks: rawTasks.map((t, tidx) => ({
          taskId: t.taskId || `w${weekNum}-d${dayNum}-t${tidx + 1}`,
          title: typeof t === 'string' ? t : (t.title || `Task ${tidx + 1}`),
          completed: false
        }))
      };
    }));

    await User.findByIdAndUpdate(req.user._id, { currentRoadmapDay: 1 });

    return res.json({ success: true, message: 'Assignment deconstructed successfully', count: 7 });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ═══════════════════════════════════════════════════════════
// GET /api/roadmap/today — Get the current day's module
// ═══════════════════════════════════════════════════════════
router.get('/today', async (req, res) => {
  try {
     const user = await User.findById(req.user._id);
     const currentDay = user.currentRoadmapDay || 1;
     let step = await RoadmapStep.findOne({ userId: req.user._id, day: currentDay });

     if (!step) {
       const goal = user.goal || 'Learn Software Engineering';
       const level = user.level || 'beginner';
       const weeks = user.timelineWeeks || 4;
       const fallback = generateSmartFallback(goal, level, weeks);
       await RoadmapStep.insertMany(fallback.map(s => ({ ...s, userId: req.user._id })));
       step = await RoadmapStep.findOne({ userId: req.user._id, day: currentDay });
     }

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
    
    const allCompleted = step.tasks.every(t => t.completed);
    step.completed = allCompleted;

    await step.save();

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
// PATCH /api/roadmap/:day/complete — Mark entire day/step as completed
// ═══════════════════════════════════════════════════════════
router.patch('/:day/complete', async (req, res) => {
  try {
    const dayNumeric = parseInt(req.params.day, 10);
    const completed = req.body.completed !== undefined ? req.body.completed : true;

    const step = await RoadmapStep.findOne({ userId: req.user._id, day: dayNumeric });
    if (!step) return res.status(404).json({ message: 'Roadmap step not found' });

    step.completed = completed;
    if (step.tasks && step.tasks.length > 0) {
      step.tasks.forEach(t => { t.completed = completed; });
    }
    await step.save();

    let user = await User.findById(req.user._id);
    if (user) {
      if (completed) {
        if (user.currentRoadmapDay <= dayNumeric) {
          user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: { currentRoadmapDay: dayNumeric + 1 }, $inc: { streak: 1 } },
            { new: true }
          );
        }
      } else {
        if (user.currentRoadmapDay > dayNumeric) {
          user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: { currentRoadmapDay: dayNumeric } },
            { new: true }
          );
        }
      }
    }
    const currentDayVal = user ? user.currentRoadmapDay : (completed ? dayNumeric + 1 : dayNumeric);
    res.json({ message: `Day ${dayNumeric} marked as ${completed ? 'completed' : 'pending'}`, step, currentRoadmapDay: currentDayVal });
  } catch (err) { res.status(500).json({ message: err.message }); }
});


// ═══════════════════════════════════════════════════════════
// GET /api/roadmap/concept/:day — On-demand Topic-Constrained AI Concept Generation
// ═══════════════════════════════════════════════════════════

const getTopicSpecificFallback = (topic, phase, dayNum, goal) => {
  const tLower = (topic || '').toLowerCase();

  if (tLower.includes('normalization') || tLower.includes('1nf') || tLower.includes('2nf') || tLower.includes('3nf')) {
    return {
      hasSimulation: true,
      visualType: 'NORMALIZATION',
      title: topic,
      phase: phase,
      subtitle: 'Eliminate data redundancy, update anomalies, and transitive dependencies via 1NF, 2NF, and 3NF table decomposition.',
      whyMatters: 'Database normalization ensures data integrity, prevents insertion/update/deletion anomalies, and reduces storage overhead in relational engines.',
      codeSnippet: `-- 3NF Normalized Schema Example
CREATE TABLE Students (
    student_id INT PRIMARY KEY,
    student_name VARCHAR(100)
);

CREATE TABLE Courses (
    course_id INT PRIMARY KEY,
    course_name VARCHAR(100)
);

-- Resolved Many-to-Many & Transitive Dependency into 3NF
CREATE TABLE Enrollments (
    student_id INT REFERENCES Students(student_id),
    course_id INT REFERENCES Courses(course_id),
    grade VARCHAR(2),
    PRIMARY KEY (student_id, course_id)
);`,
      quizQuestion: 'What type of dependency is eliminated when decomposing a relational table from 2NF to 3NF?',
      quizOptions: [
        { id: 'A', text: 'Transitive dependency (non-prime attribute depending on another non-prime attribute).', correct: true },
        { id: 'B', text: 'Partial dependency on a composite primary key.' },
        { id: 'C', text: 'Multi-valued repeating column groups.' }
      ]
    };
  }

  if (tLower.includes('join') || tLower.includes('inner join') || tLower.includes('left join')) {
    return {
      hasSimulation: true,
      visualType: 'SQL_JOIN',
      title: topic,
      phase: phase,
      subtitle: 'Combine rows from two or more tables based on a related column join predicate.',
      whyMatters: 'Understanding relational joins is fundamental to querying normalized schemas efficiently.',
      codeSnippet: `-- INNER JOIN vs LEFT JOIN Example
SELECT u.name, o.order_date, o.total_amount
FROM Users u
INNER JOIN Orders o ON u.user_id = o.user_id
WHERE o.order_date >= '2026-01-01';`,
      quizQuestion: 'Which SQL join returns all rows from the left table, even if there are no matches in the right table?',
      quizOptions: [
        { id: 'A', text: 'LEFT OUTER JOIN', correct: true },
        { id: 'B', text: 'INNER JOIN' },
        { id: 'C', text: 'CROSS JOIN' }
      ]
    };
  }

  if (tLower.includes('acid') || tLower.includes('transaction') || tLower.includes('isolation')) {
    return {
      hasSimulation: true,
      visualType: 'ACID_TRANSACTION',
      title: topic,
      phase: phase,
      subtitle: 'Ensure Atomicity, Consistency, Isolation, and Durability across database write operations.',
      whyMatters: 'ACID guarantees prevent corrupt states during server crashes, concurrent updates, and financial operations.',
      codeSnippet: `-- PostgreSQL ACID Transaction Block
BEGIN;
  UPDATE Accounts SET balance = balance - 500 WHERE account_id = 101;
  UPDATE Accounts SET balance = balance + 500 WHERE account_id = 202;
COMMIT;`,
      quizQuestion: 'Which ACID property guarantees that all operations in a transaction succeed together or fail completely with a rollback?',
      quizOptions: [
        { id: 'A', text: 'Atomicity (All-or-Nothing execution)', correct: true },
        { id: 'B', text: 'Isolation' },
        { id: 'C', text: 'Durability' }
      ]
    };
  }

  if (tLower.includes('cache') || tLower.includes('redis') || tLower.includes('memcached')) {
    return {
      hasSimulation: true,
      visualType: 'REDIS_CACHE',
      title: topic,
      phase: phase,
      subtitle: 'Implement in-memory caching patterns to reduce database latency from 100ms to <2ms.',
      whyMatters: 'Caching hot data in RAM mitigates database bottlenecks under high read throughput.',
      codeSnippet: `// Cache-Aside Pattern in Node.js & Redis
async function getUserProfile(userId) {
  const cached = await redis.get(\`user:\${userId}\`);
  if (cached) return JSON.parse(cached);

  const user = await db.query('SELECT * FROM Users WHERE id = ?', [userId]);
  await redis.setex(\`user:\${userId}\`, 3600, JSON.stringify(user));
  return user;
}`,
      quizQuestion: 'In a Cache-Aside pattern, what happens when a requested key is not present in the Redis cache (Cache Miss)?',
      quizOptions: [
        { id: 'A', text: 'The application queries the database, writes the result to Redis, and returns it to the client.', correct: true },
        { id: 'B', text: 'Redis automatically generates dummy fallback data.' },
        { id: 'C', text: 'The request fails with HTTP 404.' }
      ]
    };
  }

  if (tLower.includes('ddl') || tLower.includes('dml') || tLower.includes('foreign key') || tLower.includes('cascade')) {
    return {
      hasSimulation: true,
      visualType: 'SQL_SCHEMA_RELATIONSHIP',
      title: topic,
      phase: phase,
      subtitle: 'Understand DDL schema definitions (CREATE/ALTER/DROP) vs DML data modifications (INSERT/UPDATE/DELETE) and Foreign Key CASCADE rules.',
      whyMatters: 'DDL defines database structures and constraints, while DML manipulates records. Foreign Key CASCADE rules maintain referential integrity automatically.',
      codeSnippet: `-- DDL: Create Parent & Child Tables with Foreign Key CASCADE
CREATE TABLE Departments (
    dept_id INT PRIMARY KEY,
    dept_name VARCHAR(100) NOT NULL
);

CREATE TABLE Employees (
    emp_id INT PRIMARY KEY,
    emp_name VARCHAR(100),
    dept_id INT,
    CONSTRAINT fk_dept FOREIGN KEY (dept_id)
        REFERENCES Departments(dept_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- DML: Insert Data & Test Cascade Delete
INSERT INTO Departments VALUES (1, 'Engineering');
INSERT INTO Employees VALUES (101, 'Alice', 1);

-- Deleting parent record automatically cascades deletion to child rows
DELETE FROM Departments WHERE dept_id = 1;`,
      quizQuestion: 'In a relational database, what happens when a parent row is deleted if the foreign key constraint is configured with ON DELETE CASCADE?',
      quizOptions: [
        { id: 'A', text: 'All matching child rows in the referencing table are automatically deleted.', correct: true },
        { id: 'B', text: 'The database throws a Foreign Key Constraint Violation error.' },
        { id: 'C', text: 'The parent row is set to NULL while child rows remain unchanged.' }
      ]
    };
  }

  return {
    hasSimulation: false,
    visualType: 'NONE',
    title: topic,
    phase: phase,
    subtitle: `Master ${topic} with structured technical logic, production principles, and verifiable exercises.`,
    whyMatters: `${topic} is a core requirement for establishing engineering mastery in ${goal}.`,
    codeSnippet: `# Day ${dayNum}: ${topic} Implementation Example\ndef execute_day_${dayNum}():\n    # Technical implementation for ${topic}\n    pass`,
    quizQuestion: `What is the primary technical objective of ${topic}?`,
    quizOptions: [
      { id: 'A', text: `Establish production-ready mastery and correct implementation of ${topic}.`, correct: true },
      { id: 'B', text: 'Bypass technical evaluation constraints.' },
      { id: 'C', text: 'Increase execution runtime artificially.' }
    ]
  };
};


const classifyTopicToVisualizer = (topic) => {
  const t = (topic || '').toLowerCase();
  if (t.includes('ddl') || t.includes('dml') || t.includes('foreign key') || t.includes('cascade')) return 'SQL_SCHEMA_RELATIONSHIP';
  if (t.includes('normalization') || t.includes('1nf') || t.includes('2nf') || t.includes('3nf')) return 'NORMALIZATION';
  if (t.includes('join')) return 'SQL_JOIN';
  if (t.includes('acid') || t.includes('transaction') || t.includes('isolation')) return 'ACID_TRANSACTION';
  if (t.includes('cache') || t.includes('redis') || t.includes('memcached')) return 'REDIS_CACHE';
  if (t.includes('b-tree') || t.includes('indexing') || t.includes('explain analyze')) return 'B_TREE_INDEX';
  if (t.includes('binary search')) return 'BINARY_SEARCH';
  if (t.includes('two pointer') || t.includes('two-pointer')) return 'TWO_POINTERS';
  if (t.includes('sliding window')) return 'SLIDING_WINDOW';
  if (t.includes('matrix') || t.includes('2d grid')) return 'MATRIX_2D';
  if (t.includes('linked list') || t.includes('singly linked')) return 'LINKED_LIST';
  if (t.includes('tree') || t.includes('graph') || t.includes('bfs') || t.includes('dfs')) return 'TREE_GRAPH';
  if (t.includes('hash ring') || t.includes('consistent hash')) return 'HASH_RING';
  if (t.includes('jwt') || t.includes('oauth') || t.includes('cookie') || t.includes('auth')) return 'JWT_TOKEN';
  if (t.includes('load balan') || t.includes('microservice') || t.includes('architecture')) return 'SYSTEM_ARCHITECTURE';
  
  return 'NONE';
};

router.get('/concept/:day', async (req, res) => {
  try {
    const dayNum = parseInt(req.params.day, 10) || 1;
    const user = await User.findById(req.user._id);
    const step = await RoadmapStep.findOne({ userId: req.user._id, day: dayNum });

    const goal = user.goal || 'Software Engineering';
    const level = user.level || 'beginner';
    const topic = step ? step.dayName : `Day ${dayNum} Core Module`;
    const phase = step ? step.phaseName : goal;
    const context = step ? step.context : '';

    const expectedVisualType = classifyTopicToVisualizer(topic);

    const prompt = `You are GuideX AI Content Generator. Generate a structured technical daily micro-lesson concept.

## HARD CONSTRAINT — THE ROADMAP TOPIC IS THE SINGLE SOURCE OF TRUTH:
- **Exact Roadmap Topic**: "${topic}"
- **Roadmap Context / Description**: "${context}"
- **User Goal**: "${goal}" (${level} level)
- **Day Number**: ${dayNum}
- **Phase/Module**: "${phase}"

## CRITICAL RULES:
1. EVERY section of the returned JSON MUST be directly and exclusively about "${topic}".
2. DO NOT introduce unrelated concepts.
3. The visualType MUST be set strictly to "${expectedVisualType}". (If "${expectedVisualType}" is "NONE", set hasSimulation: false). DO NOT select an unrelated visualizer.

Generate a STRICT JSON object matching this schema:
{
  "hasSimulation": ${expectedVisualType !== 'NONE'},
  "visualType": "${expectedVisualType}",
  "title": "${topic}",
  "phase": "${phase}",
  "subtitle": "Short 1-2 sentence description of ${topic}.",
  "whyMatters": "Deep technical explanation of why ${topic} is critical in production systems.",
  "codeSnippet": "Runnable code or SQL schema example directly illustrating ${topic}.",
  "quizQuestion": "Multiple-choice interview question specifically testing ${topic}.",
  "quizOptions": [
    { "id": "A", "text": "Correct answer testing ${topic}.", "correct": true },
    { "id": "B", "text": "Option B text" },
    { "id": "C", "text": "Option C text" }
  ]
}
Output ONLY raw valid JSON. No markdown backticks.`;

    try {
      const model = getGenAI().getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      });

      let textStr = result.response.text();
      const jsonStart = textStr.indexOf('{');
      const jsonEnd = textStr.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        textStr = textStr.substring(jsonStart, jsonEnd + 1);
      }
      const parsedConcept = JSON.parse(textStr);

      parsedConcept.visualType = expectedVisualType;
      parsedConcept.hasSimulation = expectedVisualType !== 'NONE';

      return res.json({ day: dayNum, step, concept: parsedConcept });
    } catch (aiErr) {
      console.warn("⚠️ AI Concept Generation fallback used:", aiErr.message);
      return res.json({ day: dayNum, step, concept: getTopicSpecificFallback(topic, phase, dayNum, goal) });
    }
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
