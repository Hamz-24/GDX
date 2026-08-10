import { useState } from 'react';
import { Play, Sparkles, CheckCircle2, ArrowRight, BookOpen, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { USER_PROFILE } from '../constants/userProfile';

const STEPS = [
  { num: 1, key: 'understand', label: '01 UNDERSTAND' },
  { num: 2, key: 'see',        label: '02 SEE IT' },
  { num: 3, key: 'try',        label: '03 TRY IT' },
  { num: 4, key: 'prove',      label: '04 PROVE IT' },
];

const ARRAY_DATA = [2, 1, 5, 1, 3, 2];

const QUIZ_OPTIONS = [
  { id: 'A', text: 'O(N^2) time complexity because of nested loop iterations.' },
  { id: 'B', text: 'O(N) time complexity because each element is visited at most twice by left & right pointers.', correct: true },
  { id: 'C', text: 'O(N log N) time complexity due to implicit array sorting.' },
];

const DailyConcept = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  // Sliding Window Interactive Animation State
  const [windowState, setWindowState] = useState({ left: 0, right: 0, sum: 2, targetK: 3 });
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLog, setSimulationLog] = useState(['Started window at index 0']);

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

  const runSlidingWindowSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimulationLog(['Initializing window at index 0...']);
    setWindowState({ left: 0, right: 0, sum: ARRAY_DATA[0], targetK: 3 });

    let L = 0;
    let currSum = ARRAY_DATA[0];

    const interval = setInterval(() => {
      setWindowState(prev => {
        let newR = prev.right + 1;
        if (newR >= ARRAY_DATA.length) {
          clearInterval(interval);
          setIsSimulating(false);
          markComplete(2);
          setSimulationLog(l => [...l, '✓ Simulation Complete: Processed entire array in O(N) time!']);
          return prev;
        }

        let newSum = prev.sum + ARRAY_DATA[newR];
        let newL = prev.left;
        if (newR - newL + 1 > prev.targetK) {
          newSum -= ARRAY_DATA[newL];
          newL += 1;
        }

        setSimulationLog(l => [
          ...l,
          `Slide Window -> Right pointer = ${newR} (Val: ${ARRAY_DATA[newR]}), Left pointer = ${newL}. Window Sum = ${newSum}`
        ]);

        return { ...prev, left: newL, right: newR, sum: newSum };
      });
    }, 900);
  };

  const askInMentor = () => {
    navigate('/mentor', {
      state: {
        dayTopic: 'Sliding Window Pattern & Subarray Optimization',
        prompt: `Explain the Sliding Window Pattern for Data Structures (Beginner). Show me how to solve Maximum Sum Subarray of size K in O(N) time.`,
        goal: USER_PROFILE.targetRole
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 font-sans pb-16">

      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 rounded-full text-xs font-mono font-bold">
              DAILY CONCEPT INGESTION · 6 MIN
            </span>
            <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full text-xs font-mono font-bold">
              GOAL: {USER_PROFILE.targetRole.toUpperCase()}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold font-display text-zinc-900 dark:text-white tracking-tight">
            Sliding Window Pattern
          </h1>
          <p className="text-xs text-zinc-500 font-medium">
            Optimize subarray and substring problems from $O(N^2)$ to $O(N)$ linear time.
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
              Why Sliding Window Matters
            </h2>
          </div>

          <div className="space-y-4 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">
            <p>
              Imagine finding the contiguous subarray of size $K=3$ with the maximum sum in an array of numbers. The brute force approach re-calculates the sum of every 3-element window from scratch, leading to nested loops and <strong className="text-zinc-900 dark:text-white font-bold">$O(N \times K)$ or $O(N^2)$ time complexity</strong>.
            </p>

            <p>
              The <strong className="text-zinc-900 dark:text-white font-bold">Sliding Window Pattern</strong> maintains a window defined by two pointers (<code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-mono">Left</code> and <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-mono">Right</code>). As the window slides right, you simply:
            </p>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 font-mono text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <div>1. Add the NEW incoming right element: <code className="font-bold">sum += arr[right]</code></div>
              <div>2. Subtract the OUTGOING left element: <code className="font-bold">sum -= arr[left]</code></div>
              <div>3. Slide left pointer: <code className="font-bold">left += 1</code></div>
            </div>

            <p>
              This turns duplicate calculations into constant $O(1)$ arithmetic updates per step, achieving an optimal overall <strong className="text-emerald-600 dark:text-emerald-400 font-bold">$O(N)$ linear execution time</strong>.
            </p>
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

      {/* ── STEP 2: SEE IT — Interactive Window Animation ── */}
      {activeStep === 2 && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block">02 INTERACTIVE DOM VISUALIZER</span>
            <h2 className="text-xl font-extrabold font-display text-zinc-900 dark:text-white">
              Watch the Window Slide in Real Time
            </h2>
            <p className="text-xs text-zinc-500">
              Array: <code className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">[2, 1, 5, 1, 3, 2]</code> · Target Window Size $K = 3$
            </p>
          </div>

          {/* Interactive Array Cards Grid */}
          <div className="p-6 rounded-2xl bg-zinc-900 text-white space-y-6">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400 border-b border-zinc-800 pb-3">
              <span>Window Sum: <strong className="text-[#F5C542] text-lg">{windowState.sum}</strong></span>
              <span>Left Index: <strong className="text-amber-400">{windowState.left}</strong> | Right Index: <strong className="text-emerald-400">{windowState.right}</strong></span>
            </div>

            {/* Array Boxes */}
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              {ARRAY_DATA.map((val, idx) => {
                const inWindow = idx >= windowState.left && idx <= windowState.right;
                const isLeft = idx === windowState.left;
                const isRight = idx === windowState.right;

                return (
                  <div key={idx} className="flex flex-col items-center gap-2">
                    <span className="text-[10px] font-mono text-zinc-500">[{idx}]</span>
                    <div
                      className={`w-11 h-13 sm:w-14 sm:h-16 rounded-2xl flex flex-col items-center justify-center font-mono font-extrabold text-sm sm:text-base border-2 transition-all duration-300 ${
                        inWindow
                          ? 'bg-[#F5C542] text-zinc-950 border-[#F5C542] shadow-lg shadow-amber-500/20 scale-105'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}
                    >
                      <span>{val}</span>
                      {isLeft && <span className="text-[8px] font-bold uppercase tracking-tighter text-zinc-950 mt-0.5">L</span>}
                      {isRight && !isLeft && <span className="text-[8px] font-bold uppercase tracking-tighter text-zinc-950 mt-0.5">R</span>}
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
              onClick={runSlidingWindowSimulation}
              disabled={isSimulating}
              className="bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs py-3 px-6 rounded-full shadow-pill transition-all inline-flex items-center gap-2 disabled:opacity-60"
            >
              <Play size={14} className="fill-zinc-950" />
              <span>{isSimulating ? 'Sliding Window...' : 'Simulate Window Slide'}</span>
            </button>

            <button onClick={() => goToStep(3)} className="text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
              Next: Code Snippet →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: TRY IT — Code ── */}
      {activeStep === 3 && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block">03 CODE IMPLEMENTATION</span>
            <h2 className="text-xl font-extrabold font-display text-zinc-900 dark:text-white">
              Python & C++ Sliding Window Implementation
            </h2>
          </div>

          <div className="rounded-2xl overflow-hidden border border-zinc-800 shadow-sm">
            <div className="px-4 py-2.5 bg-zinc-950 text-[11px] font-mono text-amber-400 font-bold border-b border-zinc-800 flex justify-between">
              <span>sliding_window_max_sum.py</span>
              <span className="text-zinc-500">O(N) Time · O(1) Space</span>
            </div>
            <pre className="p-4 bg-zinc-900 text-zinc-100 font-mono text-xs overflow-x-auto leading-relaxed">{`def max_sub_array_of_size_k(k, arr):
    max_sum = 0
    window_sum = 0
    window_start = 0

    for window_end in range(len(arr)):
        window_sum += arr[window_end]  # Add incoming element

        # Slide window if reached size K
        if window_end >= k - 1:
            max_sum = max(max_sum, window_sum)
            window_sum -= arr[window_start]  # Subtract outgoing element
            window_start += 1  # Slide window start forward

    return max_sum

# Test Example
print(max_sub_array_of_size_k(3, [2, 1, 5, 1, 3, 2]))  # Output: 9 (from [5, 1, 3])`}</pre>
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
              Concept Assessment Quiz
            </h2>
          </div>

          <h4 className="text-sm font-bold text-zinc-900 dark:text-white font-display">
            Why does the Sliding Window pattern reduce time complexity from $O(N^2)$ to $O(N)$?
          </h4>

          <div className="space-y-3">
            {QUIZ_OPTIONS.map(opt => (
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
              <span className={`text-xs font-bold font-mono ${selectedOption === 'B' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {selectedOption === 'B' ? '✓ Correct! Option B is right.' : `✗ Incorrect. The correct answer is B.`}
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
