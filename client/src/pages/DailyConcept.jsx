import { useState } from 'react';
import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STEPS = [
  { num: 1, key: 'understand', label: 'UNDERSTAND' },
  { num: 2, key: 'see',        label: 'SEE IT' },
  { num: 3, key: 'try',        label: 'TRY IT' },
  { num: 4, key: 'prove',      label: 'PROVE IT' },
];

const QUIZ_OPTIONS = [
  { id: 'A', text: 'The event immediately stops firing and is removed from the DOM.' },
  { id: 'B', text: 'The event fires on the target but does not propagate to parent elements.', correct: true },
  { id: 'C', text: 'The event bypasses the target and fires only on the document root.' },
];

const DailyConcept = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  // Simulation state
  const [bubblingStep, setBubblingStep] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [propagationPath, setPropagationPath] = useState([]);

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

  const runSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setPropagationPath([]);
    setBubblingStep(null);

    // Animate propagation: button → div.child → div.parent → body → document
    const steps = ['button', 'child', 'parent', 'body', 'document'];
    steps.forEach((step, i) => {
      setTimeout(() => {
        setBubblingStep(step);
        setPropagationPath(prev => [...prev, step]);
      }, i * 700);
    });

    setTimeout(() => {
      setBubblingStep(null);
      setIsSimulating(false);
      markComplete(2);
    }, steps.length * 700 + 300);
  };

  const isNodeActive = (name) => bubblingStep === name;

  return (
    <div className="max-w-2xl mx-auto space-y-8 font-sans pb-16">

      {/* Header */}
      <div className="space-y-2 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <span className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest block">
          MICRO-LEARNING ENGINE · 6 MIN
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold font-display text-zinc-900 dark:text-white tracking-tight">
          EVENT BUBBLING
        </h1>
        <p className="text-sm text-zinc-500 font-medium">
          How browser events travel through the DOM tree.
        </p>
      </div>

      {/* 4-Step Progress Tracker with checkmarks (checklist 8) */}
      <div className="flex items-center gap-1">
        {STEPS.map((step, i) => {
          const isDone = completedSteps.has(step.num);
          const isCurrent = activeStep === step.num;
          return (
            <div key={step.key} className="flex items-center flex-1">
              <button
                onClick={() => setActiveStep(step.num)}
                className={`flex-1 py-2 px-1 rounded-full text-[10px] font-mono font-bold text-center transition-all ${
                  isCurrent
                    ? 'bg-[#F5C542] text-zinc-950 shadow-pill'
                    : isDone
                    ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-700'
                }`}
              >
                {isDone && !isCurrent ? `✓ ${step.label}` : step.label}
              </button>
              {i < STEPS.length - 1 && (
                <div className="w-2 h-px bg-zinc-300 dark:bg-zinc-700 mx-0.5 shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* ── STEP 1: UNDERSTAND ── */}
      {activeStep === 1 && (
        <div className="space-y-5">
          <h3 className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">01 UNDERSTAND</h3>

          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
            When a click event fires on a <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-xs font-mono">&lt;button&gt;</code>, it doesn't just execute once and stop. It <strong className="text-zinc-900 dark:text-white">bubbles upward</strong> through every parent element — the containing div, the body, all the way to the document root.
          </p>

          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
            This is called <strong className="text-zinc-900 dark:text-white">event propagation</strong>, and it's why a single event listener on a parent container can handle clicks from all its children — a technique called <strong className="text-zinc-900 dark:text-white">event delegation</strong>.
          </p>

          <button onClick={() => goToStep(2)} className="bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs py-2.5 px-6 rounded-full shadow-pill transition-all">
            Next: See It →
          </button>
        </div>
      )}

      {/* ── STEP 2: SEE IT — Interactive DOM animation (checklist 9) ── */}
      {activeStep === 2 && (
        <div className="space-y-5">
          <h3 className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">02 SEE IT</h3>

          <p className="text-xs text-zinc-500 font-medium">
            Click "Simulate" — watch the event travel up the DOM tree in real time.
          </p>

          {/* Interactive DOM diagram */}
          <div className="p-6 rounded-[20px] bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 font-mono text-xs space-y-2">

            {/* DOCUMENT */}
            <div className={`p-3 rounded-[12px] border-2 transition-all duration-300 ${isNodeActive('document') ? 'border-[#F5C542] bg-amber-50 dark:bg-amber-950/60' : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'}`}>
              <span className={`font-bold text-[11px] ${isNodeActive('document') ? 'text-amber-700 dark:text-amber-300' : 'text-zinc-500'}`}>document</span>

              {/* BODY */}
              <div className={`mt-2 p-3 rounded-[10px] border-2 transition-all duration-300 ${isNodeActive('body') ? 'border-[#F5C542] bg-amber-50 dark:bg-amber-950/60' : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800'}`}>
                <span className={`font-bold text-[11px] ${isNodeActive('body') ? 'text-amber-700 dark:text-amber-300' : 'text-zinc-500'}`}>body</span>

                {/* PARENT DIV */}
                <div className={`mt-2 p-3 rounded-[10px] border-2 transition-all duration-300 ${isNodeActive('parent') ? 'border-[#F5C542] bg-amber-50 dark:bg-amber-950/60' : 'border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-700'}`}>
                  <span className={`font-bold text-[11px] ${isNodeActive('parent') ? 'text-amber-700 dark:text-amber-300' : 'text-zinc-600 dark:text-zinc-300'}`}>div#parent</span>

                  {/* CHILD DIV */}
                  <div className={`mt-2 p-3 rounded-[10px] border-2 transition-all duration-300 ${isNodeActive('child') ? 'border-[#F5C542] bg-amber-50 dark:bg-amber-950/60' : 'border-zinc-200 dark:border-zinc-500 bg-zinc-50 dark:bg-zinc-600'}`}>
                    <span className={`font-bold text-[11px] ${isNodeActive('child') ? 'text-amber-700 dark:text-amber-300' : 'text-zinc-700 dark:text-zinc-200'}`}>div#child</span>

                    {/* BUTTON */}
                    <div className={`mt-2 px-4 py-2 rounded-[8px] border-2 transition-all duration-300 text-center ${isNodeActive('button') ? 'border-[#F5C542] bg-[#F5C542] text-zinc-950 font-extrabold' : 'border-zinc-400 bg-zinc-900 text-white'}`}>
                      &lt;button&gt; Click Me &lt;/button&gt;
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Propagation path trail */}
            {propagationPath.length > 0 && (
              <div className="pt-3 text-[11px] text-zinc-500 font-mono">
                <span className="text-zinc-400 mr-1">Path:</span>
                {propagationPath.map((p, i) => (
                  <span key={p}>
                    <span className="text-amber-500 font-bold">{p}</span>
                    {i < propagationPath.length - 1 && <span className="text-zinc-400"> → </span>}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={runSimulation}
              disabled={isSimulating}
              className="bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs py-2.5 px-6 rounded-full shadow-pill transition-all inline-flex items-center gap-2 disabled:opacity-60"
            >
              <Play size={13} className="fill-zinc-950" />
              <span>{isSimulating ? 'Propagating...' : 'Simulate Propagation'}</span>
            </button>
            <button onClick={() => goToStep(3)} className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
              Skip to Code →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: TRY IT ── */}
      {activeStep === 3 && (
        <div className="space-y-5">
          <h3 className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">03 TRY IT — CODE</h3>

          <div className="rounded-[16px] overflow-hidden border border-zinc-800">
            <div className="px-4 py-2 bg-zinc-900 text-[10px] font-mono text-zinc-400 border-b border-zinc-800">
              event-delegation.js
            </div>
            <pre className="p-4 bg-zinc-900 text-zinc-100 font-mono text-xs overflow-x-auto leading-relaxed">{`// Event delegation: one listener handles all child clicks
document.getElementById('parent').addEventListener('click', (e) => {
  // e.target is the element actually clicked
  console.log('Clicked:', e.target.id);   // "child" or "button"
  console.log('Bubbled to: parent div');
});

// Stop propagation on a specific element
document.getElementById('child').addEventListener('click', (e) => {
  e.stopPropagation(); // parent will NOT receive this event
});`}</pre>
          </div>

          <button onClick={() => goToStep(4)} className="bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs py-2.5 px-6 rounded-full shadow-pill transition-all">
            Next: Prove It →
          </button>
        </div>
      )}

      {/* ── STEP 4: PROVE IT ── */}
      {activeStep === 4 && (
        <div className="space-y-5">
          <h3 className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">04 PROVE IT — QUIZ</h3>

          <h4 className="text-base font-bold text-zinc-900 dark:text-white">
            What happens when <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-mono text-xs">e.stopPropagation()</code> is called inside an event handler?
          </h4>

          <div className="space-y-2">
            {QUIZ_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => !quizSubmitted && setSelectedOption(opt.id)}
                className={`w-full p-4 rounded-[14px] border text-left text-xs font-medium transition-all flex items-start gap-3 ${
                  quizSubmitted && opt.correct
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-zinc-900 dark:text-white'
                    : quizSubmitted && selectedOption === opt.id && !opt.correct
                    ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-500 text-zinc-900 dark:text-white'
                    : selectedOption === opt.id
                    ? 'bg-amber-50 dark:bg-zinc-900 border-[#F5C542]'
                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 font-mono font-bold text-xs flex items-center justify-center shrink-0 text-zinc-800 dark:text-zinc-200">
                  {opt.id}
                </span>
                <span className="pt-0.5">{opt.text}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => { setQuizSubmitted(true); markComplete(4); }}
              disabled={!selectedOption || quizSubmitted}
              className="bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs py-2.5 px-6 rounded-full shadow-pill transition-all disabled:opacity-40"
            >
              {quizSubmitted ? 'Submitted' : 'Check Answer'}
            </button>

            {quizSubmitted && (
              <span className={`text-xs font-bold font-mono ${selectedOption === 'B' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {selectedOption === 'B' ? '✓ Correct! Option B.' : `✗ Incorrect. Answer is B.`}
              </span>
            )}
          </div>

          {quizSubmitted && selectedOption === 'B' && (
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-xs font-bold text-zinc-900 dark:text-white hover:text-amber-500 transition-colors"
              >
                ← Back to Dashboard
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default DailyConcept;
