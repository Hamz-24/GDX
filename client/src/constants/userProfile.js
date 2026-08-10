/**
 * CANONICAL USER PROFILE — Single Source of Truth
 * Strictly limited to the 4 Core Engineering Domains:
 * 1. DATA STRUCTURES
 * 2. DATABASE
 * 3. SYSTEM DESIGN
 * 4. AUTHENTICATION
 */

export const CORE_GOALS = [
  { id: 'ds',   name: 'DATA STRUCTURES', desc: 'Arrays, Lists, Trees, Graphs, Heaps & DP' },
  { id: 'db',   name: 'DATABASE',        desc: 'SQL, B-Tree Indexing, EXPLAIN ANALYZE & Redis' },
  { id: 'sys',  name: 'SYSTEM DESIGN',   desc: 'Load Balancing, Caching, Messaging & Microservices' },
  { id: 'auth', name: 'AUTHENTICATION',  desc: 'JWTs, Sessions, OAuth 2.0, Salting & Security' },
];

export const TIMELINES = ['4 Weeks', '8 Weeks', '12 Weeks'];
export const LEVELS = ['Basic / Beginner', 'Intermediate', 'Advanced / Interview Ready'];

export const USER_PROFILE = {
  currentRole: 'Full-Stack Developer',
  targetRole: 'DATA STRUCTURES',
  experienceLevel: 'Basic / Beginner',
  timelineWeeks: 4,
  currentPhase: 1,
  currentPhaseLabel: 'Week 1 · Arrays & Memory',
  weekNumber: 1,
  careerReadiness: 35,
  activeStreak: 7,
};

/* ── DOMAIN CURRICULUM TOPICS (100% UNIQUE 12 WEEKS FOR EACH DOMAIN) ── */
const CURRICULUM_TEMPLATES = {
  'DATA STRUCTURES': {
    whyMatters: 'Algorithmic efficiency, contiguous RAM layout, and optimal memory management.',
    weeks: [
      { title: 'ARRAYS, STRINGS & MEMORY LAYOUT', topics: ['Array Memory Layout & Base Addressing', 'Two-Pointer Technique & Array Reversal', 'Sliding Window Pattern (Fixed & Variable)', '2D Matrix Storage & Grid Traversals', 'Prefix Sums & Range Queries', 'Binary Search Space Reduction', 'Week 1 Problem Sprint & Review'] },
      { title: 'LINKED LISTS, STACKS & QUEUES', topics: ['Singly Linked List Node Allocation', 'Reversing Linked Lists & Fast/Slow Pointers', 'Doubly Linked Lists & Sentinel Nodes', 'Stack LIFO & Call Stack Mechanics', 'Monotonic Stack Pattern', 'Queue FIFO & Circular Queue Arrays', 'Week 2 Sprint: Valid Parentheses & Min-Stack'] },
      { title: 'TREES, BST & GRAPH TRAVERSALS', topics: ['Recursion & Call Stack Frames', 'Binary Tree DFS (Pre, In, Post)', 'BST Invariant & Balanced Search', 'Level-Order Traversal (BFS)', 'Graph Adjacency List vs Matrix', 'Graph DFS vs BFS Traversal', 'Week 3 Sprint: Invert Tree & Graph Cycles'] },
      { title: 'HEAPS, SORTING & DYNAMIC PROGRAMMING', topics: ['Hash Tables & Collision Resolution', 'Binary Heap & Priority Queue Operations', 'O(N log N) Sorting (Merge vs Quick)', 'Intro to DP: Top-Down Memoization', 'Bottom-Up DP Tabulation', 'Full Big-O Complexity Cheat Sheet', 'Week 4 Capstone Mock Interview'] },
      { title: 'ADVANCED GRAPH ALGORITHMS', topics: ['Dijkstra Shortest Path Algorithm', 'Bellman-Ford & Negative Weight Cycles', 'Kruskal & Prim Minimum Spanning Trees', 'Topological Sort & Dependency Resolution', 'Tarjan Strongly Connected Components', 'Network Flow & Ford-Fulkerson', 'Week 5 Graph Optimization Review'] },
      { title: 'ADVANCED DYNAMIC PROGRAMMING', topics: ['0/1 Knapsack & Unbounded Knapsack', 'Longest Common Subsequence (LCS)', 'Edit Distance & String DP', 'Matrix Chain Multiplication', 'Bitmask DP & Traveling Salesperson', 'DP on Trees & DAGs', 'Week 6 DP Masterclass Review'] },
      { title: 'TRIE, SEGMENT TREES & DISJOINT SET', topics: ['Trie (Prefix Tree) Implementation', 'Disjoint Set Union (DSU / Union-Find)', 'Path Compression & Union by Rank', 'Segment Tree Range Queries', 'Fenwick Tree (Binary Indexed Tree)', 'Suffix Automata & String Matching', 'Week 7 Advanced Data Structure Review'] },
      { title: 'SYSTEM & HARDWARE PERFORMANCE', topics: ['CPU Cache Lines & Cache Locality', 'Lock-Free Data Structures & CAS', 'B-Tree & LSM-Tree Memory Buffers', 'Bit Manipulation & Bitsets', 'Space-Efficient Bloom Filters', 'Garbage Collection & Memory Leaks', 'Week 8 Hardware & Concurrency Review'] },
      { title: 'FAANG CODING PATTERNS PART 1', topics: ['Top K Elements (Heap Pattern)', 'K-Way Merge Pattern', 'Subsets & Backtracking Permutations', 'Fast & Slow Pointer Cycle Problems', 'Two Heaps (Find Median from Stream)', 'Tree Depth First Search Patterns', 'Week 9 FAANG Coding Sprint'] },
      { title: 'FAANG CODING PATTERNS PART 2', topics: ['Interval Overlaps & Merging', 'Cyclic Sort Pattern', 'In-Place Reversal of LinkedList', 'Modified Binary Search Variations', 'Bitwise XOR Trick Problems', 'Sliding Window Advanced Variations', 'Week 10 FAANG Coding Sprint'] },
      { title: 'HARD CODING INTERVIEW CHALLENGES', topics: ['Trapping Rain Water & Histogram Max', 'Alien Dictionary Topological Sort', 'Word Ladder II Shortest Transformation', 'LRU & LFU Cache Design', 'Serialize & Deserialize Binary Trees', 'Regular Expression Matching DP', 'Week 11 Hard Level Review'] },
      { title: 'CAPSTONE INTERVIEW & MASTERY', topics: ['Timed 60-Min Full Coding Assessment 1', 'Timed 60-Min Full Coding Assessment 2', 'FAANG System & DSA Mock Interview 1', 'FAANG System & DSA Mock Interview 2', 'Personal Weakness Diagnostics', 'Career Readiness Score Finalization', 'Guidex Capstone Graduation Certificate'] }
    ]
  },
  'DATABASE': {
    whyMatters: 'Relational data modeling, SQL indexing internals, ACID guarantees, and caching.',
    weeks: [
      { title: 'RELATIONAL SQL & SCHEMA DESIGN', topics: ['SQL Data Types & Foreign Keys', 'INNER/LEFT/RIGHT JOIN Operations', 'Database Normalization (1NF to 3NF)', 'SQL Window Functions & OVER()', 'DDL vs DML & Foreign Key Cascades', 'Views, Materialized Views & Triggers', 'Week 1 SQL Query Sprint'] },
      { title: 'B-TREE INDEXING & EXPLAIN ANALYZE', topics: ['B-Tree Balanced Tree Architecture', 'PostgreSQL EXPLAIN ANALYZE Plans', 'Composite Indexes & Leftmost Match', 'Covering Indexes & Write Penalties', 'GIN & GiST Indexes for JSONB', 'Query Optimization 1.2s to 4ms', 'Week 2 Indexing Assessment'] },
      { title: 'TRANSACTIONS & ACID PROPERTIES', topics: ['ACID Properties Deep Dive', 'Concurrency Anomalies (Dirty/Phantom Reads)', 'Database Isolation Levels (Read Committed to Serializable)', 'Row-Level Locks & Deadlocks', 'MVCC (Multi-Version Concurrency)', 'WAL (Write-Ahead Logging)', 'Week 3 Transaction Sprint'] },
      { title: 'REDIS CACHING & SHARDING', topics: ['Redis In-Memory Data Structures', 'Cache-Aside & Write-Through Patterns', 'Redis Eviction Policies (LRU/LFU)', 'Primary-Replica Replication Lag', 'Database Sharding & Hash Partitioning', 'Database Architecture Summary', 'Week 4 Capstone Assessment'] },
      { title: 'ADVANCED SQL & CTE RECURSION', topics: ['Common Table Expressions (WITH CTE)', 'Recursive CTEs for Tree Structures', 'JSONB Querying & Indexing in Postgres', 'Full-Text Search & tsvector/tsquery', 'UPSERT (INSERT ON CONFLICT)', 'Partitioning Tables by Range/List', 'Week 5 Advanced SQL Review'] },
      { title: 'NOSQL & DOCUMENT DATABASES', topics: ['MongoDB Document Model vs SQL', 'BSON Types & Embedded Documents', 'MongoDB Aggregation Pipeline', 'Single-Field & Compound MongoDB Indexes', 'DynamoDB Partition & Sort Keys', 'Eventual Consistency in NoSQL', 'Week 6 NoSQL Architecture Review'] },
      { title: 'TIME-SERIES & VECTOR DATABASES', topics: ['Time-Series Databases (TimescaleDB)', 'Hypertables & Chunk Compression', 'Vector Embeddings & Cosine Similarity', 'pgvector & HNSW Indexing', 'Graph Databases (Neo4j / Cypher)', 'Spatial Queries & PostGIS', 'Week 7 Specialized DB Review'] },
      { title: 'DATABASE INTERNALS & STORAGE ENGINE', topics: ['Page Storage & Buffer Pool Manager', 'LSM-Trees vs B-Trees (RocksDB)', 'WAL Redo & Undo Logging Mechanics', 'Two-Phase Commit (2PC) Protocol', 'Database Connection Pooling (PgBouncer)', 'Zero-Downtime Migration Strategies', 'Week 8 DB Internals Review'] },
      { title: 'HIGH AVAILABILITY & DISASTER RECOVERY', topics: ['Multi-Region Database Replication', 'Failover Automation & Patroni', 'Point-In-Time Recovery (PITR)', 'Read Replica Load Balancing', 'Database Backup Compression', 'Data Loss RPO & RTO Metrics', 'Week 9 High Availability Sprint'] },
      { title: 'ANALYTICS & DATA WAREHOUSING', topics: ['OLTP vs OLAP Architecture', 'Columnar Storage Engines (ClickHouse)', 'Star Schema & Snowflake Schema', 'ETL Data Pipelines', 'Materialized View Auto-Refresh', 'BigQuery & Distributed Query Execution', 'Week 10 OLAP Sprint'] },
      { title: 'DATABASE SECURITY & COMPLIANCE', topics: ['Database Encryption at Rest (TDE)', 'SSL/TLS Encryption in Transit', 'Row-Level Security (RLS) Policies', 'SQL Injection Auditing & Prepared Statements', 'GDPR Data Anonymization', 'Database Role-Based Access Control', 'Week 11 Security Audit'] },
      { title: 'CAPSTONE INTERVIEW & DB MASTERY', topics: ['Database Tuning Challenge (1M rows)', 'High-Throughput E-Commerce Schema Design', 'Database Scalability Mock Interview 1', 'Database Scalability Mock Interview 2', 'Production Performance Review', 'Career Readiness Score Finalization', 'Guidex DB Capstone Certificate'] }
    ]
  },
  'SYSTEM DESIGN': {
    whyMatters: 'Scalable architecture, distributed consensus, microservices, and high availability.',
    weeks: [
      { title: 'SCALABILITY & LOAD BALANCING', topics: ['Vertical vs Horizontal Scaling', 'Load Balancing Algorithms (Round-Robin/IP-Hash)', 'Layer 4 vs Layer 7 Load Balancers', 'Reverse Proxies & Nginx Configuration', 'Health Checks & Active/Passive Failover', 'CDN Edge Caching & PoP Routing', 'Week 1 Scalability Sprint'] },
      { title: 'DISTRIBUTED CACHING & RATE LIMITING', topics: ['Memcached vs Redis Cluster Architecture', 'Consistent Hashing Ring & Virtual Nodes', 'Token Bucket Rate Limiting Algorithm', 'Sliding Window Log Rate Limiter', 'API Gateway Security & Routing', 'Twitter Snowflake Distributed ID Generator', 'Week 2 Rate Limiter Sprint'] },
      { title: 'MESSAGE QUEUES & MICROSERVICES', topics: ['Asynchronous Messaging & Pub/Sub', 'Apache Kafka Architecture & Partitions', 'RabbitMQ vs Kafka Trade-Offs', 'Microservices Service Discovery', 'Circuit Breaker Pattern (Resilience)', 'Saga Pattern for Distributed Transactions', 'Week 3 Microservices Sprint'] },
      { title: 'DISTRIBUTED SYSTEMS & CAP THEOREM', topics: ['CAP Theorem In-Depth Trade-Offs', 'PACELC Theorem & Latency Rules', 'Eventual Consistency & Vector Clocks', 'Raft Consensus Protocol & Leader Election', '4-Step System Design Interview Framework', 'URL Shortener & Newsfeed Design', 'Week 4 Capstone System Design Mock'] },
      { title: 'DISTRIBUTED STORAGE & FILE SYSTEMS', topics: ['Google File System (GFS) & HDFS', 'Object Storage (AWS S3 Architecture)', 'Block Storage vs File Storage', 'Data Deduplication & Chunking', 'CDN Invalidation & Purge Protocols', 'Distributed File Locking', 'Week 5 Storage System Review'] },
      { title: 'SEARCH ENGINES & INVERTED INDEXES', topics: ['Elasticsearch & Inverted Index Design', 'Lucene Segment Files & Merging', 'TF-IDF & BM25 Relevance Scoring', 'Typeahead / Auto-Complete System', 'Web Crawler Architecture & Distributed Queue', 'Distributed Index Sharding', 'Week 6 Search System Review'] },
      { title: 'REAL-TIME & STREAMING SYSTEMS', topics: ['WebSockets vs Server-Sent Events (SSE)', 'Long Polling vs Short Polling', 'Chat Application Architecture (WhatsApp/Slack)', 'Live Video Streaming (HLS / WebRTC)', 'Distributed Metrics & Monitoring (Prometheus)', 'Log Aggregation Engine (ELK Stack)', 'Week 7 Streaming System Review'] },
      { title: 'LOCATION-BASED & GEOSPATIAL SYSTEMS', topics: ['Geohash & Quadtree Spatial Indexing', 'Uber Proximity Matching System', 'Google Maps Route Calculation', 'Distributed Lock Manager (Redlock)', 'Distributed Rate Limiting at Scale', 'Distributed Counter (Top K Songs)', 'Week 8 Location System Review'] },
      { title: 'HIGH-THROUGHPUT SYSTEM ARCHITECTURES', topics: ['Design Distributed Web Crawler', 'Design Distributed Notification Service', 'Design Video Platform (YouTube)', 'Design Payment Gateway Engine', 'Design Collaborative Editor (Figma/Docs)', 'Design Distributed Key-Value Store', 'Week 9 Architecture Sprint 1'] },
      { title: 'ENTERPRISE SYSTEM ARCHITECTURES', topics: ['Design E-Commerce Flash Sale Platform', 'Design Distributed Ticket Booking (BookMyShow)', 'Design Distributed Logging Service', 'Design Social Media Feed (Twitter/X)', 'Design Cloud Drive (Dropbox)', 'Design Metrics & Alerting Platform', 'Week 10 Architecture Sprint 2'] },
      { title: 'SYSTEM SECURITY & ZERO TRUST', topics: ['Zero Trust Network Architecture (ZTNA)', 'mTLS Inter-Service Encryption', 'DDoS Protection & Scrubbing Centers', 'API Rate Limits & WAF Rules', 'Distributed Tracing (Jaeger / OpenTelemetry)', 'Disaster Recovery & Chaos Engineering', 'Week 11 Security & Chaos Sprint'] },
      { title: 'CAPSTONE FAANG SYSTEM DESIGN MOCK', topics: ['Timed 45-Min System Design Mock 1', 'Timed 45-Min System Design Mock 2', 'Architecture Diagramming Review', 'Trade-off Justification Defense', 'FAANG Mock Interview Evaluation', 'Career Readiness Score Finalization', 'Guidex System Design Capstone Certificate'] }
    ]
  },
  'AUTHENTICATION': {
    whyMatters: 'Web security, stateless JWTs, OAuth 2.0, RBAC, and threat mitigation.',
    weeks: [
      { title: 'HTTP BASICS, SESSIONS & HASHING', topics: ['HTTP Basic Auth & Header Risks', 'Stateful Cookie Sessions & Flags', 'Password Salting & Bcrypt Cost Factor', 'Argon2 vs PBKDF2 Hashing', 'Redis Session Storage & Expiration', 'Password Reset Token Flow', 'Week 1 Auth Sprint'] },
      { title: 'JWT TOKENS & REFRESH ROTATION', topics: ['JWT Structure (Header.Payload.Signature)', 'Express Token Verification Middleware', 'Short-Lived Access vs Long-Lived Refresh', 'Refresh Token Rotation & Theft Detection', 'LocalStorage vs HttpOnly Cookie Storage', 'JWT Blacklisting with Redis', 'Week 2 JWT Sprint'] },
      { title: 'OAUTH 2.0 & OPENID CONNECT', topics: ['OAuth 2.0 Roles & Grant Types', 'Authorization Code Flow with PKCE', 'OpenID Connect (OIDC) & ID Tokens', 'Implementing Google & GitHub Login', 'Single Sign-On (SSO) & SAML 2.0', 'Two-Factor Authentication (TOTP / 2FA)', 'Week 3 OAuth Sprint'] },
      { title: 'AUTHORIZATION & SECURITY DEFENSES', topics: ['Role-Based Access Control (RBAC)', 'Attribute-Based Access Control (ABAC)', 'XSS Attacks & Content Security Policy', 'CSRF Attacks & Double Submit Cookies', 'SQL Injection & Parameterized Queries', 'Full Web API Security Audit', 'Week 4 Capstone Auth Mock'] },
      { title: 'ADVANCED CRYPTOGRAPHY & PKI', topics: ['Symmetric vs Asymmetric Encryption (AES/RSA)', 'Public Key Infrastructure (PKI) & TLS', 'Diffie-Hellman Key Exchange', 'Digital Signatures & Elliptic Curve (ECC)', 'Hardware Security Modules (HSM) & KMS', 'Zero-Knowledge Proofs (ZKP) Basics', 'Week 5 Cryptography Sprint'] },
      { title: 'API SECURITY & OAUTH 2.0 EXTENSIONS', topics: ['OAuth 2.0 Token Introspection & Revocation', 'Mutual TLS (mTLS) for API Security', 'API Key Management & Rotation', 'OAuth 2.0 Scopes & Granular Permissions', 'OpenID Connect Dynamic Client Registration', 'OAuth Vulnerabilities & Threat Model', 'Week 6 Advanced API Security'] },
      { title: 'IDENTITY FEDERATION & ENTERPRISE AUTH', topics: ['Enterprise SAML 2.0 Service Provider (SP)', 'WS-Federation & Active Directory (ADFS)', 'SCIM Protocol for User Provisioning', 'Multi-Tenant Authentication Architecture', 'Cross-Domain Single Sign-On (SSO)', 'Okta & Auth0 Integration Patterns', 'Week 7 Enterprise Auth Review'] },
      { title: 'PASSKEY & BIOMETRIC AUTHENTICATION', topics: ['WebAuthn API & FIDO2 Standard', 'Public-Key Passkeys without Passwords', 'Biometric Authentication (FaceID/TouchID)', 'Hardware Tokens (YubiKey / Security Keys)', 'Device Fingerprinting & Risk Scoring', 'Step-Up Adaptive Authentication', 'Week 8 Passkey Architecture Review'] },
      { title: 'SESSION HYJACKING & ADVANCED THREATS', topics: ['Session Fixation & Hijacking Mitigation', 'Man-In-The-Middle (MITM) & Certificate Pinning', 'Credential Stuffing & Rate Limiting Shields', 'Brute-Force Account Lockout Strategies', 'Security Headers (HSTS, X-Frame, CORS)', 'API Gateway Security Shielding', 'Week 9 Threat Mitigation Sprint'] },
      { title: 'ZERO TRUST SECURITY & MICROSERVICES', topics: ['Zero Trust Microservices Authentication', 'SPIFFE / SPIRE Identity Attestation', 'Service-to-Service JWT Verification', 'Centralized Policy Enforcement (OPA)', 'Security Event Logging & SIEM Integration', 'Intrusion Detection System (IDS) Alerts', 'Week 10 Zero Trust Sprint'] },
      { title: 'PENETRATION TESTING & SECURITY AUDIT', topics: ['OWASP Top 10 Security Audit Checklist', 'Burp Suite API Penetration Testing', 'Automated Static Application Security Testing (SAST)', 'Dynamic Security Testing (DAST)', 'Vulnerability Disclosure & CVE Scoring', 'Compliance (SOC 2, ISO 27001, HIPAA)', 'Week 11 Pen Testing Sprint'] },
      { title: 'CAPSTONE INTERVIEW & AUTH MASTERY', topics: ['Design Auth Architecture for 10M Users', 'Enterprise Identity Engine Challenge', 'Auth Security Mock Interview 1', 'Auth Security Mock Interview 2', 'Security Architecture Defense', 'Career Readiness Score Finalization', 'Guidex Auth Capstone Certificate'] }
    ]
  }
};

/**
 * DYNAMIC MULTI-WEEK CURRICULUM GENERATOR
 * Generates 100% UNIQUE personalized 4-Week (28 Days), 8-Week (56 Days), or 12-Week (84 Days) schedules
 * for ALL 4 Core Domains and ALL 3 Experience Levels with ZERO DUPLICATION!
 */
export const generatePersonalizedRoadmap = (goalName, timelineWeeks = 4, level = 'Basic / Beginner') => {
  const g = (goalName || 'DATA STRUCTURES').toUpperCase();
  let domainKey = 'DATA STRUCTURES';
  if (g.includes('DATABASE') || g.includes('DB')) domainKey = 'DATABASE';
  if (g.includes('SYSTEM') || g.includes('SYS')) domainKey = 'SYSTEM DESIGN';
  if (g.includes('AUTH') || g.includes('AUTHENTICATION')) domainKey = 'AUTHENTICATION';

  const template = CURRICULUM_TEMPLATES[domainKey] || CURRICULUM_TEMPLATES['DATA STRUCTURES'];
  
  // Clean duration (4, 8, or 12 weeks)
  let numWeeks = 4;
  if (String(timelineWeeks).includes('8')) numWeeks = 8;
  if (String(timelineWeeks).includes('12')) numWeeks = 12;

  const generatedWeeks = [];
  let absoluteDayCounter = 1;

  for (let w = 0; w < numWeeks; w++) {
    const weekTpl = template.weeks[w];
    const isWeek1 = w === 0;
    const weekLabel = `WEEK ${String(w + 1).padStart(2, '0')}`;

    const days = weekTpl.topics.map((topic) => {
      const dayNum = absoluteDayCounter++;
      const isCompleted = dayNum < 3;
      const isCurrent = dayNum === 3;

      let status = 'Upcoming';
      if (isCompleted) status = 'Completed';
      if (isCurrent) status = 'In Progress';

      let durationStr = '45 min';
      if (level.includes('Advanced')) durationStr = '60 min';
      if (level.includes('Intermediate')) durationStr = '50 min';

      return {
        day: dayNum,
        title: `Day ${dayNum}: ${topic}`,
        desc: `Learn & implement ${topic} tailored for ${level} level.`,
        status,
        current: isCurrent,
        duration: durationStr,
        prompt: `Explain Day ${dayNum} of ${domainKey}: ${topic} for a student at ${level} level. Give code examples and key concepts.`
      };
    });

    generatedWeeks.push({
      id: w + 1,
      num: weekLabel,
      title: weekTpl.title,
      status: isWeek1 ? 'In Progress' : 'Upcoming',
      current: isWeek1,
      progress: isWeek1 ? 42 : 0,
      duration: '7 Days',
      whyMatters: template.whyMatters,
      days
    });
  }

  return generatedWeeks;
};

export const DSA_ROADMAP = generatePersonalizedRoadmap('DATA STRUCTURES', 4, 'Basic / Beginner');
export const DB_ROADMAP = generatePersonalizedRoadmap('DATABASE', 4, 'Basic / Beginner');
export const SYS_ROADMAP = generatePersonalizedRoadmap('SYSTEM DESIGN', 4, 'Basic / Beginner');
export const AUTH_ROADMAP = generatePersonalizedRoadmap('AUTHENTICATION', 4, 'Basic / Beginner');
export const PHASES = DSA_ROADMAP;

/* ── HELPER FUNCTION TO GET ROADMAP BY GOAL NAME ── */
export const getRoadmapByGoal = (goalName, timelineWeeks = 4, level = 'Basic / Beginner') => {
  return generatePersonalizedRoadmap(goalName, timelineWeeks, level);
};

export const TODAY_MISSION = {
  title: 'Master Core Concepts',
  phase: 'Week 1 · Day 3 · Sliding Window Pattern',
  missionProgress: 42,
  recommendedMinutes: 18,
  nextCheckpoint: 'Sliding Window Subarray Sum',
  lastSession: 'Yesterday · 34 min',
  whyThisMatters: 'Core topics appear in 80% of technical evaluations.',
};

export const NEXT_BEST_ACTION = {
  title: 'Sliding Window Pattern (Day 3)',
  durationMinutes: 18,
  description: 'Your recent assessment shows window resizing is your biggest current gap in Data Structures.',
  confidence: 'High',
  signals: [
    { label: 'Quiz Score', value: '62%', status: 'warn' },
    { label: 'Domain Mastery', value: 'Medium', status: 'neutral' },
    { label: 'Interview Weight', value: 'High', status: 'good' },
    { label: 'Prerequisites', value: 'Ready', status: 'good' },
  ],
};

export const SKILL_NODES = [
  { id: 'root',        label: 'DATA STRUCTURES', sub: 'Target Goal',           status: 'Target',      mastery: 35,  x: 400, y: 55  },
  { id: 'apis',        label: 'Arrays & Memory',  sub: 'Week 1',               status: 'Learning',    mastery: 65,  x: 160, y: 195 },
  { id: 'sql',         label: 'LinkedLists & Stacks', sub: 'Week 2',           status: 'Not Started', mastery: 20,  x: 400, y: 195 },
  { id: 'sysdesign',   label: 'Trees & Graphs',    sub: 'Week 3',               status: 'Not Started', mastery: 10,  x: 640, y: 195 },
  { id: 'rest',        label: 'Sliding Window',   sub: 'Arrays',               status: 'Learning',    mastery: 50,  x: 80,  y: 365 },
  { id: 'auth',        label: 'Two Pointers',     sub: 'Arrays',               status: 'Mastered',    mastery: 85,  x: 250, y: 365 },
  { id: 'indexing',    label: 'Linked List Reverse', sub: 'LinkedLists',       status: 'Not Started', mastery: 10,  x: 400, y: 365 },
  { id: 'distributed', label: 'BST Traversal',    sub: 'Trees',                status: 'Not Started', mastery: 5,   x: 580, y: 365 },
  { id: 'caching',     label: 'DP & Heaps',       sub: 'Week 4',               status: 'Not Started', mastery: 0,   x: 720, y: 365 },
];

export const AI_ACTIVITY = [
  { time: '09:42', title: 'Goal Engine Active', desc: 'Core Engineering Domain initialized', signals: 4 },
  { time: '09:31', title: 'Day 3 Active',       desc: 'Sliding Window Pattern selected for today', signals: 3 },
  { time: '09:12', title: 'AI Mentor Ready',    desc: 'Socratic Guide linked to daily schedule', signals: 2 },
  { time: 'Yesterday', title: 'Day 2 Passed',   desc: 'Passed with 85% mastery', signals: 1 },
];

export const TASKS_TODAY = [
  { id: 1, title: 'Day 3: Sliding Window Implementation', desc: 'Learn & implement sliding window in Python/C++', priority: 'P0', done: false, minutes: 20 },
  { id: 2, title: 'LeetCode #209: Minimum Size Subarray Sum', desc: 'Solve variable sliding window problem', priority: 'P1', done: false, minutes: 25 },
  { id: 3, title: 'Day 3 AI Mentor Q&A Session', desc: 'Ask AI Mentor to explain window resizing', priority: 'P2', done: false, minutes: 15 },
  { id: 4, title: 'Day 2 Review', desc: 'Completed yesterday', priority: 'P1', done: true, minutes: 30 },
];
