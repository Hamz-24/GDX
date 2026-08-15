import { useState, useEffect } from 'react';
import { Clock, Sparkles, ArrowRight, CheckCircle2, Target, Plus, Play, BookOpen, Trash2, Edit3, Search, Filter, X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { USER_PROFILE } from '../constants/userProfile';
import api from '../utils/api';

const PRIORITY_BADGE = {
  P0: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-900',
  P1: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-900',
  P2: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700',
};

const Tasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState('P1');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // All, Pending, Completed
  const [loading, setLoading] = useState(true);

  // Edit Task State
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPriority, setEditPriority] = useState('P1');

  const fetchTasks = async () => {
    try {
      const data = await api('/api/tasks');
      if (Array.isArray(data)) {
        const transformed = data.map((t, idx) => ({
          id: t._id || t.id || idx,
          title: t.title,
          desc: t.description || 'Daily task',
          priority: t.priority || 'P1',
          done: t.status === 'Done' || Boolean(t.completed),
          minutes: t.estimatedMinutes || 20,
          dueDate: t.dueDate || new Date().toISOString().split('T')[0]
        }));
        setTasks(transformed);
      }
    } catch (err) {
      console.warn("Could not fetch tasks:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const toggle = async (id) => {
    const target = tasks.find(t => t.id === id);
    if (!target) return;
    const newDone = !target.done;
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: newDone } : t));

    try {
      if (typeof id === 'string' && id.length > 10) {
        await api(`/api/tasks/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ completed: newDone, status: newDone ? 'Done' : 'Pending' })
        });
      }
    } catch {
      // Revert on failure
      setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !newDone } : t));
    }
  };

  const add = async () => {
    if (!newTitle.trim()) return;
    const titleToSave = newTitle.trim();
    const descToSave = newDesc.trim() || 'Custom execution task';
    const tempId = `temp-${Date.now()}`;

    const tempTask = {
      id: tempId,
      title: titleToSave,
      desc: descToSave,
      priority: newPriority,
      done: false,
      minutes: 20
    };

    setTasks(prev => [tempTask, ...prev]);
    setNewTitle('');
    setNewDesc('');

    try {
      const created = await api('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: titleToSave,
          description: descToSave,
          priority: newPriority,
          estimatedMinutes: 20
        })
      });
      if (created?._id) {
        setTasks(prev => prev.map(t => t.id === tempId ? { ...t, id: created._id } : t));
      }
    } catch {
      // keep optimistic UI
    }
  };

  const deleteTask = async (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    try {
      if (typeof id === 'string' && id.length > 10) {
        await api(`/api/tasks/${id}`, { method: 'DELETE' });
      }
    } catch (err) {
      console.warn("Task deletion failed:", err.message);
      fetchTasks();
    }
  };

  const startEdit = (t) => {
    setEditingTask(t);
    setEditTitle(t.title);
    setEditDesc(t.desc || '');
    setEditPriority(t.priority || 'P1');
  };

  const saveEdit = async () => {
    if (!editingTask || !editTitle.trim()) return;
    const updatedTitle = editTitle.trim();
    const updatedDesc = editDesc.trim();

    setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, title: updatedTitle, desc: updatedDesc, priority: editPriority } : t));
    const targetId = editingTask.id;
    setEditingTask(null);

    try {
      if (typeof targetId === 'string' && targetId.length > 10) {
        await api(`/api/tasks/${targetId}`, {
          method: 'PATCH',
          body: JSON.stringify({ title: updatedTitle, description: updatedDesc, priority: editPriority })
        });
      }
    } catch (err) {
      console.warn("Task edit failed:", err.message);
      fetchTasks();
    }
  };

  // Filter tasks based on Search & Status Filter
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.desc && t.desc.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;

    if (statusFilter === 'Pending') return !t.done;
    if (statusFilter === 'Completed') return t.done;
    return true;
  });

  const active = filteredTasks.filter(t => !t.done);
  const completed = filteredTasks.filter(t => t.done);

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
              MONGODB PERSISTED
            </span>
          </div>

          <h1 className="text-3xl font-extrabold font-display text-zinc-900 dark:text-white tracking-tight">
            Today's Execution Queue
          </h1>
          <p className="text-xs text-zinc-500 font-medium">
            <strong className="text-zinc-900 dark:text-white">{tasks.filter(t => !t.done).length} active tasks</strong>
            {' · '}
            <strong className="text-emerald-500">{tasks.filter(t => t.done).length} completed</strong>
          </p>
        </div>

        <button
          onClick={() => navigate('/roadmap')}
          className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold text-xs py-3 px-5 rounded-full hover:bg-[#F5C542] hover:text-zinc-950 transition-all shrink-0 flex items-center justify-center gap-2 self-start md:self-center"
        >
          <BookOpen size={15} /> View Full Roadmap
        </button>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#F5C542]"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 p-1 border border-zinc-200 dark:border-zinc-800 rounded-xl shrink-0 w-full sm:w-auto">
          {['All', 'Pending', 'Completed'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === st ? 'bg-[#F5C542] text-zinc-950 font-bold' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Add Task Form */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 space-y-3 shadow-sm">
        <input
          type="text"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="+ Add task title..."
          className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#F5C542]"
        />

        <div className="flex flex-col sm:flex-row items-center gap-2">
          <input
            type="text"
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
            placeholder="Description / note (optional)"
            className="flex-1 w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#F5C542]"
          />

          <select
            value={newPriority}
            onChange={e => setNewPriority(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#F5C542]"
          >
            <option value="P0">P0 · Critical</option>
            <option value="P1">P1 · Practice</option>
            <option value="P2">P2 · Optional</option>
          </select>

          <button
            onClick={add}
            className="w-full sm:w-auto bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs px-5 py-2 rounded-xl shadow-pill transition-all shrink-0 flex items-center justify-center gap-1"
          >
            <Plus size={15} /> Add Task
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                <Edit3 size={16} className="text-[#F5C542]" /> Edit Task
              </h3>
              <button onClick={() => setEditingTask(null)} className="text-zinc-400 hover:text-zinc-600">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-mono text-zinc-400 block mb-1">TASK TITLE</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-zinc-400 block mb-1">DESCRIPTION</label>
                <textarea
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-zinc-400 block mb-1">PRIORITY</label>
                <select
                  value={editPriority}
                  onChange={e => setEditPriority(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white font-mono"
                >
                  <option value="P0">P0 · Critical</option>
                  <option value="P1">P1 · Practice</option>
                  <option value="P2">P2 · Optional</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingTask(null)}
                className="px-4 py-2 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-bold"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="px-5 py-2 bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs rounded-xl shadow-pill"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

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

                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1 mr-1">
                        <Clock size={12} />
                        {t.minutes} min
                      </span>

                      <button
                        onClick={() => startEdit(t)}
                        className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors"
                        title="Edit Task"
                      >
                        <Edit3 size={14} />
                      </button>

                      <button
                        onClick={() => deleteTask(t.id)}
                        className="p-1.5 text-zinc-400 hover:text-rose-500 transition-colors"
                        title="Delete Task"
                      >
                        <Trash2 size={14} />
                      </button>

                      <button
                        onClick={() => explainTaskWithAI(t)}
                        className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs px-3 py-1.5 rounded-full transition-all inline-flex items-center gap-1"
                        title="Ask AI Mentor"
                      >
                        <Sparkles size={12} className="text-amber-500" />
                        <span>AI</span>
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
            Completed Tasks ({completed.length})
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
                
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-zinc-400">{t.minutes} min</span>
                  <button
                    onClick={() => deleteTask(t.id)}
                    className="p-1 text-zinc-400 hover:text-rose-500 transition-colors"
                    title="Delete Task"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default Tasks;
