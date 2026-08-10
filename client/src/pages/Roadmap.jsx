import { useState, useEffect } from 'react';
import { ArrowRight, ChevronDown, ChevronUp, Sparkles, Clock, Target, Plus, CheckCircle2, Play, BookOpen, X, Check, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { USER_PROFILE, CORE_GOALS, TIMELINES, LEVELS, getRoadmapByGoal, DSA_ROADMAP } from '../constants/userProfile';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Roadmap = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  // Goal Form State
  const [selectedGoal, setSelectedGoal] = useState(user?.goal || 'DATA STRUCTURES');
  const [timeline, setTimeline] = useState(user?.timelineWeeks ? `${user.timelineWeeks} Weeks` : '4 Weeks');
  const [level, setLevel] = useState(user?.level || 'Basic / Beginner');
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [loadingBackend, setLoadingBackend] = useState(true);

  // Active roadmap data generated dynamically for timeline (4, 8, 12 weeks), level, & domain!
  const [roadmapData, setRoadmapData] = useState(() => getRoadmapByGoal(selectedGoal, timeline, level));
  // Default expanded week
  const [expandedWeek, setExpandedWeek] = useState(1);

  // Load live roadmap from backend API if logged in
  useEffect(() => {
    let isMounted = true;
    api('/api/roadmap')
      .then(steps => {
        if (!isMounted) return;
        if (Array.isArray(steps) && steps.length > 0) {
          // Transform backend format to UI week/day format
          const weekMap = {};
          steps.forEach(step => {
            const w = step.week || 1;
            const weekLabel = `WEEK ${String(w).padStart(2, '0')}`;
            if (!weekMap[w]) {
              weekMap[w] = {
                id: w,
                num: weekLabel,
                title: step.phaseName || `WEEK ${w} MASTERY`,
                status: w === 1 ? 'In Progress' : 'Upcoming',
                current: w === 1,
                progress: w === 1 ? 30 : 0,
                duration: '7 Days',
                whyMatters: step.context || 'Core technical capability milestone.',
                days: []
              };
            }

            // Prevent duplicate day entries inside the week
            if (!weekMap[w].days.some(d => d.day === step.day)) {
              weekMap[w].days.push({
                day: step.day,
                title: step.dayName || `Day ${step.day}: ${step.phaseName}`,
                desc: step.context || (step.tasks && step.tasks[0]?.title) || 'Daily focus topic',
                status: step.completed ? 'Completed' : (step.day === 3 ? 'In Progress' : 'Upcoming'),
                current: step.day === 3,
                duration: '45 min',
                prompt: `Explain Day ${step.day}: ${step.dayName} for ${selectedGoal}.`
              });
            }
          });

          const transformed = Object.values(weekMap);
          // Only override if transformed count matches timeline requested length
          const expectedWeeks = parseInt(timeline) || 4;
          if (transformed.length === expectedWeeks) {
            setRoadmapData(transformed);
          }
        }
      })
      .catch(() => {
        // Fallback to dynamic personalized curriculum
      })
      .finally(() => {
        if (isMounted) setLoadingBackend(false);
      });

    return () => { isMounted = false; };
  }, [selectedGoal, timeline, level]);

  const toggleWeek = (id) => setExpandedWeek(prev => prev === id ? null : id);

  const handleGoalSubmit = async (e) => {
    e.preventDefault();
    setLoadingBackend(true);
    const newRoadmap = getRoadmapByGoal(selectedGoal, timeline, level);
    setRoadmapData(newRoadmap);
    setExpandedWeek(1);
    setShowGoalModal(false);

    // Call backend reset & sync if authenticated
    try {
      await api('/api/roadmap', { method: 'DELETE' });
      const weeksInt = parseInt(timeline) || 4;
      await api('/api/profile', {
        method: 'PUT',
        body: JSON.stringify({ goal: selectedGoal, level, timelineWeeks: weeksInt })
      });
      if (setUser && user) {
        setUser({ ...user, goal: selectedGoal, level, timelineWeeks: weeksInt });
      }
    } catch {
      /* fallback gracefully */
    } finally {
      setLoadingBackend(false);
    }
  };

  const openConcept = (dayItem) => {
    navigate('/concept', {
      state: {
        day: dayItem.day,
        domain: selectedGoal
      }
    });
  };

  const explainWithAI = (dayItem) => {
    navigate('/mentor', {
      state: {
        dayTopic: dayItem.title,
        prompt: dayItem.prompt || `Explain ${dayItem.title} for a ${level} level student studying ${selectedGoal}. Provide step-by-step logic, code, and key concepts.`,
        duration: dayItem.duration,
        level: level,
        goal: selectedGoal
      }
    });
  };

  const startPractice = (dayItem) => {
    navigate('/focus', {
      state: {
        task: {
          title: dayItem.title,
          minutes: parseInt(dayItem.duration) || 25
        }
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans pb-16">

      {/* Header Banner with Goal Switcher */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 rounded-full text-xs font-mono font-bold">
              {level.toUpperCase()}
            </span>
            <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full text-xs font-mono font-bold">
              ⏱ {timeline} TIMELINE ({roadmapData.length * 7} DAYS TOTAL)
            </span>
            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-mono font-bold">
              CONNECTED BACKEND
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold font-display text-zinc-900 dark:text-white tracking-tight">
            {selectedGoal}
          </h1>
          <p className="text-xs text-zinc-500 font-medium">
            Personalized {roadmapData.length}-Week curriculum ({roadmapData.length * 7} Days) tailored for {level} level in {selectedGoal}.
          </p>
        </div>

        <button
          onClick={() => setShowGoalModal(true)}
          className="bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs py-3 px-6 rounded-full shadow-pill transition-all shrink-0 flex items-center justify-center gap-2 self-start md:self-center"
        >
          <Target size={16} /> Form Goal & Timeline
        </button>
      </div>

      {/* Goal Creation Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block">GOAL ENGINE</span>
                <h3 className="text-xl font-extrabold font-display text-zinc-900 dark:text-white mt-0.5">
                  Select Core Goal & Timeline
                </h3>
              </div>
              <button onClick={() => setShowGoalModal(false)} className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleGoalSubmit} className="space-y-5 text-xs font-sans">
              <div className="space-y-2">
                <label className="block text-zinc-700 dark:text-zinc-300 font-bold">
                  1. Select Core Goal (4 Curated Domains)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {CORE_GOALS.map(g => (
                    <button
                      type="button"
                      key={g.id}
                      onClick={() => setSelectedGoal(g.name)}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        selectedGoal === g.name
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-[#F5C542] ring-1 ring-[#F5C542]'
                          : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700/60 hover:border-amber-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold font-display text-zinc-900 dark:text-white text-xs">
                          {g.name}
                        </span>
                        {selectedGoal === g.name && <Check size={14} className="text-[#F5C542]" />}
                      </div>
                      <span className="text-[10px] text-zinc-500 block mt-1 leading-snug">
                        {g.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-bold mb-2">2. Timeline Duration</label>
                  <select
                    value={timeline}
                    onChange={e => setTimeline(e.target.value)}
                    className="w-full p-3.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xs font-mono font-bold text-zinc-900 dark:text-white focus:outline-none"
                  >
                    {TIMELINES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-bold mb-2">3. Experience Level</label>
                  <select
                    value={level}
                    onChange={e => setLevel(e.target.value)}
                    className="w-full p-3.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xs font-mono font-bold text-zinc-900 dark:text-white focus:outline-none"
                  >
                    {LEVELS.map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loadingBackend}
                  className="w-full bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-sm py-3.5 rounded-2xl shadow-pill transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Sparkles size={16} /> Generate {timeline} Personalized Curriculum
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Roadmap notification banner */}
      <div className="flex items-center justify-between gap-4 px-5 py-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-amber-500 shrink-0" />
          <span className="text-zinc-800 dark:text-zinc-200 font-medium">
            <strong className="font-bold">{roadmapData.length}-Week Personal Roadmap Active:</strong> {roadmapData.length * 7} Unique Days generated for {selectedGoal} ({level}).
          </span>
        </div>
      </div>

      {/* DYNAMIC MULTI-WEEK ROADMAP TIMELINE */}
      <div className="space-y-6">
        {roadmapData.map(week => (
          <div
            key={week.id}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm transition-all"
          >
            {/* Week Header */}
            <div
              onClick={() => toggleWeek(week.id)}
              className="p-6 flex items-center justify-between gap-4 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-mono text-xs font-extrabold shrink-0 ${
                  week.status === 'Completed'
                    ? 'bg-emerald-500 text-white'
                    : week.current
                    ? 'bg-[#F5C542] text-zinc-950 shadow-pill'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                }`}>
                  {week.id}
                </div>

                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest">
                      {week.num} · {week.duration}
                    </span>
                    {week.current && (
                      <span className="text-[9px] font-mono font-extrabold text-[#F5C542] bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                        ● CURRENT WEEK
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-extrabold font-display text-zinc-900 dark:text-white mt-0.5">
                    {week.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[#F5C542] rounded-full" style={{ width: `${week.progress}%` }} />
                  </div>
                  <span className="text-xs font-mono text-zinc-400 font-bold">{week.progress}%</span>
                </div>

                <div className="p-2 rounded-full text-zinc-400">
                  {expandedWeek === week.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>
            </div>

            {/* Week Content (Day-by-Day Topics) */}
            {expandedWeek === week.id && (
              <div className="border-t border-zinc-100 dark:border-zinc-800/80 p-6 bg-zinc-50/50 dark:bg-zinc-950/40 space-y-4">
                <div className="text-xs text-zinc-500 leading-relaxed font-medium">
                  <strong className="text-zinc-800 dark:text-zinc-200">Why this week matters:</strong> {week.whyMatters}
                </div>

                {/* Day-by-Day List */}
                <div className="space-y-3 pt-2">
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">
                    DAILY SCHEDULE ({week.days.length} DAYS)
                  </span>

                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                    {week.days.map((dayItem) => (
                      <div
                        key={dayItem.day}
                        className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                          dayItem.current ? 'bg-amber-50/40 dark:bg-amber-950/20' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                        }`}
                      >
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                              dayItem.status === 'Completed'
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                                : dayItem.current
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                            }`}>
                              {dayItem.status === 'Completed' ? '✓ Completed' : dayItem.current ? '● Today\'s Topic' : 'Upcoming'}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400">
                              <Clock size={11} className="inline mr-1" />
                              {dayItem.duration}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-zinc-900 dark:text-white font-display">
                            {dayItem.title}
                          </h4>
                          <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                            {dayItem.desc}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0 flex-wrap">
                          <button
                            onClick={() => openConcept(dayItem)}
                            className="bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs px-3.5 py-2 rounded-full transition-all inline-flex items-center gap-1.5 shadow-pill"
                            title="Open Daily Concept Module for this Day"
                          >
                            <BookOpen size={13} />
                            <span>Daily Concept</span>
                          </button>

                          <button
                            onClick={() => explainWithAI(dayItem)}
                            className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs px-3.5 py-2 rounded-full hover:bg-[#F5C542] hover:text-zinc-950 transition-all inline-flex items-center gap-1.5 shadow-sm"
                            title="Ask AI Mentor to explain this day's topic"
                          >
                            <Sparkles size={13} className="text-[#F5C542] dark:text-amber-600" />
                            <span>Explain with AI</span>
                          </button>

                          <button
                            onClick={() => startPractice(dayItem)}
                            className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-bold text-xs px-3 py-2 rounded-full transition-all inline-flex items-center gap-1"
                          >
                            <span>Practice</span>
                            <ArrowRight size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
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
