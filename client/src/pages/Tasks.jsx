import { useState } from 'react';
import { Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TASKS_TODAY, NEXT_BEST_ACTION, USER_PROFILE } from '../constants/userProfile';

const PRIORITY_BADGE = {
  P0: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
  P1: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300',
  P2: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
};

const Tasks = () => {
  const navigate  = useNavigate();
  const [tasks, setTasks] = useState(TASKS_TODAY);
  const [newTitle, setNewTitle] = useState('');

  const toggle = (id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const add = () => {
    if (!newTitle.trim()) return;
    setTasks(prev => [...prev, { id: Date.now(), title: newTitle, desc: '', priority: 'P1', done: false, minutes: 20 }]);
    setNewTitle('');
  };

  const active    = tasks.filter(t => !t.done);
  const completed = tasks.filter(t => t.done);

  // Empty state — checklist 28
  if (active.length === 0 && completed.length === 0) {
    return (
      <div className="max-w-xl mx-auto text-center space-y-4 pt-24 pb-16">
        <h2 className="text-2xl font-extrabold font-display text-zinc-900 dark:text-white">Your workspace is clear.</h2>
        <p className="text-sm text-zinc-500">Guidex recommends continuing {NEXT_BEST_ACTION.title}.</p>
        <button onClick={() => navigate('/focus')}
          className="bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-sm py-3 px-8 rounded-full shadow-pill transition-all">
          Start {NEXT_BEST_ACTION.durationMinutes} min Session
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 font-sans pb-16">

      {/* Header */}
      <div className="space-y-1 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block">
          {USER_PROFILE.targetRole} · Week {USER_PROFILE.weekNumber}
        </span>
        <h1 className="text-3xl font-extrabold font-display text-zinc-900 dark:text-white">Today's Tasks</h1>
        <p className="text-xs font-mono text-zinc-500">
          <strong className="text-zinc-900 dark:text-white">{active.length} active</strong>
          {' · '}
          <strong className="text-emerald-500">{completed.length} completed</strong>
        </p>
      </div>

      {/* Why these tasks — checklist 20 */}
      <p className="text-xs text-zinc-500 leading-relaxed">
        <strong className="text-zinc-800 dark:text-zinc-200">Why these tasks?</strong>{' '}
        {NEXT_BEST_ACTION.title} is your highest-value next action based on your current skill gaps for {USER_PROFILE.targetRole}.
      </p>

      {/* Add task row */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="Add a task..."
          className="flex-1 px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[10px] text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#F5C542]"
        />
        <button onClick={add}
          className="bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs px-4 py-2.5 rounded-[10px] shadow-pill transition-all">
          Add
        </button>
      </div>

      {/* Active task queue — checklist 9 */}
      {['P0', 'P1', 'P2'].map(prio => {
        const group = active.filter(t => t.priority === prio);
        if (!group.length) return null;
        return (
          <div key={prio} className="space-y-0">
            <span className={`inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded-full mb-2 ${PRIORITY_BADGE[prio]}`}>
              {prio === 'P0' ? 'P0 · Critical' : prio === 'P1' ? 'P1 · High' : 'P2 · Normal'}
            </span>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800 rounded-[14px] overflow-hidden border border-zinc-100 dark:border-zinc-800">
              {group.map(t => (
                <div key={t.id} className="flex items-center gap-4 px-4 py-4 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <button
                    onClick={() => toggle(t.id)}
                    className="w-5 h-5 rounded border-2 border-zinc-300 dark:border-zinc-700 hover:border-[#F5C542] transition-colors shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-zinc-900 dark:text-white">{t.title}</div>
                    {t.desc && <div className="text-xs text-zinc-500 mt-0.5">{t.desc}</div>}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1"><Clock size={11} />{t.minutes} min</span>
                    {/* Start → connects to Focus Room — checklist 10 */}
                    <button
                      onClick={() => navigate('/focus', { state: { task: t } })}
                      className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[10px] font-bold px-3 py-1.5 rounded-full hover:bg-[#F5C542] hover:text-zinc-950 transition-all"
                    >
                      Start →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Completed */}
      {completed.length > 0 && (
        <>
          <div className="h-px bg-zinc-200 dark:bg-zinc-800" />
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">
              Completed ({completed.length})
            </span>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {completed.map(t => (
                <div key={t.id} className="py-3 flex items-center gap-4 text-xs">
                  <button onClick={() => toggle(t.id)}
                    className="w-5 h-5 rounded bg-emerald-500 border-2 border-emerald-500 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                    ✓
                  </button>
                  <span className="text-zinc-400 line-through flex-1">{t.title}</span>
                  <span className="text-[10px] font-mono text-zinc-400">{t.minutes} min</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Tasks;
