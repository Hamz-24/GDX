import { useState, useEffect } from 'react';
import { Play, Sparkles, CheckCircle2, ArrowRight, BookOpen, Clock, ShieldCheck, Database, Cpu, Key, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { USER_PROFILE, CORE_GOALS, generatePersonalizedRoadmap } from '../constants/userProfile';

const STEPS = [
  { num: 1, key: 'understand', label: '01 UNDERSTAND' },
  { num: 2, key: 'see',        label: '02 SEE IT' },
  { num: 3, key: 'try',        label: '03 TRY IT' },
  { num: 4, key: 'prove',      label: '04 PROVE IT' },
];

/**
 * Dynamic Concept Generator for ANY Day and ANY Domain
 */
function getConceptForDayAndDomain(domainName, dayNum) {
  const roadmapWeeks = generatePersonalizedRoadmap(domainName, 4, 'Basic / Beginner');
  
  // Find topic matching dayNum across roadmap
  let foundTopic = `Day ${dayNum} Core Module`;
  let phaseTitle = domainName;
  
  for (const week of roadmapWeeks) {
    for (const d of week.days) {
      if (d.day === Number(dayNum)) {
        foundTopic = d.title.replace(`Day ${dayNum}: `, '');
        phaseTitle = week.title;
        break;
      }
    }
  }

  const dUpper = domainName.toUpperCase();

  // 1. DATA STRUCTURES CONCEPTS
  if (dUpper.includes('DATA') || dUpper.includes('DS')) {
    return {
      title: foundTopic,
      phase: phaseTitle,
      subtitle: `Master ${foundTopic} with linear execution efficiency and optimal space complexity.`,
      whyMatters: `${foundTopic} is a core algorithmic primitive used in high-performance software engineering.`,
      nodes: [`Node 1: Init`, `Node 2: Pointers`, `Node 3: Process`, `Node 4: Return`],
      codeSnippet: `# ${foundTopic} Implementation
def solve_day_${dayNum}(data_input):
    # Step 1: Initialize structural pointers
    left, right = 0, len(data_input) - 1
    result = []
    
    # Step 2: Iterate through inputs in O(N) time
    while left <= right:
        if data_input[left] <= data_input[right]:
            result.append(data_input[left])
            left += 1
        else:
            result.append(data_input[right])
            right -= 1
            
    return result`,
      quizQuestion: `What is the optimal Time Complexity for ${foundTopic}?`,
      quizOptions: [
        { id: 'A', text: 'O(N^2) time due to nested brute force iterations.' },
        { id: 'B', text: 'O(N) or O(log N) optimal linear/logarithmic execution.', correct: true },
        { id: 'C', text: 'O(2^N) exponential call stack overhead.' }
      ]
    };
  }

  // 2. DATABASE CONCEPTS
  if (dUpper.includes('DATABASE') || dUpper.includes('DB')) {
    return {
      title: foundTopic,
      phase: phaseTitle,
      subtitle: `Optimize queries, B-Tree leaf node traversals, and execution plans for ${foundTopic}.`,
      whyMatters: `Database indexing and SQL execution tuning transforms slow table scans into sub-millisecond lookups.`,
      nodes: [`Index Root`, `Internal Node`, `Leaf Page`, `Row ID`],
      codeSnippet: `-- ${foundTopic} SQL Query Optimization
EXPLAIN ANALYZE
SELECT id, user_id, status, created_at 
FROM production_logs 
WHERE status = 'ACTIVE' AND created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC 
LIMIT 50;`,
      quizQuestion: `How does ${foundTopic} impact query performance on a large database table?`,
      quizOptions: [
        { id: 'A', text: 'It forces a Sequential Full Table Scan across all disk pages.' },
        { id: 'B', text: 'It utilizes B-Tree indexes to jump directly to target row pages in O(log N) steps.', correct: true },
        { id: 'C', text: 'It temporarily locks the database until restarted.' }
      ]
    };
  }

  // 3. SYSTEM DESIGN CONCEPTS
  if (dUpper.includes('SYSTEM') || dUpper.includes('SYS')) {
    return {
      title: foundTopic,
      phase: phaseTitle,
      subtitle: `Design high-throughput, fault-tolerant distributed architectures for ${foundTopic}.`,
      whyMatters: `Scalable distributed design prevents single points of failure under millions of concurrent requests.`,
      nodes: [`Client App`, `Load Balancer`, `API Cluster`, `Cache Layer`],
      codeSnippet: `# ${foundTopic} Distributed Architecture
def route_incoming_request(request_payload):
    # Step 1: Generate hash key for request
    hash_key = hash(request_payload.user_id) % 360
    
    # Step 2: Route request to healthy cluster node
    target_node = consistent_hash_ring.get_nearest_node(hash_key)
    return target_node.execute(request_payload)`,
      quizQuestion: `What is the key architectural trade-off when implementing ${foundTopic}?`,
      quizOptions: [
        { id: 'A', text: 'Increasing network latency to guarantee absolute synchronous consistency (CAP Theorem).' },
        { id: 'B', text: 'Balancing Availability vs Consistency under network partitions.', correct: true },
        { id: 'C', text: 'Eliminating all server instances in favor of client-only processing.' }
      ]
    };
  }

  // 4. AUTHENTICATION CONCEPTS
  return {
    title: foundTopic,
    phase: phaseTitle,
    subtitle: `Implement stateless security, cryptographically signed tokens, and protection for ${foundTopic}.`,
    whyMatters: `Robust identity & access control shields your web APIs against XSS, CSRF, and token theft.`,
    nodes: [`Header`, `Payload`, `Signature`, 'HttpOnly Cookie'],
    codeSnippet: `// ${foundTopic} Security Middleware
function verifyAuthToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized access token' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = decodedUser;
    next();
  });
}`,
    quizQuestion: `What is the primary security benefit of ${foundTopic}?`,
    quizOptions: [
      { id: 'A', text: 'It prevents credential theft and enforces cryptographic signature verification.', correct: true },
      { id: 'B', text: 'It removes the need for password hashing algorithms.' },
      { id: 'C', text: 'It forces all client requests to run synchronously on a single thread.' }
    ]
  };
}

const DailyConcept = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Selected Domain & Day Number State
  const [selectedDomain, setSelectedDomain] = useState(location.state?.domain || USER_PROFILE.targetRole || 'DATA STRUCTURES');
  const [currentDayNum, setCurrentDayNum] = useState(location.state?.day || 3);

  // Dynamic Concept Data for active Domain and Day!
  const concept = getConceptForDayAndDomain(selectedDomain, currentDayNum);

  const [activeStep, setActiveStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  // Interactive Simulation State
  const [simIndex, setSimIndex] = useState(0);
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
  }, [selectedDomain, currentDayNum]);

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
    setSimulationLog([`Starting interactive simulation for Day ${currentDayNum}: ${concept.title}...`]);
    setSimIndex(0);

    let idx = 0;
    const interval = setInterval(() => {
      idx += 1;
      if (idx >= concept.nodes.length) {
        clearInterval(interval);
        setIsSimulating(false);
        markComplete(2);
        setSimulationLog(l => [...l, `✓ Simulation Complete: Processed all nodes for ${concept.title}!`]);
        return;
      }

      setSimIndex(idx);
      setSimulationLog(l => [
        ...l,
        `Step ${idx + 1}: Executed node "${concept.nodes[idx]}" -> Invariant Confirmed.`
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
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 transition-colors text-xs font-mono font-bold flex items-center gap-1"
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

      {/* Domain Switcher Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {CORE_GOALS.map(g => (
          <button
            key={g.id}
            onClick={() => setSelectedDomain(g.name)}
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
              Why Day {currentDayNum} ({concept.title}) Matters
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

      {/* ── STEP 2: SEE IT — Interactive Node Visualizer ── */}
      {activeStep === 2 && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block">02 INTERACTIVE DOM VISUALIZER</span>
            <h2 className="text-xl font-extrabold font-display text-zinc-900 dark:text-white">
              Day {currentDayNum}: Interactive Simulation
            </h2>
          </div>

          {/* Interactive Cards Grid */}
          <div className="p-6 rounded-2xl bg-zinc-900 text-white space-y-6">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400 border-b border-zinc-800 pb-3">
              <span>Day Topic: <strong className="text-[#F5C542]">{concept.title}</strong></span>
              <span>Node Execution: <strong className="text-emerald-400">Step {simIndex + 1} / {concept.nodes.length}</strong></span>
            </div>

            {/* Visual Node Box Cards */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
              {concept.nodes.map((nodeLabel, idx) => {
                const isActive = idx === simIndex;
                return (
                  <div key={idx} className="flex flex-col items-center gap-2">
                    <span className="text-[10px] font-mono text-zinc-500">Step {idx + 1}</span>
                    <div
                      className={`px-4 py-3 sm:px-5 sm:py-4 rounded-2xl flex flex-col items-center justify-center font-mono font-extrabold text-xs sm:text-sm border-2 transition-all duration-300 ${
                        isActive
                          ? 'bg-[#F5C542] text-zinc-950 border-[#F5C542] shadow-lg shadow-amber-500/20 scale-105'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}
                    >
                      <span>{nodeLabel}</span>
                      {isActive && <span className="text-[8px] font-bold uppercase tracking-tighter text-zinc-950 mt-1">● EXECUTING</span>}
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
              <span>day_{currentDayNum}_{concept.title.toLowerCase().replace(/[^a-z0-0]/g, '_')}</span>
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
