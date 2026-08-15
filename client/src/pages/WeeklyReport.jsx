import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const WeeklyReport = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api('/api/insights/weekly')
      .then(res => {
        if (isMounted) setReportData(res);
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  const goalTitle = user?.goal || 'Software Engineering';
  const timelineWeeks = user?.timelineWeeks || 4;
  const currentDay = reportData?.currentRoadmapDay || user?.currentRoadmapDay || 1;
  const currentWeek = Math.ceil(currentDay / 7);

  const streak = reportData?.streak !== undefined ? reportData.streak : (user?.streak || 0);
  const tasksCompleted = reportData?.tasksCompleted || 0;
  const focusHours = reportData?.totalFocusHours || '0.0';
  const readiness = reportData?.careerReadiness || 0;

  return (
    <div className="max-w-2xl mx-auto space-y-10 font-sans pb-16">

      {/* Header */}
      <div className="space-y-1.5 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block">
          WEEK {currentWeek} OF {timelineWeeks} · {goalTitle}
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold font-display text-zinc-900 dark:text-white tracking-tight">
          Your Week in Review
        </h1>
      </div>

      {/* ── THE AI READ ── */}
      <div className="space-y-3">
        <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">THE AI READ</span>
        <p className="text-xl md:text-2xl font-medium leading-relaxed text-zinc-900 dark:text-white">
          "You are tracking on Day {currentDay} of your {goalTitle} curriculum. You have achieved a{' '}
          <span className="underline decoration-[#F5C542] font-bold">{readiness}% Career Readiness Score</span> across active roadmap modules."
        </p>
        <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
          Live Database Metrics · Goal: {goalTitle}
        </div>
      </div>

      <div className="h-px bg-zinc-200 dark:bg-zinc-800" />

      {/* ── Narrative blocks ── */}
      <div className="space-y-9">

        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">WHAT IMPROVED</span>
          <h3 className="text-lg font-bold font-display text-zinc-900 dark:text-white">{goalTitle} Progress ↑</h3>
          <p className="text-sm text-zinc-500 leading-relaxed">
            Completed {tasksCompleted} tasks and logged {focusHours} focus hours this week. Continuous consistency is building technical dominance.
          </p>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold text-rose-500 uppercase tracking-widest block">WHAT NEEDS ATTENTION</span>
          <h3 className="text-lg font-bold font-display text-zinc-900 dark:text-white">Upcoming Daily Modules ↓</h3>
          <p className="text-sm text-zinc-500 leading-relaxed">
            Stay consistent with daily roadmap check-ins to prevent objective drift. Target 45 min focus sessions per day.
          </p>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block">WHAT CHANGED — GUIDEX UPDATED YOUR PLAN</span>
          <h3 className="text-lg font-bold font-display text-zinc-900 dark:text-white">Roadmap Recalibrated</h3>
          <p className="text-sm text-zinc-500 leading-relaxed">
            Curriculum synced for Day {currentDay} of {timelineWeeks * 7} total days.
          </p>
          <button onClick={() => navigate('/roadmap')}
            className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 hover:underline">
            View Live Roadmap →
          </button>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">NEXT FOCUS SPRINT</span>
          <h3 className="text-lg font-bold font-display text-zinc-900 dark:text-white">Daily Focus Session</h3>
          <p className="text-sm text-zinc-500 leading-relaxed">
            Log your next focus session to boost your career readiness score.
          </p>
          <button onClick={() => navigate('/focus')}
            className="inline-flex items-center gap-1.5 bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs py-2 px-5 rounded-full shadow-pill transition-all">
            Start Focus Session →
          </button>
        </div>

      </div>

      <div className="h-px bg-zinc-200 dark:bg-zinc-800" />

      {/* Real database numbers */}
      <div className="space-y-4">
        <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">THE NUMBERS</span>
        <div className="grid grid-cols-3 gap-6 text-center font-mono">
          {[[`${tasksCompleted}`, 'tasks done'], [`${focusHours}h`, 'focused work'], [`${streak}`, 'day streak 🔥']].map(([val, lbl]) => (
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

