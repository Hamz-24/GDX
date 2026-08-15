import express from 'express';
import protect from '../middleware/auth.js';
import RoadmapStep from '../models/RoadmapStep.js';
import Project from '../models/Project.js';
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

// ─── DATA MIGRATION HOOK ───
const runMigration = async (userId) => {
  try {
    await RoadmapStep.updateMany(
      { userId, roadmapType: { $exists: false } },
      { $set: { roadmapType: 'core', roadmapVersion: 1, isActive: true, source: 'initial', projectId: null, projectName: null } }
    );
    await RoadmapStep.updateMany(
      { userId, roadmapType: 'core', roadmapVersion: { $exists: false } },
      { $set: { roadmapVersion: 1, isActive: true, source: 'initial' } }
    );
    await RoadmapStep.updateMany(
      { userId, roadmapType: 'core', isActive: { $exists: false } },
      { $set: { isActive: true } }
    );

    const legacyProjectSteps = await RoadmapStep.find({ userId, phaseName: 'Project Sprint', roadmapType: 'core' });
    if (legacyProjectSteps.length > 0) {
      const legacyProjectId = 'proj_legacy_sprint';
      const legacyTitle = 'Project Sprint';
      await RoadmapStep.updateMany(
        { userId, phaseName: 'Project Sprint', roadmapType: 'core' },
        { $set: { roadmapType: 'project', projectId: legacyProjectId, projectName: legacyTitle } }
      );
      const existingProj = await Project.findOne({ userId, projectId: legacyProjectId });
      if (!existingProj) {
        await Project.create({
          userId,
          projectId: legacyProjectId,
          title: legacyTitle,
          description: 'Legacy 7-Day Implementation Sprint',
          totalDays: 7,
          completedDays: legacyProjectSteps.filter(s => s.completed).length,
          completed: legacyProjectSteps.every(s => s.completed)
        });
      }
    }
  } catch (err) {
    console.warn('⚠️ Migration warning:', err.message);
  }
};

// ─── HELPER: EXTRACT PROJECT TITLE ───
const extractProjectTitle = (text) => {
  if (!text) return 'Project Sprint';
  const clean = text.trim();
  const firstLine = clean.split('\n')[0].replace(/^[#*-\s]+/, '').trim();
  if (firstLine.length >= 4 && firstLine.length <= 45 && !firstLine.toLowerCase().startsWith('make') && !firstLine.toLowerCase().startsWith('build')) {
    return firstLine;
  }
  const lower = clean.toLowerCase();
  if (lower.includes('hospital') || lower.includes('bill')) return 'Hospital Bill Duplicate Checker';
  if (lower.includes('recommendation') || lower.includes('e-commerce')) return 'E-Commerce Recommendation System';
  if (lower.includes('trading') || lower.includes('stock') || lower.includes('financial')) return 'Trading Analytics Dashboard';
  if (lower.includes('chat') || lower.includes('messaging') || lower.includes('socket')) return 'Real-Time Messaging Engine';

  const words = clean.split(/\s+/).slice(0, 4).join(' ');
  return words.length > 35 ? words.substring(0, 32) + '...' : words;
};

// ─── HELPER: UNIVERSAL PDF PARSER ───
const parsePdfBuffer = async (buffer) => {
  if (!buffer || buffer.length === 0) {
    throw new Error('PDF buffer is empty');
  }

  // 1. PDFParse Class (pdf-parse v2.4.5+)
  const PDFClass = pdfParse.PDFParse || (pdfParse.default && pdfParse.default.PDFParse);
  if (PDFClass) {
    try {
      const parser = new PDFClass({ data: buffer });
      const result = await parser.getText();
      if (typeof result === 'string') return result;
      if (result && typeof result.text === 'string') return result.text;
    } catch (err) {
      console.warn('⚠️ PDFParse class attempt failed:', err.message);
    }
  }

  // 2. Function Call (pdf-parse v1.x)
  const fn = typeof pdfParse === 'function' ? pdfParse : (pdfParse.default || null);
  if (typeof fn === 'function' && fn !== PDFClass) {
    try {
      const result = await fn(buffer);
      if (typeof result === 'string') return result;
      if (result && typeof result.text === 'string') return result.text;
    } catch (err) {
      console.warn('⚠️ pdfParse function attempt failed:', err.message);
    }
  }

  throw new Error("We couldn't extract text from this document. Please try another file or paste your resume text below.");
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
      try {
        extractedText = await parsePdfBuffer(buffer);
      } catch (err) {
        return res.status(422).json({ message: "We couldn't extract text from this document. Please try another file or paste your resume text below." });
      }
    } else if (ext === 'docx') {
      try {
        const docxData = await mammoth.extractRawText({ buffer });
        extractedText = docxData.value || '';
      } catch (err) {
        return res.status(422).json({ message: "We couldn't extract text from this document. Please try another file or paste your resume text below." });
      }
    } else if (ext === 'txt' || ext === 'md' || ext === 'json') {
      extractedText = buffer.toString('utf-8');
      if (ext === 'json') {
        try {
          const parsedObj = JSON.parse(extractedText);
          extractedText = typeof parsedObj === 'string' ? parsedObj : JSON.stringify(parsedObj, null, 2);
        } catch (_) {}
      }
    } else {
      try {
        extractedText = await parsePdfBuffer(buffer);
      } catch (_) {
        extractedText = buffer.toString('utf-8');
      }
    }

    extractedText = extractedText.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F]/g, ' ').trim();

    if (!extractedText || extractedText.length < 5) {
      return res.status(422).json({ message: "We couldn't extract readable text from this document. Please try another file or paste your resume text below." });
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
    res.status(422).json({ message: "We couldn't extract text from this document. Please try another file or paste your resume text below." });
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
2. Every single day MUST introduce a unique CONCEPT or TOPIC strictly relevant to "${goal}".
3. DO NOT introduce unrelated framework concepts (e.g. Do NOT include React, Next.js, or Frontend terms in a Data Structures roadmap).
4. Each day must include a context field: a brief mission briefing explaining why this day's topic matters in "${goal}".
5. Each day must have 2-4 tasks that are granular and verifiable.
6. Task IDs must follow the pattern "w{week}-d{day}-t{taskNumber}".`;
};

// ─── CONTENT RELEVANCE VALIDATOR ───
const validateRoadmapRelevance = (goal, steps) => {
  if (!steps || !Array.isArray(steps) || steps.length === 0) return false;
  const gUpper = (goal || '').toUpperCase();

  if (gUpper.includes('DATA STRUCTURES') || gUpper.includes('ALGORITHM') || gUpper.includes('DSA')) {
    const forbiddenKeywords = ['REACT 19', 'NEXT.JS', 'ZUSTAND', 'SOLID PRINCIPLES', 'REDUX', 'DOCKERIZATION', 'EXPRESS MIDDLEWARE'];
    const hasForbidden = steps.some(s => {
      const text = `${s.dayName || ''} ${s.context || ''} ${JSON.stringify(s.tasks || [])}`.toUpperCase();
      return forbiddenKeywords.some(kw => text.includes(kw));
    });
    if (hasForbidden) return false;
  }
  return true;
};

// ─── SMART DOMAIN FALLBACK GENERATOR ───
const generateSmartFallback = (goal, level, weeks) => {
  const gUpper = (goal || '').toUpperCase();
  let domainCurriculum = [];

  if (gUpper.includes('DATA STRUCTURES') || gUpper.includes('ALGORITHM') || gUpper.includes('DSA')) {
    domainCurriculum = [
      { theme: 'Foundations & Linear Structures', topics: ['Arrays & Dynamic Array Memory Layout', 'String Manipulation & Substring Algorithms', 'Singly Linked Lists & Pointer Operations', 'Doubly Linked Lists & Circular Lists', 'Stacks & LIFO Operations', 'Queues & Deques (Double-Ended Queues)', 'Array vs Linked List Algorithmic Tradeoffs'] },
      { theme: 'Non-Linear & Tree Structures', topics: ['Binary Trees & Traversals (DFS/BFS)', 'Binary Search Trees (BST) & Search Property', 'AVL Trees & Self-Balancing Rotations', 'Heaps & Priority Queue Operations', 'Hash Tables & Collision Resolution Strategies', 'Trie (Prefix Tree) Data Structure', 'Union-Find & Disjoint Set Union (DSU)'] },
      { theme: 'Graph Algorithms & Advanced Structures', topics: ['Graph Representations (Adjacency Matrix & List)', 'Breadth-First Search (BFS) & Shortest Path', 'Depth-First Search (DFS) & Topological Sorting', 'Dijkstra\'s Shortest Path Algorithm', 'Kruskal\'s & Prim\'s Minimum Spanning Tree (MST)', 'Segment Trees & Range Query Operations', 'Monotonic Stack & Sliding Window Patterns'] },
      { theme: 'Dynamic Programming & Algorithmic Complexity', topics: ['Dynamic Programming (Memoization vs Tabulation)', '0/1 Knapsack & Subset Sum Problems', 'Longest Common Subsequence & Edit Distance', 'Backtracking Patterns & N-Queens', 'Greedy Choice Property & Proofs', 'Bit Manipulation Techniques & Bitmasks', 'Big-O Time & Space Complexity Analysis'] }
    ];
  } else if (gUpper.includes('SYSTEM DESIGN') || gUpper.includes('ARCHITECTURE')) {
    domainCurriculum = [
      { theme: 'Scalability & Core Principles', topics: ['Vertical vs Horizontal Scaling Fundamentals', 'Load Balancers & Layer 4/7 Traffic Routing', 'Consistent Hashing & Distributed Hash Tables', 'Forward vs Reverse Proxies (Nginx/HAProxy)', 'CDN Content Delivery Networks & Edge Caching', 'API Gateway Patterns & Rate Limiting', 'Stateless vs Stateful Service Architecture'] },
      { theme: 'Storage & Database Architecture', topics: ['SQL vs NoSQL Database Selection Principles', 'Database Sharding & Data Partitioning', 'Replication Topologies (Master-Slave & Multi-Master)', 'In-Memory Caching Strategies (Redis/Memcached)', 'Cache-Aside, Write-Through & Write-Back Patterns', 'Database Indexing (B-Trees & LSM Trees)', 'CAP Theorem, ACID vs BASE Guarantee Tradeoffs'] },
      { theme: 'Messaging & Distributed Systems', topics: ['Message Queues (Kafka & RabbitMQ Architecture)', 'Event-Driven Systems & Pub/Sub Patterns', 'Rate Limiting Algorithms (Token & Leaky Bucket)', 'Distributed Locking & Consensus (Zookeeper/Raft)', 'Fault Tolerance, Retries & Circuit Breakers', 'Log Aggregation & Distributed Tracing', 'Microservices vs Monolithic Architecture Tradeoffs'] },
      { theme: 'Production System Design Case Studies', topics: ['Design a High-Throughput URL Shortener (TinyURL)', 'Design a Real-Time Scalable Chat Application', 'Design a Video Streaming Platform (YouTube/Netflix)', 'Design a Distributed Web Crawler', 'Design a Rate Limiter as a Cloud Service', 'Design a Distributed Unique ID Generator (Snowflake)', 'System Bottleneck Analysis & Load Benchmarking'] }
    ];
  } else if (gUpper.includes('BACKEND')) {
    domainCurriculum = [
      { theme: 'Core Server Architecture', topics: ['Node.js Event Loop & Non-Blocking I/O', 'RESTful API Design Best Practices', 'Middleware Pipeline & Request Lifecycle', 'Input Validation & Schema Sanitization (Zod/Joi)', 'Environment Configuration & Secrets Management', 'Structured Logging & Tracing (Winston/Pino)', 'Global Error Handling & Exception Boundaries'] },
      { theme: 'Databases & Persistence Layer', topics: ['Relational Schema Design (PostgreSQL/MySQL)', 'Document Store Data Modeling (MongoDB)', 'Query Optimization & Indexing Strategies', 'Database Migrations & Versioning Systems', 'ORM & Query Builders (Prisma/Mongoose)', 'Database Connection Pooling & Lifecycle', 'Transactions & Isolation Levels'] },
      { theme: 'Security, Auth & Caching', topics: ['JWT Authentication & Refresh Token Rotation', 'OAuth 2.0 & OpenID Connect Authorization', 'Password Hashing & Salting Strategies (Bcrypt/Argon2)', 'OWASP Top 10 Security Mitigations (CORS, XSS, CSRF)', 'In-Memory Caching with Redis', 'Rate Limiting & Anti-Abuse Controls', 'File Upload Pipeline & Cloud Object Storage (S3)'] },
      { theme: 'Microservices & Production Deployment', topics: ['Docker Containerization & Multi-Stage Builds', 'CI/CD Pipeline Automation (GitHub Actions)', 'Microservice Inter-Service Communication (gRPC)', 'WebSockets & Real-Time Bidirectional Communication', 'Unit & Integration Testing Suites (Jest/Supertest)', 'Server Health Checks & Graceful Shutdowns', 'Cloud Container Deployment & Load Balancing'] }
    ];
  } else if (gUpper.includes('FRONTEND') || gUpper.includes('REACT')) {
    domainCurriculum = [
      { theme: 'Core Web & Component Foundations', topics: ['HTML5 Semantic Architecture & ARIA Accessibility', 'Modern CSS Layouts (Flexbox & Grid Systems)', 'JavaScript ES6+ Async Patterns (Promises & Async/Await)', 'DOM Event Bubbling & Performance Optimization', 'Responsive Design & Mobile-First Media Queries', 'CSS Architecture & Utility Frameworks', 'Browser Critical Rendering Path & Web Vitals'] },
      { theme: 'Component Architecture & State', topics: ['Component Lifecycle & State Management', 'React Hooks Abstraction & Custom Hooks', 'Form Handling & Validation Patterns', 'Component Styling & CSS Modules', 'Client-Side Routing & Dynamic Page Navigation', 'Virtual DOM & Reconciliation Mechanics', 'Context API & Local State Scoping'] },
      { theme: 'State Management & Performance', topics: ['Global State Management (Zustand/Redux)', 'Server State & Caching (React Query/SWR)', 'SSR (Server-Side Rendering) vs SSG vs ISR', 'Code Splitting & Dynamic Imports', 'Performance Optimization (LCP, CLS, INP)', 'Error Boundaries & Resilient Fallback UI', 'Asset Optimization & Image Processing'] },
      { theme: 'Testing, Security & Deployment', topics: ['Component Unit Testing (Jest & React Testing Library)', 'End-to-End Testing Suite (Playwright/Cypress)', 'Web Security Mitigations (XSS, CSP Headers)', 'Progressive Web Apps (PWA) & Service Workers', 'Build Tooling & Bundling (Vite/Webpack)', 'CI/CD Pipeline & Continuous Deployment', 'Production Error Monitoring & Analytics'] }
    ];
  } else {
    domainCurriculum = [
      { theme: `${goal} Core Foundations`, topics: [`${goal} Environment Setup`, `${goal} Basic Concepts`, `${goal} Syntax & Rules`, `${goal} Scoping & Functions`, `${goal} Control Flow`, `${goal} Data Handling`, `${goal} Week 1 Review`] },
      { theme: `${goal} Intermediate Principles`, topics: [`${goal} Modularization`, `${goal} Architecture Patterns`, `${goal} Error Handling`, `${goal} Testing Basics`, `${goal} Refactoring`, `${goal} API Integration`, `${goal} Week 2 Review`] },
      { theme: `${goal} Advanced Mastery`, topics: [`${goal} Performance Optimization`, `${goal} Security Best Practices`, `${goal} Scalability Controls`, `${goal} Database Integration`, `${goal} Async Pipelines`, `${goal} Telemetry & Logging`, `${goal} Week 3 Review`] },
      { theme: `${goal} Production Deployment`, topics: [`${goal} Containerization`, `${goal} CI/CD Automation`, `${goal} Monitoring & Alerts`, `${goal} Production Benchmarking`, `${goal} Security Audit`, `${goal} High-Availability Setup`, `${goal} Capstone Final Polish`] }
    ];
  }

  const fallback = [];
  for (let d = 1; d <= weeks * 7; d++) {
    const weekNum = Math.ceil(d / 7);
    const phaseIndex = Math.min(weekNum - 1, domainCurriculum.length - 1);
    const phase = domainCurriculum[phaseIndex];
    const dayInWeek = ((d - 1) % 7) + 1;
    const topic = phase.topics[(dayInWeek - 1) % phase.topics.length];

    fallback.push({
      userId: null,
      week: weekNum,
      day: d,
      phaseName: `PHASE_${weekNum}: ${phase.theme}`,
      dayName: `${goal} - SEC_${d}: ${topic}`,
      context: `Mission protocol engaged: Deep-diving into ${topic} to establish cognitive dominance in ${goal}.`,
      tasks: [
        { taskId: `w${weekNum}-d${d}-t1`, title: `[PRIMARY MISSION] Master ${topic}`, completed: false },
        { taskId: `w${weekNum}-d${d}-t2`, title: `[PRACTICE] Implement ${topic} code exercise`, completed: false },
        { taskId: `w${weekNum}-d${d}-t3`, title: `[REINFORCEMENT] Review ${topic} edge cases`, completed: false },
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
// GET /api/roadmap/core — Fetch Active Core Roadmap
// ═══════════════════════════════════════════════════════════
router.get('/core', async (req, res) => {
  try {
    await runMigration(req.user._id);
    let steps = await RoadmapStep.find({ userId: req.user._id, roadmapType: 'core', isActive: true }).sort({ week: 1, day: 1 });

    if (steps.length === 0) {
      const user = await User.findById(req.user._id);
      const weeks = user ? (user.timelineWeeks || 4) : 4;
      const goal = user?.goal || 'DATA STRUCTURES';
      const level = user?.level || 'intermediate';

      console.log(`🧠 Generating Core AI roadmap for "${goal}" (${weeks} weeks, ${level} level)...`);
      const prompt = buildRoadmapPrompt(goal, level, weeks);
      let generatedSteps = await generateAIContent(prompt);

      if (!validateRoadmapRelevance(goal, generatedSteps)) {
        console.log(`⚠️ AI output irrelevant for "${goal}". Using domain-matched fallback generator...`);
        generatedSteps = generateSmartFallback(goal, level, weeks);
      }

      await RoadmapStep.insertMany(
        generatedSteps.map((s, idx) => {
          const dayNum = s.day || (idx + 1);
          const weekNum = s.week && s.week > 0 ? s.week : Math.ceil(dayNum / 7);
          const rawTasks = Array.isArray(s.tasks) && s.tasks.length > 0 ? s.tasks : [
            { title: `[PRIMARY MISSION] Master ${s.dayName || 'Day Focus'}`, completed: false }
          ];
          return {
            userId: req.user._id,
            roadmapType: 'core',
            roadmapVersion: 1,
            isActive: true,
            source: 'initial',
            projectId: null,
            projectName: null,
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

      steps = await RoadmapStep.find({ userId: req.user._id, roadmapType: 'core', isActive: true }).sort({ week: 1, day: 1 });
    }
    res.json(steps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
// GET /api/roadmap — Default Roadmap Endpoint (Alias to Core Active)
// ═══════════════════════════════════════════════════════════
router.get('/', async (req, res) => {
  try {
    await runMigration(req.user._id);
    let steps = await RoadmapStep.find({ userId: req.user._id, roadmapType: 'core', isActive: true }).sort({ week: 1, day: 1 });
    if (steps.length === 0) {
      const user = await User.findById(req.user._id);
      const weeks = user ? (user.timelineWeeks || 4) : 4;
      const goal = user?.goal || 'DATA STRUCTURES';
      const level = user?.level || 'intermediate';

      console.log(`🧠 Generating Core AI roadmap for "${goal}" (${weeks} weeks, ${level} level)...`);
      const prompt = buildRoadmapPrompt(goal, level, weeks);
      let generatedSteps = await generateAIContent(prompt);

      if (!validateRoadmapRelevance(goal, generatedSteps)) {
        generatedSteps = generateSmartFallback(goal, level, weeks);
      }

      await RoadmapStep.insertMany(
        generatedSteps.map((s, idx) => {
          const dayNum = s.day || (idx + 1);
          const weekNum = s.week && s.week > 0 ? s.week : Math.ceil(dayNum / 7);
          const rawTasks = Array.isArray(s.tasks) && s.tasks.length > 0 ? s.tasks : [
            { title: `[PRIMARY MISSION] Master ${s.dayName || 'Day Focus'}`, completed: false }
          ];
          return {
            userId: req.user._id,
            roadmapType: 'core',
            roadmapVersion: 1,
            isActive: true,
            source: 'initial',
            projectId: null,
            projectName: null,
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
      steps = await RoadmapStep.find({ userId: req.user._id, roadmapType: 'core', isActive: true }).sort({ week: 1, day: 1 });
    }
    res.json(steps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
// GET /api/roadmap/history — Fetch Core Roadmap Version History
// ═══════════════════════════════════════════════════════════
router.get('/history', async (req, res) => {
  try {
    await runMigration(req.user._id);
    const steps = await RoadmapStep.find({ userId: req.user._id, roadmapType: 'core' }).sort({ roadmapVersion: -1, day: 1 });

    const versionMap = {};
    steps.forEach(s => {
      const v = s.roadmapVersion || 1;
      if (!versionMap[v]) {
        versionMap[v] = {
          version: v,
          source: s.source || 'initial',
          isActive: Boolean(s.isActive),
          createdAt: s.createdAt,
          dayCount: 0
        };
      }
      versionMap[v].dayCount += 1;
    });

    res.json(Object.values(versionMap));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ═══════════════════════════════════════════════════════════
// POST /api/roadmap/restore/:version — Restore Previous Core Roadmap Version
// ═══════════════════════════════════════════════════════════
router.post('/restore/:version', async (req, res) => {
  try {
    const versionNum = parseInt(req.params.version, 10);
    if (isNaN(versionNum)) return res.status(400).json({ message: 'Invalid version number' });

    const targetSteps = await RoadmapStep.find({ userId: req.user._id, roadmapType: 'core', roadmapVersion: versionNum });
    if (targetSteps.length === 0) {
      return res.status(404).json({ message: `Core Roadmap Version v${versionNum} not found` });
    }

    await RoadmapStep.updateMany(
      { userId: req.user._id, roadmapType: 'core' },
      { $set: { isActive: false } }
    );
    await RoadmapStep.updateMany(
      { userId: req.user._id, roadmapType: 'core', roadmapVersion: versionNum },
      { $set: { isActive: true } }
    );

    res.json({ success: true, message: `Restored Core Roadmap Version v${versionNum}`, version: versionNum });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ═══════════════════════════════════════════════════════════
// GET /api/roadmap/projects — List All Active Project Sprints
// ═══════════════════════════════════════════════════════════
router.get('/projects', async (req, res) => {
  try {
    await runMigration(req.user._id);
    const projects = await Project.find({ userId: req.user._id }).sort({ createdAt: -1 });

    const updatedProjects = await Promise.all(projects.map(async (p) => {
      const steps = await RoadmapStep.find({ userId: req.user._id, roadmapType: 'project', projectId: p.projectId });
      const completedDays = steps.filter(s => s.completed).length;
      const isComplete = steps.length > 0 && completedDays === steps.length;
      if (p.completedDays !== completedDays || p.completed !== isComplete) {
        p.completedDays = completedDays;
        p.completed = isComplete;
        await p.save();
      }
      return p;
    }));

    res.json(updatedProjects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
// GET /api/roadmap/projects/:projectId — Fetch Specific Project Sprint Steps
// ═══════════════════════════════════════════════════════════
router.get('/projects/:projectId', async (req, res) => {
  try {
    await runMigration(req.user._id);
    const { projectId } = req.params;
    const project = await Project.findOne({ userId: req.user._id, projectId });
    if (!project) return res.status(404).json({ message: 'Project Sprint not found' });

    const steps = await RoadmapStep.find({ userId: req.user._id, roadmapType: 'project', projectId }).sort({ day: 1 });
    res.json({ project, steps });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
// DELETE /api/roadmap/projects/:projectId — Delete Project Sprint
// ═══════════════════════════════════════════════════════════
router.delete('/projects/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    await RoadmapStep.deleteMany({ userId: req.user._id, roadmapType: 'project', projectId });
    await Project.deleteOne({ userId: req.user._id, projectId });
    res.json({ success: true, message: 'Project Sprint deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
// POST /api/roadmap/analyze-resume — AI Resume Skill Gap Optimization
// ═══════════════════════════════════════════════════════════
router.post('/analyze-resume', async (req, res) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 5) {
      return res.status(400).json({ message: 'Please upload a resume or paste your resume text.' });
    }

    await runMigration(req.user._id);
    const user = await User.findById(req.user._id);
    if (!user) return res.status(401).json({ message: 'Authenticated user not found' });

    const goal = user.goal || 'DATA STRUCTURES';
    const weeks = user.timelineWeeks || 4;

    const prompt = `Analyze this resume against the user's TARGET GOAL: "${goal}". 
1. Identify what skills the user ALREADY has.
2. Identify the GAPS needed specifically for "${goal}".
3. Generate a refined, intensive learning roadmap for ${weeks} weeks (${weeks * 7} total days) focusing ONLY on the gaps within "${goal}".

CRITICAL CONSTRAINT: All topics MUST remain strictly within "${goal}". DO NOT introduce unrelated framework topics.

Resume: ${resumeText.trim()}

Output format: STRICT JSON array matching the roadmap schema (week, day, phaseName, dayName, context, tasks).`;

    let generatedSteps = await generateAIContent(prompt);
    if (!validateRoadmapRelevance(goal, generatedSteps)) {
      console.log(`⚠️ AI Resume output irrelevant or failed. Using smart fallback for "${goal}"...`);
      generatedSteps = generateSmartFallback(goal, user.level || 'intermediate', weeks);
    }

    // Calculate next version
    const lastStep = await RoadmapStep.findOne({ userId: req.user._id, roadmapType: 'core' }).sort({ roadmapVersion: -1 });
    const nextVersion = lastStep ? (lastStep.roadmapVersion || 1) + 1 : 1;

    // Map and validate new core steps
    const newCoreDocs = generatedSteps.map((s, idx) => {
      const dayNum = s.day || (idx + 1);
      const weekNum = s.week && s.week > 0 ? s.week : Math.ceil(dayNum / 7);
      const rawTasks = Array.isArray(s.tasks) && s.tasks.length > 0 ? s.tasks : [
        { title: `[PRIMARY MISSION] Master ${s.dayName || 'Day Focus'}`, completed: false }
      ];
      return {
        userId: req.user._id,
        roadmapType: 'core',
        roadmapVersion: nextVersion,
        isActive: true,
        source: 'resume_optimization',
        projectId: null,
        projectName: null,
        week: weekNum,
        day: dayNum,
        phaseName: s.phaseName || `Phase ${weekNum}`,
        dayName: s.dayName || `Day ${dayNum}: ${goal}`,
        context: s.context || `Resume Gap Optimization Day ${dayNum}`,
        completed: false,
        tasks: rawTasks.map((t, tidx) => ({
          taskId: typeof t === 'object' && t.taskId ? t.taskId : `w${weekNum}-d${dayNum}-t${tidx + 1}`,
          title: typeof t === 'string' ? t : (t.title || `Task ${tidx + 1}`),
          completed: false
        }))
      };
    });

    // Save new version FIRST
    await RoadmapStep.insertMany(newCoreDocs);

    // Deactivate previous core versions (NEVER DELETE!)
    await RoadmapStep.updateMany(
      { userId: req.user._id, roadmapType: 'core', roadmapVersion: { $ne: nextVersion } },
      { $set: { isActive: false } }
    );

    await User.findByIdAndUpdate(req.user._id, { currentRoadmapDay: 1 });

    return res.json({ success: true, message: 'Core roadmap optimized via resume analysis', version: nextVersion, count: generatedSteps.length });
  } catch (err) {
    console.error('❌ Resume analysis error:', err.message);
    res.status(500).json({ message: "We couldn't analyze your resume right now. Your existing roadmap is safe. Please try again." });
  }
});

// ═══════════════════════════════════════════════════════════
// POST /api/roadmap/analyze-assignment — Create New Project Sprint
// ═══════════════════════════════════════════════════════════
router.post('/analyze-assignment', async (req, res) => {
  try {
    const { assignmentText } = req.body;
    if (!assignmentText || typeof assignmentText !== 'string' || assignmentText.trim().length < 5) {
      return res.status(400).json({ message: 'Please provide assignment specifications or upload a project file.' });
    }

    await runMigration(req.user._id);
    const user = await User.findById(req.user._id);
    if (!user) return res.status(401).json({ message: 'Authenticated user not found' });

    const projectTitle = extractProjectTitle(assignmentText);
    const projectId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const prompt = `Break this assignment/project specification into a step-by-step implementation sprint roadmap for exactly 7 days (1 week).
Project Title: "${projectTitle}"
Assignment Specification: ${assignmentText.trim()}

Output format: STRICT JSON array matching the roadmap schema (week: 1, day: 1-7, phaseName: "Project Sprint", dayName, context, tasks).`;

    let generatedSteps = await generateAIContent(prompt);
    if (!generatedSteps || !Array.isArray(generatedSteps) || generatedSteps.length === 0) {
      console.log('⚠️ Assignment parser using smart fallback generator...');
      generatedSteps = generateSmartFallback(projectTitle, 'intermediate', 1);
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

    // Save project sprint steps with explicit roadmapType: 'project' and projectId
    await RoadmapStep.deleteMany({ userId: req.user._id, roadmapType: 'project', projectId });
    await RoadmapStep.insertMany(generatedSteps.map((s, idx) => {
      const dayNum = s.day || (idx + 1);
      const weekNum = 1;
      const rawTasks = Array.isArray(s.tasks) && s.tasks.length > 0 ? s.tasks : [
        { title: `[PRIMARY MISSION] Master ${s.dayName || 'Day Focus'}`, completed: false }
      ];
      return {
        userId: req.user._id,
        roadmapType: 'project',
        roadmapVersion: 1,
        isActive: true,
        source: 'assignment_parser',
        projectId,
        projectName: projectTitle,
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

    // Create Project record in MongoDB
    const project = await Project.create({
      userId: req.user._id,
      projectId,
      title: projectTitle,
      description: assignmentText.trim().substring(0, 150),
      totalDays: 7,
      completedDays: 0,
      completed: false
    });

    return res.json({
      success: true,
      message: 'Project Sprint created successfully',
      projectId,
      title: projectTitle,
      project,
      count: 7
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ═══════════════════════════════════════════════════════════
// POST /api/roadmap — Goal Update / Roadmap Regeneration
// ═══════════════════════════════════════════════════════════
router.post('/', async (req, res) => {
  try {
    await runMigration(req.user._id);
    const user = await User.findById(req.user._id);
    if (!user) return res.status(401).json({ message: 'User not found' });

    const goal = req.body.goal || user.goal || 'DATA STRUCTURES';
    const level = req.body.level || user.level || 'intermediate';
    const weeks = req.body.timelineWeeks || user.timelineWeeks || 4;

    const prompt = buildRoadmapPrompt(goal, level, weeks);
    let generatedSteps = await generateAIContent(prompt);

    if (!validateRoadmapRelevance(goal, generatedSteps)) {
      generatedSteps = generateSmartFallback(goal, level, weeks);
    }

    const lastStep = await RoadmapStep.findOne({ userId: req.user._id, roadmapType: 'core' }).sort({ roadmapVersion: -1 });
    const nextVersion = lastStep ? (lastStep.roadmapVersion || 1) + 1 : 1;

    const newCoreDocs = generatedSteps.map((s, idx) => {
      const dayNum = s.day || (idx + 1);
      const weekNum = s.week && s.week > 0 ? s.week : Math.ceil(dayNum / 7);
      const rawTasks = Array.isArray(s.tasks) && s.tasks.length > 0 ? s.tasks : [
        { title: `[PRIMARY MISSION] Master ${s.dayName || 'Day Focus'}`, completed: false }
      ];
      return {
        userId: req.user._id,
        roadmapType: 'core',
        roadmapVersion: nextVersion,
        isActive: true,
        source: 'goal_update',
        projectId: null,
        projectName: null,
        week: weekNum,
        day: dayNum,
        phaseName: s.phaseName || `Phase ${weekNum}`,
        dayName: s.dayName || `Day ${dayNum}: ${goal}`,
        context: s.context || `Curriculum Day ${dayNum}`,
        completed: false,
        tasks: rawTasks.map((t, tidx) => ({
          taskId: typeof t === 'object' && t.taskId ? t.taskId : `w${weekNum}-d${dayNum}-t${tidx + 1}`,
          title: typeof t === 'string' ? t : (t.title || `Task ${tidx + 1}`),
          completed: false
        }))
      };
    });

    await RoadmapStep.insertMany(newCoreDocs);
    await RoadmapStep.updateMany(
      { userId: req.user._id, roadmapType: 'core', roadmapVersion: { $ne: nextVersion } },
      { $set: { isActive: false } }
    );

    await User.findByIdAndUpdate(req.user._id, { goal, level, timelineWeeks: weeks, currentRoadmapDay: 1 });

    return res.json({ success: true, message: 'Core roadmap generated successfully', version: nextVersion, count: newCoreDocs.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
// DELETE /api/roadmap — Reset Active Core Roadmap
// ═══════════════════════════════════════════════════════════
router.delete('/', async (req, res) => {
  try {
    await RoadmapStep.updateMany(
      { userId: req.user._id, roadmapType: 'core' },
      { $set: { isActive: false } }
    );
    res.json({ message: 'Active Core Roadmap reset successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ═══════════════════════════════════════════════════════════
// GET /api/roadmap/today — Get current day's module
// ═══════════════════════════════════════════════════════════
router.get('/today', async (req, res) => {
  try {
     await runMigration(req.user._id);
     const { roadmapType, projectId } = req.query;
     const user = await User.findById(req.user._id);
     
     let step = null;
     if (roadmapType === 'project' && projectId) {
       step = await RoadmapStep.findOne({ userId: req.user._id, roadmapType: 'project', projectId }).sort({ day: 1 });
     } else {
       const currentDay = user ? (user.currentRoadmapDay || 1) : 1;
       step = await RoadmapStep.findOne({ userId: req.user._id, roadmapType: 'core', isActive: true, day: currentDay });
       if (!step) {
         step = await RoadmapStep.findOne({ userId: req.user._id, roadmapType: 'core', isActive: true }).sort({ day: 1 });
       }
       if (!step) {
         const goal = user ? (user.goal || 'DATA STRUCTURES') : 'DATA STRUCTURES';
         const level = user ? (user.level || 'intermediate') : 'intermediate';
         const weeks = user ? (user.timelineWeeks || 4) : 4;
         const fallback = generateSmartFallback(goal, level, weeks);
         await RoadmapStep.insertMany(fallback.map(s => ({
           ...s,
           userId: req.user._id,
           roadmapType: 'core',
           roadmapVersion: 1,
           isActive: true,
           source: 'initial',
           projectId: null,
           projectName: null
         })));
         step = await RoadmapStep.findOne({ userId: req.user._id, roadmapType: 'core', isActive: true, day: currentDay });
       }
     }

     const totalDays = await RoadmapStep.countDocuments({
       userId: req.user._id,
       ...(roadmapType === 'project' && projectId ? { roadmapType: 'project', projectId } : { roadmapType: 'core', isActive: true })
     });

     res.json({ currentDay: step ? step.day : 1, totalDays, step });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ═══════════════════════════════════════════════════════════
// PATCH /api/roadmap/:day/task/:taskId — Toggle task completion
// ═══════════════════════════════════════════════════════════
router.patch('/:day/task/:taskId', async (req, res) => {
  try {
    await runMigration(req.user._id);
    const dayNumeric = parseInt(req.params.day, 10);
    const { roadmapType, projectId } = req.query;

    const query = { userId: req.user._id, day: dayNumeric };
    if (roadmapType === 'project' && projectId) {
      query.roadmapType = 'project';
      query.projectId = projectId;
    } else {
      query.roadmapType = 'core';
      query.isActive = true;
    }

    const step = await RoadmapStep.findOne(query);
    if (!step) return res.status(404).json({ message: 'Roadmap step not found' });

    const task = step.tasks.find(t => t.taskId === req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.completed = req.body.completed;
    const allCompleted = step.tasks.every(t => t.completed);
    step.completed = allCompleted;
    await step.save();

    if (step.roadmapType === 'project' && step.projectId) {
      const allSteps = await RoadmapStep.find({ userId: req.user._id, roadmapType: 'project', projectId: step.projectId });
      const completedCount = allSteps.filter(s => s.completed).length;
      await Project.updateOne(
        { userId: req.user._id, projectId: step.projectId },
        { $set: { completedDays: completedCount, completed: allSteps.length > 0 && completedCount === allSteps.length } }
      );
    } else if (allCompleted) {
      const user = await User.findById(req.user._id);
      if (user && user.currentRoadmapDay === dayNumeric) {
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
    await runMigration(req.user._id);
    const dayNumeric = parseInt(req.params.day, 10);
    const completed = req.body.completed !== undefined ? req.body.completed : true;
    const { roadmapType, projectId } = req.query;

    const query = { userId: req.user._id, day: dayNumeric };
    if (roadmapType === 'project' && projectId) {
      query.roadmapType = 'project';
      query.projectId = projectId;
    } else {
      query.roadmapType = 'core';
      query.isActive = true;
    }

    const step = await RoadmapStep.findOne(query);
    if (!step) return res.status(404).json({ message: 'Roadmap step not found' });

    step.completed = completed;
    if (step.tasks && step.tasks.length > 0) {
      step.tasks.forEach(t => { t.completed = completed; });
    }
    await step.save();

    let currentDayVal = dayNumeric;
    if (step.roadmapType === 'project' && step.projectId) {
      const allSteps = await RoadmapStep.find({ userId: req.user._id, roadmapType: 'project', projectId: step.projectId });
      const completedCount = allSteps.filter(s => s.completed).length;
      await Project.updateOne(
        { userId: req.user._id, projectId: step.projectId },
        { $set: { completedDays: completedCount, completed: allSteps.length > 0 && completedCount === allSteps.length } }
      );
    } else {
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
      currentDayVal = user ? user.currentRoadmapDay : (completed ? dayNumeric + 1 : dayNumeric);
    }

    res.json({ message: `Day ${dayNumeric} marked as ${completed ? 'completed' : 'pending'}`, step, currentRoadmapDay: currentDayVal });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ═══════════════════════════════════════════════════════════
// GET /api/roadmap/concept/:day — On-demand AI Concept Generation
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
      whyMatters: 'Database normalization is essential for maintaining referential integrity and scaling relational schemas.',
      codeSnippet: `-- 1NF -> 2NF -> 3NF Normalization Example\nCREATE TABLE Users (\n    user_id INT PRIMARY KEY,\n    email VARCHAR(255) UNIQUE NOT NULL\n);\n\nCREATE TABLE Orders (\n    order_id INT PRIMARY KEY,\n    user_id INT REFERENCES Users(user_id),\n    total_amount DECIMAL(10, 2)\n);`,
      quizQuestion: 'What defines Third Normal Form (3NF)?',
      quizOptions: [
        { id: 'A', text: 'It must be in 2NF and have no transitive functional dependencies on non-primary key attributes.', correct: true },
        { id: 'B', text: 'It allows repeating groups of arrays.' },
        { id: 'C', text: 'It requires all tables to be merged into a single flat file.' }
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
      codeSnippet: `-- INNER JOIN vs LEFT JOIN Example\nSELECT u.name, o.order_date, o.total_amount\nFROM Users u\nINNER JOIN Orders o ON u.user_id = o.user_id\nWHERE o.order_date >= '2026-01-01';`,
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
      codeSnippet: `-- PostgreSQL ACID Transaction Block\nBEGIN;\n  UPDATE Accounts SET balance = balance - 500 WHERE account_id = 101;\n  UPDATE Accounts SET balance = balance + 500 WHERE account_id = 202;\nCOMMIT;`,
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
      codeSnippet: `// Cache-Aside Pattern in Node.js & Redis\nasync function getUserProfile(userId) {\n  const cached = await redis.get(\`user:\${userId}\`);\n  if (cached) return JSON.parse(cached);\n\n  const user = await db.query('SELECT * FROM Users WHERE id = ?', [userId]);\n  await redis.setex(\`user:\${userId}\`, 3600, JSON.stringify(user));\n  return user;\n}`,
      quizQuestion: 'In a Cache-Aside pattern, what happens when a requested key is not present in the Redis cache (Cache Miss)?',
      quizOptions: [
        { id: 'A', text: 'The application queries the database, writes the result to Redis, and returns it to the client.', correct: true },
        { id: 'B', text: 'Redis automatically generates dummy fallback data.' },
        { id: 'C', text: 'The request fails with HTTP 404.' }
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
    await runMigration(req.user._id);
    const dayNum = parseInt(req.params.day, 10) || 1;
    const { roadmapType, projectId } = req.query;
    const user = await User.findById(req.user._id);

    const query = { userId: req.user._id, day: dayNum };
    if (roadmapType === 'project' && projectId) {
      query.roadmapType = 'project';
      query.projectId = projectId;
    } else {
      query.roadmapType = 'core';
      query.isActive = true;
    }

    const step = await RoadmapStep.findOne(query);
    const goal = user ? (user.goal || 'Software Engineering') : 'Software Engineering';
    const level = user ? (user.level || 'beginner') : 'beginner';
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
  "hasSimulation": boolean,
  "visualType": "${expectedVisualType}",
  "title": "${topic}",
  "phase": "${phase}",
  "subtitle": "Clear 1-sentence technical summary of ${topic}",
  "whyMatters": "Clear 1-sentence explanation of why ${topic} is critical in production",
  "codeSnippet": "Production-ready code example demonstrating ${topic}",
  "quizQuestion": "A multiple-choice question testing understanding of ${topic}",
  "quizOptions": [
    { "id": "A", "text": "Option A text", "correct": boolean },
    { "id": "B", "text": "Option B text" },
    { "id": "C", "text": "Option C text" }
  ]
}`;

    let aiResult = await generateAIContent(prompt);
    if (!aiResult || typeof aiResult !== 'object' || !aiResult.title) {
      console.log(`⚠️ AI Concept Generation fallback used for "${topic}"...`);
      aiResult = getTopicSpecificFallback(topic, phase, dayNum, goal);
    } else {
      aiResult.visualType = expectedVisualType;
      aiResult.hasSimulation = expectedVisualType !== 'NONE';
    }

    res.json({ ...aiResult, concept: aiResult });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
