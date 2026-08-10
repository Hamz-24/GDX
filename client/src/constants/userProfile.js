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

/* ── 1. DATA STRUCTURES ROADMAP ── */
export const DSA_ROADMAP = [
  {
    id: 1,
    num: 'WEEK 01',
    title: 'ARRAYS, STRINGS & MEMORY LAYOUT',
    status: 'In Progress',
    current: true,
    progress: 42,
    duration: '7 Days',
    whyMatters: 'Contiguous memory layout and direct array indexing arithmetic.',
    days: [
      { day: 1, title: 'Day 1: Array Fundamentals & Contiguous Memory', desc: 'RAM layout, base address calculation, O(1) access time.', status: 'Completed', duration: '40 min', prompt: 'Explain Day 1 of Data Structures: Array Memory Layout for a Beginner.' },
      { day: 2, title: 'Day 2: Two-Pointer Technique (In-Place Swaps)', desc: 'Left/right pointer convergence, array reversal in O(1) space.', status: 'Completed', duration: '45 min', prompt: 'Explain Day 2 of Data Structures: Two-Pointer Technique.' },
      { day: 3, title: 'Day 3: Sliding Window Pattern (Fixed & Variable)', desc: 'Subarray problems without nested loops.', status: 'In Progress', current: true, duration: '50 min', prompt: 'Explain Day 3 of Data Structures: Sliding Window Pattern.' },
      { day: 4, title: 'Day 4: Matrix & 2D Array Traversals', desc: 'Row-major vs column-major grid storage.', status: 'Upcoming', duration: '45 min', prompt: 'Explain Day 4 of Data Structures: 2D Matrix Traversals.' },
      { day: 5, title: 'Day 5: Prefix Sums & Range Queries', desc: 'Cumulative sum arrays for O(1) subarray query response.', status: 'Upcoming', duration: '40 min', prompt: 'Explain Day 5 of Data Structures: Prefix Sum Technique.' },
      { day: 6, title: 'Day 6: Binary Search Space Reduction', desc: 'Mid point calculation low + (high - low)/2 without overflow.', status: 'Upcoming', duration: '50 min', prompt: 'Explain Day 6 of Data Structures: Binary Search.' },
      { day: 7, title: 'Day 7: Week 1 Problem Sprint & Review', desc: 'Solve 3 beginner LeetCode problems (Two Sum, Stock, Duplicates).', status: 'Upcoming', duration: '60 min', prompt: 'Provide a Week 1 Review for Data Structures: Arrays & Strings.' }
    ]
  },
  {
    id: 2,
    num: 'WEEK 02',
    title: 'LINKED LISTS, STACKS & QUEUES',
    status: 'Upcoming',
    progress: 0,
    duration: '7 Days',
    whyMatters: 'Dynamic node allocation and LIFO/FIFO operational semantics.',
    days: [
      { day: 8, title: 'Day 8: Singly Linked List Implementation', desc: 'Node struct, pointers, head/tail insertion and deletion.', status: 'Upcoming', duration: '45 min', prompt: 'Explain Day 8: Singly Linked List Implementation.' },
      { day: 9, title: 'Day 9: Reversing a Linked List & Fast/Slow Pointers', desc: 'Iterative 3-pointer reversal and Floyds cycle detection.', status: 'Upcoming', duration: '50 min', prompt: 'Explain Day 9: Reversing Linked Lists & Fast/Slow Pointers.' },
      { day: 10, title: 'Day 10: Doubly Linked Lists & Sentinel Nodes', desc: 'Prev/Next pointers and dummy head nodes.', status: 'Upcoming', duration: '40 min', prompt: 'Explain Day 10: Doubly Linked Lists & Sentinel Nodes.' },
      { day: 11, title: 'Day 11: Stack Data Structure & Call Stack', desc: 'LIFO principle, push/pop/peek operations in O(1).', status: 'Upcoming', duration: '45 min', prompt: 'Explain Day 11: Stack Data Structure & Call Stack.' },
      { day: 12, title: 'Day 12: Monotonic Stack Pattern', desc: 'Next greater element in O(N) time complexity.', status: 'Upcoming', duration: '50 min', prompt: 'Explain Day 12: Monotonic Stack Pattern.' },
      { day: 13, title: 'Day 13: Queue & Circular Queue', desc: 'FIFO principle and array-based circular queue.', status: 'Upcoming', duration: '45 min', prompt: 'Explain Day 13: Queue & Circular Queue Implementation.' },
      { day: 14, title: 'Day 14: Week 2 Sprint — Valid Parentheses & Min-Stack', desc: 'Solve expression parsing and Min-Stack with O(1) getMin.', status: 'Upcoming', duration: '60 min', prompt: 'Provide a Week 2 Review for Linked Lists and Stacks.' }
    ]
  },
  {
    id: 3,
    num: 'WEEK 03',
    title: 'TREES, BST & GRAPH TRAVERSALS',
    status: 'Upcoming',
    progress: 0,
    duration: '7 Days',
    whyMatters: 'Hierarchical and non-linear branching data structures.',
    days: [
      { day: 15, title: 'Day 15: Recursion & Call Stack Frames', desc: 'Base cases, recursive steps, stack unwinding.', status: 'Upcoming', duration: '45 min', prompt: 'Explain Day 15: Recursion & Call Stack Frames.' },
      { day: 16, title: 'Day 16: Binary Tree Traversals (DFS)', desc: 'Pre-order, In-order, and Post-order DFS traversals.', status: 'Upcoming', duration: '50 min', prompt: 'Explain Day 16: Binary Tree DFS Traversals.' },
      { day: 17, title: 'Day 17: Binary Search Tree (BST) Properties', desc: 'BST search invariant left < root < right.', status: 'Upcoming', duration: '45 min', prompt: 'Explain Day 17: Binary Search Tree Properties.' },
      { day: 18, title: 'Day 18: Level-Order Traversal (BFS)', desc: 'Breadth-First Search using Queue.', status: 'Upcoming', duration: '50 min', prompt: 'Explain Day 18: Level-Order Traversal BFS.' },
      { day: 19, title: 'Day 19: Graph Adjacency List vs Matrix', desc: 'Vertices, edges, directed vs undirected graphs.', status: 'Upcoming', duration: '45 min', prompt: 'Explain Day 19: Graph Adjacency Representation.' },
      { day: 20, title: 'Day 20: Graph Traversal (DFS vs BFS)', desc: 'Visited set and queue/stack graph exploration.', status: 'Upcoming', duration: '55 min', prompt: 'Explain Day 20: Graph DFS vs BFS.' },
      { day: 21, title: 'Day 21: Week 3 Tree & Graph Sprint', desc: 'Solve Max Depth and Invert Binary Tree.', status: 'Upcoming', duration: '60 min', prompt: 'Provide a Week 3 Tree & Graph Review.' }
    ]
  },
  {
    id: 4,
    num: 'WEEK 04',
    title: 'HEAPS, SORTING & DYNAMIC PROGRAMMING',
    status: 'Upcoming',
    progress: 0,
    duration: '7 Days',
    whyMatters: 'Algorithmic optimization, priority queues, and memoization.',
    days: [
      { day: 22, title: 'Day 22: Hash Tables & Collision Resolution', desc: 'Hash functions, chaining, and linear probing.', status: 'Upcoming', duration: '45 min', prompt: 'Explain Day 22: Hash Tables & Collision Resolution.' },
      { day: 23, title: 'Day 23: Binary Heap & Priority Queue', desc: 'Complete binary tree array, heapify up/down.', status: 'Upcoming', duration: '50 min', prompt: 'Explain Day 23: Binary Heap & Priority Queue.' },
      { day: 24, title: 'Day 24: Sorting Algorithms (Merge vs Quick Sort)', desc: 'Divide-and-conquer O(N log N) proofs.', status: 'Upcoming', duration: '50 min', prompt: 'Explain Day 24: Divide-and-Conquer Sorting.' },
      { day: 25, title: 'Day 25: Intro to Dynamic Programming', desc: 'Overlapping subproblems and top-down memoization.', status: 'Upcoming', duration: '50 min', prompt: 'Explain Day 25: Intro to Dynamic Programming Memoization.' },
      { day: 26, title: 'Day 26: Bottom-Up DP Tabulation', desc: 'Iterative DP tables and space reduction.', status: 'Upcoming', duration: '45 min', prompt: 'Explain Day 26: Bottom-Up DP Tabulation.' },
      { day: 27, title: 'Day 27: Full DSA Comprehensive Review', desc: 'Big-O time and space complexity summary.', status: 'Upcoming', duration: '60 min', prompt: 'Provide a complete DSA Big-O Cheat Sheet.' },
      { day: 28, title: 'Day 28: Capstone Assessment & Mock Interview', desc: 'Solve 2 timed interview problems.', status: 'Upcoming', duration: '75 min', prompt: 'Conduct a Final Capstone Mock Interview for Data Structures.' }
    ]
  }
];

export const PHASES = DSA_ROADMAP;

/* ── 2. DATABASE ROADMAP ── */
export const DB_ROADMAP = [
  {
    id: 1,
    num: 'WEEK 01',
    title: 'RELATIONAL SQL & SCHEMA DESIGN',
    status: 'In Progress',
    current: true,
    progress: 50,
    duration: '7 Days',
    whyMatters: 'Relational data modeling, normal forms, and JOIN performance.',
    days: [
      { day: 1, title: 'Day 1: SQL Data Types & Relational Models', desc: 'Tables, Primary Keys, Foreign Keys, 1:N and N:M relationships.', status: 'Completed', duration: '40 min', prompt: 'Explain Day 1 of Database: Relational Schema Modeling & Foreign Keys.' },
      { day: 2, title: 'Day 2: Advanced JOINs & Aggregations', desc: 'INNER, LEFT, RIGHT, FULL OUTER JOINs, GROUP BY, HAVING.', status: 'In Progress', current: true, duration: '45 min', prompt: 'Explain Day 2 of Database: JOIN Operations & Aggregations.' },
      { day: 3, title: 'Day 3: Normalization (1NF, 2NF, 3NF, BCNF)', desc: 'Eliminating data redundancy and update anomalies.', status: 'Upcoming', duration: '45 min', prompt: 'Explain Day 3 of Database: Database Normal Forms (1NF-3NF).' },
      { day: 4, title: 'Day 4: Subqueries & Window Functions', desc: 'OVER(), PARTITION BY, ROW_NUMBER(), DENSE_RANK().', status: 'Upcoming', duration: '50 min', prompt: 'Explain Day 4 of Database: SQL Window Functions & Partitioning.' },
      { day: 5, title: 'Day 5: DDL vs DML & Foreign Key Cascades', desc: 'ALTER, DROP, TRUNCATE vs CASCADE actions.', status: 'Upcoming', duration: '40 min', prompt: 'Explain Day 5 of Database: DDL vs DML and Foreign Key Cascades.' },
      { day: 6, title: 'Day 6: Views, Materialized Views & Triggers', desc: 'Pre-computed query views and automated database triggers.', status: 'Upcoming', duration: '50 min', prompt: 'Explain Day 6 of Database: Materialized Views vs Dynamic Views.' },
      { day: 7, title: 'Day 7: Week 1 SQL Problem Sprint', desc: 'Solve 3 complex multi-table SQL queries.', status: 'Upcoming', duration: '60 min', prompt: 'Provide a Week 1 Review for Database: Relational SQL Queries.' }
    ]
  },
  {
    id: 2,
    num: 'WEEK 02',
    title: 'B-TREE INDEXING & EXPLAIN ANALYZE',
    status: 'Upcoming',
    progress: 0,
    duration: '7 Days',
    whyMatters: 'Database indexing internals and execution plan profiling.',
    days: [
      { day: 8, title: 'Day 8: B-Tree Index Architecture', desc: 'B-Tree balanced tree structure, O(log N) lookup.', status: 'Upcoming', duration: '45 min', prompt: 'Explain Day 8: B-Tree Index Structure and Leaf Nodes.' },
      { day: 9, title: 'Day 9: PostgreSQL EXPLAIN ANALYZE', desc: 'Sequential Scan vs Index Scan vs Index Only Scan.', status: 'Upcoming', duration: '50 min', prompt: 'Explain Day 9: PostgreSQL EXPLAIN ANALYZE Execution Plans.' },
      { day: 10, title: 'Day 10: Composite Indexes & Leftmost Prefix Rule', desc: 'Indexing multiple columns and query matching rules.', status: 'Upcoming', duration: '45 min', prompt: 'Explain Day 10: Composite Indexes and Leftmost Column Match.' },
      { day: 11, title: 'Day 11: Covering Indexes & Index Overheads', desc: 'INCLUDE clause, index write penalty during INSERT/UPDATE.', status: 'Upcoming', duration: '45 min', prompt: 'Explain Day 11: Covering Indexes & Write Penalties.' },
      { day: 12, title: 'Day 12: Hash Indexes, GIN & GiST Overview', desc: 'Specialized indexes for JSONB and Full-Text Search.', status: 'Upcoming', duration: '50 min', prompt: 'Explain Day 12: GIN and GiST Indexes for JSONB and Search.' },
      { day: 13, title: 'Day 13: Query Optimization Sprint', desc: 'Optimize a slow query from 1.2s to 4ms using indexes.', status: 'Upcoming', duration: '50 min', prompt: 'Explain Day 13: Query Optimization Walkthrough from 1.2s to 4ms.' },
      { day: 14, title: 'Day 14: Week 2 Indexing Assessment', desc: 'Profile 3 slow queries and recommend index strategies.', status: 'Upcoming', duration: '60 min', prompt: 'Provide a Week 2 Review for Database Indexing & Profiling.' }
    ]
  },
  {
    id: 3,
    num: 'WEEK 03',
    title: 'TRANSACTIONS & ACID PROPERTIES',
    status: 'Upcoming',
    progress: 0,
    duration: '7 Days',
    whyMatters: 'Concurrency control, locking, and data integrity guarantees.',
    days: [
      { day: 15, title: 'Day 15: ACID Properties Explained', desc: 'Atomicity, Consistency, Isolation, Durability.', status: 'Upcoming', duration: '45 min', prompt: 'Explain Day 15: ACID Properties in Databases.' },
      { day: 16, title: 'Day 16: Concurrency Anomalies', desc: 'Dirty Reads, Non-Repeatable Reads, Phantom Reads.', status: 'Upcoming', duration: '50 min', prompt: 'Explain Day 16: Database Concurrency Anomalies.' },
      { day: 17, title: 'Day 17: Isolation Levels (Read Committed to Serializable)', desc: 'Read Uncommitted, Read Committed, Repeatable Read, Serializable.', status: 'Upcoming', duration: '50 min', prompt: 'Explain Day 17: Database Isolation Levels.' },
      { day: 18, title: 'Day 18: Row-Level Locking & Deadlocks', desc: 'SELECT FOR UPDATE, shared vs exclusive locks, deadlock detection.', status: 'Upcoming', duration: '45 min', prompt: 'Explain Day 18: Row-Level Locking & Deadlocks.' },
      { day: 19, title: 'Day 19: MVCC (Multi-Version Concurrency Control)', desc: 'Postgres tuple versioning and VACUUM processing.', status: 'Upcoming', duration: '50 min', prompt: 'Explain Day 19: Multi-Version Concurrency Control (MVCC).' },
      { day: 20, title: 'Day 20: WAL (Write-Ahead Logging)', desc: 'Redo logs, checkpointing, crash recovery durability.', status: 'Upcoming', duration: '45 min', prompt: 'Explain Day 20: Write-Ahead Logging & Crash Recovery.' },
      { day: 21, title: 'Day 21: Week 3 Transaction Sprint', desc: 'Simulate high-concurrency bank transfer transaction.', status: 'Upcoming', duration: '60 min', prompt: 'Provide a Week 3 Transaction & ACID Review.' }
    ]
  },
  {
    id: 4,
    num: 'WEEK 04',
    title: 'REDIS CACHING, SHARDING & REPLICATION',
    status: 'Upcoming',
    progress: 0,
    duration: '7 Days',
    whyMatters: 'Scaling read/write performance with in-memory caching and horizontal partitioning.',
    days: [
      { day: 22, title: 'Day 22: Redis In-Memory Data Structures', desc: 'Strings, Hashes, Lists, Sets, Sorted Sets (ZSET).', status: 'Upcoming', duration: '45 min', prompt: 'Explain Day 22: Redis In-Memory Data Structures.' },
      { day: 23, title: 'Day 23: Cache-Aside & Write-Through Patterns', desc: 'Cache invalidation, TTL expiration, cache stampede.', status: 'Upcoming', duration: '50 min', prompt: 'Explain Day 23: Cache-Aside and Write-Through Caching.' },
      { day: 24, title: 'Day 24: Redis Eviction Policies (LRU vs LFU)', desc: 'Volatile-LRU, allkeys-LRU, memory limits.', status: 'Upcoming', duration: '45 min', prompt: 'Explain Day 24: Redis Eviction Policies (LRU vs LFU).' },
      { day: 25, title: 'Day 25: Primary-Replica Replication', desc: 'Read replicas, asynchronous replication lag.', status: 'Upcoming', duration: '50 min', prompt: 'Explain Day 25: Primary-Replica Replication.' },
      { day: 26, title: 'Day 26: Database Sharding & Hash Partitioning', desc: 'Shard keys, range vs hash partitioning, cross-shard queries.', status: 'Upcoming', duration: '50 min', prompt: 'Explain Day 26: Database Sharding & Partitioning.' },
      { day: 27, title: 'Day 27: Database Architecture Review', desc: 'Complete SQL, Indexing, ACID, and Caching summary.', status: 'Upcoming', duration: '60 min', prompt: 'Provide a complete Database Architecture Summary.' },
      { day: 28, title: 'Day 28: Capstone Assessment & Mock Interview', desc: 'Design a high-throughput database schema & indexing strategy.', status: 'Upcoming', duration: '75 min', prompt: 'Conduct a Final Database Engineering Capstone Interview.' }
    ]
  }
];

/* ── 3. SYSTEM DESIGN ROADMAP ── */
export const SYS_ROADMAP = [
  {
    id: 1,
    num: 'WEEK 01',
    title: 'SCALABILITY & LOAD BALANCING',
    status: 'In Progress',
    current: true,
    progress: 30,
    duration: '7 Days',
    whyMatters: 'Handling traffic growth through horizontal scaling and traffic distribution.',
    days: [
      { day: 1, title: 'Day 1: Vertical vs Horizontal Scaling', desc: 'Stateless application servers, bottleneck analysis.', status: 'Completed', duration: '40 min', prompt: 'Explain Day 1 of System Design: Vertical vs Horizontal Scaling.' },
      { day: 2, title: 'Day 2: Load Balancing Algorithms', desc: 'Round-Robin, Least Connections, IP-Hash, Weighted.', status: 'In Progress', current: true, duration: '45 min', prompt: 'Explain Day 2 of System Design: Load Balancing Algorithms.' },
      { day: 3, title: 'Day 3: Layer 4 vs Layer 7 Load Balancers', desc: 'TCP/IP vs HTTP/HTTPS routing, SSL termination.', status: 'Upcoming', duration: '45 min', prompt: 'Explain Day 3 of System Design: Layer 4 vs Layer 7 Load Balancing.' },
      { day: 4, title: 'Day 4: Reverse Proxies (Nginx / HAProxy)', desc: 'Request routing, compression, security buffering.', status: 'Upcoming', duration: '50 min', prompt: 'Explain Day 4 of System Design: Reverse Proxies & Nginx.' },
      { day: 5, title: 'Day 5: Health Checks & Failover', desc: 'Active/passive load balancing, heartbeats, DNS failover.', status: 'Upcoming', duration: '40 min', prompt: 'Explain Day 5 of System Design: Health Checks & Failover.' },
      { day: 6, title: 'Day 6: CDN (Content Delivery Network)', desc: 'Edge caching, static assets, PoP routing.', status: 'Upcoming', duration: '50 min', prompt: 'Explain Day 6 of System Design: Content Delivery Networks.' },
      { day: 7, title: 'Day 7: Week 1 Scalability Sprint', desc: 'Design a web app serving 100k daily active users.', status: 'Upcoming', duration: '60 min', prompt: 'Provide a Week 1 Scalability System Design Review.' }
    ]
  },
  {
    id: 2,
    num: 'WEEK 02',
    title: 'DISTRIBUTED CACHING & RATE LIMITING',
    status: 'Upcoming',
    progress: 0,
    duration: '7 Days',
    whyMatters: 'Sub-millisecond data retrieval and API protection.',
    days: [
      { day: 8, title: 'Day 8: Distributed Caching Architecture', desc: 'Memcached vs Redis cluster, cache consistency.', status: 'Upcoming', duration: '45 min', prompt: 'Explain Day 8: Distributed Caching Architecture.' },
      { day: 9, title: 'Day 9: Consistent Hashing Pattern', desc: 'Hash ring, virtual nodes, node addition without total remapping.', status: 'Upcoming', duration: '50 min', prompt: 'Explain Day 9: Consistent Hashing in System Design.' },
      { day: 10, title: 'Day 10: Token Bucket Rate Limiting', desc: 'Bucket capacity, refill rate, bursting protection.', status: 'Upcoming', duration: '45 min', prompt: 'Explain Day 10: Token Bucket Rate Limiting Algorithm.' },
      { day: 11, title: 'Day 11: Sliding Window Log Rate Limiter', desc: 'Accurate rate limiting using Redis sorted sets.', status: 'Upcoming', duration: '50 min', prompt: 'Explain Day 11: Sliding Window Log Rate Limiting.' },
      { day: 12, title: 'Day 12: API Gateway Pattern', desc: 'Authentication, rate limiting, logging, routing.', status: 'Upcoming', duration: '45 min', prompt: 'Explain Day 12: API Gateway Architecture.' },
      { day: 13, title: 'Day 13: Distributed ID Generator (Snowflake)', desc: '64-bit unique IDs: timestamp + datacenter + worker + sequence.', status: 'Upcoming', duration: '50 min', prompt: 'Explain Day 13: Twitter Snowflake Distributed ID Generator.' },
      { day: 14, title: 'Day 14: Week 2 Caching & Rate Limiter Sprint', desc: 'Design a distributed rate-limiting API service.', status: 'Upcoming', duration: '60 min', prompt: 'Provide a Week 2 System Design Review.' }
    ]
  },
  {
    id: 3,
    num: 'WEEK 03',
    title: 'MESSAGE QUEUES & MICROSERVICES',
    status: 'Upcoming',
    progress: 0,
    duration: '7 Days',
    whyMatters: 'Asynchronous event-driven architecture and decoupled services.',
    days: [
      { day: 15, title: 'Day 15: Asynchronous Processing & Pub/Sub', desc: 'Message queues, producer/consumer, push vs pull.', status: 'Upcoming', duration: '45 min', prompt: 'Explain Day 15: Asynchronous Messaging & Pub/Sub.' },
      { day: 16, title: 'Day 16: Apache Kafka Architecture', desc: 'Topics, partitions, consumer groups, offset management.', status: 'Upcoming', duration: '50 min', prompt: 'Explain Day 16: Apache Kafka Architecture.' },
      { day: 17, title: 'Day 17: RabbitMQ vs Kafka Trade-offs', desc: 'AMQP routing keys vs distributed commit log.', status: 'Upcoming', duration: '45 min', prompt: 'Explain Day 17: RabbitMQ vs Kafka Comparison.' },
      { day: 18, title: 'Day 18: Microservices Service Discovery', desc: 'Consul, Eureka, Client-side vs Server-side discovery.', status: 'Upcoming', duration: '45 min', prompt: 'Explain Day 18: Microservices Service Discovery.' },
      { day: 19, title: 'Day 19: Circuit Breaker Pattern (Resilience)', desc: 'Closed, Open, Half-Open states, fallback logic.', status: 'Upcoming', duration: '50 min', prompt: 'Explain Day 19: Circuit Breaker Pattern in Microservices.' },
      { day: 20, title: 'Day 20: Saga Pattern for Distributed Transactions', desc: 'Choreography vs Orchestration compensations.', status: 'Upcoming', duration: '55 min', prompt: 'Explain Day 20: Saga Pattern for Distributed Transactions.' },
      { day: 21, title: 'Day 21: Week 3 Messaging Sprint', desc: 'Design an event-driven notification engine.', status: 'Upcoming', duration: '60 min', prompt: 'Provide a Week 3 Microservices & Messaging Review.' }
    ]
  },
  {
    id: 4,
    num: 'WEEK 04',
    title: 'DISTRIBUTED SYSTEMS & CAP THEOREM',
    status: 'Upcoming',
    progress: 0,
    duration: '7 Days',
    whyMatters: 'Theoretical foundations of distributed data and consensus.',
    days: [
      { day: 22, title: 'Day 22: CAP Theorem In-Depth', desc: 'Consistency, Availability, Partition Tolerance trade-offs.', status: 'Upcoming', duration: '45 min', prompt: 'Explain Day 22: CAP Theorem Trade-offs.' },
      { day: 23, title: 'Day 23: PACELC Theorem', desc: 'Latency vs Consistency under non-partitioned state.', status: 'Upcoming', duration: '45 min', prompt: 'Explain Day 23: PACELC Theorem.' },
      { day: 24, title: 'Day 24: Eventual Consistency & Vector Clocks', desc: 'Read repair, hint handoff, version vectors.', status: 'Upcoming', duration: '50 min', prompt: 'Explain Day 24: Eventual Consistency & Vector Clocks.' },
      { day: 25, title: 'Day 25: Distributed Consensus (Raft / Paxos)', desc: 'Leader election, log replication, quorum.', status: 'Upcoming', duration: '50 min', prompt: 'Explain Day 25: Raft Consensus Protocol.' },
      { day: 26, title: 'Day 26: Complete System Design Interview Framework', desc: '4-Step System Design Interview template.', status: 'Upcoming', duration: '60 min', prompt: 'Explain the 4-Step System Design Interview Template.' },
      { day: 27, title: 'Day 27: Full System Design Review', desc: 'Review URL Shortener, Newsfeed & Video Streaming.', status: 'Upcoming', duration: '60 min', prompt: 'Provide a System Design Interview Cheat Sheet.' },
      { day: 28, title: 'Day 28: Capstone Assessment & System Design Mock', desc: 'Design YouTube or Uber backend system.', status: 'Upcoming', duration: '75 min', prompt: 'Conduct a Final System Design Mock Interview for YouTube/Uber.' }
    ]
  }
];

/* ── 4. AUTHENTICATION ROADMAP ── */
export const AUTH_ROADMAP = [
  {
    id: 1,
    num: 'WEEK 01',
    title: 'HTTP BASICS, SESSIONS & PASSWORD HASHING',
    status: 'In Progress',
    current: true,
    progress: 40,
    duration: '7 Days',
    whyMatters: 'Foundational web security, stateful session management, and credential storage.',
    days: [
      { day: 1, title: 'Day 1: HTTP Authentication Headers & Basic Auth', desc: 'Authorization header, Base64 encoding security risks.', status: 'Completed', duration: '40 min', prompt: 'Explain Day 1 of Authentication: HTTP Basic Auth & Headers.' },
      { day: 2, title: 'Day 2: Stateful Cookie Sessions', desc: 'Set-Cookie header, HttpOnly, Secure, SameSite flags.', status: 'In Progress', current: true, duration: '45 min', prompt: 'Explain Day 2 of Authentication: Stateful Cookie Sessions & Flags.' },
      { day: 3, title: 'Day 3: Password Hashing & Salting (Bcrypt)', desc: 'Rainbow tables, salt generation, Bcrypt cost factor.', status: 'Upcoming', duration: '45 min', prompt: 'Explain Day 3 of Authentication: Password Salting & Bcrypt.' },
      { day: 4, title: 'Day 4: Argon2 vs PBKDF2 Password Storage', desc: 'Memory-hard hashing algorithms against GPU cracking.', status: 'Upcoming', duration: '45 min', prompt: 'Explain Day 4 of Authentication: Argon2 vs PBKDF2.' },
      { day: 5, title: 'Day 5: Session Storage (Memory vs Redis)', desc: 'Store session IDs in Redis with automatic TTL expiration.', status: 'Upcoming', duration: '45 min', prompt: 'Explain Day 5 of Authentication: Redis Session Storage.' },
      { day: 6, title: 'Day 6: Password Reset Token Security', desc: 'Cryptographically secure random tokens, expiry timers.', status: 'Upcoming', duration: '45 min', prompt: 'Explain Day 6 of Authentication: Password Reset Token Flows.' },
      { day: 7, title: 'Day 7: Week 1 Auth Sprint', desc: 'Implement secure login and signup API endpoints.', status: 'Upcoming', duration: '60 min', prompt: 'Provide a Week 1 Authentication Security Review.' }
    ]
  },
  {
    id: 2,
    num: 'WEEK 02',
    title: 'JWT TOKENS & REFRESH TOKEN ROTATION',
    status: 'Upcoming',
    progress: 0,
    duration: '7 Days',
    whyMatters: 'Stateless authentication tokens and token revocation techniques.',
    days: [
      { day: 8, title: 'Day 8: JWT Architecture (Header.Payload.Signature)', desc: 'Base64Url encoding, HMAC-SHA256 signing.', status: 'Upcoming', duration: '45 min', prompt: 'Explain Day 8: JWT Token Structure & Signatures.' },
      { day: 9, title: 'Day 9: Stateless Token Verification Middleware', desc: 'Verifying JWT signatures in Express/FastAPI middleware.', status: 'Upcoming', duration: '45 min', prompt: 'Explain Day 9: JWT Verification Middleware.' },
      { day: 10, title: 'Day 10: Access Token vs Refresh Token', desc: 'Short-lived access tokens (15m) vs long-lived refresh tokens.', status: 'Upcoming', duration: '45 min', prompt: 'Explain Day 10: Access Tokens vs Refresh Tokens.' },
      { day: 11, title: 'Day 11: Refresh Token Rotation & Theft Detection', desc: 'Automatic revocation upon reuse detection.', status: 'Upcoming', duration: '50 min', prompt: 'Explain Day 11: Refresh Token Rotation & Theft Detection.' },
      { day: 12, title: 'Day 12: Storing Tokens (LocalStorage vs HttpOnly Cookie)', desc: 'Evaluating XSS vs CSRF vulnerabilities.', status: 'Upcoming', duration: '50 min', prompt: 'Explain Day 12: Storing Tokens: LocalStorage vs HttpOnly Cookies.' },
      { day: 13, title: 'Day 13: JWT Blacklisting & Revocation', desc: 'Using Redis for token blacklist on logout.', status: 'Upcoming', duration: '45 min', prompt: 'Explain Day 13: JWT Blacklisting with Redis.' },
      { day: 14, title: 'Day 14: Week 2 JWT Sprint', desc: 'Build a production-ready JWT Auth system with refresh rotation.', status: 'Upcoming', duration: '60 min', prompt: 'Provide a Week 2 JWT Authentication Review.' }
    ]
  },
  {
    id: 3,
    num: 'WEEK 03',
    title: 'OAUTH 2.0 & OPENID CONNECT (OIDC)',
    status: 'Upcoming',
    progress: 0,
    duration: '7 Days',
    whyMatters: 'Third-party authorization (Google, GitHub login) and identity verification.',
    days: [
      { day: 15, title: 'Day 15: OAuth 2.0 Core Roles & Grant Types', desc: 'Resource Owner, Client, Authorization Server, Resource Server.', status: 'Upcoming', duration: '45 min', prompt: 'Explain Day 15: OAuth 2.0 Roles and Grant Types.' },
      { day: 16, title: 'Day 16: Authorization Code Flow with PKCE', desc: 'Proof Key for Code Exchange for SPAs and Mobile.', status: 'Upcoming', duration: '50 min', prompt: 'Explain Day 16: OAuth 2.0 Authorization Code Flow with PKCE.' },
      { day: 17, title: 'Day 17: OpenID Connect (OIDC) & ID Tokens', desc: 'Authentication layer on top of OAuth 2.0, userInfo endpoint.', status: 'Upcoming', duration: '45 min', prompt: 'Explain Day 17: OpenID Connect (OIDC) & ID Tokens.' },
      { day: 18, title: 'Day 18: Implementing Login with Google / GitHub', desc: 'Configuring OAuth credentials, redirect URIs, and callback handler.', status: 'Upcoming', duration: '50 min', prompt: 'Explain Day 18: Implementing Login with Google / GitHub.' },
      { day: 19, title: 'Day 19: Single Sign-On (SSO) & SAML 2.0 Basics', desc: 'Enterprise identity federation.', status: 'Upcoming', duration: '45 min', prompt: 'Explain Day 19: Single Sign-On (SSO) & SAML 2.0.' },
      { day: 20, title: 'Day 20: Two-Factor Authentication (2FA / TOTP)', desc: 'HMAC-based & Time-based OTP, QR code generation.', status: 'Upcoming', duration: '50 min', prompt: 'Explain Day 20: Two-Factor Authentication (TOTP / 2FA).' },
      { day: 21, title: 'Day 21: Week 3 OAuth Sprint', desc: 'Add Social Login (Google/GitHub) to your application.', status: 'Upcoming', duration: '60 min', prompt: 'Provide a Week 3 OAuth 2.0 Review.' }
    ]
  },
  {
    id: 4,
    num: 'WEEK 04',
    title: 'AUTHORIZATION (RBAC) & SECURITY DEFENSES',
    status: 'Upcoming',
    progress: 0,
    duration: '7 Days',
    whyMatters: 'Role-Based Access Control and protecting against XSS, CSRF, and SQLi.',
    days: [
      { day: 22, title: 'Day 22: Role-Based Access Control (RBAC)', desc: 'User roles, permissions matrix, middleware enforcement.', status: 'Upcoming', duration: '45 min', prompt: 'Explain Day 22: Role-Based Access Control (RBAC).' },
      { day: 23, title: 'Day 23: Attribute-Based Access Control (ABAC)', desc: 'Dynamic policy enforcement based on context & ownership.', status: 'Upcoming', duration: '45 min', prompt: 'Explain Day 23: Attribute-Based Access Control (ABAC).' },
      { day: 24, title: 'Day 24: Cross-Site Scripting (XSS) Prevention', desc: 'Stored XSS, Reflected XSS, Content Security Policy (CSP).', status: 'Upcoming', duration: '50 min', prompt: 'Explain Day 24: XSS Prevention & Content Security Policy.' },
      { day: 25, title: 'Day 25: Cross-Site Request Forgery (CSRF) Tokens', desc: 'Double Submit Cookie pattern, SameSite cookies.', status: 'Upcoming', duration: '45 min', prompt: 'Explain Day 25: CSRF Attacks & Defense Mechanisms.' },
      { day: 26, title: 'Day 26: SQL Injection & Parameterized Queries', desc: 'Prepared statements, ORM safety against SQLi.', status: 'Upcoming', duration: '45 min', prompt: 'Explain Day 26: SQL Injection & Parameterized Queries.' },
      { day: 27, title: 'Day 27: Full Auth Security Comprehensive Review', desc: 'Complete Security Audit checklist for Web APIs.', status: 'Upcoming', duration: '60 min', prompt: 'Provide a Complete Web API Security Audit Checklist.' },
      { day: 28, title: 'Day 28: Capstone Assessment & Auth Mock Interview', desc: 'Design an Enterprise Auth & Identity Service from scratch.', status: 'Upcoming', duration: '75 min', prompt: 'Conduct a Final Authentication Security Capstone Interview.' }
    ]
  }
];

/* ── HELPER FUNCTION TO GET ROADMAP BY GOAL NAME ── */
export const getRoadmapByGoal = (goalName) => {
  const g = (goalName || '').toUpperCase();
  if (g.includes('DATABASE') || g.includes('DB')) return DB_ROADMAP;
  if (g.includes('SYSTEM') || g.includes('SYS')) return SYS_ROADMAP;
  if (g.includes('AUTH') || g.includes('AUTHENTICATION')) return AUTH_ROADMAP;
  return DSA_ROADMAP;
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
