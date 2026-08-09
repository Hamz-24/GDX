/**
 * CANONICAL USER PROFILE — Single Source of Truth
 * Every page, component, and AI recommendation must derive from this.
 * Never hardcode role/phase/skill data outside this file.
 */

export const USER_PROFILE = {
  currentRole: 'Full-Stack Developer',
  targetRole: 'Backend Engineer',
  experienceLevel: 'Intermediate',
  timelineWeeks: 12,
  currentPhase: 2,           // 1-indexed phase number
  currentPhaseLabel: 'Backend Architecture',
  weekNumber: 5,
  careerReadiness: 78,       // % match to target role
  activeStreak: 7,           // days
};

export const PHASES = [
  {
    id: 1,
    num: '01',
    title: 'FOUNDATIONS',
    status: 'Completed',
    progress: 100,
    duration: '2 weeks',
    whyMatters: 'Clean code and data structures are non-negotiable for every Backend Engineer evaluation.',
    skills: [
      { name: 'SOLID Principles & Clean Code',        done: true,  mastery: 95 },
      { name: 'Object-Oriented Design Patterns',       done: true,  mastery: 88 },
      { name: 'Data Structures & Algorithms',          done: true,  mastery: 82 },
    ],
  },
  {
    id: 2,
    num: '02',
    title: 'BACKEND ARCHITECTURE',
    status: 'In Progress',
    current: true,
    progress: 64,
    duration: '3 weeks',
    whyMatters: 'APIs, data persistence, and auth are core Backend Engineer interview domains. This phase directly unlocks senior-level readiness.',
    skills: [
      { name: 'REST APIs & OpenAPI Specs',             done: true,  mastery: 98 },
      { name: 'JWT Auth & Middleware',                 done: true,  mastery: 70 },
      { name: 'Database Indexing & B-Trees',           done: false, active: true, mastery: 55 },
      { name: 'PostgreSQL EXPLAIN ANALYZE',            done: false, mastery: 30 },
      { name: 'Redis & Cache-Aside Pattern',           done: false, mastery: 10 },
    ],
  },
  {
    id: 3,
    num: '03',
    title: 'SCALABILITY',
    status: 'Upcoming',
    locked: true,
    progress: 0,
    duration: '3 weeks',
    whyMatters: 'System-level thinking about traffic and failures separates mid-level from senior engineers.',
    skills: [
      { name: 'Load Balancing Strategies',             done: false, mastery: 5 },
      { name: 'Horizontal Scaling Patterns',           done: false, mastery: 5 },
      { name: 'Message Queues (Kafka / RabbitMQ)',     done: false, mastery: 0 },
    ],
  },
  {
    id: 4,
    num: '04',
    title: 'DISTRIBUTED SYSTEMS',
    status: 'Upcoming',
    locked: true,
    progress: 0,
    duration: '4 weeks',
    whyMatters: 'Distributed systems is the primary evaluation criteria for senior Backend Engineer roles.',
    skills: [
      { name: 'CAP Theorem & Consistency Models',     done: false, mastery: 15 },
      { name: 'Database Sharding & Replication',      done: false, mastery: 0  },
      { name: 'Microservices Architecture',           done: false, mastery: 0  },
      { name: 'Event-Driven Architecture',            done: false, mastery: 0  },
    ],
  },
];

export const TODAY_MISSION = {
  title: 'Master SOLID Principles',
  phase: 'Phase 2 · Backend Architecture',
  missionProgress: 42,       // % of today's mission completed
  recommendedMinutes: 18,
  nextCheckpoint: 'Dependency Inversion Principle',
  lastSession: 'Yesterday · 34 min',
  whyThisMatters: 'Your roadmap identifies software architecture as your highest-priority gap for Backend Engineer.',
};

export const NEXT_BEST_ACTION = {
  title: 'B-Tree Indexing + EXPLAIN ANALYZE',
  durationMinutes: 18,
  description: 'Your recent assessment shows query optimization is your biggest current gap for Backend Engineering. This session strengthens the database → performance chain.',
  confidence: 'High',
  signals: [
    { label: 'Recent quiz', value: '62%', status: 'warn' },
    { label: 'DB performance', value: 'Weak', status: 'bad' },
    { label: 'Interview weight', value: 'High', status: 'neutral' },
    { label: 'Prerequisites', value: 'Ready', status: 'good' },
  ],
};

export const SKILL_NODES = [
  { id: 'root',        label: 'BACKEND ENGINEER', sub: 'Target Role',           status: 'Target',      mastery: 78,  x: 400, y: 55  },
  { id: 'apis',        label: 'APIs & Services',  sub: 'Backend Architecture',  status: 'Mastered',    mastery: 94,  x: 160, y: 195 },
  { id: 'sql',         label: 'Database & SQL',   sub: 'Data Engineering',      status: 'Learning',    mastery: 60,  x: 400, y: 195 },
  { id: 'sysdesign',   label: 'System Design',    sub: 'Distributed Systems',   status: 'Skill Gap',   mastery: 35,  x: 640, y: 195 },
  { id: 'rest',        label: 'REST & GraphQL',   sub: 'API Protocol',          status: 'Mastered',    mastery: 98,  x: 80,  y: 365 },
  { id: 'auth',        label: 'Auth & JWT',       sub: 'Security Layer',        status: 'Learning',    mastery: 70,  x: 250, y: 365 },
  { id: 'indexing',    label: 'DB Indexing',      sub: 'Query Performance',     status: 'Learning',    mastery: 55,  x: 400, y: 365 },
  { id: 'distributed', label: 'Distributed Sys',  sub: 'Architecture',          status: 'Skill Gap',   mastery: 25,  x: 580, y: 365 },
  { id: 'caching',     label: 'Redis & Caching',  sub: 'Performance Layer',     status: 'Not Started', mastery: 10,  x: 720, y: 365 },
];

export const SKILL_EDGES = [
  { from: 'root', to: 'apis' },
  { from: 'root', to: 'sql' },
  { from: 'root', to: 'sysdesign' },
  { from: 'apis', to: 'rest' },
  { from: 'apis', to: 'auth' },
  { from: 'sql',  to: 'indexing' },
  { from: 'sysdesign', to: 'distributed' },
  { from: 'sysdesign', to: 'caching' },
];

export const AI_ACTIVITY = [
  { time: '09:42', title: 'Roadmap recalibrated',   desc: 'Query Optimization priority increased', signals: 3 },
  { time: '09:31', title: 'Skill gap detected',     desc: 'System Design bottleneck identified',  signals: 2 },
  { time: '09:12', title: 'Daily mission generated', desc: 'Master SOLID Principles selected',    signals: 4 },
  { time: 'Yesterday', title: 'Skill analysis done', desc: 'Backend Engineering fit: 78%',        signals: 1 },
];

export const TASKS_TODAY = [
  { id: 1, title: 'B-Tree Indexing Implementation',  desc: 'Learn & implement B-Tree from scratch',  priority: 'P0', done: false, minutes: 18 },
  { id: 2, title: 'PostgreSQL EXPLAIN ANALYZE',       desc: 'Profile and optimize query execution',   priority: 'P1', done: false, minutes: 25 },
  { id: 3, title: 'Redis Cache-Aside Pattern',        desc: 'Read docs + write a working example',   priority: 'P2', done: false, minutes: 15 },
  { id: 4, title: 'SQL Indexing Fundamentals',        desc: 'Completed in morning session',           priority: 'P1', done: true,  minutes: 30 },
  { id: 5, title: 'Query Plans Overview',             desc: 'Completed in morning session',           priority: 'P1', done: true,  minutes: 20 },
];
