import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TASKS_TODAY, USER_PROFILE } from '../constants/userProfile';

const FocusConsole = () => {
  const navigate  = useNavigate();
  const location  = useLocation();

  // If navigated from Tasks with a task in state, use it. Otherwise use default.
  const passedTask = location.state?.task;
  const defaultTask = TASKS_TODAY.find(t => !t.done) || TASKS_TODAY[0];
  const activeTask = passedTask || defaultTask;

  const [secondsLeft, setSecondsLeft] = useState((activeTask?.minutes || 25) * 60);
  const [isRunning, setIsRunning] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [reflection, setReflection] = useState('');

  const remainingActive = TASKS_TODAY.filter(t => !t.done).length;

  useEffect(() => {
    let id = null;
    if (isRunning && secondsLeft > 0) {
      id = setInterval(() => setSecondsLeft(s => s - 1), 1000);
    } else if (secondsLeft === 0) {
      setIsRunning(false);
      setIsFinished(true);
    }
    return () => clearInterval(id);
  }, [isRunning, secondsLeft]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') navigate('/tasks'); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  const fmt = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  const pct  = 1 - secondsLeft / ((activeTask?.minutes || 25) * 60);

  // ── REFLECTION SCREEN ──
  if (isFinished) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0F0F12] text-white flex flex-col items-center justify-center p-8 font-sans">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center mx-auto text-2xl font-bold shadow-lg shadow-emerald-500/30">
            ✓
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest block">
              SESSION COMPLETE · {activeTask?.minutes || 25} MINUTES FOCUSED
            </span>
            <h2 className="text-2xl font-extrabold font-display">{activeTask?.title}</h2>
            <p className="text-xs text-zinc-500 font-mono">{USER_PROFILE.targetRole} · Phase 2</p>
          </div>

          <div className="text-left space-y-2">
            <label className="text-[10px] font-mono text-zinc-400 font-bold uppercase block">
              What did you learn?
            </label>
            <textarea
              rows={4}
              value={reflection}
              onChange={e => setReflection(e.target.value)}
              placeholder="Record your core insight or realization..."
              className="w-full p-4 rounded-[16px] bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#F5C542] resize-none"
            />
          </div>

          <div className="space-y-2">
            <button
              onClick={() => navigate('/tasks')}
              className="w-full bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-sm py-3.5 rounded-full shadow-pill transition-all"
            >
              Save & Return to Tasks
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full text-xs font-mono text-zinc-500 hover:text-zinc-300 transition-colors py-2"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── FOCUS SCREEN — brutally minimal, checklist 11 ──
  return (
    <div className="fixed inset-0 z-50 bg-[#0F0F12] text-white flex flex-col font-sans">

      {/* Top bar — only essentials */}
      <div className="flex items-center justify-between px-8 py-5">
        <span className="text-sm font-extrabold font-display tracking-wide text-white">GUIDEX</span>
        <span className="text-[10px] font-mono text-zinc-600">ESC — Exit</span>
      </div>

      {/* Center — the only thing that matters */}
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 px-6">

        {/* Giant timer */}
        <div className="text-[96px] md:text-[128px] font-extrabold font-mono text-[#F5C542] tracking-tighter leading-none">
          {fmt(secondsLeft)}
        </div>

        <div className="space-y-2">
          <h1 className="text-xl md:text-2xl font-extrabold font-display text-white tracking-tight">
            {activeTask?.title?.toUpperCase()}
          </h1>
          <span className="text-xs font-mono text-zinc-500 block">
            {USER_PROFILE.targetRole} · Deep Work Session
          </span>
        </div>

        {/* Thin progress line */}
        <div className="w-48 h-0.5 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-[#F5C542] rounded-full transition-all duration-1000" style={{ width: `${pct * 100}%` }} />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsRunning(v => !v)}
            className="bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-sm py-3 px-10 rounded-full shadow-pill transition-all"
          >
            {isRunning ? 'Pause' : 'Resume'}
          </button>
          <button
            onClick={() => setIsFinished(true)}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs py-3 px-6 rounded-full transition-all"
          >
            Finish
          </button>
        </div>

        {/* Minimal context */}
        <span className="text-[11px] font-mono text-zinc-600">
          {remainingActive > 0 ? `${remainingActive} tasks remaining today` : 'All tasks complete'}
        </span>

      </div>

      {/* No footer */}
    </div>
  );
};

export default FocusConsole;
