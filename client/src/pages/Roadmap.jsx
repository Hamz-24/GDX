import { useState, useEffect } from 'react';
import { ArrowRight, ChevronDown, ChevronUp, Sparkles, Clock, Target, Plus, CheckCircle2, Play, BookOpen, X, Check, Loader, Upload, FileText, FileCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { USER_PROFILE, CORE_GOALS, TIMELINES, LEVELS, getRoadmapByGoal, DSA_ROADMAP } from '../constants/userProfile';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

// Helper to format phase titles cleanly for display
const formatPhaseTitle = (title, weekId) => {
  if (!title) return `PHASE ${weekId} — Core Technical Foundations`;
  let cleaned = title.replace(/PHASE_(\d+):?\s*/i, 'PHASE $1 — ');
  cleaned = cleaned.replace(/PHASE\s+(\d+):?\s*/i, 'PHASE $1 — ');
  cleaned = cleaned.replace(/—\s*—/g, '—').replace(/-\s*-/g, '-');
  if (!cleaned.includes('—') && !cleaned.includes('-')) {
    cleaned = `PHASE ${weekId} — ${cleaned}`;
  }
  return cleaned.trim();
};

// Helper to format task titles for display (separates SEC tags cleanly)
const formatTaskTitle = (rawTitle) => {
  if (!rawTitle) return { mainTitle: 'Daily Roadmap Mission', subTag: '' };
  const match = rawTitle.match(/^(.*?)(?:\s*-\s*SEC_\d+:?\s*|\s*:\s*)(.*)$/i);
  if (match && match[2]) {
    const tag = match[1].replace(/_/g, ' ').trim();
    const title = match[2].trim();
    return { mainTitle: title, subTag: tag };
  }
  return { mainTitle: rawTitle, subTag: '' };
};

const Roadmap = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  // Goal Form State
  const [selectedGoal, setSelectedGoal] = useState(user?.goal || 'DATA STRUCTURES');
  const [timeline, setTimeline] = useState(user?.timelineWeeks ? `${user.timelineWeeks} Weeks` : '4 Weeks');
  const [level, setLevel] = useState(user?.level || 'Basic / Beginner');
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [loadingBackend, setLoadingBackend] = useState(true);

  // Resume & Assignment Import State
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [assignmentText, setAssignmentText] = useState('');
  const [fileName, setFileName] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  // Active roadmap data generated dynamically for timeline (4, 8, 12 weeks), level, & domain
  const [roadmapData, setRoadmapData] = useState(() => getRoadmapByGoal(selectedGoal, timeline, level));
  // Default expanded week
  const [expandedWeek, setExpandedWeek] = useState(1);

  const fetchAndSetRoadmap = async () => {
    try {
      const steps = await api('/api/roadmap');
      if (Array.isArray(steps) && steps.length > 0) {
        const weekMap = {};
        steps.forEach(step => {
          const dayNum = step.day || 1;
          const w = (step.week && step.week > 0) ? step.week : Math.ceil(dayNum / 7);
          const weekLabel = `WEEK ${String(w).padStart(2, '0')}`;

          if (!weekMap[w]) {
            weekMap[w] = {
              id: w,
              num: weekLabel,
              title: step.phaseName || `WEEK ${w} MASTERY`,
              status: 'Upcoming',
              current: w === 1,
              progress: 0,
              duration: '7 Days',
              whyMatters: step.context || 'Core technical capability milestone.',
              days: []
            };
          }

          const userCurrentDay = user?.currentRoadmapDay || 1;
          const isCompleted = Boolean(step.completed);
          const isCurrent = step.day === userCurrentDay;

          if (!weekMap[w].days.some(d => d.day === step.day)) {
            weekMap[w].days.push({
              day: step.day,
              title: step.dayName || `Day ${step.day}: ${step.phaseName}`,
              desc: step.context || (step.tasks && step.tasks[0]?.title) || 'Daily focus topic',
              status: isCompleted ? 'Completed' : (isCurrent ? 'In Progress' : 'Upcoming'),
              completed: isCompleted,
              current: isCurrent,
              duration: '45 min',
              prompt: `Explain Day ${step.day}: ${step.dayName} for ${selectedGoal}.`
            });
          }
        });

        // Compute actual week progress dynamically
        Object.values(weekMap).forEach(week => {
          const totalInWeek = week.days.length;
          const completedInWeek = week.days.filter(d => d.completed || d.status === 'Completed').length;
          week.progress = totalInWeek > 0 ? Math.round((completedInWeek / totalInWeek) * 100) : 0;
          if (week.progress === 100) {
            week.status = 'Completed';
          } else if (completedInWeek > 0 || week.days.some(d => d.current)) {
            week.status = 'In Progress';
          } else {
            week.status = 'Upcoming';
          }
        });

        const transformed = Object.values(weekMap);
        if (transformed.length > 0) {
          setRoadmapData(transformed);
        }
      }
    } catch (err) {
      console.warn("Could not fetch roadmap:", err.message);
    }
  };

  useEffect(() => {
    setLoadingBackend(true);
    fetchAndSetRoadmap().finally(() => {
      setLoadingBackend(false);
    });

    const handleUpdate = () => fetchAndSetRoadmap();
    window.addEventListener('gdx_roadmap_updated', handleUpdate);
    return () => window.removeEventListener('gdx_roadmap_updated', handleUpdate);
  }, [selectedGoal, timeline, level]);

  // Toggle a specific day's completion state
  const toggleDayCompletion = async (dayNum, currentlyCompleted) => {
    const nextState = !currentlyCompleted;
    setRoadmapData(prev => prev.map(week => ({
      ...week,
      days: week.days.map(d =>
        d.day === dayNum
          ? { ...d, status: nextState ? 'Completed' : 'Upcoming' }
          : d
      )
    })));
    try {
      await api(`/api/roadmap/${dayNum}/complete`, {
        method: 'PATCH',
        body: JSON.stringify({ completed: nextState })
      });
      window.dispatchEvent(new CustomEvent('gdx_roadmap_updated'));
    } catch {
      setRoadmapData(prev => prev.map(week => ({
        ...week,
        days: week.days.map(d =>
          d.day === dayNum
            ? { ...d, status: currentlyCompleted ? 'Completed' : 'Upcoming' }
            : d
        )
      })));
    }
  };

  const toggleWeek = (id) => setExpandedWeek(prev => prev === id ? null : id);

  const [parsingFile, setParsingFile] = useState(false);
  const [uiError, setUiError] = useState('');

  const handleFileUpload = (e, setTargetText) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setParsingFile(true);
    setUiError('');

    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'txt' || ext === 'md') {
      const reader = new FileReader();
      reader.onload = (event) => {
        let content = event.target.result || '';
        content = content.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F]/g, ' ');
        setTargetText(content);
        setParsingFile(false);
      };
      reader.readAsText(file);
    } else {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const fileBase64 = event.target.result;
          const parsed = await api('/api/roadmap/parse-document', {
            method: 'POST',
            body: JSON.stringify({ fileBase64, fileName: file.name })
          });
          setTargetText(parsed.text || '');
        } catch (err) {
          setUiError(err.message || 'Failed to extract text from document');
        } finally {
          setParsingFile(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeResume = async (e) => {
    e.preventDefault();
    if (!resumeText.trim()) return;
    setAnalyzing(true);
    setUiError('');
    try {
      await api('/api/roadmap/analyze-resume', {
        method: 'POST',
        body: JSON.stringify({ resumeText })
      });
      await fetchAndSetRoadmap();
      setShowResumeModal(false);
      setResumeText('');
      setFileName('');
    } catch (err) {
      setUiError(err.message || 'Could not analyze resume');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAnalyzeAssignment = async (e) => {
    e.preventDefault();
    if (!assignmentText.trim()) return;
    setAnalyzing(true);
    setUiError('');
    try {
      await api('/api/roadmap/analyze-assignment', {
        method: 'POST',
        body: JSON.stringify({ assignmentText })
      });
      await fetchAndSetRoadmap();
      setShowAssignmentModal(false);
      setAssignmentText('');
      setFileName('');
    } catch (err) {
      setUiError(err.message || 'Could not deconstruct assignment');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGoalSubmit = async (e) => {
    e.preventDefault();
    setLoadingBackend(true);
    const newRoadmap = getRoadmapByGoal(selectedGoal, timeline, level);
    setRoadmapData(newRoadmap);
    setExpandedWeek(1);
    setShowGoalModal(false);

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
    <div className="max-w-4xl mx-auto space-y-6 font-sans pb-16">

      {/* Header Banner with Goal Switcher */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 rounded-full text-xs font-mono font-bold">
              {level.toUpperCase()}
            </span>
            <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full text-xs font-mono font-bold">
              ⏱ {timeline} TIMELINE ({roadmapData.length * 7} DAYS TOTAL)
            </span>
            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-mono font-bold">
              LIVE DATABASE
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold font-display text-zinc-900 dark:text-white tracking-tight">
            {selectedGoal}
          </h1>
          <p className="text-xs text-zinc-500 font-medium">
            Personalized {roadmapData.length}-Week curriculum ({roadmapData.length * 7} Days) tailored for {level} level in {selectedGoal}.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            onClick={() => setShowGoalModal(true)}
            className="bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs py-2.5 px-4 rounded-full shadow-pill transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Target size={14} /> Goal Engine
          </button>

          <button
            onClick={() => setShowResumeModal(true)}
            className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs py-2.5 px-4 rounded-full hover:bg-amber-500 hover:text-zinc-950 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <FileText size={14} /> AI Resume Gap Import
          </button>

          <button
            onClick={() => setShowAssignmentModal(true)}
            className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-bold text-xs py-2.5 px-4 rounded-full transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FileCode size={14} /> Assignment Parser
          </button>
        </div>
      </div>

      {/* AI Resume Gap Import Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block">AI RESUME ENGINE</span>
                <h3 className="text-xl font-extrabold font-display text-zinc-900 dark:text-white mt-0.5">
                  Import Resume & Analyze Skill Gaps
                </h3>
              </div>
              <button onClick={() => setShowResumeModal(false)} className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-white cursor-pointer" aria-label="Close modal">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAnalyzeResume} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-bold mb-2">
                  Upload Resume File (.txt, .md, .json, .pdf)
                </label>
                <div className="relative border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-amber-400 rounded-2xl p-4 text-center cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept=".txt,.md,.json,.pdf,.docx"
                    onChange={(e) => handleFileUpload(e, setResumeText)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-1 text-zinc-500">
                    <Upload size={20} className="text-amber-500" />
                    <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200">
                      {fileName ? `File Selected: ${fileName}` : 'Click or Drag & Drop Resume File'}
                    </span>
                    <span className="text-[10px] text-zinc-400">Extracts text and feeds into Gemini AI Gap Analyzer</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-bold mb-1.5">
                  Or Paste Resume Text
                </label>
                <textarea
                  rows={4}
                  value={resumeText}
                  onChange={e => setResumeText(e.target.value)}
                  placeholder="Paste your current resume details, skills, and experience..."
                  className="w-full p-3.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xs font-mono text-zinc-900 dark:text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={analyzing || !resumeText.trim()}
                className="w-full bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-sm py-3.5 rounded-2xl shadow-pill transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {analyzing ? <Loader size={16} className="animate-spin" /> : <Sparkles size={16} />}
                <span>{analyzing ? 'Analyzing Skill Gaps via Gemini...' : 'Analyze Gaps & Re-generate Roadmap'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* AI Assignment Deconstructor Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block">AI SPRINT ENGINE</span>
                <h3 className="text-xl font-extrabold font-display text-zinc-900 dark:text-white mt-0.5">
                  Deconstruct Project / Assignment
                </h3>
              </div>
              <button onClick={() => setShowAssignmentModal(false)} className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-white cursor-pointer" aria-label="Close modal">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAnalyzeAssignment} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-bold mb-2">
                  Upload Assignment Brief (.txt, .md, .pdf)
                </label>
                <div className="relative border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-amber-400 rounded-2xl p-4 text-center cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept=".txt,.md,.json,.pdf,.docx"
                    onChange={(e) => handleFileUpload(e, setAssignmentText)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-1 text-zinc-500">
                    <Upload size={20} className="text-amber-500" />
                    <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200">
                      {fileName ? `File Selected: ${fileName}` : 'Click or Drag & Drop Project File'}
                    </span>
                    <span className="text-[10px] text-zinc-400">Parses project requirements into a 7-day sprint</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-bold mb-1.5">
                  Or Paste Project Specs / Syllabus
                </label>
                <textarea
                  rows={4}
                  value={assignmentText}
                  onChange={e => setAssignmentText(e.target.value)}
                  placeholder="Paste project guidelines, hackathon specs, or assignment details..."
                  className="w-full p-3.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xs font-mono text-zinc-900 dark:text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={analyzing || !assignmentText.trim()}
                className="w-full bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-sm py-3.5 rounded-2xl shadow-pill transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {analyzing ? <Loader size={16} className="animate-spin" /> : <Sparkles size={16} />}
                <span>{analyzing ? 'Deconstructing Project...' : 'Generate 7-Day Implementation Sprint'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

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
              <button onClick={() => setShowGoalModal(false)} className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-white cursor-pointer" aria-label="Close modal">
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
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
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
                  className="w-full bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-sm py-3.5 rounded-2xl shadow-pill transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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
      <div className="space-y-5">
        {roadmapData.map(week => {
          const displayPhaseTitle = formatPhaseTitle(week.title, week.id);
          const isWeekCompleted = week.progress === 100 || week.status === 'Completed';

          return (
            <div
              key={week.id}
              className={`bg-white dark:bg-zinc-900 border rounded-3xl overflow-hidden shadow-sm transition-all ${
                week.current
                  ? 'border-amber-400/80 dark:border-amber-500/60 ring-1 ring-amber-400/30'
                  : isWeekCompleted
                  ? 'border-emerald-200 dark:border-emerald-900/40'
                  : 'border-zinc-200/80 dark:border-zinc-800'
              }`}
            >
              {/* Week Header */}
              <div
                onClick={() => toggleWeek(week.id)}
                role="button"
                tabIndex={0}
                aria-expanded={expandedWeek === week.id}
                aria-label={`Toggle ${week.num}`}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleWeek(week.id); }}
                className="p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors select-none"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-mono text-xs font-extrabold shrink-0 ${
                    isWeekCompleted
                      ? 'bg-emerald-500 text-white'
                      : week.current
                      ? 'bg-[#F5C542] text-zinc-950 shadow-pill'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                  }`}>
                    {isWeekCompleted ? '✓' : week.id}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest">
                        {week.num} · {week.duration}
                      </span>
                      {week.current && (
                        <span className="text-[9px] font-mono font-extrabold text-amber-900 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                          ● CURRENT WEEK
                        </span>
                      )}
                      {isWeekCompleted && (
                        <span className="text-[9px] font-mono font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                          ✓ COMPLETED
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-extrabold font-display text-zinc-900 dark:text-white mt-0.5 truncate">
                      {displayPhaseTitle}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="hidden sm:flex items-center gap-2.5">
                    <div className="w-24 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${isWeekCompleted ? 'bg-emerald-500' : 'bg-[#F5C542]'}`} style={{ width: `${week.progress}%` }} />
                    </div>
                    <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 font-bold w-10 text-right">{week.progress}%</span>
                  </div>

                  <div className="p-2 rounded-full text-zinc-400">
                    {expandedWeek === week.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>
              </div>

              {/* Week Content (Day-by-Day Topics) */}
              {expandedWeek === week.id && (
                <div className="border-t border-zinc-100 dark:border-zinc-800/80 p-5 sm:p-6 bg-zinc-50/50 dark:bg-zinc-950/40 space-y-4">
                  <div className="text-xs text-zinc-500 leading-relaxed font-medium">
                    <strong className="text-zinc-800 dark:text-zinc-200">Why this week matters:</strong> {week.whyMatters}
                  </div>

                  {/* Day-by-Day List */}
                  <div className="space-y-3 pt-2">
                    <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">
                      DAILY SCHEDULE ({week.days.length} DAYS)
                    </span>

                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                      {week.days.map((dayItem) => {
                        const isDone = dayItem.status === 'Completed';
                        const formatted = formatTaskTitle(dayItem.title);

                        return (
                          <div
                            key={dayItem.day}
                            className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                              dayItem.current ? 'bg-amber-50/40 dark:bg-amber-950/20' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                            }`}
                          >
                            {/* CHECKBOX + DAY INFO */}
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              {/* NATIVE CHECKBOX */}
                              <label
                                htmlFor={`roadmap-day-${dayItem.day}`}
                                className="flex items-center mt-0.5 cursor-pointer select-none shrink-0 group"
                                title={isDone ? 'Mark task as incomplete' : 'Mark task as complete'}
                              >
                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                                  isDone
                                    ? 'bg-emerald-500 border-emerald-500'
                                    : 'border-zinc-300 dark:border-zinc-600 group-hover:border-amber-500'
                                }`}>
                                  {isDone && (
                                    <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                                      <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  )}
                                </div>
                                <input
                                  id={`roadmap-day-${dayItem.day}`}
                                  type="checkbox"
                                  checked={isDone}
                                  onChange={() => toggleDayCompletion(dayItem.day, isDone)}
                                  className="sr-only"
                                />
                              </label>

                              <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                                    isDone
                                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                                      : dayItem.current
                                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                                  }`}>
                                    {isDone ? '✓ Completed' : dayItem.current ? "● Today's Topic" : 'Upcoming'}
                                  </span>

                                  {formatted.subTag && (
                                    <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">
                                      {formatted.subTag}
                                    </span>
                                  )}

                                  <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                                    <Clock size={11} className="inline text-zinc-400" />
                                    {dayItem.duration}
                                  </span>
                                </div>

                                <h4 className={`text-sm font-bold font-display transition-colors ${
                                  isDone ? 'text-zinc-400 dark:text-zinc-500 line-through' : 'text-zinc-900 dark:text-white'
                                }`} title={dayItem.title}>
                                  {formatted.mainTitle}
                                </h4>

                                <p className="text-xs text-zinc-500 leading-relaxed font-medium line-clamp-2">
                                  {dayItem.desc}
                                </p>
                              </div>
                            </div>

                            {/* Actions with visual hierarchy */}
                            <div className="flex items-center gap-2 shrink-0 flex-wrap">
                              {/* Primary Action: Daily Concept */}
                              <button
                                onClick={() => openConcept(dayItem)}
                                className="bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs px-3.5 py-2 rounded-full transition-all inline-flex items-center gap-1.5 shadow-pill cursor-pointer"
                                title="Open Daily Concept Module for this Day"
                              >
                                <BookOpen size={13} />
                                <span>Daily Concept</span>
                              </button>

                              {/* Secondary Action: Explain with AI */}
                              <button
                                onClick={() => explainWithAI(dayItem)}
                                className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs px-3.5 py-2 rounded-full hover:bg-[#F5C542] hover:text-zinc-950 transition-all inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                                title="Ask AI Mentor to explain this day's topic"
                              >
                                <Sparkles size={13} className="text-[#F5C542] dark:text-amber-600" />
                                <span>Explain with AI</span>
                              </button>

                              {/* Tertiary Action: Practice */}
                              <button
                                onClick={() => startPractice(dayItem)}
                                className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-bold text-xs px-3 py-2 rounded-full transition-all inline-flex items-center gap-1 cursor-pointer"
                                title="Start Practice Timer"
                              >
                                <span>Practice</span>
                                <ArrowRight size={13} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default Roadmap;
