import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock, Flame, Target, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const WeeklyReport = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchReport = () => {
    setLoading(true);
    setError(false);
    api('/api/insights/weekly')
      .then(res => {
        setReportData(res);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const goalTitle = user?.goal || 'DATA STRUCTURES';
  const currentDay = reportData?.currentRoadmapDay || user?.currentRoadmapDay || 1;
  const totalRoadmapDays = reportData?.totalRoadmapDays || (user?.timelineWeeks ? user.timelineWeeks * 7 : 28);
  const totalRoadmapWeeks = reportData?.totalRoadmapWeeks || Math.ceil(totalRoadmapDays / 7) || 4;
  const currentWeek = reportData?.currentWeek || Math.ceil(currentDay / 7) || 1;

  const streak = reportData?.streak !== undefined ? reportData.streak : (user?.streak || 0);
  const tasksCompleted = reportData?.tasksCompleted || 0;
  const focusHours = reportData?.totalFocusHours || '0.0';
  const focusMinutes = reportData?.totalFocusMinutes || 0;
  const readiness = reportData?.careerReadiness || 0;
  const breakdown = reportData?.careerReadinessBreakdown || { roadmapCompletion: 0, taskCompletion: 0, streakBonus: 0 };
  const nextModule = reportData?.nextModule || { day: currentDay, title: 'Daily Roadmap Mission' };

  // Calculate current date range string dynamically
  const getWeekDateRange = () => {
    const curr = new Date();
    const first = curr.getDate() - curr.getDay() + 1; // Monday
    const last = first + 6; // Sunday
    const monday = new Date(curr.setDate(first));
    const sunday = new Date(curr.setDate(last));
    const opts = { month: 'short', day: 'numeric' };
    return `${monday.toLocaleDateString('en-US', opts)} – ${sunday.toLocaleDateString('en-US', opts)}`;
  };

  const hasActivity = tasksCompleted > 0 || focusMinutes > 0 || streak > 0;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 font-sans pt-2 sm:pt-4 pb-16 animate-pulse">
        <div className="space-y-2 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <div className="h-4 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
          <div className="h-9 w-64 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
          ))}
        </div>
        <div className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl text-center space-y-4 shadow-sm font-sans">
        <AlertCircle size={36} className="text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold font-display text-zinc-900 dark:text-white">Unable to load Weekly Insights</h3>
        <p className="text-xs text-zinc-500">Could not sync live report metrics from database.</p>
        <button
          onClick={fetchReport}
          className="bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs py-2.5 px-5 rounded-full shadow-pill transition-all inline-flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw size={14} /> Retry Sync
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 font-sans pt-2 sm:pt-4 pb-16">

      {/* Header Banner */}
      <div className="space-y-2 border-b border-zinc-200/80 dark:border-zinc-800 pb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block">
            WEEK {currentWeek} OF {totalRoadmapWeeks} · {goalTitle}
          </span>
          <span className="text-[10px] font-mono text-zinc-400">
            ({getWeekDateRange()})
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold font-display text-zinc-900 dark:text-white tracking-tight">
          Your Week in Review
        </h1>
      </div>

      {/* ── COMPACT METRICS GRID (Live Database Numbers) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm text-center">
          <span className="text-2xl font-extrabold font-mono text-zinc-900 dark:text-white block">{tasksCompleted}</span>
          <span className="text-[11px] font-mono text-zinc-500 font-medium block mt-0.5">Tasks Done</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm text-center">
          <span className="text-2xl font-extrabold font-mono text-zinc-900 dark:text-white block">{focusHours}h</span>
          <span className="text-[11px] font-mono text-zinc-500 font-medium block mt-0.5">Focus Time</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm text-center">
          <span className="text-2xl font-extrabold font-mono text-zinc-900 dark:text-white block">Day {currentDay}</span>
          <span className="text-[11px] font-mono text-zinc-500 font-medium block mt-0.5">Roadmap Position</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm text-center">
          <span className="text-2xl font-extrabold font-mono text-amber-500 block">{streak} days 🔥</span>
          <span className="text-[11px] font-mono text-zinc-500 font-medium block mt-0.5">Active Streak</span>
        </div>
      </div>

      {/* ── THE AI READ (Factual & Honest) ── */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">THE AI READ</span>
          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Live Database Metrics
          </span>
        </div>

        <p className="text-lg md:text-xl font-medium leading-relaxed text-zinc-900 dark:text-white">
          "You are currently tracking on Day <strong className="font-extrabold text-amber-500">{currentDay}</strong> of your {totalRoadmapDays}-day <strong>{goalTitle}</strong> curriculum. You completed <strong className="text-amber-500">{tasksCompleted}</strong> tasks and logged <strong className="text-amber-500">{focusHours} hours</strong> of focus this week."
        </p>

        {/* Career Readiness Context Breakdown */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-zinc-800 dark:text-zinc-200">CAREER READINESS SCORE</span>
            <span className="font-extrabold text-[#F5C542] text-sm">{readiness}%</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-zinc-500">
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-xl border border-zinc-200/60 dark:border-zinc-800">
              <span className="block text-zinc-400">Roadmap</span>
              <strong className="text-zinc-900 dark:text-zinc-200 text-xs">{breakdown.roadmapCompletion}%</strong>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-xl border border-zinc-200/60 dark:border-zinc-800">
              <span className="block text-zinc-400">Tasks</span>
              <strong className="text-zinc-900 dark:text-zinc-200 text-xs">{breakdown.taskCompletion}%</strong>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-xl border border-zinc-200/60 dark:border-zinc-800">
              <span className="block text-zinc-400">Streak Bonus</span>
              <strong className="text-amber-500 text-xs">+{breakdown.streakBonus}%</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-zinc-200/80 dark:bg-zinc-800" />

      {/* ── NARRATIVE CARDS ── */}
      <div className="space-y-6">

        {/* WHAT IMPROVED */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-2">
          <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">
            WHAT IMPROVED
          </span>

          <h3 className="text-lg font-bold font-display text-zinc-900 dark:text-white">
            {hasActivity ? (
              tasksCompleted > 0 ? `${goalTitle} Task Execution ↑` : focusMinutes > 0 ? `Focus Session Activity ↑` : `Active Streak Momentum ↑`
            ) : (
              `No measurable progress yet`
            )}
          </h3>

          <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed font-medium">
            {hasActivity ? (
              `Completed ${tasksCompleted} tasks and logged ${focusHours} focus hours this week. Continuous execution builds technical mastery.`
            ) : (
              `Complete your first task or log a focus session to start building this week's progress.`
            )}
          </p>
        </div>

        {/* WHAT NEEDS ATTENTION */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-2">
          <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest block">
            WHAT NEEDS ATTENTION
          </span>

          <h3 className="text-lg font-bold font-display text-zinc-900 dark:text-white">
            {tasksCompleted === 0 ? 'Task Completion' : focusMinutes === 0 ? 'Focus Consistency' : 'Maintain Daily Pace'}
          </h3>

          <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed font-medium">
            {tasksCompleted === 0 ? (
              `Complete your first roadmap task this week to stay on track for your Day ${currentDay} milestone.`
            ) : focusMinutes === 0 ? (
              `Try a 45-minute focus session today to build deep focus habits.`
            ) : (
              `You're on track! Maintain your current daily pace to prevent objective drift.`
            )}
          </p>
        </div>

        {/* CURRENT ROADMAP POSITION */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3">
          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">
            CURRENT ROADMAP POSITION
          </span>

          <h3 className="text-lg font-bold font-display text-zinc-900 dark:text-white">
            Day {currentDay} of {totalRoadmapDays} Total Days
          </h3>

          <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed font-medium">
            Curriculum currently synced for Day {currentDay} of {totalRoadmapDays} total days in {goalTitle}.
          </p>

          <button
            onClick={() => navigate('/roadmap')}
            className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer inline-flex items-center gap-1"
          >
            <span>View Live Roadmap</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* NEXT ROADMAP MODULE */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3">
          <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block">
            NEXT ROADMAP MODULE
          </span>

          <h3 className="text-lg font-bold font-display text-zinc-900 dark:text-white">
            Day {nextModule.day}: {nextModule.title}
          </h3>

          <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed font-medium">
            {nextModule.phaseName || goalTitle} module. Review technical concepts and complete scheduled tasks.
          </p>

          <button
            onClick={() => navigate('/roadmap')}
            className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer inline-flex items-center gap-1"
          >
            <span>Go to Roadmap Module</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* NEXT FOCUS SPRINT */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
          <div>
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">
              NEXT FOCUS SPRINT
            </span>
            <h3 className="text-lg font-bold font-display text-zinc-900 dark:text-white mt-1">
              Daily Focus Session
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed font-medium mt-1">
              {focusMinutes === 0
                ? 'Start your first focus session to begin logging technical activity.'
                : `You've logged ${focusHours} hours. Start another focus session to boost your career readiness score.`}
            </p>
          </div>

          <button
            onClick={() => navigate('/focus')}
            className="inline-flex items-center gap-1.5 bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs py-3 px-6 rounded-full shadow-pill transition-all cursor-pointer"
          >
            <span>Start Focus Session</span>
            <ArrowRight size={14} />
          </button>
        </div>

      </div>

    </div>
  );
};

export default WeeklyReport;
