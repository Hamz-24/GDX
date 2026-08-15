import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
  ArrowRight, Clock, Flame, ChevronRight, TrendingUp,
  Zap, Award, Target, BookOpen, MessageSquare, CheckCircle2,
  BarChart3, Sparkles, ChevronDown, ChevronUp, Play, Loader
} from 'lucide-react';
import AIMessageRenderer from '../components/AIMessageRenderer';

/* ── Hero SVG illustration (mountain / road path, GuideX amber tones) ── */
const HeroIllustration = () => (
  <svg viewBox="0 0 420 180" xmlns="http://www.w3.org/2000/svg" className="hidden md:block absolute right-0 top-0 h-full w-auto pointer-events-none select-none opacity-80">
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

    <path d="M 0 180 L 0 120 L 60 60 L 120 100 L 180 50 L 240 90 L 300 40 L 360 80 L 420 50 L 420 180 Z" fill="url(#mountain1)" opacity="0.35" />
    <path d="M 0 180 L 0 140 L 80 85 L 140 110 L 200 70 L 260 100 L 320 60 L 380 90 L 420 70 L 420 180 Z" fill="url(#mountain2)" opacity="0.25" />

    <path d="M 160 180 Q 200 155 210 135 Q 225 110 240 100 Q 260 88 270 78 Q 285 65 295 55" stroke="#F5C542" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.8" />
    <path d="M 175 173 Q 195 160 207 145" stroke="#fff" strokeWidth="1.5" fill="none" strokeDasharray="4 6" strokeLinecap="round" opacity="0.9" />
    <path d="M 215 128 Q 232 112 243 103" stroke="#fff" strokeWidth="1.5" fill="none" strokeDasharray="4 6" strokeLinecap="round" opacity="0.9" />
    <path d="M 252 96 Q 268 82 278 72" stroke="#fff" strokeWidth="1.5" fill="none" strokeDasharray="4 6" strokeLinecap="round" opacity="0.9" />

    <circle cx="295" cy="50" r="5" fill="#F5C542" />
    <line x1="295" y1="45" x2="295" y2="28" stroke="#F5C542" strokeWidth="1.5" />
    <path d="M 295 28 L 308 32 L 295 36 Z" fill="#F5C542" />

    {[[350,20],[380,35],[330,42],[400,15],[370,55]].map(([x,y],i)=>(
      <circle key={i} cx={x} cy={y} r="1.5" fill="#F5C542" opacity={0.5} />
    ))}
    <circle cx="390" cy="28" r="12" fill="#fef9c3" opacity="0.6" />
    <circle cx="395" cy="24" r="9" fill="#fef3c7" opacity="0.4" />
  </svg>
);

/* ── SVG Sparkline ── */
const Sparkline = ({ values = [], color = '#F5C542', h = 52, w = 220 }) => {
  const safeVals = values.length > 0 ? values : [0, 0, 0, 0, 0, 0];
  const max = Math.max(...safeVals, 1), min = Math.min(...safeVals, 0), range = max - min || 1;
  const pts = safeVals.map((v, i) => `${(i / (safeVals.length - 1)) * w},${h - ((v - min) / range) * (h - 4)}`);
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
      <circle cx={w} cy={h - ((safeVals[safeVals.length-1] - min) / range) * (h - 4)} r="3.5" fill={color} />
    </svg>
  );
};

/* ── Donut Ring ── */
const Donut = ({ pct = 64, size = 120, stroke = 10, color = '#F5C542', children }) => {
  const r = (size - stroke) / 2, circ = 2 * Math.PI * r, dash = (pct / 100) * circ;
  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)', position:'absolute', inset:0 }}>
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
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <div className={`w-full rounded-md transition-all ${i === values.length - 1 ? 'bg-[#F5C542]' : 'bg-zinc-200 dark:bg-zinc-700'}`}
            style={{ height: `${Math.max(6, (v / max) * 44)}px` }} />
          <span className="text-[9px] font-mono text-zinc-400">{days[i]}</span>
        </div>
      ))}
    </div>
  );
};

/* ── Weekly Line Chart ── */
const WeeklyLineChart = ({ data = [] }) => {
  const W = 600, H = 80;
  const safeData = data.length > 0 ? data : [
    { label:'Mon',v:0 },{ label:'Tue',v:0 },{ label:'Wed',v:0 },
    { label:'Thu',v:0 },{ label:'Fri',v:0 },{ label:'Sat',v:0 },{ label:'Sun',v:0 }
  ];
  const hasActivity = safeData.some(d => d.v > 0);
  const max = Math.max(...safeData.map(d => d.v), 1);
  const pts = safeData.map((d, i) => ({
    x: 20 + (i / (safeData.length - 1)) * (W - 40),
    y: H - 16 - ((d.v / max) * (H - 28)),
    ...d
  }));
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${pts[pts.length-1].x} ${H} L ${pts[0].x} ${H} Z`;

  return (
    <div className="relative w-full overflow-hidden">
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
      {!hasActivity && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/40 dark:bg-zinc-900/40 backdrop-blur-[1px]">
          <span className="text-xs font-mono font-bold text-zinc-500 bg-white dark:bg-zinc-800 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-700 shadow-sm">
            No focus activity recorded this week
          </span>
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════ */
/*  MAIN DASHBOARD                                        */
/* ══════════════════════════════════════════════════════ */
const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [whyOpen, setWhyOpen] = useState(false);
  const [liveData, setLiveData] = useState(null);
  const [todayData, setTodayData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = () => {
    Promise.all([
      api('/api/insights/weekly').catch(() => null),
      api('/api/roadmap/today').catch(() => null)
    ]).then(([insights, todayRes]) => {
      if (insights) setLiveData(insights);
      if (todayRes) setTodayData(todayRes);
    }).finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchDashboardData();
    const handleUpdate = () => fetchDashboardData();
    window.addEventListener('gdx_roadmap_updated', handleUpdate);
    return () => window.removeEventListener('gdx_roadmap_updated', handleUpdate);
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'Developer';
  const h = new Date().getHours();
  const greeting = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';

  const activeStreak = liveData?.streak !== undefined ? liveData.streak : (user?.streak || 0);
  const careerReadiness = liveData?.careerReadiness || 0;
  const weeklyData = liveData?.weeklyData || [
    { label:'Mon',v:0 },{ label:'Tue',v:0 },{ label:'Wed',v:0 },
    { label:'Thu',v:0 },{ label:'Fri',v:0 },{ label:'Sat',v:0 },{ label:'Sun',v:0 }
  ];

  const skillNodes = liveData?.skillNodes && liveData.skillNodes.length > 0 ? liveData.skillNodes : [
    { id: 'node-0', label: user?.goal || 'Core Engineering', mastery: careerReadiness, status: careerReadiness > 50 ? 'Learning' : 'Pending' }
  ];

  const nextAction = liveData?.nextBestAction || {
    title: todayData?.step ? `Day ${todayData.currentDay || 1}: ${todayData.step.dayName}` : 'Today\'s Primary Mission',
    description: todayData?.step?.context || 'Complete today\'s primary roadmap mission.',
    durationMinutes: 45,
    signals: [
      { label: 'Status', value: 'Active', status: 'good' }
    ]
  };

  const aiLogs = liveData?.aiActivity || [
    { time: 'Just now', title: 'Guidex System Active', desc: `Connected to goal ${user?.goal || 'DATA STRUCTURES'}` }
  ];

  const todayStepTasks = todayData?.step?.tasks || [];
  const missionProgress = todayStepTasks.length > 0
    ? Math.round((todayStepTasks.filter(t => t.completed).length / todayStepTasks.length) * 100)
    : 0;

  const achievements = [
    { icon: Flame,    label: `${activeStreak} Day Streak`, sub: 'Great going!', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/40' },
    { icon: Target,   label: 'Goal Focus',      sub: user?.goal || 'Software Dev', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
    { icon: Award,    label: 'Mastery Index',   sub: `${careerReadiness}% Score`, color: 'text-[#F5C542]', bg: 'bg-amber-50 dark:bg-amber-950/40' },
    { icon: BookOpen, label: 'Consistent',      sub: `Day ${todayData?.currentDay || 1} Active`, color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-950/40' },
  ];

  const taskStatus = (i) => i === 0
    ? { label:'In Progress', cls:'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400', dot:'bg-emerald-500' }
    : { label:'Pending',     cls:'bg-zinc-100 dark:bg-zinc-800 text-zinc-500',                                   dot:'bg-zinc-400'   };

  return (
    <div className="space-y-6 font-sans pb-12">

      {/* HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800 border border-zinc-200/80 dark:border-zinc-800 px-6 sm:px-8 py-7 shadow-sm">
        <HeroIllustration />

        <div className="relative z-10 max-w-[560px] space-y-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display text-zinc-900 dark:text-white tracking-tight leading-tight">
            {greeting}, {firstName}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 font-medium">
            Ready to engineering your next learning milestone?
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] font-mono text-zinc-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
              <span className="font-bold text-zinc-600 dark:text-zinc-300">SYSTEM STATUS</span>
              <span className="text-emerald-500 font-bold">ACTIVE</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Sparkles size={11} className="text-[#F5C542]" />
              Goal: <strong className="text-zinc-800 dark:text-zinc-200 font-bold">{user?.goal || 'DATA STRUCTURES'}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* MAIN RESPONSIVE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[290px_1fr_270px] gap-5 items-start">

        {/* ── COLUMN 1: Momentum + Today's Plan ── */}
        <div className="space-y-5">

          {/* MOMENTUM CARD */}
          <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">MOMENTUM</span>
              <Flame size={18} className="text-orange-500" />
            </div>

            <div>
              <div className="text-5xl font-extrabold font-display text-zinc-900 dark:text-white leading-none">
                {activeStreak}
              </div>
              <div className="text-xs text-zinc-500 font-medium mt-1">Days streak</div>
              <button onClick={() => navigate('/roadmap')}
                className="mt-2 text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 hover:gap-2 transition-all cursor-pointer">
                Keep it up! 🔥
              </button>
            </div>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <ActivityBars
                values={weeklyData.map(d => d.v)}
                days={['Mon','Tue','Wed','Thu','Fri','Sat','Sun']}
              />
            </div>
          </div>

          {/* TODAY'S PLAN CARD */}
          <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">TODAY'S PLAN</span>
                <span className="text-[11px] text-zinc-400 font-medium">{todayStepTasks.length} tasks scheduled</span>
              </div>
              <button onClick={() => navigate('/tasks')}
                className="text-[10px] font-mono font-bold text-amber-500 hover:text-amber-600 flex items-center gap-0.5 transition-colors cursor-pointer">
                View All <ChevronRight size={12} />
              </button>
            </div>

            <div className="space-y-2.5">
              {todayStepTasks.map((t, i) => {
                const s = taskStatus(i);
                return (
                  <div key={t.taskId || i}
                    onClick={() => navigate('/focus', { state: { task: { title: t.title, minutes: 25 } } })}
                    title={t.title}
                    className="flex items-center gap-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/60 p-2.5 rounded-2xl transition-colors group">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      i === 0 ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-600' :
                      i === 1 ? 'bg-violet-100 dark:bg-violet-950/40 text-violet-600' :
                                'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                    }`}>
                      {i === 0 ? <BookOpen size={14} /> : i === 1 ? <Play size={14} /> : <Zap size={14} />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-2 leading-snug">{t.title}</div>
                      <div className="text-[10px] text-zinc-400 font-mono truncate mt-0.5">
                        {user?.goal || 'Learning Mission'}
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 ${t.completed ? 'bg-emerald-100 text-emerald-700' : s.cls}`}>
                        <span className={`w-1 h-1 rounded-full ${t.completed ? 'bg-emerald-500' : s.dot}`} />
                        {t.completed ? 'Done' : s.label}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">25 min</span>
                    </div>
                  </div>
                );
              })}

              {todayStepTasks.length === 0 && (
                <div className="text-xs text-zinc-400 italic py-3 text-center">
                  No active tasks remaining for today's roadmap step.
                </div>
              )}
            </div>

            <button onClick={() => navigate('/focus')}
              className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-xs py-3 rounded-2xl transition-all hover:bg-[#F5C542] hover:text-zinc-950 flex items-center justify-center gap-2 group cursor-pointer shadow-sm">
              Continue Learning <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* ── COLUMN 2: Objective + Insights ── */}
        <div className="space-y-5">

          {/* OBJECTIVE CARD */}
          <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-7 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
              <div className="space-y-4 flex-1 w-full">
                <div>
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block mb-1">OBJECTIVE</span>
                  <h2 className="text-xl sm:text-2xl font-extrabold font-display text-zinc-900 dark:text-white tracking-tight leading-snug break-words">
                    {loading ? 'Loading today\'s mission...' : `Day ${todayData?.currentDay || 1}: ${todayData?.step?.dayName || 'Core Technical Module'}`}
                  </h2>
                </div>

                <div>
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block mb-1">CURRENT FOCUS</span>
                  <button onClick={() => navigate('/concept')}
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-zinc-700 dark:text-zinc-200 hover:text-amber-500 transition-colors text-left break-words cursor-pointer">
                    <BookOpen size={14} className="text-[#F5C542] shrink-0" />
                    <span>{todayData?.step?.context || 'Core Technical Capability Node'}</span>
                  </button>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono text-zinc-400">
                    <span>Mission progress</span>
                    <span className="font-bold text-zinc-700 dark:text-zinc-200">{missionProgress}%</span>
                  </div>
                  <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[#F5C542] rounded-full transition-all duration-700"
                      style={{ width: `${missionProgress}%` }} />
                  </div>
                </div>
              </div>

              {/* Donut Ring */}
              <div className="shrink-0 self-center sm:self-start">
                <Donut pct={missionProgress} size={115} stroke={10} color="#F5C542">
                  <div className="text-center">
                    <div className="text-2xl font-extrabold font-mono text-zinc-900 dark:text-white leading-none">
                      {missionProgress}%
                    </div>
                    <div className="text-[9px] font-mono text-zinc-400 mt-1">today</div>
                  </div>
                </Donut>
              </div>
            </div>
          </div>

          {/* INSIGHTS & RECOMMENDATIONS CARD */}
          <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-7 space-y-5 shadow-sm">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">INSIGHTS & RECOMMENDATIONS</span>

            {/* Mentor callout */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-zinc-900 dark:bg-zinc-800 flex items-center justify-center shrink-0 shadow-sm">
                  <MessageSquare size={18} className="text-[#F5C542]" />
                </div>
                <div>
                  <div className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">Your mentor is ready!</div>
                  <div className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                    Get personalised Socratic guidance and clarify doubts.
                  </div>
                </div>
              </div>
              <button onClick={() => navigate('/mentor')}
                className="shrink-0 text-xs sm:text-sm font-bold text-amber-500 hover:text-amber-600 flex items-center gap-1 transition-colors whitespace-nowrap cursor-pointer">
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

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white leading-snug break-words">{nextAction.title}</div>
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{nextAction.description}</p>
                </div>
                <button onClick={() => navigate('/focus')}
                  className="shrink-0 bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs px-3.5 py-2 rounded-full shadow-sm transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer self-start">
                  <Clock size={13} /> {nextAction.durationMinutes} min
                </button>
              </div>

              {/* Expandable why */}
              <button onClick={() => setWhyOpen(v => !v)}
                className="text-[10px] font-mono text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 flex items-center gap-0.5 transition-colors cursor-pointer">
                Why this? {whyOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              </button>
              {whyOpen && (
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {nextAction.signals.map(s => (
                    <div key={s.label} className="text-[10px] font-mono bg-zinc-50 dark:bg-zinc-800 rounded-xl px-3 py-2">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
                  <TrendingUp size={16} className="text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">Career Readiness</div>
                  <div className="text-[11px] text-zinc-400">{careerReadiness}% computed score</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center shrink-0">
                  <Clock size={16} className="text-amber-500" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">Focus Logged</div>
                  <div className="text-[11px] text-zinc-400">{liveData?.totalFocusHours || '0.0'} hours</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── COLUMN 3: Progress + Mastery ── */}
        <div className="space-y-5 col-span-1 md:col-span-2 xl:col-span-1">

          {/* MASTERY INDEX CARD */}
          <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">PROGRESS</span>
              <button onClick={() => navigate('/report')}
                className="text-[10px] font-mono text-zinc-400 hover:text-zinc-700 cursor-pointer">⋯</button>
            </div>

            <div className="flex flex-col items-center gap-3">
              <Donut pct={careerReadiness} size={110} stroke={10} color="#F5C542">
                <div className="text-center">
                  <div className="text-2xl font-extrabold font-mono text-zinc-900 dark:text-white leading-none">
                    {careerReadiness}%
                  </div>
                </div>
              </Donut>
              <div className="text-center">
                <div className="text-xs font-extrabold font-display text-zinc-900 dark:text-white uppercase tracking-wide">MASTERY INDEX</div>
                <div className="text-[10px] text-zinc-400 mt-0.5">Career Readiness Score</div>
              </div>
            </div>

            <div className="pt-1">
              <Sparkline values={weeklyData.map(d => d.v)} color="#F5C542" h={48} w={220} />
            </div>

            <div className="flex flex-col gap-1 text-[10px] font-mono">
              <span className="text-emerald-500 font-bold flex items-center gap-1">
                <TrendingUp size={11} />Live database calculations
              </span>
              <span className="text-zinc-400">{100 - careerReadiness}% remaining until goal completion</span>
            </div>
          </div>

          {/* SKILL MASTERY CARD */}
          <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4 shadow-sm">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">SKILL MASTERY</span>

            <div className="space-y-3">
              {skillNodes.map(node => (
                <div key={node.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono gap-2">
                    <span className="text-zinc-700 dark:text-zinc-300 font-medium leading-snug break-words" title={node.label}>
                      {node.label}
                    </span>
                    <span className={`font-bold shrink-0 ${
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
            </div>

            <button onClick={() => navigate('/roadmap')}
              className="w-full text-[10px] font-mono font-bold text-zinc-500 hover:text-amber-500 flex items-center justify-center gap-1 pt-1 transition-colors cursor-pointer">
              View All Skills <ChevronRight size={11} />
            </button>
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════
          BOTTOM ROW
      ══════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1fr_320px_280px] gap-5 items-start">

        {/* WEEKLY ACTIVITY */}
        <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">WEEKLY ACTIVITY</span>
              <span className="text-[11px] text-zinc-400 font-mono">This Week</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono">
              <TrendingUp size={12} className="text-emerald-500" />
              <span className="text-emerald-600 font-bold">Live database metrics</span>
            </div>
          </div>

          <WeeklyLineChart data={weeklyData} />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-center font-mono">
            {[
              { v:`${liveData?.totalFocusHours || '0.0'}h`,  l:'Focus time',  c:'text-zinc-900 dark:text-white' },
              { v:`${liveData?.tasksCompleted || 0}`,    l:'Tasks done',  c:'text-emerald-600' },
              { v:`${todayData?.currentDay || 1}`,     l:'Current Day',    c:'text-amber-500' },
              { v:`${activeStreak}d 🔥`, l:'Streak',      c:'text-orange-500' },
            ].map(s => (
              <div key={s.l} className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/40">
                <div className={`text-lg font-extrabold ${s.c}`}>{s.v}</div>
                <div className="text-[10px] text-zinc-400 mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RECENT ACHIEVEMENTS */}
        <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">RECENT ACHIEVEMENTS</span>
            <button onClick={() => navigate('/report')}
              className="text-[10px] font-mono font-bold text-amber-500 hover:text-amber-600 transition-colors cursor-pointer">
              View All
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {achievements.map((a, i) => (
              <div key={i} className={`flex flex-col items-center gap-2 p-3.5 rounded-2xl ${a.bg} text-center`}>
                <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center shadow-sm">
                  <a.icon size={18} className={a.color} />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-white leading-tight break-words">{a.label}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5 truncate max-w-[100px]">{a.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-zinc-400 truncate">{user?.goal || 'Engineering Goal'}</span>
              <span className="font-bold text-zinc-700 dark:text-zinc-200 shrink-0 ml-2">{careerReadiness}%</span>
            </div>
            <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-[#F5C542] rounded-full" style={{ width: `${careerReadiness}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
              <span>Day {todayData?.currentDay || 1} of {todayData?.totalDays || 28}</span>
              <span>{user?.timelineWeeks || 4} weeks timeline</span>
            </div>
          </div>
        </div>

        {/* GUIDEX AI LOGS */}
        <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4 shadow-sm col-span-1 md:col-span-2 xl:col-span-1">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-[#F5C542]" />
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">GUIDEX AI LOGS</span>
          </div>
          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
            {aiLogs.map((log, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs leading-snug pb-2.5 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0 last:pb-0">
                <span className="font-mono text-amber-500 font-bold shrink-0 w-12 text-[10px] pt-0.5">{log.time}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-zinc-900 dark:text-white text-[11px]">{log.title}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5 line-clamp-2 leading-relaxed">{log.desc}</div>
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
