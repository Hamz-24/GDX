import { ArrowRight, CheckCircle2, Zap, AlertTriangle, Target, Compass, Sparkles } from 'lucide-react';
import { useState } from 'react';

const CareerGraph = () => {
  const [activeSkill, setActiveSkill] = useState(null);

  const skills = [
    { id: 'sql', name: 'SQL & Indexing', status: 'Learning', level: '78%', type: 'Database' },
    { id: 'apis', name: 'REST & GraphQL APIs', status: 'Mastered', level: '94%', type: 'Backend' },
    { id: 'sysdesign', name: 'System Design', status: 'Weak', level: '35%', type: 'Architecture' },
    { id: 'scaling', name: 'Scaling & Redis Caching', status: 'Learning', level: '60%', type: 'Performance' },
    { id: 'ml', name: 'PyTorch & ML Models', status: 'Recommended', level: '20%', type: 'AI Specialization' },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Mastered':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300';
      case 'Learning':
        return 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300';
      case 'Weak':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300';
      default:
        return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-300';
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-card space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 rounded-full text-[11px] font-bold font-mono">
              SIGNATURE CAREER ENGINE
            </span>
          </div>
          <h3 className="text-xl font-extrabold font-display text-zinc-900 dark:text-white mt-1">
            Career Topology & Skill Map
          </h3>
          <p className="text-xs text-zinc-500 font-medium">
            Live mapping of your current technical abilities against target role requirements.
          </p>
        </div>

        {/* Legend pills */}
        <div className="flex items-center gap-2 flex-wrap text-[10px] font-bold font-mono">
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">● Mastered</span>
          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300">● Learning</span>
          <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">● Skill Gap</span>
        </div>
      </div>

      {/* Role Pipeline Flow Visual */}
      <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between gap-2 overflow-x-auto text-xs font-mono font-bold">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-zinc-500">CURRENT:</span>
          <span className="px-3 py-1 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white">Full-Stack Dev</span>
        </div>

        <ArrowRight size={16} className="text-[#F5C542] shrink-0" />

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-amber-500">TARGET:</span>
          <span className="px-3 py-1 rounded-full bg-[#F5C542] text-zinc-950 shadow-pill font-extrabold">AI/ML Engineer</span>
        </div>

        <div className="hidden md:flex items-center gap-2 shrink-0 text-[11px] text-zinc-400">
          <span>Completion Target: 12 Weeks</span>
        </div>
      </div>

      {/* Interactive Topology Graph Nodes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative">
        {skills.map(s => (
          <div
            key={s.id}
            onClick={() => setActiveSkill(s.id === activeSkill ? null : s.id)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeSkill === s.id 
                ? 'bg-amber-50 dark:bg-zinc-800 border-[#F5C542] shadow-pill' 
                : 'bg-white dark:bg-zinc-800/40 border-zinc-200/70 dark:border-zinc-800 hover:border-zinc-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">{s.type}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border ${getStatusBadge(s.status)}`}>
                {s.status}
              </span>
            </div>

            <h4 className="text-sm font-bold text-zinc-900 dark:text-white font-sans mb-3">{s.name}</h4>

            {/* Mini bar */}
            <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${s.status === 'Mastered' ? 'bg-emerald-500' : s.status === 'Weak' ? 'bg-rose-500' : 'bg-[#F5C542]'}`} 
                style={{ width: s.level }}
              />
            </div>
            <span className="text-[10px] font-mono text-zinc-400 mt-1.5 block text-right font-bold">{s.level} Mastery</span>
          </div>
        ))}
      </div>

    </div>
  );
};

export default CareerGraph;
