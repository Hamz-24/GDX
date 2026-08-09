import { useNavigate } from 'react-router-dom';
import { USER_PROFILE } from '../constants/userProfile';

const WeeklyReport = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto space-y-10 font-sans pb-16">

      {/* Header — checklist 22 */}
      <div className="space-y-1.5 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block">
          WEEK {USER_PROFILE.weekNumber} OF {USER_PROFILE.timelineWeeks} · {USER_PROFILE.targetRole}
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold font-display text-zinc-900 dark:text-white tracking-tight">
          Your Week in Review
        </h1>
      </div>

      {/* ── THE AI READ — story first, numbers last ── */}
      <div className="space-y-3">
        <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">THE AI READ</span>
        <p className="text-xl md:text-2xl font-medium leading-relaxed text-zinc-900 dark:text-white">
          "You made strong progress in backend engineering this week. SQL query optimization is improving — but{' '}
          <span className="underline decoration-[#F5C542] font-bold">system design</span> remains your largest gap for {USER_PROFILE.targetRole}."
        </p>
        <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
          High confidence · 7 signals this week
        </div>
      </div>

      <div className="h-px bg-zinc-200 dark:bg-zinc-800" />

      {/* ── Narrative blocks — no borders, just space and typography ── */}
      <div className="space-y-9">

        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">WHAT IMPROVED</span>
          <h3 className="text-lg font-bold font-display text-zinc-900 dark:text-white">Backend APIs & SQL Indexing ↑</h3>
          <p className="text-sm text-zinc-500 leading-relaxed">
            B-Tree indexing mastery jumped from 40% to 78%. All query plan execution tests passed. REST API implementation is now production-ready.
          </p>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold text-rose-500 uppercase tracking-widest block">WHAT NEEDS ATTENTION</span>
          <h3 className="text-lg font-bold font-display text-zinc-900 dark:text-white">System Design ↓</h3>
          <p className="text-sm text-zinc-500 leading-relaxed">
            No sessions logged for distributed architecture. This is your #1 bottleneck for senior {USER_PROFILE.targetRole} interviews.
          </p>
          {/* Why — checklist 20 */}
          <p className="text-xs text-zinc-400 pt-1">
            <strong className="text-zinc-600 dark:text-zinc-300">Why this gap?</strong> System design appears in 90% of senior backend interviews. Your current mastery is 35%.
          </p>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block">WHAT CHANGED — GUIDEX UPDATED YOUR PLAN</span>
          <h3 className="text-lg font-bold font-display text-zinc-900 dark:text-white">Roadmap Recalibrated</h3>
          <p className="text-sm text-zinc-500 leading-relaxed">
            ↑ Query Optimization priority · ↑ Distributed Systems priority · ↓ Frontend priority
          </p>
          <button onClick={() => navigate('/roadmap')}
            className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 hover:underline">
            View Updated Roadmap →
          </button>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">NEXT WEEK'S FOCUS</span>
          <h3 className="text-lg font-bold font-display text-zinc-900 dark:text-white">System Design Sprint</h3>
          <p className="text-sm text-zinc-500 leading-relaxed">
            Target: 60% system design mastery. Start with caching fundamentals — they're the prerequisite.
          </p>
          <button onClick={() => navigate('/focus')}
            className="inline-flex items-center gap-1.5 bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs py-2 px-5 rounded-full shadow-pill transition-all">
            Start Focus Session →
          </button>
        </div>

      </div>

      <div className="h-px bg-zinc-200 dark:bg-zinc-800" />

      {/* Numbers last — supporting the story */}
      <div className="space-y-4">
        <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">THE NUMBERS</span>
        <div className="grid grid-cols-3 gap-6 text-center font-mono">
          {[['12', 'tasks done'], ['6.4h', 'focused work'], ['7', 'day streak 🔥']].map(([val, lbl]) => (
            <div key={lbl}>
              <span className="text-4xl font-extrabold text-zinc-900 dark:text-white block">{val}</span>
              <span className="text-[11px] text-zinc-500 block mt-0.5">{lbl}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default WeeklyReport;
