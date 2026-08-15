import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, ArrowRight, CheckCircle2, RotateCcw, X, Play, Pause, Save } from 'lucide-react';
import { TASKS_TODAY, USER_PROFILE } from '../constants/userProfile';
import api from '../utils/api';

const FocusConsole = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // If navigated from Tasks or Roadmap with a task in state, use it.
  const passedTask = location.state?.task;
  const defaultTask = TASKS_TODAY.find(t => !t.done) || TASKS_TODAY[0];
  const activeTask = passedTask || defaultTask;

  const initialMinutes = activeTask?.minutes || 25;
  const [secondsLeft, setSecondsLeft] = useState(initialMinutes * 60);
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
  const pct = 1 - secondsLeft / (initialMinutes * 60);

  const askAIMentorMidFocus = () => {
    navigate('/mentor', {
      state: {
        dayTopic: activeTask.title,
        prompt: `I am currently in a Focus Session for "${activeTask.title}". Can you give me a quick 3-step execution strategy to complete this task effectively?`,
        duration: `${initialMinutes} min`,
        goal: USER_PROFILE.targetRole
      }
    });
  };

  const [isSaving, setIsSaving] = useState(false);

  const saveFocusSession = async (notesText = reflection) => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await api('/api/focus', {
        method: 'POST',
        body: JSON.stringify({
          duration: initialMinutes,
          durationMinutes: initialMinutes,
          task: activeTask?.title || 'Focus Session',
          taskId: activeTask?._id || activeTask?.id,
          notes: notesText
        })
      });
      window.dispatchEvent(new CustomEvent('gdx_focus_updated'));
    } catch (err) {
      console.warn('Focus session log failed:', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveReflection = async () => {
    await saveFocusSession(reflection);
    navigate('/tasks');
  };

  // ── REFLECTION / COMPLETION SCREEN ──
  if (isFinished) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0F0F12] text-white flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full space-y-6 text-center animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center mx-auto text-2xl font-bold shadow-lg shadow-emerald-500/30">
            ✓
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest block">
              FOCUS SESSION COMPLETE · {initialMinutes} MINUTES FOCUSED
            </span>
            <h2 className="text-2xl font-extrabold font-display text-white">{activeTask?.title}</h2>
            <p className="text-xs text-zinc-400 font-mono">
              Goal: {USER_PROFILE.targetRole} · Week 1
            </p>
          </div>

          <div className="text-left space-y-2">
            <label className="text-[10px] font-mono text-zinc-400 font-bold uppercase block">
              What did you learn or accomplish?
            </label>
            <textarea
              rows={4}
              value={reflection}
              onChange={e => setReflection(e.target.value)}
              placeholder="Record key realization or code snippet (saved to Data Vault)..."
              className="w-full p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#F5C542] resize-none font-sans"
            />
          </div>

          <div className="space-y-3">
            <button
              onClick={handleSaveReflection}
              className="w-full bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-sm py-3.5 rounded-full shadow-pill transition-all flex items-center justify-center gap-2"
            >
              <Save size={16} /> Save & Return to Tasks
            </button>

            <button
              onClick={askAIMentorMidFocus}
              className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold text-xs py-3 rounded-full transition-all flex items-center justify-center gap-2"
            >
              <Sparkles size={15} className="text-amber-400" />
              <span>Ask AI Mentor to Quiz Me on This Task</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── FOCUS TIMER CONSOLE ──
  return (
    <div className="fixed inset-0 z-50 bg-[#0F0F12] text-white flex flex-col justify-between p-8 md:p-12 font-sans select-none">

      {/* Top Header */}
      <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-white font-display text-lg tracking-tight">GUIDEX</span>
          <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-amber-400 text-[10px] font-bold">
            FOCUS MODE
          </span>
        </div>

        <button
          onClick={() => navigate('/tasks')}
          className="text-zinc-500 hover:text-white flex items-center gap-1 transition-colors"
        >
          <span>ESC — Exit</span>
        </button>
      </div>

      {/* Centerpiece Timer */}
      <div className="max-w-xl mx-auto text-center space-y-8 my-auto">

        {/* Giant Countdown Display */}
        <div className="text-[100px] md:text-[135px] font-extrabold font-mono text-[#F5C542] tracking-tighter leading-none">
          {fmt(secondsLeft)}
        </div>

        {/* Active Task Info */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest font-bold block">
            ACTIVE TASK OBJECTIVE
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold font-display text-white tracking-tight leading-tight">
            {activeTask?.title?.toUpperCase()}
          </h1>
          <span className="text-xs font-mono text-zinc-400 block">
            Goal: {USER_PROFILE.targetRole} · Deep Work Session
          </span>
        </div>

        {/* Thin Progress Indicator */}
        <div className="w-56 h-1 bg-zinc-800 rounded-full overflow-hidden mx-auto">
          <div
            className="h-full bg-[#F5C542] rounded-full transition-all duration-1000"
            style={{ width: `${pct * 100}%` }}
          />
        </div>

        {/* Control Actions */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={() => setIsRunning(v => !v)}
            className="bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-sm py-3.5 px-8 rounded-full shadow-pill transition-all inline-flex items-center gap-2"
          >
            {isRunning ? <Pause size={16} /> : <Play size={16} />}
            <span>{isRunning ? 'Pause' : 'Resume'}</span>
          </button>

          <button
            onClick={askAIMentorMidFocus}
            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-bold text-xs py-3.5 px-6 rounded-full transition-all inline-flex items-center gap-2"
          >
            <Sparkles size={15} className="text-amber-400" />
            <span>Ask AI Mentor</span>
          </button>

          <button
            onClick={() => setIsFinished(true)}
            className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white font-bold text-xs py-3.5 px-5 rounded-full transition-all"
          >
            Finish
          </button>
        </div>

        <span className="text-[11px] font-mono text-zinc-600 block">
          {remainingActive > 0 ? `${remainingActive} active tasks remaining today` : 'All scheduled tasks completed'}
        </span>
      </div>

      {/* Footer */}
      <div className="text-center text-[10px] font-mono text-zinc-600">
        Distraction-Free Focus Environment · ESC to Exit
      </div>

    </div>
  );
};

export default FocusConsole;
