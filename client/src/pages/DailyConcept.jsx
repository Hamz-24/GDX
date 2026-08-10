import { useState } from 'react';
import { Play, Sparkles, CheckCircle2, ArrowRight, BookOpen, Clock, ShieldCheck, Database, Cpu, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { USER_PROFILE, CORE_GOALS } from '../constants/userProfile';

const DOMAIN_LESSONS = {
  'DATA STRUCTURES': {
    title: 'Sliding Window Pattern',
    subtitle: 'Optimize subarray & substring problems from O(N²) nested loops to linear O(N) execution time.',
    whyMatters: 'Subarray problems appear in over 80% of technical coding evaluations.',
    arrayData: [2, 1, 5, 1, 3, 2],
    codeSnippet: `def max_sub_array_of_size_k(k, arr):
    max_sum = 0
    window_sum = 0
    window_start = 0

    for window_end in range(len(arr)):
        window_sum += arr[window_end]  # Add right element
        if window_end >= k - 1:
            max_sum = max(max_sum, window_sum)
            window_sum -= arr[window_start]  # Subtract left element
            window_start += 1  # Slide left forward
    return max_sum`,
    quizQuestion: 'Why does the Sliding Window pattern reduce time complexity from O(N²) to O(N)?',
    quizOptions: [
      { id: 'A', text: 'It sorts the input array in logarithmic time.' },
      { id: 'B', text: 'Each element is added and removed from running sum at most once by left & right pointers.', correct: true },
      { id: 'C', text: 'It creates nested loops that run in parallel.' }
    ]
  },
  'DATABASE': {
    title: 'B-Tree Indexing & Execution Plans',
    subtitle: 'Understand how B-Tree indexes avoid full table scans by traversing balanced tree nodes in O(log N) time.',
    whyMatters: 'Database index optimization transforms 1.2s slow queries into 4ms sub-millisecond responses.',
    arrayData: [12, 25, 40, 68, 85, 99],
    codeSnippet: `-- Create B-Tree Composite Index
CREATE INDEX idx_user_orders ON orders (user_id, created_at DESC);

-- Profile Query Execution Plan
EXPLAIN ANALYZE
SELECT * FROM orders 
WHERE user_id = 4821 
ORDER BY created_at DESC 
LIMIT 10;`,
    quizQuestion: 'What type of execution plan is produced when a query matches a B-Tree index column directly?',
    quizOptions: [
      { id: 'A', text: 'Sequential Scan (Full Table Read)' },
      { id: 'B', text: 'Index Scan or Index Only Scan via O(log N) node traversal', correct: true },
      { id: 'C', text: 'Memory Leak Overflow Scan' }
    ]
  },
  'SYSTEM DESIGN': {
    title: 'Consistent Hashing Ring Architecture',
    subtitle: 'Distribute requests evenly across servers without remapping all keys when nodes scale or fail.',
    whyMatters: 'Consistent hashing is the core scaling mechanism behind Cassandra, DynamoDB, and Redis Cluster.',
    arrayData: ['Node A', 'Node B', 'Node C', 'Node D'],
    codeSnippet: `# Consistent Hashing Virtual Node Placement
import hashlib

def get_server_node(request_key, ring_nodes):
    hash_val = int(hashlib.md5(request_key.encode()).hexdigest(), 16) % 360
    # Find nearest server node on 360° ring
    for node_angle, node_name in sorted(ring_nodes):
        if hash_val <= node_angle:
            return node_name
    return ring_nodes[0][1]`,
    quizQuestion: 'What happens in Consistent Hashing when a new server node is added to the cluster ring?',
    quizOptions: [
      { id: 'A', text: 'All keys in the cluster must be completely remapped.' },
      { id: 'B', text: 'Only K/N keys are remapped to the new node, preserving 90%+ cache hits.', correct: true },
      { id: 'C', text: 'The load balancer crashes until restarted.' }
    ]
  },
  'AUTHENTICATION': {
    title: 'JWT Tokens & Refresh Token Rotation',
    subtitle: 'Implement stateless token authentication with short-lived access tokens and theft detection.',
    whyMatters: 'JWT refresh rotation prevents replay attacks and enables instant token revocation.',
    arrayData: ['Header', 'Payload', 'Signature', 'Refresh'],
    codeSnippet: `// Verify JWT Token Middleware
const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Token expired/tampered
    req.user = user;
    next();
  });
}`,
    quizQuestion: 'Why is it recommended to store Refresh Tokens in HttpOnly cookies instead of LocalStorage?',
    quizOptions: [
      { id: 'A', text: 'HttpOnly cookies cannot be read or stolen by malicious JavaScript (XSS attacks).', correct: true },
      { id: 'B', text: 'LocalStorage only holds up to 10 bytes of data.' },
      { id: 'C', text: 'HttpOnly cookies automatically disable server authentication.' }
    ]
  }
};

const STEPS = [
  { num: 1, key: 'understand', label: '01 UNDERSTAND' },
  { num: 2, key: 'see',        label: '02 SEE IT' },
  { num: 3, key: 'try',        label: '03 TRY IT' },
  { num: 4, key: 'prove',      label: '04 PROVE IT' },
];

const DailyConcept = () => {
  const navigate = useNavigate();

  // Active Domain Switcher (Defaulting to user profile domain)
  const [selectedDomain, setSelectedDomain] = useState(USER_PROFILE.targetRole || 'DATA STRUCTURES');
  const activeLesson = DOMAIN_LESSONS[selectedDomain] || DOMAIN_LESSONS['DATA STRUCTURES'];

  const [activeStep, setActiveStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  // Interactive Simulation State
  const [simIndex, setSimIndex] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLog, setSimulationLog] = useState([`Initialized ${selectedDomain} concept module.`]);

  // Quiz state
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const markComplete = (stepNum) => {
    setCompletedSteps(prev => new Set([...prev, stepNum]));
  };

  const goToStep = (num) => {
    markComplete(activeStep);
    setActiveStep(num);
  };

  const runConceptSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimulationLog([`Starting interactive ${selectedDomain} simulation...`]);
    setSimIndex(0);

    let idx = 0;
    const interval = setInterval(() => {
      idx += 1;
      if (idx >= activeLesson.arrayData.length) {
        clearInterval(interval);
        setIsSimulating(false);
        markComplete(2);
        setSimulationLog(l => [...l, `✓ Simulation Complete: All ${selectedDomain} nodes processed!`]);
        return;
      }

      setSimIndex(idx);
      setSimulationLog(l => [
        ...l,
        `Step ${idx}: Traversed node "${activeLesson.arrayData[idx]}" -> Optimal State Confirmed.`
      ]);
    }, 800);
  };

  const askInMentor = () => {
    navigate('/mentor', {
      state: {
        dayTopic: activeLesson.title,
        prompt: `Explain ${activeLesson.title} in ${selectedDomain}. Provide step-by-step logic, code, and edge cases.`,
        goal: selectedDomain
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 font-sans pb-16">

      {/* Header Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 rounded-full text-xs font-mono font-bold">
              DAILY MICRO-LESSON · 6 MIN
            </span>
            <span className="px-3 py-1 bg-[#F5C542] text-zinc-950 rounded-full text-xs font-mono font-extrabold">
              {selectedDomain}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold font-display text-zinc-900 dark:text-white tracking-tight">
            {activeLesson.title}
          </h1>
          <p className="text-xs text-zinc-500 font-medium">
            {activeLesson.subtitle}
          </p>
        </div>

        <button
          onClick={askInMentor}
          className="bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs py-3 px-5 rounded-full shadow-pill transition-all shrink-0 flex items-center justify-center gap-2 self-start md:self-center"
        >
          <Sparkles size={16} /> Explain with AI
        </button>
      </div>

      {/* Domain Switcher Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {CORE_GOALS.map(g => (
          <button
            key={g.id}
            onClick={() => {
              setSelectedDomain(g.name);
              setActiveStep(1);
              setQuizSubmitted(false);
              setSelectedOption(null);
            }}
            className={`px-4 py-2 rounded-full text-xs font-mono font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedDomain === g.name
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
                : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            {g.name === 'DATA STRUCTURES' && <Cpu size={13} className="text-[#F5C542]" />}
            {g.name === 'DATABASE' && <Database size={13} className="text-[#F5C542]" />}
            {g.name === 'SYSTEM DESIGN' && <Sparkles size={13} className="text-[#F5C542]" />}
            {g.name === 'AUTHENTICATION' && <Key size={13} className="text-[#F5C542]" />}
            <span>{g.name}</span>
          </button>
        ))}
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
              Why {activeLesson.title} Matters
            </h2>
          </div>

          <div className="space-y-4 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">
              {activeLesson.whyMatters}
            </p>

            <p>
              {activeLesson.subtitle}
            </p>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 font-mono text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <div>1. Core Invariant: Maintain structural guarantees.</div>
              <div>2. Time Complexity Target: Achieve optimal linear or logarithmic steps.</div>
              <div>3. Production Impact: Prevents system bottlenecks under load.</div>
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

      {/* ── STEP 2: SEE IT — Interactive Domain Simulation ── */}
      {activeStep === 2 && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block">02 INTERACTIVE DOM VISUALIZER</span>
            <h2 className="text-xl font-extrabold font-display text-zinc-900 dark:text-white">
              {selectedDomain}: Interactive Simulation
            </h2>
          </div>

          {/* Interactive Cards Grid */}
          <div className="p-6 rounded-2xl bg-zinc-900 text-white space-y-6">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400 border-b border-zinc-800 pb-3">
              <span>Active Target Domain: <strong className="text-[#F5C542]">{selectedDomain}</strong></span>
              <span>Active Node Index: <strong className="text-emerald-400">{simIndex}</strong></span>
            </div>

            {/* Visual Node Box Cards */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
              {activeLesson.arrayData.map((val, idx) => {
                const isActive = idx === simIndex;
                return (
                  <div key={idx} className="flex flex-col items-center gap-2">
                    <span className="text-[10px] font-mono text-zinc-500">Node {idx + 1}</span>
                    <div
                      className={`px-4 py-3 sm:px-5 sm:py-4 rounded-2xl flex flex-col items-center justify-center font-mono font-extrabold text-xs sm:text-sm border-2 transition-all duration-300 ${
                        isActive
                          ? 'bg-[#F5C542] text-zinc-950 border-[#F5C542] shadow-lg shadow-amber-500/20 scale-105'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}
                    >
                      <span>{String(val)}</span>
                      {isActive && <span className="text-[8px] font-bold uppercase tracking-tighter text-zinc-950 mt-1">● ACTIVE</span>}
                    </div>
                  </div>
                );
              })}
            </div>

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
              <span>{isSimulating ? 'Simulating...' : `Simulate ${selectedDomain}`}</span>
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
              {selectedDomain}: Core Pattern Code
            </h2>
          </div>

          <div className="rounded-2xl overflow-hidden border border-zinc-800 shadow-sm">
            <div className="px-4 py-2.5 bg-zinc-950 text-[11px] font-mono text-amber-400 font-bold border-b border-zinc-800 flex justify-between">
              <span>{selectedDomain.toLowerCase().replace(' ', '_')}_implementation</span>
              <span className="text-zinc-500">Production Code</span>
            </div>
            <pre className="p-4 bg-zinc-900 text-zinc-100 font-mono text-xs overflow-x-auto leading-relaxed">{activeLesson.codeSnippet}</pre>
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
              {selectedDomain} Assessment Quiz
            </h2>
          </div>

          <h4 className="text-sm font-bold text-zinc-900 dark:text-white font-display">
            {activeLesson.quizQuestion}
          </h4>

          <div className="space-y-3">
            {activeLesson.quizOptions.map(opt => (
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
              <span className={`text-xs font-bold font-mono ${activeLesson.quizOptions.find(o => o.id === selectedOption)?.correct ? 'text-emerald-500' : 'text-rose-500'}`}>
                {activeLesson.quizOptions.find(o => o.id === selectedOption)?.correct ? '✓ Correct!' : '✗ Incorrect. Review concept intuition above.'}
              </span>
            )}
          </div>

          {quizSubmitted && (
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-zinc-500 font-mono">Daily concept micro-lesson completed!</span>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs py-2.5 px-5 rounded-full hover:bg-[#F5C542] hover:text-zinc-950 transition-all inline-flex items-center gap-1.5"
              >
                <span>Return to Dashboard</span>
                <ArrowRight size={13} />
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default DailyConcept;
