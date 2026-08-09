import { useState } from 'react';
import { ArrowRight, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CareerTopology from '../components/CareerTopology';
import { USER_PROFILE, TODAY_MISSION, NEXT_BEST_ACTION, AI_ACTIVITY } from '../constants/userProfile';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [whyOpen, setWhyOpen] = useState(false);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'GOOD MORNING';
    if (h < 18) return 'GOOD AFTERNOON';
    return 'GOOD EVENING';
  };

  return (
    <div className="space-y-10 font-sans pb-16 max-w-5xl mx-auto">

      {/* ── GREETING ── */}
      <div className="space-y-1">
        <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">
          {USER_PROFILE.currentRole} → <span className="text-zinc-900 dark:text-white">{USER_PROFILE.targetRole}</span>
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold font-display text-zinc-900 dark:text-white tracking-tight">
          {greeting()}, {user?.name?.split(' ')[0]?.toUpperCase() || 'DEVELOPER'}
        </h1>
        <p className="text-sm text-zinc-500 font-medium">
          Week {USER_PROFILE.weekNumber} of {USER_PROFILE.timelineWeeks} ·{' '}
          <strong className="text-zinc-800 dark:text-zinc-200">2 sessions</strong> from completing Phase 2.
        </p>
      </div>

      <div className="h-px bg-zinc-200 dark:bg-zinc-800" />

      {/* ── TODAY'S MISSION (hero) — checklist 4 ── */}
      <section className="space-y-5">
        <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block">
          TODAY'S MISSION
        </span>

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
          <div className="space-y-4 flex-1 max-w-2xl">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold font-display text-zinc-900 dark:text-white tracking-tight leading-tight">
                {TODAY_MISSION.title}
              </h2>
              <p className="text-sm text-zinc-500 font-medium mt-1">{TODAY_MISSION.phase}</p>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono text-zinc-500">
                <span><strong className="text-zinc-900 dark:text-white">{TODAY_MISSION.missionProgress}%</strong> of today's mission</span>
                <span><strong className="text-zinc-900 dark:text-white">{TODAY_MISSION.recommendedMinutes} min</strong> recommended</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-[#F5C542] rounded-full transition-all" style={{ width: `${TODAY_MISSION.missionProgress}%` }} />
              </div>
            </div>

            {/* Checkpoint + Last session */}
            <div className="grid grid-cols-2 gap-4 text-xs pt-1 border-t border-zinc-100 dark:border-zinc-800">
              <div>
                <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block mb-0.5">Next checkpoint</span>
                <span className="font-bold text-zinc-900 dark:text-white">{TODAY_MISSION.nextCheckpoint}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block mb-0.5">Last session</span>
                <span className="font-bold text-zinc-900 dark:text-white">{TODAY_MISSION.lastSession}</span>
              </div>
            </div>

            <p className="text-xs text-zinc-500">
              <strong className="text-zinc-800 dark:text-zinc-200">Why this matters:</strong>{' '}{TODAY_MISSION.whyThisMatters}
            </p>
          </div>

          <button
            onClick={() => navigate('/roadmap')}
            className="bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-sm py-3.5 px-8 rounded-full shadow-pill transition-all inline-flex items-center gap-2 shrink-0 self-start"
          >
            Continue Learning <ArrowRight size={17} />
          </button>
        </div>
      </section>

      <div className="h-px bg-zinc-200 dark:bg-zinc-800" />

      {/* ── NEXT BEST ACTION — single AI decision, checklist 3 ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
            NEXT BEST ACTION
          </span>
          <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            {NEXT_BEST_ACTION.confidence} confidence · {NEXT_BEST_ACTION.signals.length} signals
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2 flex-1 max-w-2xl">
            <h3 className="text-xl font-bold font-display text-zinc-900 dark:text-white">
              {NEXT_BEST_ACTION.title}
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">{NEXT_BEST_ACTION.description}</p>

            {/* Evidence signals */}
            <div className="flex flex-wrap gap-2 pt-1">
              {NEXT_BEST_ACTION.signals.map(sig => (
                <span key={sig.label} className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full">
                  {sig.label}: <strong className={sig.status === 'bad' ? 'text-rose-500' : sig.status === 'warn' ? 'text-amber-500' : sig.status === 'good' ? 'text-emerald-500' : 'text-zinc-700 dark:text-zinc-200'}>{sig.value}</strong>
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigate('/focus')}
            className="bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs py-3 px-6 rounded-full shadow-pill transition-all inline-flex items-center gap-2 shrink-0 self-start"
          >
            <Clock size={14} /> Start {NEXT_BEST_ACTION.durationMinutes} Min Session
          </button>
        </div>

        {/* Expandable Why — checklist 20 */}
        <div>
          <button
            onClick={() => setWhyOpen(v => !v)}
            className="text-[11px] font-semibold text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 transition-colors"
          >
            Why this recommendation? {whyOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          {whyOpen && (
            <div className="mt-3 p-4 rounded-[14px] bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono space-y-2">
              <div className="text-[10px] font-bold text-zinc-400 uppercase">GUIDEX ANALYSIS</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {NEXT_BEST_ACTION.signals.map(sig => (
                  <div key={sig.label} className="space-y-0.5">
                    <div className="text-zinc-400 text-[10px]">{sig.label}</div>
                    <div className={`font-bold ${sig.status === 'bad' ? 'text-rose-500' : sig.status === 'warn' ? 'text-amber-500' : sig.status === 'good' ? 'text-emerald-500' : 'text-zinc-900 dark:text-white'}`}>
                      {sig.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="h-px bg-zinc-200 dark:bg-zinc-800" />

      {/* ── CAREER READINESS + AI ACTIVITY ── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        <div className="space-y-4">
          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">CAREER READINESS</span>
          <div>
            <div className="text-5xl font-extrabold font-display text-zinc-900 dark:text-white">{USER_PROFILE.careerReadiness}%</div>
            <span className="text-xs text-zinc-500 block mt-0.5">Skills matched to {USER_PROFILE.targetRole}</span>
          </div>
          <div className="space-y-2 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs">
            {[
              { label: 'Strongest', value: 'REST APIs', color: 'text-emerald-600 dark:text-emerald-400' },
              { label: 'Biggest Gap', value: 'System Design', color: 'text-rose-600 dark:text-rose-400' },
              { label: 'Next Priority', value: 'DB Indexing', color: 'text-amber-600 dark:text-amber-400' },
            ].map(r => (
              <div key={r.label} className="flex justify-between">
                <span className="text-zinc-400 font-mono text-[10px]">{r.label}</span>
                <span className={`font-bold ${r.color}`}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">RECENT GUIDEX ACTIVITY</span>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {AI_ACTIVITY.map((log, i) => (
              <div key={i} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="space-y-0.5">
                  <div className="font-mono text-[10px] text-zinc-400">{log.time}</div>
                  <div className="font-bold text-zinc-900 dark:text-white">{log.title}</div>
                  <div className="text-zinc-500">{log.desc}</div>
                </div>
                <span className="shrink-0 text-[10px] font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                  {log.signals} signals
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-px bg-zinc-200 dark:bg-zinc-800" />

      {/* ── CAREER TOPOLOGY — enlarged, checklist 5 ── */}
      <CareerTopology targetRole={USER_PROFILE.targetRole} height={520} />

    </div>
  );
};

export default Dashboard;
