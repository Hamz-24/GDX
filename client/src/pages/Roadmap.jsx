import { useState } from 'react';
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { USER_PROFILE, PHASES } from '../constants/userProfile';

const Roadmap = () => {
  const navigate = useNavigate();
  // Default: only the current phase is expanded (checklist 8)
  const [expandedPhase, setExpandedPhase] = useState(USER_PROFILE.currentPhase);

  const toggle = (id) => setExpandedPhase(prev => prev === id ? null : id);

  return (
    <div className="max-w-2xl mx-auto space-y-8 font-sans pb-16">

      {/* Header */}
      <div className="space-y-1.5 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block">
          {USER_PROFILE.currentRole} → {USER_PROFILE.targetRole} · {USER_PROFILE.timelineWeeks} Weeks
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold font-display text-zinc-900 dark:text-white tracking-tight">
          Career Timeline
        </h1>
        <p className="text-xs text-zinc-500 font-medium">
          Click a phase to expand lessons. Collapsed = overview. Expanded = workspace.
        </p>
      </div>

      {/* Roadmap updated banner — checklist 21 */}
      <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-[14px] bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs">
        <div>
          <span className="font-mono font-bold text-amber-700 dark:text-amber-400 text-[10px] uppercase block">GUIDEX UPDATED YOUR PLAN</span>
          <span className="text-zinc-700 dark:text-zinc-300 font-medium">↑ DB Indexing priority · ↑ System Design priority · ↓ Frontend priority</span>
        </div>
        <button onClick={() => navigate('/vault')} className="shrink-0 text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 hover:underline">
          View Changes →
        </button>
      </div>

      {/* Vertical Timeline — checklist 7 */}
      <div className="relative pl-2 space-y-0">
        {/* Spine line */}
        <div className="absolute left-[27px] top-3 bottom-3 w-0.5 bg-zinc-200 dark:bg-zinc-800" />

        {PHASES.map(phase => (
          <div key={phase.id} className="relative">

            {/* Phase header row */}
            <div
              className="flex items-start gap-4 cursor-pointer py-4 group"
              onClick={() => toggle(phase.id)}
            >
              {/* Node */}
              <div className={`relative z-10 w-7 h-7 rounded-full border-2 flex items-center justify-center font-mono text-[10px] font-extrabold shrink-0 mt-0.5 transition-all ${
                phase.status === 'Completed'
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : phase.current
                  ? 'bg-[#F5C542] border-[#F5C542] text-zinc-950 shadow-pill'
                  : 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-400'
              }`}>
                {phase.status === 'Completed' ? '✓' : phase.current ? '●' : '○'}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`text-sm font-bold font-display tracking-tight transition-colors ${
                    phase.current
                      ? 'text-zinc-900 dark:text-white group-hover:text-amber-500'
                      : phase.status === 'Completed'
                      ? 'text-zinc-500 dark:text-zinc-400'
                      : 'text-zinc-400 dark:text-zinc-600'
                  }`}>
                    {phase.num} ━━ {phase.title}
                  </span>

                  {/* YOU ARE HERE — checklist 7 */}
                  {phase.current && (
                    <span className="text-[10px] font-mono font-extrabold text-[#F5C542] bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                      ● YOU ARE HERE
                    </span>
                  )}
                  {phase.status === 'Completed' && (
                    <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">✓ Completed</span>
                  )}
                  {phase.locked && !phase.current && (
                    <span className="text-[10px] font-mono text-zinc-400">○ Upcoming · {phase.duration}</span>
                  )}
                </div>

                {!phase.locked && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden max-w-xs">
                      <div
                        className={`h-full rounded-full ${phase.status === 'Completed' ? 'bg-emerald-500' : 'bg-[#F5C542]'}`}
                        style={{ width: `${phase.progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 font-semibold">{phase.progress}%</span>
                  </div>
                )}
              </div>

              <div className="text-zinc-400 pt-1 shrink-0">
                {expandedPhase === phase.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </div>
            </div>

            {/* Expanded workspace — checklist 8 */}
            {expandedPhase === phase.id && (
              <div className="ml-11 mb-4 pl-5 border-l-2 border-zinc-200 dark:border-zinc-800 space-y-5 pb-4">

                <div>
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase block mb-1">Why this phase matters</span>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{phase.whyMatters}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase block">Skills</span>
                  {phase.skills.map((sk, i) => (
                    <div key={i} className={`flex items-center justify-between gap-3 py-2 text-xs ${sk.active ? 'pl-3 -ml-3 border-l-2 border-[#F5C542]' : ''}`}>
                      <div className="flex items-center gap-2.5">
                        <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[9px] shrink-0 ${
                          sk.done ? 'bg-emerald-500 border-emerald-500 text-white' :
                          sk.active ? 'bg-[#F5C542] border-[#F5C542] text-zinc-950' :
                          'border-zinc-300 dark:border-zinc-700'
                        }`}>
                          {sk.done ? '✓' : sk.active ? '●' : ''}
                        </span>
                        <span className={sk.done ? 'line-through text-zinc-400' : sk.active ? 'font-bold text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'}>
                          {sk.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono text-zinc-400">{sk.mastery}%</span>
                        {sk.active && (
                          <button onClick={() => navigate('/focus')}
                            className="bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-[10px] px-3 py-1 rounded-full shadow-pill">
                            Start →
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-[10px] font-mono text-zinc-400">Estimated: {phase.duration}</span>
                  {!phase.locked && (
                    <button onClick={() => navigate('/focus')}
                      className="inline-flex items-center gap-1 text-xs font-bold text-zinc-900 dark:text-white hover:text-amber-500 transition-colors">
                      Continue Phase <ArrowRight size={13} />
                    </button>
                  )}
                </div>

              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Roadmap;
