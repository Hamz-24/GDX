import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight, Clock, Flame, ChevronRight, TrendingUp,
  Zap, Award, Target, BookOpen, MessageSquare, CheckCircle2,
  BarChart3, Sparkles, ChevronDown, ChevronUp, Play
} from 'lucide-react';
import {
  USER_PROFILE, PHASES, TODAY_MISSION, NEXT_BEST_ACTION,
  AI_ACTIVITY, TASKS_TODAY, SKILL_NODES
} from '../constants/userProfile';

/* ── Hero SVG illustration (mountain / road path, GuideX amber tones) ── */
const HeroIllustration = () => (
  <svg viewBox="0 0 420 180" xmlns="http://www.w3.org/2000/svg" className="absolute right-0 top-0 h-full w-auto pointer-events-none select-none opacity-90">
    {/* Sky gradient */}
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#fff7ed" stopOpacity="1" />
        <stop offset="100%" stopColor="#fef3c7" stopOpacity="0.4" />
      </linearGradient>
      <linearGradient id="mountain1" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#e5e7eb" />
        <stop offset="100%" stopColor="#d1d5db" />
      </linearGradient>
      <linearGradient id="mountain2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#d1d5db" />
        <stop offset="100%" stopColor="#9ca3af" />
      </linearGradient>
    </defs>

    {/* Background mountains */}
    <path d="M 0 180 L 0 120 L 60 60 L 120 100 L 180 50 L 240 90 L 300 40 L 360 80 L 420 50 L 420 180 Z" fill="url(#mountain1)" opacity="0.35" />
    <path d="M 0 180 L 0 140 L 80 85 L 140 110 L 200 70 L 260 100 L 320 60 L 380 90 L 420 70 L 420 180 Z" fill="url(#mountain2)" opacity="0.25" />

    {/* Winding road */}
    <path d="M 160 180 Q 200 155 210 135 Q 225 110 240 100 Q 260 88 270 78 Q 285 65 295 55" stroke="#F5C542" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.8" />
    {/* Road dashes */}
    <path d="M 175 173 Q 195 160 207 145" stroke="#fff" strokeWidth="1.5" fill="none" strokeDasharray="4 6" strokeLinecap="round" opacity="0.9" />
    <path d="M 215 128 Q 232 112 243 103" stroke="#fff" strokeWidth="1.5" fill="none" strokeDasharray="4 6" strokeLinecap="round" opacity="0.9" />
    <path d="M 252 96 Q 268 82 278 72" stroke="#fff" strokeWidth="1.5" fill="none" strokeDasharray="4 6" strokeLinecap="round" opacity="0.9" />

    {/* Flag at top */}
    <circle cx="295" cy="50" r="5" fill="#F5C542" />
    <line x1="295" y1="45" x2="295" y2="28" stroke="#F5C542" strokeWidth="1.5" />
    <path d="M 295 28 L 308 32 L 295 36 Z" fill="#F5C542" />

    {/* Stars/dots in sky */}
    {[[350,20],[380,35],[330,42],[400,15],[370,55]].map(([x,y],i)=>(
      <circle key={i} cx={x} cy={y} r="1.5" fill="#F5C542" opacity={0.5} />
    ))}
    {/* Moon-like circle */}
    <circle cx="390" cy="28" r="12" fill="#fef9c3" opacity="0.6" />
    <circle cx="395" cy="24" r="9" fill="#fef3c7" opacity="0.4" />
  </svg>
);

/* ── SVG Sparkline ── */
const Sparkline = ({ values = [], color = '#F5C542', h = 52, w = 160 }) => {
  const max = Math.max(...values), min = Math.min(...values), range = max - min || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - ((v - min) / range) * (h - 4)}`);
  const area = `M ${pts[0]} L ${pts.join(' L ')} L ${w},${h} L 0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sp-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sp-${color.replace('#','')})`} />
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Last dot */}
      <circle cx={(w)} cy={h - ((values[values.length-1] - min) / range) * (h - 4)} r="3.5" fill={color} />
    </svg>
  );
};

/* ── Donut Ring ── */
const Donut = ({ pct = 64, size = 130, stroke = 12, color = '#F5C542', children }) => {
  const r = (size - stroke) / 2, circ = 2 * Math.PI * r, dash = (pct / 100) * circ;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)', position:'absolute',inset:0 }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e4e4e7" strokeWidth={stroke} className="dark:stroke-zinc-800" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ-dash}`} strokeLinecap="round" />
      </svg>
      <div className="relative z-10 text-center">{children}</div>
    </div>
  );
};

/* ── Activity Bars ── */
const ActivityBars = ({ values = [], days = [] }) => {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end justify-between gap-1.5 w-full">
      {values.map((v, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
          <div className={`w-full rounded-md transition-all ${i === values.length - 1 ? 'bg-[#F5C542]' : 'bg-zinc-200 dark:bg-zinc-700'}`}
            style={{ height: `${Math.max(6, (v / max) * 52)}px` }} />
          <span className="text-[9px] font-mono text-zinc-400">{days[i]}</span>
        </div>
      ))}
    </div>
  );
};

/* ── Weekly Line Chart ── */
const WeeklyLineChart = ({ data }) => {
  const W = 600, H = 80;
  const max = Math.max(...data.map(d => d.v), 1);
  const pts = data.map((d, i) => ({
    x: 20 + (i / (data.length - 1)) * (W - 40),
    y: H - 16 - ((d.v / max) * (H - 28)),
    ...d
  }));
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${pts[pts.length-1].x} ${H} L ${pts[0].x} ${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      <defs>
        <linearGradient id="wk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F5C542" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#F5C542" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#wk)" />
      <path d={pathD} fill="none" stroke="#F5C542" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill="#F5C542" stroke="#fff" strokeWidth="1.5" />
          <text x={p.x} y={H - 2} textAnchor="middle" fontSize="9" fill="#a1a1aa" fontFamily="monospace">{p.label}</text>
        </g>
      ))}
    </svg>
  );
};

/* ══════════════════════════════════════════════════════ */
/*  MAIN DASHBOARD                                        */
/* ══════════════════════════════════════════════════════ */
const Dashboard = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [whyOpen, setWhyOpen] = useState(false);

  const firstName = user?.name?.split(' ')[0] || 'Developer';
  const h = new Date().getHours();
  const greeting = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';

  const currentPhase = PHASES.find(p => p.current) || PHASES[1];
  const activeTasks  = TASKS_TODAY.filter(t => !t.done);
  const doneTasks    = TASKS_TODAY.filter(t => t.done);

  const weeklyData = [
    { label:'Mon',v:30 },{ label:'Tue',v:45 },{ label:'Wed',v:25 },
    { label:'Thu',v:55 },{ label:'Fri',v:40 },{ label:'Sat',v:68 },{ label:'Sun',v:52 },
  ];
  const readinessTrend = [70,72,71,74,75,76,77,77,78,78,78,78];

  const achievements = [
    { icon:Flame,   label:'5 Day Streak',  sub:'Great going!',  color:'text-orange-500',  bg:'bg-orange-50 dark:bg-orange-950/40'  },
    { icon:Target,  label:'Goal Achieved',  sub:'Goal achieved!', color:'text-emerald-600', bg:'bg-emerald-50 dark:bg-emerald-950/40' },
    { icon:Award,   label:'Quiz Master',    sub:'Score 90%+',    color:'text-[#F5C542]',   bg:'bg-amber-50  dark:bg-amber-950/40'    },
    { icon:BookOpen,label:'Consistent',     sub:'Keep learning!',color:'text-sky-500',     bg:'bg-sky-50    dark:bg-sky-950/40'      },
  ];

  /* ── Status tags for tasks ── */
  const taskStatus = (i) => i === 0
    ? { label:'In Progress', cls:'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400', dot:'bg-emerald-500' }
    : { label:'Pending',     cls:'bg-zinc-100 dark:bg-zinc-800 text-zinc-500',                                   dot:'bg-zinc-400'   };

  return (
    <div className="space-y-5 font-sans pb-12">

      {/* ══════════════════════════════════════
          HERO BANNER
      ══════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800 border border-zinc-200 dark:border-zinc-800 px-8 py-8 min-h-[160px]">
        <HeroIllustration />

        <div className="relative z-10 max-w-[520px] space-y-2">
          <h1 className="text-4xl md:text-5xl font-extrabold font-display text-zinc-900 dark:text-white tracking-tight">
            {greeting}, {firstName}! 👋
          </h1>
          <p className="text-sm text-zinc-500 font-medium">
            Let's continue your learning journey today.
          </p>

          {/* System status */}
          <div className="flex items-center gap-5 pt-2 text-[11px] font-mono text-zinc-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
              <span className="font-bold text-zinc-600 dark:text-zinc-300">SYSTEM STATUS</span>
              <span className="text-emerald-500 font-bold">ACTIVE</span>
            </span>
            <span className="hidden sm:block">·</span>
            <span className="hidden sm:flex items-center gap-1.5">
              <Sparkles size={11} className="text-[#F5C542]" />
              All systems operational
            </span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          MAIN 3-COLUMN GRID
      ══════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_256px] gap-4 items-start">

        {/* ── COLUMN 1: Momentum + Today's Plan ── */}
        <div className="space-y-4">

          {/* MOMENTUM */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">MOMENTUM</span>
              <Flame size={18} className="text-orange-500" />
            </div>

            <div>
              <div className="text-6xl font-extrabold font-display text-zinc-900 dark:text-white leading-none">
                {USER_PROFILE.activeStreak}
              </div>
              <div className="text-sm text-zinc-500 font-medium mt-1">Days streak</div>
              <button onClick={() => navigate('/roadmap')}
                className="mt-2 text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 hover:gap-2 transition-all">
                Keep it up! 🔥
              </button>
            </div>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <ActivityBars
                values={[30, 45, 20, 55, 40, 68, 52]}
                days={['Mon','Tue','Wed','Thu','Fri','Sat','Sun']}
              />
            </div>
          </div>

          {/* TODAY'S PLAN */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">TODAY'S PLAN</span>
                <span className="text-[11px] text-zinc-400 font-medium">{activeTasks.length} tasks scheduled</span>
              </div>
              <button onClick={() => navigate('/tasks')}
                className="text-[10px] font-mono font-bold text-amber-500 hover:text-amber-600 flex items-center gap-0.5 transition-colors">
                View All <ChevronRight size={12} />
              </button>
            </div>

            <div className="space-y-3">
              {activeTasks.map((t, i) => {
                const s = taskStatus(i);
                return (
                  <div key={t.id}
                    onClick={() => navigate('/focus', { state: { task: t } })}
                    className="flex items-center gap-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/60 -mx-2 px-2 py-2.5 rounded-xl transition-colors group">
                    {/* Task type icon */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      i === 0 ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-600' :
                      i === 1 ? 'bg-violet-100 dark:bg-violet-950/40 text-violet-600' :
                                'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                    }`}>
                      {i === 0 ? <BookOpen size={13} /> : i === 1 ? <Play size={13} /> : <Zap size={13} />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-zinc-900 dark:text-white truncate">{t.title}</div>
                      <div className="text-[10px] text-zinc-400 font-mono truncate mt-0.5">
                        {currentPhase.title} · {USER_PROFILE.targetRole}
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${s.cls}`}>
                        <span className={`w-1 h-1 rounded-full ${s.dot}`} />
                        {s.label}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">{t.minutes} min</span>
                    </div>
                  </div>
                );
              })}

              {/* Completed preview */}
              {doneTasks.slice(0, 1).map(t => (
                <div key={t.id} className="flex items-center gap-3 opacity-40">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={13} className="text-emerald-600" />
                  </div>
                  <span className="text-xs text-zinc-500 line-through flex-1 truncate">{t.title}</span>
                  <span className="text-[10px] font-mono text-zinc-400">{t.minutes}m</span>
                </div>
              ))}
            </div>

            <button onClick={() => navigate('/focus')}
              className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-sm py-3 rounded-xl transition-all hover:bg-[#F5C542] hover:text-zinc-950 flex items-center justify-center gap-2 group">
              Continue Learning <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* ── COLUMN 2: Objective + Insights ── */}
        <div className="space-y-4">

          {/* OBJECTIVE */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-7">
            <div className="flex items-start justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div>
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block mb-2">OBJECTIVE</span>
                  <h2 className="text-2xl md:text-3xl font-extrabold font-display text-zinc-900 dark:text-white tracking-tight leading-tight">
                    {TODAY_MISSION.title}
                  </h2>
                </div>

                <div>
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block mb-2">CURRENT FOCUS</span>
                  <button onClick={() => navigate('/concept')}
                    className="inline-flex items-center gap-2 text-sm font-bold text-zinc-700 dark:text-zinc-200 hover:text-amber-500 transition-colors">
                    <BookOpen size={14} className="text-[#F5C542]" />
                    {TODAY_MISSION.nextCheckpoint}
                  </button>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono text-zinc-400">
                    <span>Mission progress</span>
                    <span className="font-bold text-zinc-700 dark:text-zinc-200">{TODAY_MISSION.missionProgress}%</span>
                  </div>
                  <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[#F5C542] rounded-full transition-all duration-700"
                      style={{ width: `${TODAY_MISSION.missionProgress}%` }} />
                  </div>
                </div>
              </div>

              {/* Large donut */}
              <div className="shrink-0">
                <Donut pct={TODAY_MISSION.missionProgress} size={130} stroke={12} color="#F5C542">
                  <div className="text-center">
                    <div className="text-3xl font-extrabold font-mono text-zinc-900 dark:text-white leading-none">
                      {TODAY_MISSION.missionProgress}%
                    </div>
                    <div className="text-[9px] font-mono text-zinc-400 mt-1">today</div>
                  </div>
                </Donut>
              </div>
            </div>
          </div>

          {/* INSIGHTS & RECOMMENDATIONS */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-7 space-y-5">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">INSIGHTS & RECOMMENDATIONS</span>

            {/* Mentor callout */}
            <div className="flex items-start justify-between gap-4 pb-5 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-zinc-900 dark:bg-zinc-800 flex items-center justify-center shrink-0 shadow-sm">
                  <MessageSquare size={18} className="text-[#F5C542]" />
                </div>
                <div>
                  <div className="text-base font-bold text-zinc-900 dark:text-white">Your mentor is ready!</div>
                  <div className="text-xs text-zinc-500 mt-1 leading-relaxed">
                    Get personalised guidance and clarify your doubts.
                  </div>
                </div>
              </div>
              <button onClick={() => navigate('/mentor')}
                className="shrink-0 text-sm font-bold text-amber-500 hover:text-amber-600 flex items-center gap-1 transition-colors whitespace-nowrap">
                Go to Mentor <ArrowRight size={14} />
              </button>
            </div>

            {/* Next Best Action */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">NEXT BEST ACTION</span>
                <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  High confidence
                </span>
              </div>

              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="text-base font-bold text-zinc-900 dark:text-white">{NEXT_BEST_ACTION.title}</div>
                  <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed line-clamp-2">{NEXT_BEST_ACTION.description}</p>
                </div>
                <button onClick={() => navigate('/focus')}
                  className="shrink-0 bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs px-4 py-2 rounded-full shadow-sm transition-all whitespace-nowrap flex items-center gap-1.5">
                  <Clock size={12} /> {NEXT_BEST_ACTION.durationMinutes} min
                </button>
              </div>

              {/* Expandable why */}
              <button onClick={() => setWhyOpen(v => !v)}
                className="text-[10px] font-mono text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 flex items-center gap-0.5 transition-colors">
                Why this? {whyOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              </button>
              {whyOpen && (
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {NEXT_BEST_ACTION.signals.map(s => (
                    <div key={s.label} className="text-[10px] font-mono bg-zinc-50 dark:bg-zinc-800 rounded-lg px-2.5 py-2">
                      <div className="text-zinc-400">{s.label}</div>
                      <div className={`font-bold mt-0.5 ${
                        s.status==='bad'?'text-rose-500':s.status==='warn'?'text-amber-500':s.status==='good'?'text-emerald-500':'text-zinc-700 dark:text-zinc-200'
                      }`}>{s.value}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Stat pills */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
                  <TrendingUp size={16} className="text-emerald-600" />
                </div>
                <div>
                  <div className="text-sm font-bold text-zinc-900 dark:text-white">You've improved 6%</div>
                  <div className="text-[11px] text-zinc-400">this week! Great consistency.</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center shrink-0">
                  <Clock size={16} className="text-amber-500" />
                </div>
                <div>
                  <div className="text-sm font-bold text-zinc-900 dark:text-white">Average time spent</div>
                  <div className="text-[11px] text-zinc-400">45 min/day</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── COLUMN 3: Progress + Mastery ── */}
        <div className="space-y-4">

          {/* PROGRESS / MASTERY INDEX */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">PROGRESS</span>
              <button onClick={() => navigate('/report')}
                className="text-[10px] font-mono text-zinc-400 hover:text-zinc-700">⋯</button>
            </div>

            {/* Big centered donut */}
            <div className="flex flex-col items-center gap-3">
              <Donut pct={USER_PROFILE.careerReadiness} size={120} stroke={12} color="#F5C542">
                <div className="text-center">
                  <div className="text-3xl font-extrabold font-mono text-zinc-900 dark:text-white leading-none">
                    {USER_PROFILE.careerReadiness}%
                  </div>
                </div>
              </Donut>
              <div className="text-center">
                <div className="text-xs font-extrabold font-display text-zinc-900 dark:text-white uppercase tracking-wide">MASTERY INDEX</div>
                <div className="text-[10px] text-zinc-400 mt-0.5">Career Readiness Score</div>
              </div>
            </div>

            {/* Sparkline */}
            <div className="pt-1">
              <Sparkline values={readinessTrend} color="#F5C542" h={52} w={220} />
            </div>

            <div className="flex flex-col gap-1 text-[10px] font-mono">
              <span className="text-emerald-500 font-bold flex items-center gap-1">
                <TrendingUp size={11} />+8% since last week
              </span>
              <span className="text-zinc-400">50% remaining until objective capture</span>
            </div>
          </div>

          {/* SKILL MASTERY */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">SKILL MASTERY</span>

            {SKILL_NODES.slice(1, 5).map(node => (
              <div key={node.id} className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-700 dark:text-zinc-300 font-medium truncate max-w-[130px]">{node.label}</span>
                  <span className={`font-bold ${
                    node.status==='Mastered'?'text-emerald-600':node.status==='Learning'?'text-amber-500':'text-rose-500'
                  }`}>{node.mastery}%</span>
                </div>
                <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${
                    node.status==='Mastered'?'bg-emerald-500':node.status==='Learning'?'bg-[#F5C542]':'bg-rose-400'
                  }`} style={{ width: `${node.mastery}%` }} />
                </div>
              </div>
            ))}

            <button onClick={() => navigate('/roadmap')}
              className="w-full text-[10px] font-mono font-bold text-zinc-500 hover:text-amber-500 flex items-center justify-center gap-1 pt-1 transition-colors">
              View All Skills <ChevronRight size={11} />
            </button>
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════
          BOTTOM ROW
      ══════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px_240px] gap-4">

        {/* WEEKLY ACTIVITY */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">WEEKLY ACTIVITY</span>
              <span className="text-[11px] text-zinc-400 font-mono">This Week</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono">
              <TrendingUp size={12} className="text-emerald-500" />
              <span className="text-emerald-600 font-bold">+15% vs last week</span>
            </div>
          </div>

          <WeeklyLineChart data={weeklyData} />

          <div className="grid grid-cols-4 gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-center font-mono">
            {[
              { v:'6.4h',  l:'Focus time',  c:'text-zinc-900 dark:text-white' },
              { v:'12',    l:'Tasks done',  c:'text-emerald-600' },
              { v:'4',     l:'Concepts',    c:'text-amber-500' },
              { v:'7d 🔥', l:'Streak',      c:'text-orange-500' },
            ].map(s => (
              <div key={s.l}>
                <div className={`text-xl font-extrabold ${s.c}`}>{s.v}</div>
                <div className="text-[10px] text-zinc-400 mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RECENT ACHIEVEMENTS */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">RECENT ACHIEVEMENTS</span>
            <button onClick={() => navigate('/report')}
              className="text-[10px] font-mono font-bold text-amber-500 hover:text-amber-600 transition-colors">
              View All
            </button>
          </div>

          {/* 2×2 badge grid */}
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((a, i) => (
              <div key={i} className={`flex flex-col items-center gap-2.5 p-4 rounded-xl ${a.bg} text-center`}>
                <div className="w-12 h-12 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center shadow-sm">
                  <a.icon size={20} className={a.color} />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-white leading-tight">{a.label}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">{a.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Phase progress bar */}
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-zinc-400 truncate">{currentPhase.title}</span>
              <span className="font-bold text-zinc-700 dark:text-zinc-200 shrink-0 ml-2">{currentPhase.progress}%</span>
            </div>
            <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-[#F5C542] rounded-full" style={{ width: `${currentPhase.progress}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
              <span>Phase {USER_PROFILE.currentPhase} of 4</span>
              <span>{USER_PROFILE.timelineWeeks - USER_PROFILE.weekNumber} weeks left</span>
            </div>
          </div>
        </div>

        {/* GUIDEX AI Activity (in bottom row) */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-[#F5C542]" />
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">GUIDEX AI LOGS</span>
          </div>
          <div className="space-y-3">
            {AI_ACTIVITY.map((log, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs leading-snug pb-2 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0 last:pb-0">
                <span className="font-mono text-amber-500 font-bold shrink-0 w-12 text-[10px]">{log.time}</span>
                <div>
                  <div className="font-bold text-zinc-900 dark:text-white text-[11px]">{log.title}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">{log.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
