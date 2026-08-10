import { useState, useEffect } from 'react';
import { Clock, Sparkles, ArrowRight, CheckCircle2, Target, Plus, Play, BookOpen, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TASKS_TODAY, USER_PROFILE } from '../constants/userProfile';
import api from '../utils/api';

const PRIORITY_BADGE = {
  P0: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-900',
  P1: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-900',
  P2: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700',
};

const Tasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState(TASKS_TODAY);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(true);

  // Load live tasks from backend API
  useEffect(() => {
    let isMounted = true;
    api('/api/tasks')
      .then(data => {
        if (!isMounted) return;
        if (Array.isArray(data) && data.length > 0) {
          const transformed = data.map((t, idx) => ({
            id: t._id || t.id || idx,
            title: t.title,
            desc: t.description || t.desc || 'Daily task',
            priority: t.priority || 'P1',
            done: !!t.completed || !!t.done,
            minutes: t.estimatedMinutes || t.minutes || 20
          }));
          setTasks(transformed);
        }
      })
      .catch(() => {
        /* fallback to default */
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  const toggle = async (id) => {
    const target = tasks.find(t => t.id === id);
    const newDone = !target?.done;
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: newDone } : t));

    try {
      if (typeof id === 'string' && id.length > 10) {
        await api(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ completed: newDone }) });
      }
    } catch { /* silent fallback */ }
  };

  const add = async () => {
    if (!newTitle.trim()) return;
    const newTask = { title: newTitle, desc: 'Custom execution task', priority: 'P1', done: false, minutes: 20 };
    setTasks(prev => [...prev, { ...newTask, id: Date.now() }]);
    setNewTitle('');

    try {
      const created = await api('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({ title: newTitle, priority: 'P1', estimatedMinutes: 20 })
      });
      if (created?._id) {
        setTasks(prev => prev.map(t => t.title === newTitle ? { ...t, id: created._id } : t));
      }
    } catch { /* silent fallback */ }
  };

  const active = tasks.filter(t => !t.done);
  const completed = tasks.filter(t => t.done);

  const explainTaskWithAI = (t) => {
    navigate('/mentor', {
      state: {
        dayTopic: t.title,
        prompt: `Explain how to approach and implement "${t.title}" step-by-step for a Beginner. Include key logic, edge cases, and time complexity.`,
        duration: `${t.minutes} min`,
        goal: USER_PROFILE.targetRole
      }
    });
  };

  const startTaskInFocus = (t) => {
    navigate('/focus', {
      state: {
        task: t
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
              GOAL: {USER_PROFILE.targetRole.toUpperCase()}
            </span>
            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-mono font-bold">
              CONNECTED BACKEND API
            </span>
          </div>

          <h1 className="text-3xl font-extrabold font-display text-zinc-900 dark:text-white tracking-tight">
            Today's Execution Queue
          </h1>
          <p className="text-xs text-zinc-500 font-medium">
            <strong className="text-zinc-900 dark:text-white">{active.length} active tasks</strong>
            {' · '}
            <strong className="text-emerald-500">{completed.length} completed</strong>
          </p>
        </div>

        <button
          onClick={() => navigate('/roadmap')}
          className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold text-xs py-3 px-5 rounded-full hover:bg-[#F5C542] hover:text-zinc-950 transition-all shrink-0 flex items-center justify-center gap-2 self-start md:self-center"
        >
          <BookOpen size={15} /> View Full Roadmap
        </button>
      </div>

      {/* AI Recommendation banner */}
      <div className="flex items-center justify-between gap-4 px-5 py-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-amber-500 shrink-0" />
          <span className="text-zinc-800 dark:text-zinc-200 font-medium">
            <strong className="font-bold">Backend Sync Active:</strong> Click <strong>Start →</strong> to launch a timer, or <strong>AI Explain</strong> for step-by-step guidance.
          </span>
        </div>
      </div>

      {/* Add Task Input */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="+ Add a custom task to today's queue..."
          className="flex-1 px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#F5C542]"
        />
        <button
          onClick={add}
          className="bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs px-5 py-3 rounded-2xl shadow-pill transition-all shrink-0 flex items-center gap-1"
        >
          <Plus size={15} /> Add
        </button>
      </div>

      {/* Active Tasks Queue */}
      <div className="space-y-6">
        {['P0', 'P1', 'P2'].map(prio => {
          const group = active.filter(t => t.priority === prio);
          if (!group.length) return null;
          return (
            <div key={prio} className="space-y-3">
              <span className={`inline-block text-[10px] font-mono font-bold px-3 py-1 rounded-full border ${PRIORITY_BADGE[prio]}`}>
                {prio === 'P0' ? 'P0 · Critical Objective' : prio === 'P1' ? 'P1 · Recommended Practice' : 'P2 · Deepening Knowledge'}
              </span>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
                {group.map(t => (
                  <div key={t.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                    
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => toggle(t.id)}
                        className="w-5 h-5 rounded-full border-2 border-zinc-300 dark:border-zinc-700 hover:border-[#F5C542] transition-colors shrink-0 mt-0.5"
                        title="Mark as completed"
                      />
                      <div className="min-w-0 space-y-0.5">
                        <div className="font-bold text-sm text-zinc-900 dark:text-white font-display leading-tight">{t.title}</div>
                        {t.desc && <div className="text-xs text-zinc-500 font-medium">{t.desc}</div>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                      <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
                        <Clock size={12} />
                        {t.minutes} min
                      </span>

                      <button
                        onClick={() => explainTaskWithAI(t)}
                        className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs px-3 py-1.5 rounded-full transition-all inline-flex items-center gap-1"
                        title="Ask AI Mentor for step-by-step guidance on this task"
                      >
                        <Sparkles size={12} className="text-amber-500" />
                        <span>AI Explain</span>
                      </button>

                      <button
                        onClick={() => startTaskInFocus(t)}
                        className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold px-4 py-1.5 rounded-full hover:bg-[#F5C542] hover:text-zinc-950 transition-all inline-flex items-center gap-1 shadow-sm"
                      >
                        <span>Start</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Completed Tasks */}
      {completed.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">
            Completed Today ({completed.length})
          </span>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 px-4">
            {completed.map(t => (
              <div key={t.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggle(t.id)}
                    className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0"
                  >
                    ✓
                  </button>
                  <span className="text-zinc-400 line-through font-medium">{t.title}</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">{t.minutes} min</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default Tasks;
