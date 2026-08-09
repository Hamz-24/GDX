import { Search, Compass, Sparkles, Clock, Map, Database, ArrowRight, X, Terminal, Cpu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          /* Trigger via props handled in DashboardLayout */
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    { id: 'continue', title: 'Continue Today\'s Mission', desc: 'Master Database Indexing (18m remaining)', path: '/roadmap', icon: Sparkles, badge: 'Hero' },
    { id: 'mentor', title: 'Ask AI Mentor', desc: 'Socratic guidance & code review', path: '/mentor', icon: Compass, badge: 'AI' },
    { id: 'focus', title: 'Start Focus Session', desc: '25m Pomodoro deep work sprint', path: '/focus', icon: Clock, badge: 'Focus' },
    { id: 'roadmap', title: 'Recalibrate AI Roadmap', desc: 'Re-align phases with current experience', path: '/roadmap', icon: Map, badge: 'AI' },
    { id: 'resume', title: 'Inject Resume / Skill Gaps', desc: 'Scan resume to detect weak areas', path: '/vault', icon: Database, badge: 'Data' },
  ];

  const filtered = actions.filter(a => 
    a.title.toLowerCase().includes(query.toLowerCase()) || 
    a.desc.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 p-4 font-sans animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Search Header Input */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
          <Search size={20} className="text-zinc-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search Guidex (Press ESC to close)..."
            className="w-full bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 text-sm font-sans focus:outline-none"
          />
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
            <X size={18} />
          </button>
        </div>

        {/* Action List */}
        <div className="p-3 space-y-1.5 max-h-80 overflow-y-auto">
          <div className="px-3 py-1 text-[10px] font-bold font-mono text-zinc-400 uppercase tracking-widest">
            Quick Commands & Shortcuts
          </div>

          {filtered.map(action => (
            <button
              key={action.id}
              onClick={() => handleSelect(action.path)}
              className="w-full p-3 rounded-2xl flex items-center justify-between gap-3 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800/70 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white flex items-center justify-center shrink-0 group-hover:bg-[#F5C542] group-hover:text-zinc-950 transition-colors">
                  <action.icon size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white font-sans">{action.title}</h4>
                  <p className="text-[11px] text-zinc-500 font-medium">{action.desc}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-mono font-bold uppercase">
                  {action.badge}
                </span>
                <ArrowRight size={14} className="text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          ))}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-950/60 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-400 px-4">
          <span>Navigate with arrows or type search</span>
          <span className="bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded text-[10px] text-zinc-700 dark:text-zinc-300 font-bold">⌘K</span>
        </div>

      </div>
    </div>
  );
};

export default CommandPalette;
