import { useState, useEffect } from 'react';
import { Play, Sparkles, CheckCircle2, ArrowRight, BookOpen, Clock, ShieldCheck, Database, Cpu, Key, ChevronLeft, ChevronRight, Grid, Network, Layers, FileCode } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { USER_PROFILE, generatePersonalizedRoadmap } from '../constants/userProfile';
import { useAuth } from '../context/AuthContext';

/**
 * Dynamic Concept Generator for ANY Day and ANY Domain
 * Returns custom visualizer types: MATRIX_2D, SLIDING_WINDOW, LINKED_LIST, TREE_GRAPH, B_TREE_INDEX, HASH_RING, JWT_TOKEN
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

  // Detect visualizer type based on topic title
  let visualType = 'SLIDING_WINDOW';
  if (topicLower.includes('matrix') || topicLower.includes('2d') || topicLower.includes('grid')) {
    visualType = 'MATRIX_2D';
  } else if (topicLower.includes('linked list') || topicLower.includes('stack') || topicLower.includes('queue')) {
    visualType = 'LINKED_LIST';
  } else if (topicLower.includes('tree') || topicLower.includes('graph') || topicLower.includes('dfs') || topicLower.includes('bfs') || topicLower.includes('bst')) {
    visualType = 'TREE_GRAPH';
  } else if (dUpper.includes('DATABASE') || dUpper.includes('DB')) {
    visualType = 'B_TREE_INDEX';
  } else if (dUpper.includes('SYSTEM') || dUpper.includes('SYS')) {
    visualType = 'HASH_RING';
  } else if (dUpper.includes('AUTH') || dUpper.includes('AUTHENTICATION')) {
    visualType = 'JWT_TOKEN';
  }

  // 1. 2D MATRIX VISUALIZER DATA
  if (visualType === 'MATRIX_2D') {
    return {
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

  // 2. LINKED LIST VISUALIZER DATA
  if (visualType === 'LINKED_LIST') {
    return {
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

  // 3. TREE / GRAPH VISUALIZER DATA
  if (visualType === 'TREE_GRAPH') {
    return {
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

  // 4. DATABASE B-TREE INDEX DATA
  if (visualType === 'B_TREE_INDEX') {
    return {
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

  // 5. SYSTEM DESIGN HASH RING DATA
  if (visualType === 'HASH_RING') {
    return {
      visualType: 'HASH_RING',
      title: foundTopic,
      phase: phaseTitle,
      subtitle: `Distribute incoming request hashes across a 360° Consistent Hashing Ring of server nodes.`,
      whyMatters: `Consistent hashing minimizes key remapping when scaling out server clusters.`,
      clusterNodes: [
        { name: 'Server Alpha (0°)', angle: 0 },
        { name: 'Server Beta (120°)', angle: 120 },
        { name: 'Server Gamma (240°)', angle: 240 },
        { name: 'Request Hash (145°)', angle: 145 }
      ],
      codeSnippet: `# Consistent Hashing Ring Routing
import hashlib

def route_key(user_id, ring_nodes):
    hash_val = int(hashlib.md5(user_id.encode()).hexdigest(), 16) % 360
    for angle, node in sorted(ring_nodes):
        if hash_val <= angle:
            return node
    return ring_nodes[0][1]`,
      quizQuestion: `What happens when a new server node is added to a Consistent Hashing ring?`,
      quizOptions: [
        { id: 'A', text: 'Only a fraction (1/N) of keys are remapped, preserving cache hit ratios.', correct: true },
        { id: 'B', text: '100% of all keys in the database must be re-hashed.' },
        { id: 'C', text: 'The load balancer drops all active connections.' }
      ]
    };
  }

  // 6. AUTHENTICATION JWT DATA
  if (visualType === 'JWT_TOKEN') {
    return {
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

  // DEFAULT 1D SLIDING WINDOW / ARRAY DATA
  return {
    visualType: 'SLIDING_WINDOW',
    title: foundTopic,
    phase: phaseTitle,
    subtitle: `Maintain left & right pointers across a 1D array to solve subarray problems in linear O(N) time.`,
    whyMatters: `Sliding Window avoids nested O(N^2) loops by adding incoming and subtracting outgoing elements.`,
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
  const [currentDayNum, setCurrentDayNum] = useState(location.state?.day || 4);

  // Dynamic Concept Data for active Domain and Day!
  const concept = getConceptForDayAndDomain(selectedDomain, currentDayNum);

  const [activeStep, setActiveStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  // Interactive Simulation State
  const [simIndex, setSimIndex] = useState(0);
  const [matrixCell, setMatrixCell] = useState({ r: 0, c: 0 });
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
  }, [selectedDomain, currentDayNum]);

  const markComplete = (stepNum) => {
    setCompletedSteps(prev => new Set([...prev, stepNum]));
  };

  const goToStep = (num) => {
    markComplete(activeStep);
    setActiveStep(num);
  };

  // Run Custom Simulation Based on Visualizer Type
  const runConceptSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimulationLog([`Starting interactive simulation for Day ${currentDayNum}: ${concept.title}...`]);

    if (concept.visualType === 'MATRIX_2D') {
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

    // Default Step Simulation
    let idx = 0;
    setSimIndex(0);
    const maxSteps = concept.gridData ? 9 : (concept.nodesList ? concept.nodesList.length : (concept.treeNodes ? concept.treeNodes.length : (concept.dbPages ? concept.dbPages.length : (concept.jwtParts ? concept.jwtParts.length : 6))));

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
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 rounded-full text-xs font-mono font-bold">
              DAILY MICRO-LESSON · DAY {currentDayNum}
            </span>
            <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full text-xs font-mono font-bold">
              {selectedDomain}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold font-display text-zinc-900 dark:text-white tracking-tight">
            Day {currentDayNum}: {concept.title}
          </h1>
          <p className="text-xs text-zinc-500 font-medium">
            {concept.subtitle}
          </p>
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
              <span>Next: See Interactive Visual →</span>
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

          {/* Interactive Visual Container */}
          <div className="p-6 rounded-2xl bg-zinc-900 text-white space-y-6">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400 border-b border-zinc-800 pb-3">
              <span className="flex items-center gap-1.5">
                <Grid size={14} className="text-[#F5C542]" />
                Mode: <strong className="text-[#F5C542]">{concept.visualType}</strong>
              </span>
              <span>
                {concept.visualType === 'MATRIX_2D'
                  ? `Active Cell: (${matrixCell.r}, ${matrixCell.c}) | RAM Offset = ${matrixCell.r * 3 + matrixCell.c}`
                  : `Step ${simIndex + 1}`}
              </span>
            </div>

            {/* MODE 1: 2D MATRIX VISUALIZER */}
            {concept.visualType === 'MATRIX_2D' && (
              <div className="space-y-4">
                <div className="text-center text-xs font-mono text-zinc-400">
                  3x3 2D Matrix Storage (Row-Major Order)
                </div>
                <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                  {concept.gridData.map((row, rIdx) =>
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

            {/* MODE 2: LINKED LIST VISUALIZER */}
            {concept.visualType === 'LINKED_LIST' && (
              <div className="flex items-center justify-center gap-3 overflow-x-auto py-4">
                {concept.nodesList.map((nd, idx) => {
                  const isActive = idx === simIndex % concept.nodesList.length;
                  return (
                    <div key={idx} className="flex items-center gap-3 shrink-0">
                      <div className={`p-4 rounded-2xl border-2 font-mono text-xs transition-all ${
                        isActive ? 'bg-[#F5C542] text-zinc-950 border-[#F5C542] font-bold scale-105' : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                      }`}>
                        <div>Addr: {nd.addr}</div>
                        <div className="text-sm font-extrabold my-1">Val: {nd.val}</div>
                        <div className="text-[10px] text-zinc-400">Next: {nd.next}</div>
                      </div>
                      {idx < concept.nodesList.length - 1 && <span className="text-amber-400 font-mono font-bold">→</span>}
                    </div>
                  );
                })}
              </div>
            )}

            {/* MODE 3: TREE GRAPH VISUALIZER */}
            {concept.visualType === 'TREE_GRAPH' && (
              <div className="flex flex-col items-center gap-3 py-2 font-mono text-xs">
                {concept.treeNodes.map((tn, idx) => {
                  const isActive = idx === simIndex % concept.treeNodes.length;
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

            {/* MODE 4: B-TREE INDEX VISUALIZER */}
            {concept.visualType === 'B_TREE_INDEX' && (
              <div className="space-y-2 py-2 font-mono text-xs">
                {concept.dbPages.map((pg, idx) => {
                  const isActive = idx === simIndex % concept.dbPages.length;
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

            {/* MODE 5: SYSTEM DESIGN HASH RING VISUALIZER */}
            {concept.visualType === 'HASH_RING' && (
              <div className="grid grid-cols-2 gap-3 py-2 font-mono text-xs">
                {concept.clusterNodes.map((cn, idx) => {
                  const isActive = idx === simIndex % concept.clusterNodes.length;
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

            {/* MODE 6: JWT TOKEN VISUALIZER */}
            {concept.visualType === 'JWT_TOKEN' && (
              <div className="space-y-2 py-2 font-mono text-xs">
                {concept.jwtParts.map((jp, idx) => {
                  const isActive = idx === simIndex % concept.jwtParts.length;
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

            {/* MODE 7: DEFAULT 1D SLIDING WINDOW ARRAY */}
            {concept.visualType === 'SLIDING_WINDOW' && (
              <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap py-2 font-mono">
                {concept.arrayData.map((val, idx) => {
                  const isActive = idx === simIndex % concept.arrayData.length;
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

            {/* Simulation Trace Log */}
            <div className="space-y-1.5 text-[11px] font-mono bg-zinc-950 p-3 rounded-xl max-h-32 overflow-y-auto border border-zinc-800">
              {simulationLog.map((log, i) => (
                <div key={i} className="text-zinc-300">
                  <span className="text-amber-500 mr-1.5">❯</span>
                  {log}
                </div>
              ))}
            </div>
          </div>

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
              <span>day_{currentDayNum}_{concept.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}</span>
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
            {concept.quizOptions.map(opt => (
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
              <span className={`text-xs font-bold font-mono ${concept.quizOptions.find(o => o.id === selectedOption)?.correct ? 'text-emerald-500' : 'text-rose-500'}`}>
                {concept.quizOptions.find(o => o.id === selectedOption)?.correct ? '✓ Correct! Micro-lesson passed.' : '✗ Incorrect. Review concept intuition.'}
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
