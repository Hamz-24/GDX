import { Check, Clock, AlertCircle } from 'lucide-react';

const TaskItem = ({ title, time, status, priority = 'P1', onToggle }) => {
  const isDone = status === 'Done' || status === true;
  
  const getPriorityBadge = (p) => {
    switch (p) {
      case 'P0':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300';
      case 'P1':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';
      default:
        return 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400';
    }
  };

  return (
    <div className={`group flex items-center justify-between gap-4 p-4 rounded-2xl border transition-all duration-200 ${
      isDone 
        ? 'bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200/50 dark:border-zinc-800/50 opacity-60' 
        : 'bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 hover:border-[#F5C542] shadow-sm'
    }`}>
      <div className="flex items-center gap-3.5 overflow-hidden flex-1">
        <button 
          onClick={onToggle}
          className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all flex-shrink-0 ${
            isDone 
              ? 'bg-[#F5C542] border-[#F5C542] text-zinc-950' 
              : 'border-zinc-300 dark:border-zinc-700 hover:border-[#F5C542] text-transparent'
          }`}
        >
          <Check size={14} className={isDone ? "opacity-100 stroke-[3]" : "opacity-0 group-hover:opacity-40 transition-opacity text-zinc-600"} />
        </button>
        
        <p className={`text-sm md:text-base font-semibold truncate font-sans ${isDone ? 'line-through text-zinc-400' : 'text-zinc-900 dark:text-white'}`}>
          {title}
        </p>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        {priority && (
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase ${getPriorityBadge(priority)}`}>
            {priority}
          </span>
        )}
        
        {time && (
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
            <Clock size={14} className="text-amber-500" />
            <span>{time}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskItem;
