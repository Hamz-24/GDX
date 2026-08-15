import { useState, useEffect } from 'react';
import { Play, Sparkles, CheckCircle2, ArrowRight, BookOpen, Clock, ShieldCheck, Database, Cpu, Key, ChevronLeft, ChevronRight, Grid, Network, Layers, FileCode, Check, AlertCircle, Loader } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { USER_PROFILE, generatePersonalizedRoadmap } from '../constants/userProfile';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';


/**
 * Dynamic Concept Generator for ANY Day and ANY Domain
 * Returns custom visualizer types with guaranteed safe array defaults:
 * - PREFIX_SUM (Day 5 Prefix Sums & Range Queries)
 * - BINARY_SEARCH (Day 6 Binary Search)
 * - TWO_POINTERS (Day 2 Two Pointers)
 * - SLIDING_WINDOW (Day 3 Sliding Window)
 * - MATRIX_2D (Day 4 2D Matrix)
 * - LINKED_LIST (Node chains)
 * - TREE_GRAPH (Trees & Graphs)
 * - B_TREE_INDEX (SQL Indexing)
 * - HASH_RING (Consistent Hashing)
 * - JWT_TOKEN (JWT Security)
 * - NONE (Reviews / Cheat Sheets / Mock Interviews - Disables simulation)
 */
function getConceptForDayAndDomain(domainName, dayNum) {
  const roadmapWeeks = generatePersonalizedRoadmap(domainName, 4, 'Basic / Beginner');
  
  let foundTopic = `Core Module`;
  let phaseTitle = domainName;
  
  for (const week of roadmapWeeks) {
    for (const d of week.days) {
      if (d.day === Number(dayNum)) {
        foundTopic = d.title.replace(/^Day \d+:\s*/, '');
        phaseTitle = week.title;
        break;
      }
    }
  }

  const topicLower = (foundTopic || '').toLowerCase();
  const dUpper = (domainName || '').toUpperCase();

  // Check if topic is a Review / Cheat Sheet / Mock Interview (No simulation needed)
  if (topicLower.includes('review') || topicLower.includes('cheat sheet') || topicLower.includes('mock interview') || topicLower.includes('capstone') || topicLower.includes('assessment')) {
    return {
      hasSimulation: false,
      visualType: 'NONE',
      title: foundTopic,
      phase: phaseTitle,
      subtitle: `Comprehensive review & interview preparation milestone for ${foundTopic}.`,
      whyMatters: `Review milestones consolidate past daily concepts into production readiness and mock interview performance.`,
      codeSnippet: `# ${foundTopic} Comprehensive Summary
def review_milestone_summary():
    return {
        "status": "Ready for Assessment",
        "domain": "${domainName}",
        "day": ${dayNum}
    }`,
      quizQuestion: `What is the primary objective of a ${foundTopic} milestone?`,
      quizOptions: [
        { id: 'A', text: 'Consolidate multiple domain concepts and verify technical interview readiness.', correct: true },
        { id: 'B', text: 'Reset all user progress to Day 1.' },
        { id: 'C', text: 'Bypass all code testing.' }
      ]
    };
  }

  // 1. PREFIX SUMS & RANGE QUERIES (DAY 5)
  if (topicLower.includes('prefix sum') || topicLower.includes('range quer')) {
    return {
      hasSimulation: true,
      visualType: 'PREFIX_SUM',
      title: foundTopic,
      phase: phaseTitle,
      subtitle: `Precompute prefix sums P[i] to answer any contiguous subarray sum query Range(L, R) in O(1) constant time.`,
      whyMatters: `Prefix sums eliminate repetitive O(N) subarray sum loops, answering static range queries instantly. Formula: Sum(L, R) = P[R+1] - P[L].`,
      origArray: [2, 1, 5, 1, 3, 2],
      prefixArray: [0, 2, 3, 8, 9, 12, 14],
      codeSnippet: `# Prefix Sum Precomputation & O(1) Range Queries
arr = [2, 1, 5, 1, 3, 2]

# Step 1: Precompute Prefix Sum Array (P[i] = sum of arr[0...i-1])
prefix = [0] * (len(arr) + 1)
for i in range(len(arr)):
    prefix[i + 1] = prefix[i] + arr[i]

# Step 2: Answer Range Query Sum(L=1, R=3) -> Elements [1, 5, 1]
# Formula: prefix[R + 1] - prefix[L] -> prefix[4] - prefix[1] = 9 - 2 = 7
def query_range_sum(L, R):
    return prefix[R + 1] - prefix[L]

print("Range Sum (1 to 3):", query_range_sum(1, 3))  # Output: 7`,
      quizQuestion: `In Prefix Sum Array P where P[i] stores the sum of first i elements, what is the formula to get subarray sum from index L to R in O(1) time?`,
      quizOptions: [
        { id: 'A', text: 'P[R + 1] - P[L]', correct: true },
        { id: 'B', text: 'P[R] + P[L]' },
        { id: 'C', text: 'P[R] * P[L]' }
      ]
    };
  }

  // 2. BINARY SEARCH (DAY 6)
  if (topicLower.includes('binary search')) {
    return {
      hasSimulation: true,
      visualType: 'BINARY_SEARCH',
      title: foundTopic,
      phase: phaseTitle,
      subtitle: `Reduce search space by half at each step on sorted arrays, finding target elements in logarithmic O(log N) steps.`,
      whyMatters: `Binary search turns 1,000,000 element linear scans into at most 20 comparison steps. Mid formula: low + (high - low) // 2.`,
      sortedArray: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91],
      target: 23,
      codeSnippet: `# Binary Search on Sorted Array
def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    
    while low <= high:
        mid = low + (high - low) // 2  # Prevents integer overflow
        if arr[mid] == target:
            return mid  # Found target index
        elif arr[mid] < target:
            low = mid + 1  # Search right half
        else:
            high = mid - 1  # Search left half
            
    return -1`,
      quizQuestion: `Why is mid calculated as "low + (high - low) // 2" instead of "(low + high) // 2"?`,
      quizOptions: [
        { id: 'A', text: 'It prevents potential integer overflow when low + high exceeds maximum 32-bit integer limits.', correct: true },
        { id: 'B', text: 'It automatically sorts the array.' },
        { id: 'C', text: 'It runs twice as fast on modern CPUs.' }
      ]
    };
  }

  // 3. TWO POINTERS (DAY 2)
  if (topicLower.includes('two-pointer') || topicLower.includes('two pointer')) {
    return {
      hasSimulation: true,
      visualType: 'TWO_POINTERS',
      title: foundTopic,
      phase: phaseTitle,
      subtitle: `Converge left and right pointers from array boundaries to process pairs in O(N) time and O(1) space.`,
      whyMatters: `Two pointers eliminate nested loops in sorted array searching and array reversal problems.`,
      arrayData: [2, 1, 5, 1, 3, 2],
      codeSnippet: `# Two-Pointer In-Place Array Reversal
def reverse_array_in_place(arr):
    left, right = 0, len(arr) - 1
    while left < right:
        arr[left], arr[right] = arr[right], arr[left]  # Swap
        left += 1
        right -= 1
    return arr`,
      quizQuestion: `What is the auxiliary space complexity of the Two-Pointer in-place reversal algorithm?`,
      quizOptions: [
        { id: 'A', text: 'O(1) constant auxiliary space since modifications happen directly in-place.', correct: true },
        { id: 'B', text: 'O(N) space due to creating a new copy array.' },
        { id: 'C', text: 'O(N log N) stack space.' }
      ]
    };
  }

  // 4. 2D MATRIX (DAY 4)
  if (topicLower.includes('matrix') || topicLower.includes('2d') || topicLower.includes('grid')) {
    return {
      hasSimulation: true,
      visualType: 'MATRIX_2D',
      title: foundTopic,
      phase: phaseTitle,
      subtitle: `Understand row-major vs column-major 2D matrix memory storage and cell-by-cell grid traversal.`,
      whyMatters: `2D matrices represent grids, image pixels, game boards, and DP tables in memory. Memory formula: Index = r * COLS + c.`,
      gridData: [
        [10, 20, 30],
        [40, 50, 60],
        [70, 80, 90]
      ],
      codeSnippet: `# 2D Matrix Row-Major Grid Traversal
grid = [
  [10, 20, 30],
  [40, 50, 60],
  [70, 80, 90]
]

ROWS, COLS = len(grid), len(grid[0])

# Row-major traversal (sequential memory access)
for r in range(ROWS):
    for c in range(COLS):
        ram_offset = r * COLS + c
        val = grid[r][c]
        print(f"Row {r}, Col {c} -> Val: {val} (RAM Offset: {ram_offset})")`,
      quizQuestion: `In Row-Major 2D Matrix storage with 3 columns, what is the 1D linear RAM memory offset for cell (row=1, col=2)?`,
      quizOptions: [
        { id: 'A', text: 'Offset 3 (1 + 2)' },
        { id: 'B', text: 'Offset 5 (row * COLS + col = 1 * 3 + 2 = 5)', correct: true },
        { id: 'C', text: 'Offset 9 (3 * 3)' }
      ]
    };
  }

  // 5. SLIDING WINDOW (DAY 3)
  if (topicLower.includes('sliding window')) {
    return {
      hasSimulation: true,
      visualType: 'SLIDING_WINDOW',
      title: foundTopic,
      phase: phaseTitle,
      subtitle: `Maintain left & right pointers across a 1D array to solve subarray problems in linear O(N) time.`,
      whyMatters: `Sliding Window avoids nested O(N^2) loops by adding incoming right and subtracting outgoing left elements.`,
      arrayData: [2, 1, 5, 1, 3, 2],
      codeSnippet: `# Sliding Window Max Subarray Sum of Size K
def max_sub_array_of_size_k(k, arr):
    max_sum, window_sum, window_start = 0, 0, 0
    for window_end in range(len(arr)):
        window_sum += arr[window_end]
        if window_end >= k - 1:
            max_sum = max(max_sum, window_sum)
            window_sum -= arr[window_start]
            window_start += 1
    return max_sum`,
      quizQuestion: `Why does Sliding Window achieve O(N) linear time complexity?`,
      quizOptions: [
        { id: 'A', text: 'Each element is visited at most twice by left and right pointers.', correct: true },
        { id: 'B', text: 'It creates nested loops that run in parallel.' },
        { id: 'C', text: 'It sorts the input array automatically.' }
      ]
    };
  }

  // 6. LINKED LIST / STACK / QUEUE
  if (topicLower.includes('linked list') || topicLower.includes('stack') || topicLower.includes('queue')) {
    return {
      hasSimulation: true,
      visualType: 'LINKED_LIST',
      title: foundTopic,
      phase: phaseTitle,
      subtitle: `Master node pointer allocation, prev/next references, and structural traversal without contiguous memory.`,
      whyMatters: `Linked Lists allow O(1) dynamic node insertions and deletions without reallocation.`,
      nodesList: [
        { val: 12, addr: '0x10A', next: '0x20B' },
        { val: 45, addr: '0x20B', next: '0x30C' },
        { val: 89, addr: '0x30C', next: 'NULL' }
      ],
      codeSnippet: `# Singly Linked List Node Traversal
class Node:
    def __init__(self, val, next_node=None):
        self.val = val
        self.next = next_node

head = Node(12, Node(45, Node(89)))

curr = head
while curr:
    print(f"Visiting Node val={curr.val}")
    curr = curr.next`,
      quizQuestion: `Why does finding an element by index in a Singly Linked List take O(N) time?`,
      quizOptions: [
        { id: 'A', text: 'Node memory is non-contiguous, requiring sequential pointer traversal from Head.', correct: true },
        { id: 'B', text: 'The CPU cache automatically locks linked list nodes.' },
        { id: 'C', text: 'LinkedList nodes can only store strings.' }
      ]
    };
  }

  // 5. DATABASE NORMALIZATION (1NF, 2NF, 3NF)
  if (topicLower.includes('normalization') || topicLower.includes('1nf') || topicLower.includes('2nf') || topicLower.includes('3nf')) {
    return {
      hasSimulation: true,
      visualType: 'NORMALIZATION',
      title: foundTopic,
      phase: phaseTitle,
      subtitle: `Eliminate data redundancy, update anomalies, and transitive dependencies via 1NF, 2NF, and 3NF table decomposition.`,
      whyMatters: `Database normalization ensures data integrity, prevents insertion/update/deletion anomalies, and reduces storage overhead in relational engines.`,
      codeSnippet: `-- 3NF Normalized Relational Schema
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
      quizQuestion: `What type of dependency is eliminated when decomposing a relational table from 2NF to 3NF?`,
      quizOptions: [
        { id: 'A', text: 'Transitive dependency (non-prime attribute depending on another non-prime attribute).', correct: true },
        { id: 'B', text: 'Partial dependency on a composite primary key.' },
        { id: 'C', text: 'Multi-valued repeating column groups.' }
      ]
    };
  }

  // 6. SQL JOINS (INNER, LEFT, RIGHT)
  if (topicLower.includes('join') || topicLower.includes('inner join') || topicLower.includes('left join')) {
    return {
      hasSimulation: true,
      visualType: 'SQL_JOIN',
      title: foundTopic,
      phase: phaseTitle,
      subtitle: `Combine rows from two or more tables based on a related column join predicate.`,
      whyMatters: `Understanding relational joins is fundamental to querying normalized schemas efficiently.`,
      codeSnippet: `-- INNER JOIN vs LEFT JOIN Example
SELECT u.name, o.order_date, o.total_amount
FROM Users u
INNER JOIN Orders o ON u.user_id = o.user_id
WHERE o.order_date >= '2026-01-01';`,
      quizQuestion: `Which SQL join returns all rows from the left table, even if there are no matches in the right table?`,
      quizOptions: [
        { id: 'A', text: 'LEFT OUTER JOIN', correct: true },
        { id: 'B', text: 'INNER JOIN' },
        { id: 'C', text: 'CROSS JOIN' }
      ]
    };
  }

  // 7. ACID TRANSACTIONS & CONCURRENCY
  if (topicLower.includes('acid') || topicLower.includes('transaction') || topicLower.includes('isolation')) {
    return {
      hasSimulation: true,
      visualType: 'ACID_TRANSACTION',
      title: foundTopic,
      phase: phaseTitle,
      subtitle: `Ensure Atomicity, Consistency, Isolation, and Durability across database write operations.`,
      whyMatters: `ACID guarantees prevent corrupt states during server crashes, concurrent updates, and financial operations.`,
      codeSnippet: `-- PostgreSQL ACID Transaction Block
BEGIN;
  UPDATE Accounts SET balance = balance - 500 WHERE account_id = 101;
  UPDATE Accounts SET balance = balance + 500 WHERE account_id = 202;
COMMIT;`,
      quizQuestion: `Which ACID property guarantees that all operations in a transaction succeed together or fail completely with a rollback?`,
      quizOptions: [
        { id: 'A', text: 'Atomicity (All-or-Nothing execution)', correct: true },
        { id: 'B', text: 'Isolation' },
        { id: 'C', text: 'Durability' }
      ]
    };
  }

  // 8. REDIS & CACHING
  if (topicLower.includes('cache') || topicLower.includes('redis') || topicLower.includes('memcached')) {
    return {
      hasSimulation: true,
      visualType: 'REDIS_CACHE',
      title: foundTopic,
      phase: phaseTitle,
      subtitle: `Implement in-memory caching patterns to reduce database latency from 100ms to <2ms.`,
      whyMatters: `Caching hot data in RAM mitigates database bottlenecks under high read throughput.`,
      codeSnippet: `// Cache-Aside Pattern in Node.js & Redis
async function getUserProfile(userId) {
  const cached = await redis.get(\`user:\${userId}\`);
  if (cached) return JSON.parse(cached);

  const user = await db.query('SELECT * FROM Users WHERE id = ?', [userId]);
  await redis.setex(\`user:\${userId}\`, 3600, JSON.stringify(user));
  return user;
}`,
      quizQuestion: `In a Cache-Aside pattern, what happens when a requested key is not present in the Redis cache (Cache Miss)?`,
      quizOptions: [
        { id: 'A', text: 'The application queries the database, writes the result to Redis, and returns it to the client.', correct: true },
        { id: 'B', text: 'Redis automatically generates dummy fallback data.' },
        { id: 'C', text: 'The request fails with HTTP 404.' }
      ]
    };
  }

  // 9. LINKED LIST
  if (topicLower.includes('linked list') || topicLower.includes('node allocation')) {
    return {
      hasSimulation: true,
      visualType: 'LINKED_LIST',
      title: foundTopic,
      phase: phaseTitle,
      subtitle: `Understand dynamic heap node allocation, pointer references, and sequential traversal mechanics.`,
      whyMatters: `Linked lists store elements non-contiguously, enabling O(1) dynamic insertions/deletions at known pointer nodes.`,
      nodesList: [
        { addr: '0x1000', val: 12, next: '0x1040' },
        { addr: '0x1040', val: 45, next: '0x10B0' },
        { addr: '0x10B0', val: 89, next: 'NULL' }
      ],
      codeSnippet: `# Node Definition & Linked List Traversal
class Node:
    def __init__(self, val, next_node=None):
        self.val = val
        self.next = next_node

head = Node(12, Node(45, Node(89)))

curr = head
while curr:
    print(f"Visiting Node val={curr.val}")
    curr = curr.next`,
      quizQuestion: `Why does finding an element by index in a Singly Linked List take O(N) time?`,
      quizOptions: [
        { id: 'A', text: 'Node memory is non-contiguous, requiring sequential pointer traversal from Head.', correct: true },
        { id: 'B', text: 'The CPU cache automatically locks linked list nodes.' },
        { id: 'C', text: 'LinkedList nodes can only store strings.' }
      ]
    };
  }

  // 10. TREE / GRAPH
  if (topicLower.includes('tree') || topicLower.includes('graph') || topicLower.includes('dfs') || topicLower.includes('bfs') || topicLower.includes('bst')) {
    return {
      hasSimulation: true,
      visualType: 'TREE_GRAPH',
      title: foundTopic,
      phase: phaseTitle,
      subtitle: `Understand hierarchical parent-child relationships and Depth-First / Breadth-First exploration.`,
      whyMatters: `Trees and Graphs model file systems, DOM trees, network topology, and decision trees.`,
      treeNodes: [
        { id: 'Root', val: 'Root (10)', level: 0 },
        { id: 'L1', val: 'Left (5)', level: 1 },
        { id: 'R1', val: 'Right (15)', level: 1 },
        { id: 'L2', val: 'L-Leaf (2)', level: 2 },
        { id: 'R2', val: 'R-Leaf (20)', level: 2 }
      ],
      codeSnippet: `# Binary Tree In-Order Traversal (DFS)
def in_order_traversal(root):
    if not root:
        return
    in_order_traversal(root.left)   # Visit Left Subtree
    print(root.val)                 # Process Current Node
    in_order_traversal(root.right)  # Visit Right Subtree`,
      quizQuestion: `In a Binary Search Tree (BST), what is true about all nodes in the left subtree of a node X?`,
      quizOptions: [
        { id: 'A', text: 'All left subtree node values are strictly less than X.val.', correct: true },
        { id: 'B', text: 'All left subtree node values are strictly greater than X.val.' },
        { id: 'C', text: 'Left subtree nodes are always stored in array format.' }
      ]
    };
  }

  // 11. DATABASE B-TREE INDEX (Only when topic specifically mentions B-Tree or Indexing)
  if (topicLower.includes('b-tree') || topicLower.includes('indexing') || topicLower.includes('explain analyze') || topicLower.includes('index')) {
    return {
      hasSimulation: true,
      visualType: 'B_TREE_INDEX',
      title: foundTopic,
      phase: phaseTitle,
      subtitle: `Traverse B-Tree index pages from Root -> Internal Node -> Leaf Page -> Table Row ID.`,
      whyMatters: `B-Tree indexes reduce 10,000,000 row table scans down to 3-4 disk page reads in O(log N) steps.`,
      dbPages: [
        { name: 'Root Index Page', type: 'Root' },
        { name: 'Branch Page (50-100)', type: 'Internal' },
        { name: 'Leaf Page (70-75)', type: 'Leaf' },
        { name: 'Row Record #742', type: 'Table Data' }
      ],
      codeSnippet: `-- B-Tree Index Query Optimization
EXPLAIN ANALYZE
SELECT id, email, created_at 
FROM users 
WHERE email = 'student@guidex.io';`,
      quizQuestion: `Why is B-Tree index lookup time complexity O(log N)?`,
      quizOptions: [
        { id: 'A', text: 'Every tree node level eliminates a constant fraction of remaining index keys.', correct: true },
        { id: 'B', text: 'B-Trees sort the entire physical disk drive.' },
        { id: 'C', text: 'B-Trees read every table row in parallel.' }
      ]
    };
  }

  // 12. SYSTEM DESIGN HASH RING / ARCHITECTURE
  if (topicLower.includes('hash ring') || topicLower.includes('consistent hash') || topicLower.includes('load balan') || topicLower.includes('microservice') || topicLower.includes('system design')) {
    return {
      hasSimulation: true,
      visualType: topicLower.includes('hash') ? 'HASH_RING' : 'SYSTEM_ARCHITECTURE',
      title: foundTopic,
      phase: phaseTitle,
      subtitle: `Distribute incoming request traffic across scalable microservices, load balancers, and gateways.`,
      whyMatters: `System architecture design guarantees high availability, horizontal scalability, and zero single points of failure.`,
      clusterNodes: [
        { name: 'Server Alpha (0°)', angle: 0 },
        { name: 'Server Beta (120°)', angle: 120 },
        { name: 'Server Gamma (240°)', angle: 240 },
        { name: 'Request Hash (145°)', angle: 145 }
      ],
      codeSnippet: `# System Load Balancing & Service Discovery
def route_incoming_request(request, cluster_nodes):
    # Route via Layer 7 Weighted Round-Robin
    target_node = select_healthy_node(cluster_nodes)
    return forward_request(target_node, request)`,
      quizQuestion: `What is the primary function of a Layer 7 Load Balancer in a distributed system?`,
      quizOptions: [
        { id: 'A', text: 'Distribute HTTP/HTTPS traffic based on application data such as URLs, headers, and cookies.', correct: true },
        { id: 'B', text: 'Format physical RAM memory chips.' },
        { id: 'C', text: 'Encrypt client hard drives.' }
      ]
    };
  }

  // 13. AUTHENTICATION JWT
  if (topicLower.includes('jwt') || topicLower.includes('oauth') || topicLower.includes('session') || topicLower.includes('cookie') || topicLower.includes('auth')) {
    return {
      hasSimulation: true,
      visualType: 'JWT_TOKEN',
      title: foundTopic,
      phase: phaseTitle,
      subtitle: `Inspect Base64Url Header, Payload Claims, and HMAC-SHA256 Cryptographic Signature.`,
      whyMatters: `JWT tokens enable stateless authentication while preventing tampering via HMAC verification.`,
      jwtParts: [
        { part: 'Header', val: '{"alg": "HS256", "typ": "JWT"}' },
        { part: 'Payload', val: '{"sub": "usr_948", "role": "admin"}' },
        { part: 'Signature', val: 'HMACSHA256(header + payload, secret)' },
        { part: 'Cookie', val: 'HttpOnly; Secure; SameSite=Strict' }
      ],
      codeSnippet: `// Express JWT Token Verification
const jwt = require('jsonwebtoken');

function verifyJWT(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);
    req.user = decoded;
    next();
  });
}`,
      quizQuestion: `Why should sensitive refresh tokens be stored in HttpOnly Cookies instead of LocalStorage?`,
      quizOptions: [
        { id: 'A', text: 'HttpOnly cookies cannot be accessed or stolen by malicious client-side JavaScript (XSS).', correct: true },
        { id: 'B', text: 'LocalStorage can only store up to 5 bytes of data.' },
        { id: 'C', text: 'HttpOnly cookies bypass server validation.' }
      ]
    };
  }

  // DEFAULT TOPIC FALLBACK (No specialized visualizer — set visualType to NONE, hasSimulation to false)
  return {
    hasSimulation: false,
    visualType: 'NONE',
    title: foundTopic,
    phase: phaseTitle,
    subtitle: `Learn & implement ${foundTopic} with structured technical logic and production standards.`,
    whyMatters: `${foundTopic} is a core technical capability required for engineering evaluations.`,
    codeSnippet: `# ${foundTopic} Implementation Example\ndef execute_day_${dayNum}():\n    # ${foundTopic} technical implementation\n    pass`,
    quizQuestion: `What is the primary technical objective of ${foundTopic}?`,
    quizOptions: [
      { id: 'A', text: `Achieve production-grade technical implementation for ${foundTopic}.`, correct: true },
      { id: 'B', text: 'Bypass technical evaluation constraints.' },
      { id: 'C', text: 'Increase execution runtime artificially.' }
    ]
  };
}


const STEPS = [

  { num: 1, key: 'understand', label: '01 UNDERSTAND' },
  { num: 2, key: 'see',        label: '02 SEE IT' },
  { num: 3, key: 'try',        label: '03 TRY IT' },
  { num: 4, key: 'prove',      label: '04 PROVE IT' },
];

const DailyConcept = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Selected Domain locked to user's active goal
  const selectedDomain = user?.goal || location.state?.domain || USER_PROFILE.targetRole || 'DATA STRUCTURES';
  const [currentDayNum, setCurrentDayNum] = useState(location.state?.day || user?.currentRoadmapDay || 1);
  const [isDayCompleted, setIsDayCompleted] = useState(false);

  // Fetch current roadmap day from backend if not provided in location state
  useEffect(() => {
    if (!location.state?.day) {
      api('/api/roadmap/today')
        .then(res => {
          if (res && res.currentDay) {
            setCurrentDayNum(res.currentDay);
            if (res.step) setIsDayCompleted(!!res.step.completed);
          }
        })
        .catch(() => {});
    }
  }, [location.state]);

  // Check completion status whenever currentDayNum changes
  useEffect(() => {
    let isMounted = true;
    api('/api/roadmap')
      .then(allSteps => {
        if (isMounted && Array.isArray(allSteps)) {
          const matchingStep = allSteps.find(s => s.day === Number(currentDayNum));
          if (matchingStep) {
            setIsDayCompleted(!!matchingStep.completed);
          }
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, [currentDayNum]);

  const toggleDayCompletion = async () => {
    const nextState = !isDayCompleted;
    setIsDayCompleted(nextState);
    try {
      const res = await api(`/api/roadmap/${currentDayNum}/complete`, {
        method: 'PATCH',
        body: JSON.stringify({ completed: nextState })
      });
      if (res) {
        window.dispatchEvent(new CustomEvent('gdx_roadmap_updated'));
      }
    } catch {
      setIsDayCompleted(!nextState);
    }
  };

  const [loadingAi, setLoadingAi] = useState(false);
  const [aiConcept, setAiConcept] = useState(null);

  // Fetch dynamic AI concept when day changes
  useEffect(() => {
    let isMounted = true;
    setLoadingAi(true);
    api(`/api/roadmap/concept/${currentDayNum}`)
      .then(res => {
        if (isMounted && res && res.concept) {
          setAiConcept(res.concept);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoadingAi(false);
      });

    return () => { isMounted = false; };
  }, [currentDayNum]);

  // Dynamic Concept Data combining Gemini AI output with fallback templates
  const fallbackConcept = getConceptForDayAndDomain(selectedDomain, currentDayNum);
  const concept = aiConcept ? { ...fallbackConcept, ...aiConcept } : fallbackConcept;

  const [activeStep, setActiveStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  // Interactive Simulation State
  const [simIndex, setSimIndex] = useState(0);
  const [matrixCell, setMatrixCell] = useState({ r: 0, c: 0 });
  const [binarySearchPointers, setBinarySearchPointers] = useState({ low: 0, mid: 4, high: 9 });
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLog, setSimulationLog] = useState([`Loaded Day ${currentDayNum} concept: ${concept.title}`]);

  // Quiz state
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Reset steps when day or domain changes
  useEffect(() => {
    setActiveStep(1);
    setCompletedSteps(new Set());
    setSelectedOption(null);
    setQuizSubmitted(false);
    setSimulationLog([`Loaded Day ${currentDayNum} concept: ${concept.title}`]);
    setSimIndex(0);
    setMatrixCell({ r: 0, c: 0 });
    setBinarySearchPointers({ low: 0, mid: 4, high: 9 });
  }, [selectedDomain, currentDayNum, aiConcept]);

  const markComplete = (stepNum) => {
    setCompletedSteps(prev => new Set([...prev, stepNum]));
  };

  const goToStep = (num) => {
    markComplete(activeStep);
    setActiveStep(num);
  };

  // Run Custom Simulation Based on Visualizer Type
  const runConceptSimulation = () => {
    if (isSimulating || !concept.hasSimulation) return;
    setIsSimulating(true);
    setSimulationLog([`Starting interactive simulation for Day ${currentDayNum}: ${concept.title}...`]);

    // MODE: PREFIX SUM SIMULATION
    if (concept.visualType === 'PREFIX_SUM' && concept.prefixArray) {
      let idx = 0;
      setSimIndex(0);
      const interval = setInterval(() => {
        idx += 1;
        if (idx >= concept.prefixArray.length) {
          clearInterval(interval);
          setIsSimulating(false);
          markComplete(2);
          setSimulationLog(l => [
            ...l,
            `✓ Prefix Sum Array Generated: [0, 2, 3, 8, 9, 12, 14]`,
            `✓ Verified Range Sum(L=1, R=3) = Prefix[4] - Prefix[1] = 9 - 2 = 7 in O(1) time!`
          ]);
          return;
        }

        setSimIndex(idx);
        setSimulationLog(l => [
          ...l,
          `Prefix[${idx}] = Prefix[${idx - 1}] + arr[${idx - 1}] = ${concept.prefixArray[idx]}`
        ]);
      }, 700);
      return;
    }

    // MODE: BINARY SEARCH SIMULATION
    if (concept.visualType === 'BINARY_SEARCH' && concept.sortedArray) {
      let low = 0, high = concept.sortedArray.length - 1;
      let step = 0;

      const interval = setInterval(() => {
        step += 1;
        let mid = Math.floor(low + (high - low) / 2);
        setBinarySearchPointers({ low, mid, high });
        
        const val = concept.sortedArray[mid];
        if (val === concept.target) {
          clearInterval(interval);
          setIsSimulating(false);
          markComplete(2);
          setSimulationLog(l => [
            ...l,
            `✓ Target ${concept.target} found at Index ${mid} in Step ${step}!`
          ]);
          return;
        } else if (val < concept.target) {
          setSimulationLog(l => [...l, `Step ${step}: mid val (${val}) < target (${concept.target}) -> Move low to ${mid + 1}`]);
          low = mid + 1;
        } else {
          setSimulationLog(l => [...l, `Step ${step}: mid val (${val}) > target (${concept.target}) -> Move high to ${mid - 1}`]);
          high = mid - 1;
        }
      }, 900);
      return;
    }

    // MODE: 2D MATRIX SIMULATION
    if (concept.visualType === 'MATRIX_2D' && concept.gridData) {
      let r = 0, c = 0;
      setMatrixCell({ r: 0, c: 0 });

      const interval = setInterval(() => {
        c += 1;
        if (c >= 3) {
          c = 0;
          r += 1;
        }

        if (r >= 3) {
          clearInterval(interval);
          setIsSimulating(false);
          markComplete(2);
          setSimulationLog(l => [...l, `✓ 2D Grid Traversal Complete: Visited all 9 matrix cells in row-major order!`]);
          return;
        }

        setMatrixCell({ r, c });
        const offset = r * 3 + c;
        const val = concept.gridData[r][c];
        setSimulationLog(l => [
          ...l,
          `Traversing Cell (${r}, ${c}) -> Value: ${val} | 1D RAM Offset = ${r} * 3 + ${c} = ${offset}`
        ]);
      }, 750);
      return;
    }

    // DEFAULT STEP SIMULATION
    let idx = 0;
    setSimIndex(0);
    const maxSteps = concept.arrayData ? concept.arrayData.length : (concept.nodesList ? concept.nodesList.length : 4);

    const interval = setInterval(() => {
      idx += 1;
      if (idx >= maxSteps) {
        clearInterval(interval);
        setIsSimulating(false);
        markComplete(2);
        setSimulationLog(l => [...l, `✓ Simulation Complete: Processed all steps for ${concept.title}!`]);
        return;
      }

      setSimIndex(idx);
      setSimulationLog(l => [
        ...l,
        `Step ${idx + 1}: Processed node element -> Invariant Confirmed.`
      ]);
    }, 850);
  };

  const handleNextDay = () => {
    setCurrentDayNum(prev => prev + 1);
  };

  const handlePrevDay = () => {
    if (currentDayNum > 1) setCurrentDayNum(prev => prev - 1);
  };

  const askInMentor = () => {
    navigate('/mentor', {
      state: {
        dayTopic: `Day ${currentDayNum}: ${concept.title}`,
        prompt: `Explain Day ${currentDayNum} concept (${concept.title}) in ${selectedDomain}. Provide step-by-step logic, code, and key interview questions.`,
        goal: selectedDomain
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 font-sans pb-16">

      {/* Day Navigation & Domain Bar */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900 text-white border border-zinc-800">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevDay}
            disabled={currentDayNum <= 1}
            className="p-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 transition-colors text-xs font-mono font-bold flex items-center gap-1"
          >
            <ChevronLeft size={14} /> Prev Day
          </button>
          <span className="px-3 py-1 bg-[#F5C542] text-zinc-950 rounded-full text-xs font-mono font-extrabold">
            DAY {currentDayNum} MODULE
          </span>
        </div>

        <div className="text-xs font-mono text-amber-400 font-bold truncate">
          {concept.phase}
        </div>

        <button
          onClick={handleNextDay}
          className="p-2 px-3 rounded-xl bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 transition-colors text-xs font-mono font-extrabold flex items-center gap-1 shadow-pill"
        >
          Next Day <ChevronRight size={14} />
        </button>
      </div>

      {/* Header Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 rounded-full text-xs font-mono font-bold">
              DAILY MICRO-LESSON · DAY {currentDayNum}
            </span>
            <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full text-xs font-mono font-bold">
              {selectedDomain}
            </span>
            {isDayCompleted && (
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-mono font-bold flex items-center gap-1">
                <CheckCircle2 size={12} /> COMPLETED
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold font-display text-zinc-900 dark:text-white tracking-tight">
            Day {currentDayNum}: {concept.title}
          </h1>
          <p className="text-xs text-zinc-500 font-medium">
            {concept.subtitle}
          </p>

          {/* DAY NAVIGATION */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            {/* Prev Day */}
            <button
              onClick={() => setCurrentDayNum(prev => Math.max(1, prev - 1))}
              disabled={currentDayNum <= 1}
              className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-bold flex items-center gap-1 disabled:opacity-40 transition-all"
            >
              <ChevronLeft size={14} /> Day {Math.max(1, currentDayNum - 1)}
            </button>

            {/* Day Counter */}
            <span className="text-xs font-mono font-bold text-zinc-500">
              Day {currentDayNum} of 28
            </span>

            {/* Next Day */}
            <button
              onClick={() => setCurrentDayNum(prev => Math.min(28, prev + 1))}
              disabled={currentDayNum >= 28}
              className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-bold flex items-center gap-1 disabled:opacity-40 transition-all"
            >
              Day {Math.min(28, currentDayNum + 1)} <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <button
          onClick={askInMentor}
          className="bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs py-3 px-5 rounded-full shadow-pill transition-all shrink-0 flex items-center justify-center gap-2 self-start md:self-center"
        >
          <Sparkles size={16} /> Explain with AI
        </button>
      </div>

      {/* 4-Step Progress Tracker */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {STEPS.map((step) => {
          const isDone = completedSteps.has(step.num);
          const isCurrent = activeStep === step.num;
          return (
            <button
              key={step.key}
              onClick={() => setActiveStep(step.num)}
              className={`py-3 px-3 rounded-2xl text-xs font-mono font-bold text-center transition-all ${
                isCurrent
                  ? 'bg-[#F5C542] text-zinc-950 shadow-pill'
                  : isDone
                  ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400'
                  : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-700'
              }`}
            >
              {isDone && !isCurrent ? `✓ ${step.label}` : step.label}
            </button>
          );
        })}
      </div>

      {/* ── STEP 1: UNDERSTAND ── */}
      {activeStep === 1 && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block">01 CONCEPT INTUITION</span>
            <h2 className="text-xl font-extrabold font-display text-zinc-900 dark:text-white">
              Why Day {currentDayNum}: {concept.title} Matters
            </h2>
          </div>

          <div className="space-y-4 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">
              {concept.whyMatters}
            </p>

            <p>
              {concept.subtitle}
            </p>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 font-mono text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <div>1. Target Focus: {concept.title} primitives.</div>
              <div>2. Execution Target: Optimal complexity and zero runtime errors.</div>
              <div>3. Production Utility: Core building block in production systems.</div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => goToStep(2)}
              className="bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs py-3 px-6 rounded-full shadow-pill transition-all inline-flex items-center gap-1.5"
            >
              <span>{concept.hasSimulation ? 'Next: See Interactive Visual →' : 'Next: Code Implementation →'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: SEE IT — Custom Visualizer Modes ── */}
      {activeStep === 2 && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block">02 INTERACTIVE DOM VISUALIZER</span>
            <h2 className="text-xl font-extrabold font-display text-zinc-900 dark:text-white">
              Day {currentDayNum}: Interactive Simulation
            </h2>
          </div>

          {/* IF NO SIMULATION NEEDED FOR THIS DAY */}
          {!concept.hasSimulation ? (
            <div className="p-8 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-3 text-center">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-300 mx-auto">
                <BookOpen size={24} />
              </div>
              <h3 className="text-base font-extrabold font-display text-zinc-900 dark:text-white">
                Theoretical & Comprehensive Review Milestone
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 max-w-md mx-auto leading-relaxed">
                Day {currentDayNum} ({concept.title}) focuses on full system architecture, cheat sheets, and interview evaluation strategy. No interactive DOM simulation is required for this milestone.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => goToStep(3)}
                  className="bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs py-3 px-6 rounded-full shadow-pill transition-all inline-flex items-center gap-1.5"
                >
                  <span>Proceed to Code Implementation →</span>
                </button>
              </div>
            </div>
          ) : (
            /* Interactive Visual Container */
            <div className="p-6 rounded-2xl bg-zinc-900 text-white space-y-6">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400 border-b border-zinc-800 pb-3">
                <span className="flex items-center gap-1.5">
                  <Grid size={14} className="text-[#F5C542]" />
                  Mode: <strong className="text-[#F5C542]">{concept.visualType}</strong>
                </span>
                <span>
                  {concept.visualType === 'PREFIX_SUM' && `Step ${simIndex + 1} / ${(concept.prefixArray || []).length}`}
                  {concept.visualType === 'BINARY_SEARCH' && `Low: ${binarySearchPointers.low} | Mid: ${binarySearchPointers.mid} | High: ${binarySearchPointers.high}`}
                  {concept.visualType === 'MATRIX_2D' && `Active Cell: (${matrixCell.r}, ${matrixCell.c}) | RAM Offset = ${matrixCell.r * 3 + matrixCell.c}`}
                  {concept.visualType !== 'PREFIX_SUM' && concept.visualType !== 'BINARY_SEARCH' && concept.visualType !== 'MATRIX_2D' && `Step ${simIndex + 1}`}
                </span>
              </div>

              {/* MODE 1: PREFIX SUM VISUALIZER (DAY 5) */}
              {concept.visualType === 'PREFIX_SUM' && (
                <div className="space-y-4 font-mono text-xs">
                  <div>
                    <span className="text-zinc-400 block mb-2">Original Array A:</span>
                    <div className="flex items-center justify-center gap-2">
                      {(concept.origArray || []).map((val, idx) => (
                        <div key={idx} className="w-11 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex flex-col items-center justify-center">
                          <span className="text-[9px] text-zinc-500">[{idx}]</span>
                          <span className="font-bold text-white">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-amber-400 block mb-2">Precomputed Prefix Sum Array P (P[i] = Sum arr[0...i-1]):</span>
                    <div className="flex items-center justify-center gap-2">
                      {(concept.prefixArray || []).map((pVal, idx) => {
                        const isActive = idx === simIndex;
                        return (
                          <div
                            key={idx}
                            className={`w-11 h-13 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                              isActive ? 'bg-[#F5C542] text-zinc-950 border-[#F5C542] font-black scale-105' : 'bg-zinc-800 text-amber-300 border-zinc-700'
                            }`}
                          >
                            <span className="text-[9px] opacity-70">P[{idx}]</span>
                            <span className="font-extrabold">{pVal}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* MODE 2: BINARY SEARCH VISUALIZER (DAY 6) */}
              {concept.visualType === 'BINARY_SEARCH' && (
                <div className="space-y-4 font-mono text-xs">
                  <div className="text-center text-zinc-400">
                    Sorted Array (Target: <strong className="text-[#F5C542]">{concept.target}</strong>)
                  </div>
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
                    {(concept.sortedArray || []).map((val, idx) => {
                      const isMid = idx === binarySearchPointers.mid;
                      const isLow = idx === binarySearchPointers.low;
                      const isHigh = idx === binarySearchPointers.high;
                      const inRange = idx >= binarySearchPointers.low && idx <= binarySearchPointers.high;

                      return (
                        <div key={idx} className="flex flex-col items-center gap-1">
                          <span className="text-[9px] text-zinc-500">[{idx}]</span>
                          <div
                            className={`w-10 h-13 rounded-xl border-2 flex flex-col items-center justify-center font-bold transition-all ${
                              isMid
                                ? 'bg-[#F5C542] text-zinc-950 border-[#F5C542] scale-110 font-black'
                                : inRange
                                ? 'bg-amber-950/40 text-amber-200 border-amber-700'
                                : 'bg-zinc-800 text-zinc-600 border-zinc-800 opacity-40'
                            }`}
                          >
                            <span>{val}</span>
                            {isMid && <span className="text-[8px] uppercase">MID</span>}
                            {isLow && !isMid && <span className="text-[8px] uppercase text-emerald-400">LOW</span>}
                            {isHigh && !isMid && <span className="text-[8px] uppercase text-rose-400">HIGH</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* MODE 3: TWO POINTERS VISUALIZER (DAY 2) */}
              {concept.visualType === 'TWO_POINTERS' && (
                <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap py-2 font-mono">
                  {(concept.arrayData || []).map((val, idx) => {
                    const isLeft = idx === simIndex;
                    const isRight = idx === (concept.arrayData || []).length - 1 - simIndex;
                    const inRange = idx >= simIndex && idx <= (concept.arrayData || []).length - 1 - simIndex;

                    return (
                      <div key={idx} className="flex flex-col items-center gap-1">
                        <span className="text-[9px] text-zinc-500">[{idx}]</span>
                        <div
                          className={`w-12 h-14 rounded-2xl flex flex-col items-center justify-center border-2 transition-all ${
                            isLeft || isRight
                              ? 'bg-[#F5C542] text-zinc-950 border-[#F5C542] font-black scale-105'
                              : inRange
                              ? 'bg-zinc-800 text-zinc-300 border-zinc-700'
                              : 'bg-zinc-900 text-zinc-600 border-zinc-800 opacity-40'
                          }`}
                        >
                          <span>{val}</span>
                          {isLeft && <span className="text-[8px] font-bold">L</span>}
                          {isRight && !isLeft && <span className="text-[8px] font-bold">R</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* MODE 4: 2D MATRIX VISUALIZER (DAY 4) */}
              {concept.visualType === 'MATRIX_2D' && (
                <div className="space-y-4">
                  <div className="text-center text-xs font-mono text-zinc-400">
                    3x3 2D Matrix Storage (Row-Major Order)
                  </div>
                  <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                    {(concept.gridData || []).map((row, rIdx) =>
                      row.map((val, cIdx) => {
                        const isActive = matrixCell.r === rIdx && matrixCell.c === cIdx;
                        return (
                          <div
                            key={`${rIdx}-${cIdx}`}
                            className={`p-4 rounded-2xl border-2 font-mono flex flex-col items-center justify-center transition-all duration-300 ${
                              isActive
                                ? 'bg-[#F5C542] text-zinc-950 border-[#F5C542] shadow-lg shadow-amber-500/20 scale-105 font-black'
                                : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                            }`}
                          >
                            <span className="text-xs font-bold">({rIdx},{cIdx})</span>
                            <span className="text-base font-extrabold mt-0.5">{val}</span>
                            {isActive && <span className="text-[8px] font-bold uppercase mt-1 text-zinc-950">ACTIVE</span>}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* MODE 5: SLIDING WINDOW VISUALIZER (DAY 3) */}
              {concept.visualType === 'SLIDING_WINDOW' && (
                <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap py-2 font-mono">
                  {(concept.arrayData || []).map((val, idx) => {
                    const isActive = idx === simIndex % (concept.arrayData || []).length;
                    return (
                      <div
                        key={idx}
                        className={`w-12 h-14 rounded-2xl flex flex-col items-center justify-center border-2 transition-all ${
                          isActive ? 'bg-[#F5C542] text-zinc-950 border-[#F5C542] font-extrabold scale-105' : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                        }`}
                      >
                        <span>{val}</span>
                        {isActive && <span className="text-[8px] font-bold">L/R</span>}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* MODE 6: LINKED LIST VISUALIZER */}
              {concept.visualType === 'LINKED_LIST' && (
                <div className="flex items-center justify-center gap-3 overflow-x-auto py-4">
                  {(concept.nodesList || []).map((nd, idx) => {
                    const isActive = idx === simIndex % (concept.nodesList || []).length;
                    return (
                      <div key={idx} className="flex items-center gap-3 shrink-0">
                        <div className={`p-4 rounded-2xl border-2 font-mono text-xs transition-all ${
                          isActive ? 'bg-[#F5C542] text-zinc-950 border-[#F5C542] font-bold scale-105' : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                        }`}>
                          <div>Addr: {nd.addr}</div>
                          <div className="text-sm font-extrabold my-1">Val: {nd.val}</div>
                          <div className="text-[10px] text-zinc-400">Next: {nd.next}</div>
                        </div>
                        {idx < (concept.nodesList || []).length - 1 && <span className="text-amber-400 font-mono font-bold">→</span>}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* MODE 7: TREE GRAPH VISUALIZER */}
              {concept.visualType === 'TREE_GRAPH' && (
                <div className="flex flex-col items-center gap-3 py-2 font-mono text-xs">
                  {(concept.treeNodes || []).map((tn, idx) => {
                    const isActive = idx === simIndex % (concept.treeNodes || []).length;
                    return (
                      <div
                        key={tn.id}
                        className={`px-5 py-2.5 rounded-2xl border-2 transition-all ${
                          isActive ? 'bg-[#F5C542] text-zinc-950 border-[#F5C542] font-bold scale-105' : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                        }`}
                      >
                        {tn.val} {isActive && '● VISITING'}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* MODE 8: B-TREE INDEX VISUALIZER */}
              {concept.visualType === 'B_TREE_INDEX' && (
                <div className="space-y-2 py-2 font-mono text-xs">
                  {(concept.dbPages || []).map((pg, idx) => {
                    const isActive = idx === simIndex % (concept.dbPages || []).length;
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-2xl border-2 flex items-center justify-between transition-all ${
                          isActive ? 'bg-[#F5C542] text-zinc-950 border-[#F5C542] font-bold scale-102' : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                        }`}
                      >
                        <span>[{pg.type}] {pg.name}</span>
                        {isActive && <span className="text-[10px] font-extrabold uppercase">● INDEX MATCH</span>}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* MODE 9: SYSTEM DESIGN HASH RING VISUALIZER */}
              {concept.visualType === 'HASH_RING' && (
                <div className="grid grid-cols-2 gap-3 py-2 font-mono text-xs">
                  {(concept.clusterNodes || []).map((cn, idx) => {
                    const isActive = idx === simIndex % (concept.clusterNodes || []).length;
                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-2xl border-2 transition-all ${
                          isActive ? 'bg-[#F5C542] text-zinc-950 border-[#F5C542] font-bold' : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                        }`}
                      >
                        <div>{cn.name}</div>
                        <div className="text-[10px] text-zinc-400 mt-1">Ring Angle: {cn.angle}°</div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* MODE 10: JWT TOKEN VISUALIZER */}
              {concept.visualType === 'JWT_TOKEN' && (
                <div className="space-y-2 py-2 font-mono text-xs">
                  {(concept.jwtParts || []).map((jp, idx) => {
                    const isActive = idx === simIndex % (concept.jwtParts || []).length;
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-2xl border-2 transition-all ${
                          isActive ? 'bg-[#F5C542] text-zinc-950 border-[#F5C542] font-bold' : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                        }`}
                      >
                        <div className="font-extrabold uppercase">{jp.part}</div>
                        <div className="text-[11px] text-zinc-400 mt-0.5 truncate">{jp.val}</div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* MODE 11: DATABASE NORMALIZATION (1NF, 2NF, 3NF) VISUALIZER */}
              {concept.visualType === 'NORMALIZATION' && (
                <div className="space-y-3 py-2 font-mono text-xs">
                  {[
                    { form: 'UNNORMALIZED TABLE', desc: 'Repeating column groups & non-atomic multi-valued attributes.', table: 'Students(id, name, courses)' },
                    { form: '1NF (FIRST NORMAL FORM)', desc: 'Atomic column values & unique primary key established.', table: 'Enrollments(student_id, course_name)' },
                    { form: '2NF (SECOND NORMAL FORM)', desc: 'Eliminated partial dependencies on composite primary key.', table: 'Students(id, name) + Courses(id, title)' },
                    { form: '3NF (THIRD NORMAL FORM)', desc: 'Eliminated transitive dependencies (non-prime -> non-prime).', table: 'Students + Courses + Enrollments(s_id, c_id, grade)' }
                  ].map((norm, idx) => {
                    const isActive = idx === simIndex % 4;
                    return (
                      <div
                        key={norm.form}
                        className={`p-3.5 rounded-2xl border-2 transition-all ${
                          isActive ? 'bg-[#F5C542] text-zinc-950 border-[#F5C542] font-extrabold scale-102 shadow-lg shadow-amber-500/10' : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold">{norm.form}</span>
                          {isActive && <span className="text-[9px] bg-zinc-950 text-[#F5C542] px-2 py-0.5 rounded-full uppercase">DECOMPOSITION STEP</span>}
                        </div>
                        <p className="text-[11px] opacity-80 mt-1">{norm.desc}</p>
                        <div className="text-[10px] font-mono text-amber-400 mt-1 bg-zinc-950/60 p-2 rounded-xl">
                          Normalized Schema: {norm.table}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* MODE 12: SQL JOIN VISUALIZER */}
              {concept.visualType === 'SQL_JOIN' && (
                <div className="space-y-3 py-2 font-mono text-xs">
                  {[
                    { join: 'TABLE A (Users)', data: 'id: 1 (Alice), id: 2 (Bob), id: 3 (Charlie)' },
                    { join: 'TABLE B (Orders)', data: 'user_id: 1 ($100), user_id: 2 ($50)' },
                    { join: 'JOIN PREDICATE', data: 'Users.user_id = Orders.user_id' },
                    { join: 'INNER JOIN RESULT', data: '2 Matched Rows: (Alice -> $100), (Bob -> $50)' }
                  ].map((j, idx) => {
                    const isActive = idx === simIndex % 4;
                    return (
                      <div key={j.join} className={`p-3.5 rounded-2xl border-2 transition-all ${isActive ? 'bg-[#F5C542] text-zinc-950 border-[#F5C542] font-bold' : 'bg-zinc-800 text-zinc-300 border-zinc-700'}`}>
                        <div className="font-extrabold">{j.join}</div>
                        <div className="text-[11px] opacity-80 mt-0.5">{j.data}</div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* MODE 13: ACID TRANSACTION VISUALIZER */}
              {concept.visualType === 'ACID_TRANSACTION' && (
                <div className="grid grid-cols-2 gap-3 py-2 font-mono text-xs">
                  {[
                    { prop: 'A - ATOMICITY', desc: 'All-or-Nothing execution with automatic rollback.' },
                    { prop: 'C - CONSISTENCY', desc: 'Valid state transitions satisfying all DB constraints.' },
                    { prop: 'I - ISOLATION', desc: 'Concurrent transactions do not corrupt execution states.' },
                    { prop: 'D - DURABILITY', desc: 'Committed transactions survive crashes (WAL write).' }
                  ].map((acid, idx) => {
                    const isActive = idx === simIndex % 4;
                    return (
                      <div key={acid.prop} className={`p-3.5 rounded-2xl border-2 transition-all ${isActive ? 'bg-[#F5C542] text-zinc-950 border-[#F5C542] font-bold' : 'bg-zinc-800 text-zinc-300 border-zinc-700'}`}>
                        <div className="font-extrabold">{acid.prop}</div>
                        <div className="text-[10px] opacity-80 mt-1">{acid.desc}</div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* MODE 14: REDIS CACHE VISUALIZER */}
              {concept.visualType === 'REDIS_CACHE' && (
                <div className="space-y-3 py-2 font-mono text-xs">
                  {[
                    { stage: '1. CLIENT REQUEST', desc: 'GET /api/user/101' },
                    { stage: '2. REDIS LOOKUP', desc: 'Checking key user:101 in RAM Cache...' },
                    { stage: '3. CACHE MISS -> DB QUERY', desc: 'Fetching from SQL database (45ms)' },
                    { stage: '4. CACHE WRITE & RETURN', desc: 'Saved to Redis (TTL 3600s). Returned to client (<2ms next time)!' }
                  ].map((c, idx) => {
                    const isActive = idx === simIndex % 4;
                    return (
                      <div key={c.stage} className={`p-3.5 rounded-2xl border-2 transition-all ${isActive ? 'bg-[#F5C542] text-zinc-950 border-[#F5C542] font-bold' : 'bg-zinc-800 text-zinc-300 border-zinc-700'}`}>
                        <div className="font-extrabold">{c.stage}</div>
                        <div className="text-[11px] opacity-80 mt-0.5">{c.desc}</div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* MODE 15: SYSTEM ARCHITECTURE VISUALIZER */}
              {concept.visualType === 'SYSTEM_ARCHITECTURE' && (
                <div className="space-y-3 py-2 font-mono text-xs">
                  {[
                    { node: '1. CLIENT REQUEST', desc: 'HTTPS Request from Web/Mobile client' },
                    { node: '2. LOAD BALANCER', desc: 'Nginx Layer 7 Round-Robin distribution' },
                    { node: '3. API GATEWAY', desc: 'Authentication, Rate Limiting & Service Routing' },
                    { node: '4. MICROSERVICES & DB', desc: 'Stateless Service -> Distributed DB / Redis' }
                  ].map((sa, idx) => {
                    const isActive = idx === simIndex % 4;
                    return (
                      <div key={sa.node} className={`p-3.5 rounded-2xl border-2 transition-all ${isActive ? 'bg-[#F5C542] text-zinc-950 border-[#F5C542] font-bold' : 'bg-zinc-800 text-zinc-300 border-zinc-700'}`}>
                        <div className="font-extrabold">{sa.node}</div>
                        <div className="text-[11px] opacity-80 mt-0.5">{sa.desc}</div>
                      </div>
                    );
                  })}
                </div>
              )}


              {/* Simulation Trace Log */}
              <div className="space-y-1.5 text-[11px] font-mono bg-zinc-950 p-3 rounded-xl max-h-32 overflow-y-auto border border-zinc-800">
                {(simulationLog || []).map((log, i) => (
                  <div key={i} className="text-zinc-300">
                    <span className="text-amber-500 mr-1.5">❯</span>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {concept.hasSimulation && (
            <div className="flex items-center justify-between">
              <button
                onClick={runConceptSimulation}
                disabled={isSimulating}
                className="bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs py-3 px-6 rounded-full shadow-pill transition-all inline-flex items-center gap-2 disabled:opacity-60"
              >
                <Play size={14} className="fill-zinc-950" />
                <span>{isSimulating ? 'Simulating...' : `Simulate Day ${currentDayNum}`}</span>
              </button>

              <button onClick={() => goToStep(3)} className="text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                Next: Code Snippet →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 3: TRY IT — Code Snippet ── */}
      {activeStep === 3 && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block">03 CODE IMPLEMENTATION</span>
            <h2 className="text-xl font-extrabold font-display text-zinc-900 dark:text-white">
              Day {currentDayNum}: {concept.title} Code
            </h2>
          </div>

          <div className="rounded-2xl overflow-hidden border border-zinc-800 shadow-sm">
            <div className="px-4 py-2.5 bg-zinc-950 text-[11px] font-mono text-amber-400 font-bold border-b border-zinc-800 flex justify-between">
              <span>day_{currentDayNum}_{(concept.title || '').toLowerCase().replace(/[^a-z0-9]/g, '_')}</span>
              <span className="text-zinc-500">Day {currentDayNum} Production Code</span>
            </div>
            <pre className="p-4 bg-zinc-900 text-zinc-100 font-mono text-xs overflow-x-auto leading-relaxed">{concept.codeSnippet}</pre>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => goToStep(4)}
              className="bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs py-3 px-6 rounded-full shadow-pill transition-all inline-flex items-center gap-1.5"
            >
              <span>Next: Take Concept Quiz →</span>
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 4: PROVE IT — Quiz ── */}
      {activeStep === 4 && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block">04 KNOWLEDGE PROOF</span>
            <h2 className="text-xl font-extrabold font-display text-zinc-900 dark:text-white">
              Day {currentDayNum} Quiz: {concept.title}
            </h2>
          </div>

          <h4 className="text-sm font-bold text-zinc-900 dark:text-white font-display">
            {concept.quizQuestion}
          </h4>

          <div className="space-y-3">
            {(concept.quizOptions || []).map(opt => (
              <button
                key={opt.id}
                onClick={() => !quizSubmitted && setSelectedOption(opt.id)}
                className={`w-full p-4 rounded-2xl border text-left text-xs font-medium transition-all flex items-start gap-3 ${
                  quizSubmitted && opt.correct
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-zinc-900 dark:text-white font-bold'
                    : quizSubmitted && selectedOption === opt.id && !opt.correct
                    ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-500 text-zinc-900 dark:text-white'
                    : selectedOption === opt.id
                    ? 'bg-amber-50 dark:bg-zinc-800 border-[#F5C542]'
                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50'
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 font-mono font-bold text-xs flex items-center justify-center shrink-0 text-zinc-800 dark:text-zinc-200">
                  {opt.id}
                </span>
                <span className="pt-1">{opt.text}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => { setQuizSubmitted(true); markComplete(4); }}
              disabled={!selectedOption || quizSubmitted}
              className="bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs py-3 px-6 rounded-full shadow-pill transition-all disabled:opacity-40"
            >
              {quizSubmitted ? 'Submitted' : 'Check Answer'}
            </button>

            {quizSubmitted && (
              <span className={`text-xs font-bold font-mono ${(concept.quizOptions || []).find(o => o.id === selectedOption)?.correct ? 'text-emerald-500' : 'text-rose-500'}`}>
                {(concept.quizOptions || []).find(o => o.id === selectedOption)?.correct ? '✓ Correct! Micro-lesson passed.' : '✗ Incorrect. Review concept intuition.'}
              </span>
            )}
          </div>

          {quizSubmitted && (
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
              <span className="text-xs text-zinc-500 font-mono">Day {currentDayNum} concept completed!</span>
              <button
                onClick={handleNextDay}
                className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs py-2.5 px-5 rounded-full hover:bg-[#F5C542] hover:text-zinc-950 transition-all inline-flex items-center gap-1.5 shadow-pill"
              >
                <span>Advance to Day {currentDayNum + 1} Concept →</span>
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default DailyConcept;
