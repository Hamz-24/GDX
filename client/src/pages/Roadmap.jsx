import { useState, useEffect } from 'react';
import { ArrowRight, ChevronDown, ChevronUp, Sparkles, Clock, Target, Plus, CheckCircle2, Play, BookOpen, X, Check, Loader, Upload, FileText, FileCode, Trash2, LayoutGrid, Compass } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, setUser } = useAuth();

  // Active Tab State: 'core' | 'projects' | 'sprint_detail'
  const initialTab = searchParams.get('tab') || (searchParams.get('project') ? 'sprint_detail' : 'core');
  const [activeTab, setActiveTab] = useState(initialTab);

  // Goal Form State
  const [selectedGoal, setSelectedGoal] = useState(user?.goal || 'DATA STRUCTURES');
  const [timeline, setTimeline] = useState(user?.timelineWeeks ? `${user.timelineWeeks} Weeks` : '4 Weeks');
  const [level, setLevel] = useState(user?.level || 'Basic / Beginner');
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [loadingBackend, setLoadingBackend] = useState(true);

  // Core Roadmap State
  const [coreRoadmapData, setCoreRoadmapData] = useState(() => getRoadmapByGoal(selectedGoal, timeline, level));

  // Project Sprints State
  const [projectsList, setProjectsList] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [projectStepsData, setProjectStepsData] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Resume Engine State
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [resumeFileName, setResumeFileName] = useState('');
  const [resumeParsing, setResumeParsing] = useState(false);
  const [resumeAnalyzing, setResumeAnalyzing] = useState(false);
  const [resumeError, setResumeError] = useState('');

  // Assignment Engine State
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentText, setAssignmentText] = useState('');
  const [assignmentFileName, setAssignmentFileName] = useState('');
  const [assignmentParsing, setAssignmentParsing] = useState(false);
  const [assignmentAnalyzing, setAssignmentAnalyzing] = useState(false);
  const [assignmentError, setAssignmentError] = useState('');

  // Success Toast Banner
  const [successBanner, setSuccessBanner] = useState('');

  // Default expanded week
  const [expandedWeek, setExpandedWeek] = useState(1);

  // Fetch Core Roadmap
  const fetchCoreRoadmap = async () => {
    try {
      const steps = await api('/api/roadmap/core');
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
          setCoreRoadmapData(transformed);
        }
      }
    } catch (err) {
      console.warn("Could not fetch core roadmap:", err.message);
    }
  };

  // Fetch Projects List
  const fetchProjectsList = async () => {
    setLoadingProjects(true);
    try {
      const list = await api('/api/roadmap/projects');
      if (Array.isArray(list)) {
        setProjectsList(list);
      }
    } catch (err) {
      console.warn("Could not fetch projects list:", err.message);
    } finally {
      setLoadingProjects(false);
    }
  };

  // Fetch Specific Project Steps
  const fetchProjectSteps = async (projectId) => {
    try {
      const data = await api(`/api/roadmap/projects/${projectId}`);
      if (data && data.project && data.steps) {
        setActiveProject(data.project);
        setProjectStepsData(data.steps);
        setActiveTab('sprint_detail');
        setSearchParams({ project: projectId });
      }
    } catch (err) {
      console.warn("Could not fetch project steps:", err.message);
      setActiveTab('projects');
      setSearchParams({ tab: 'projects' });
    }
  };

  useEffect(() => {
    setLoadingBackend(true);
    Promise.all([fetchCoreRoadmap(), fetchProjectsList()]).finally(() => {
      setLoadingBackend(false);
    });

    const urlProj = searchParams.get('project');
    if (urlProj) {
      fetchProjectSteps(urlProj);
    }

    const handleUpdate = () => {
      fetchCoreRoadmap();
      fetchProjectsList();
      if (activeProject) fetchProjectSteps(activeProject.projectId);
    };

    window.addEventListener('gdx_roadmap_updated', handleUpdate);
    return () => window.removeEventListener('gdx_roadmap_updated', handleUpdate);
  }, [selectedGoal, timeline, level]);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    if (tab === 'core') {
      setSearchParams({});
    } else if (tab === 'projects') {
      setSearchParams({ tab: 'projects' });
    }
  };

  // Toggle Core Day Completion
  const toggleCoreDayCompletion = async (dayNum, currentlyCompleted) => {
    const nextState = !currentlyCompleted;
    setCoreRoadmapData(prev => prev.map(week => ({
      ...week,
      days: week.days.map(d =>
        d.day === dayNum
          ? { ...d, status: nextState ? 'Completed' : 'Upcoming' }
          : d
      )
    })));
    try {
      await api(`/api/roadmap/${dayNum}/complete?roadmapType=core`, {
        method: 'PATCH',
        body: JSON.stringify({ completed: nextState })
      });
      window.dispatchEvent(new CustomEvent('gdx_roadmap_updated'));
    } catch {
      setCoreRoadmapData(prev => prev.map(week => ({
        ...week,
        days: week.days.map(d =>
          d.day === dayNum
            ? { ...d, status: currentlyCompleted ? 'Completed' : 'Upcoming' }
            : d
        )
      })));
    }
  };

  // Toggle Project Day Completion
  const toggleProjectDayCompletion = async (dayNum, currentlyCompleted) => {
    if (!activeProject) return;
    const nextState = !currentlyCompleted;
    setProjectStepsData(prev => prev.map(s => s.day === dayNum ? { ...s, completed: nextState } : s));

    try {
      await api(`/api/roadmap/${dayNum}/complete?roadmapType=project&projectId=${activeProject.projectId}`, {
        method: 'PATCH',
        body: JSON.stringify({ completed: nextState })
      });
      fetchProjectsList();
      window.dispatchEvent(new CustomEvent('gdx_roadmap_updated'));
    } catch {
      setProjectStepsData(prev => prev.map(s => s.day === dayNum ? { ...s, completed: currentlyCompleted } : s));
    }
  };

  // Delete Project Sprint
  const handleDeleteProject = async (projectId, e) => {
    if (e) e.stopPropagation();
    try {
      await api(`/api/roadmap/projects/${projectId}`, { method: 'DELETE' });
      setProjectsList(prev => prev.filter(p => p.projectId !== projectId));
      if (activeProject && activeProject.projectId === projectId) {
        setActiveProject(null);
        setActiveTab('projects');
        setSearchParams({ tab: 'projects' });
      }
      setSuccessBanner('Project Sprint deleted successfully');
      setTimeout(() => setSuccessBanner(''), 4000);
    } catch (err) {
      console.warn('Delete project error:', err.message);
    }
  };

  const toggleWeek = (id) => setExpandedWeek(prev => prev === id ? null : id);

  // Resume File Upload Handler
  const handleResumeFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setResumeFileName(file.name);
    setResumeParsing(true);
    setResumeError('');

    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'txt' || ext === 'md' || ext === 'json') {
      const reader = new FileReader();
      reader.onload = (event) => {
        let content = event.target.result || '';
        if (ext === 'json') {
          try {
            const parsedObj = JSON.parse(content);
            content = typeof parsedObj === 'string' ? parsedObj : JSON.stringify(parsedObj, null, 2);
          } catch (_) {}
        }
        content = content.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F]/g, ' ').trim();
        setResumeText(content);
        setResumeParsing(false);
      };
      reader.onerror = () => {
        setResumeError('Failed to read file from disk.');
        setResumeParsing(false);
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
          setResumeText(parsed.text || '');
        } catch (err) {
          setResumeError(err.message || 'Failed to extract text from document');
        } finally {
          setResumeParsing(false);
        }
      };
      reader.onerror = () => {
        setResumeError('Failed to encode document.');
        setResumeParsing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Assignment File Upload Handler
  const handleAssignmentFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAssignmentFileName(file.name);
    setAssignmentParsing(true);
    setAssignmentError('');

    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'txt' || ext === 'md' || ext === 'json') {
      const reader = new FileReader();
      reader.onload = (event) => {
        let content = event.target.result || '';
        if (ext === 'json') {
          try {
            const parsedObj = JSON.parse(content);
            content = typeof parsedObj === 'string' ? parsedObj : JSON.stringify(parsedObj, null, 2);
          } catch (_) {}
        }
        content = content.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F]/g, ' ').trim();
        setAssignmentText(content);
        setAssignmentParsing(false);
      };
      reader.onerror = () => {
        setAssignmentError('Failed to read file from disk.');
        setAssignmentParsing(false);
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
          setAssignmentText(parsed.text || '');
        } catch (err) {
          setAssignmentError(err.message || 'Failed to extract text from document');
        } finally {
          setAssignmentParsing(false);
        }
      };
      reader.onerror = () => {
        setAssignmentError('Failed to encode document.');
        setAssignmentParsing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Analyze Resume -> Updates CORE ROADMAP
  const handleAnalyzeResume = async (e) => {
    e.preventDefault();
    if (!resumeText || resumeText.trim().length < 5) {
      setResumeError('Please upload a resume file or paste your resume text (minimum 5 characters).');
      return;
    }
    setResumeAnalyzing(true);
    setResumeError('');
    try {
      const res = await api('/api/roadmap/analyze-resume', {
        method: 'POST',
        body: JSON.stringify({ resumeText: resumeText.trim() })
      });
      await fetchCoreRoadmap();
      window.dispatchEvent(new CustomEvent('gdx_roadmap_updated'));
      setShowResumeModal(false);
      setResumeText('');
      setResumeFileName('');
      setActiveTab('core');
      setSearchParams({});
      setSuccessBanner(res.message || 'Core Roadmap Updated: Personalized gap-focused roadmap generated.');
      setTimeout(() => setSuccessBanner(''), 8000);
    } catch (err) {
      setResumeError(err.message || 'Could not analyze resume. Please try again.');
    } finally {
      setResumeAnalyzing(false);
    }
  };

  // Analyze Assignment -> Creates NEW PROJECT SPRINT
  const handleAnalyzeAssignment = async (e) => {
    e.preventDefault();
    if (!assignmentText || assignmentText.trim().length < 5) {
      setAssignmentError('Please upload an assignment file or paste project specifications (minimum 5 characters).');
      return;
    }
    setAssignmentAnalyzing(true);
    setAssignmentError('');
    try {
      const res = await api('/api/roadmap/analyze-assignment', {
        method: 'POST',
        body: JSON.stringify({ assignmentText: assignmentText.trim() })
      });
      await fetchProjectsList();
      window.dispatchEvent(new CustomEvent('gdx_roadmap_updated'));
      setShowAssignmentModal(false);
      setAssignmentText('');
      setAssignmentFileName('');

      if (res.projectId) {
        await fetchProjectSteps(res.projectId);
      } else {
        setActiveTab('projects');
        setSearchParams({ tab: 'projects' });
      }

      setSuccessBanner(res.message || 'Project Sprint Created! Your 7-day implementation plan is ready.');
      setTimeout(() => setSuccessBanner(''), 8000);
    } catch (err) {
      setAssignmentError(err.message || 'Could not deconstruct assignment. Please try again.');
    } finally {
      setAssignmentAnalyzing(false);
    }
  };

  const handleGoalSubmit = async (e) => {
    e.preventDefault();
    setLoadingBackend(true);
    const newRoadmap = getRoadmapByGoal(selectedGoal, timeline, level);
    setCoreRoadmapData(newRoadmap);
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
      await fetchCoreRoadmap();
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
        domain: activeTab === 'sprint_detail' ? activeProject?.title : selectedGoal
      }
    });
  };

  const explainWithAI = (dayItem) => {
    navigate('/mentor', {
      state: {
        dayTopic: dayItem.title,
        prompt: dayItem.prompt || `Explain ${dayItem.title} step-by-step with production code and key architecture principles.`,
        duration: dayItem.duration,
        level: level,
        goal: activeTab === 'sprint_detail' ? activeProject?.title : selectedGoal
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

      {/* Dynamic Success Toast Banner */}
      {successBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-bold font-mono flex items-center justify-between shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner('')} className="p-1 hover:text-emerald-950 dark:hover:text-white cursor-pointer">
            <X size={15} />
          </button>
        </div>
      )}

      {/* Header Banner with Goal Switcher */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 rounded-full text-xs font-mono font-bold">
              {level.toUpperCase()}
            </span>
            <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full text-xs font-mono font-bold">
              ⏱ {timeline} TIMELINE
            </span>
            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-mono font-bold">
              LIVE DATABASE
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold font-display text-zinc-900 dark:text-white tracking-tight">
            {selectedGoal}
          </h1>
          <p className="text-xs text-zinc-500 font-medium">
            GuideX Career Preparation & Implementation Sprint Architecture.
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
            onClick={() => { setResumeError(''); setShowResumeModal(true); }}
            className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs py-2.5 px-4 rounded-full hover:bg-amber-500 hover:text-zinc-950 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <FileText size={14} /> AI Resume Gap Import
          </button>

          <button
            onClick={() => { setAssignmentError(''); setShowAssignmentModal(true); }}
            className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-bold text-xs py-2.5 px-4 rounded-full transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FileCode size={14} /> Assignment Parser
          </button>
        </div>
      </div>

      {/* ROADMAP TYPE SWITCHER BAR */}
      <div className="flex items-center justify-between gap-4 bg-zinc-900/90 dark:bg-zinc-900/90 p-2 rounded-2xl border border-zinc-800 shadow-md flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleTabSwitch('core')}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold font-mono transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'core'
                ? 'bg-[#F5C542] text-zinc-950 shadow-pill'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
            }`}
          >
            <Compass size={15} />
            <span>CORE ROADMAP</span>
          </button>

          <button
            onClick={() => handleTabSwitch('projects')}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold font-mono transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'projects' || activeTab === 'sprint_detail'
                ? 'bg-[#F5C542] text-zinc-950 shadow-pill'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
            }`}
          >
            <LayoutGrid size={15} />
            <span>PROJECT SPRINTS</span>
            {projectsList.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'projects' || activeTab === 'sprint_detail' ? 'bg-zinc-950/20 text-zinc-950' : 'bg-zinc-800 text-amber-400'
              }`}>
                {projectsList.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'sprint_detail' && activeProject && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTabSwitch('projects')}
              className="text-xs font-mono font-bold text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              ← Back to Projects
            </button>
          </div>
        )}
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
              <button 
                onClick={() => { setShowResumeModal(false); setResumeError(''); }} 
                className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-white cursor-pointer" 
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-zinc-500">
              Analyzes your resume against your target goal ({selectedGoal}) and optimizes your <strong>CORE ROADMAP</strong>.
            </p>

            {resumeError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold font-mono">
                ⚠️ {resumeError}
              </div>
            )}

            <form onSubmit={handleAnalyzeResume} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-bold mb-2">
                  Upload Resume File (.txt, .md, .json, .pdf, .docx)
                </label>
                <div className="relative border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-amber-400 rounded-2xl p-4 text-center cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept=".txt,.md,.json,.pdf,.docx"
                    onChange={handleResumeFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-1 text-zinc-500">
                    <Upload size={20} className="text-amber-500" />
                    <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200">
                      {resumeParsing 
                        ? 'Parsing File Text...' 
                        : resumeFileName 
                        ? `Selected File: ${resumeFileName}` 
                        : 'Click or Drag & Drop Resume File'}
                    </span>
                    <span className="text-[10px] text-zinc-400">Extracts text and populates input for AI Gap Analysis</span>
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
                  onChange={e => { setResumeText(e.target.value); setResumeError(''); }}
                  placeholder="Paste your current resume details, skills, and experience..."
                  className="w-full p-3.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xs font-mono text-zinc-900 dark:text-white focus:outline-none"
                />
                {resumeText.trim().length > 0 && (
                  <span className="text-[10px] font-mono text-zinc-400 mt-1 block">
                    Character Count: {resumeText.trim().length}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={resumeAnalyzing || resumeParsing || !resumeText.trim()}
                className="w-full bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-sm py-3.5 rounded-2xl shadow-pill transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {resumeAnalyzing || resumeParsing ? <Loader size={16} className="animate-spin" /> : <Sparkles size={16} />}
                <span>
                  {resumeParsing
                    ? 'Extracting Text from File...'
                    : resumeAnalyzing
                    ? 'Analyzing Skill Gaps via Gemini...'
                    : 'Analyze Gaps & Re-generate Core Roadmap'}
                </span>
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
              <button 
                onClick={() => { setShowAssignmentModal(false); setAssignmentError(''); }} 
                className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-white cursor-pointer" 
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-zinc-500">
              Parses project requirements into a <strong>NEW 7-DAY PROJECT SPRINT</strong>. Leaves your Core Roadmap 100% untouched.
            </p>

            {assignmentError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold font-mono">
                ⚠️ {assignmentError}
              </div>
            )}

            <form onSubmit={handleAnalyzeAssignment} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-bold mb-2">
                  Upload Assignment Brief (.txt, .md, .json, .pdf, .docx)
                </label>
                <div className="relative border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-amber-400 rounded-2xl p-4 text-center cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept=".txt,.md,.json,.pdf,.docx"
                    onChange={handleAssignmentFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-1 text-zinc-500">
                    <Upload size={20} className="text-amber-500" />
                    <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200">
                      {assignmentParsing 
                        ? 'Parsing File Text...' 
                        : assignmentFileName 
                        ? `Selected File: ${assignmentFileName}` 
                        : 'Click or Drag & Drop Project File'}
                    </span>
                    <span className="text-[10px] text-zinc-400">Parses project requirements into a 7-day implementation sprint</span>
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
                  onChange={e => { setAssignmentText(e.target.value); setAssignmentError(''); }}
                  placeholder="Paste project guidelines, hackathon specs, or assignment details..."
                  className="w-full p-3.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xs font-mono text-zinc-900 dark:text-white focus:outline-none"
                />
                {assignmentText.trim().length > 0 && (
                  <span className="text-[10px] font-mono text-zinc-400 mt-1 block">
                    Character Count: {assignmentText.trim().length}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={assignmentAnalyzing || assignmentParsing || !assignmentText.trim()}
                className="w-full bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-sm py-3.5 rounded-2xl shadow-pill transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {assignmentAnalyzing || assignmentParsing ? <Loader size={16} className="animate-spin" /> : <Sparkles size={16} />}
                <span>
                  {assignmentParsing
                    ? 'Extracting Text from File...'
                    : assignmentAnalyzing
                    ? 'Deconstructing Project Sprint...'
                    : 'Generate 7-Day Implementation Sprint'}
                </span>
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

      {/* VIEW 1: CORE ROADMAP */}
      {activeTab === 'core' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between gap-4 px-5 py-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles size={15} className="text-amber-500 shrink-0" />
              <span className="text-zinc-800 dark:text-zinc-200 font-medium">
                <strong className="font-bold">CORE ROADMAP:</strong> Long-term career preparation ({coreRoadmapData.length * 7} Days) for {selectedGoal}.
              </span>
            </div>
          </div>

          <div className="space-y-5">
            {coreRoadmapData.map(week => {
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

                  {expandedWeek === week.id && (
                    <div className="border-t border-zinc-100 dark:border-zinc-800/80 p-5 sm:p-6 bg-zinc-50/50 dark:bg-zinc-950/40 space-y-4">
                      <div className="text-xs text-zinc-500 leading-relaxed font-medium">
                        <strong className="text-zinc-800 dark:text-zinc-200">Why this week matters:</strong> {week.whyMatters}
                      </div>

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
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                  <label
                                    htmlFor={`core-day-${dayItem.day}`}
                                    className="flex items-center mt-0.5 cursor-pointer select-none shrink-0 group"
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
                                      id={`core-day-${dayItem.day}`}
                                      type="checkbox"
                                      checked={isDone}
                                      onChange={() => toggleCoreDayCompletion(dayItem.day, isDone)}
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
                                    }`}>
                                      {formatted.mainTitle}
                                    </h4>

                                    <p className="text-xs text-zinc-500 leading-relaxed font-medium line-clamp-2">
                                      {dayItem.desc}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                                  <button
                                    onClick={() => openConcept(dayItem)}
                                    className="bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs px-3.5 py-2 rounded-full transition-all inline-flex items-center gap-1.5 shadow-pill cursor-pointer"
                                  >
                                    <BookOpen size={13} />
                                    <span>Daily Concept</span>
                                  </button>

                                  <button
                                    onClick={() => explainWithAI(dayItem)}
                                    className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs px-3.5 py-2 rounded-full hover:bg-[#F5C542] hover:text-zinc-950 transition-all inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                                  >
                                    <Sparkles size={13} className="text-[#F5C542] dark:text-amber-600" />
                                    <span>Explain with AI</span>
                                  </button>

                                  <button
                                    onClick={() => startPractice(dayItem)}
                                    className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-bold text-xs px-3 py-2 rounded-full transition-all inline-flex items-center gap-1 cursor-pointer"
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
      )}

      {/* VIEW 2: PROJECT SPRINTS LIST */}
      {activeTab === 'projects' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex-wrap">
            <div>
              <span className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest block">PROJECT SPRINTS</span>
              <h2 className="text-xl font-extrabold font-display text-zinc-900 dark:text-white mt-1">
                Implementation Sprints ({projectsList.length})
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                Short-term 7-day implementation plans generated from assignment specifications.
              </p>
            </div>

            <button
              onClick={() => { setAssignmentError(''); setShowAssignmentModal(true); }}
              className="bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-extrabold text-xs py-3 px-5 rounded-2xl shadow-pill transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus size={16} /> + New Project Sprint
            </button>
          </div>

          {loadingProjects ? (
            <div className="p-12 text-center text-zinc-500 text-xs font-mono flex items-center justify-center gap-2">
              <Loader size={18} className="animate-spin text-amber-500" /> Loading Project Sprints...
            </div>
          ) : projectsList.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 text-center space-y-4">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/60 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
                <FileCode size={24} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">No Project Sprints Created Yet</h3>
                <p className="text-xs text-zinc-500 max-w-md mx-auto mt-1">
                  Upload an assignment specification or paste project guidelines to generate a dedicated 7-day implementation sprint.
                </p>
              </div>
              <button
                onClick={() => { setAssignmentError(''); setShowAssignmentModal(true); }}
                className="bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs py-3 px-5 rounded-full shadow-pill transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus size={15} /> Create First Project Sprint
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projectsList.map((proj) => {
                const pct = Math.round(((proj.completedDays || 0) / (proj.totalDays || 7)) * 100);
                const isDone = proj.completed || pct === 100;

                return (
                  <div
                    key={proj.projectId}
                    onClick={() => fetchProjectSteps(proj.projectId)}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-amber-400 dark:hover:border-amber-500/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-4 group relative"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                            PROJECT SPRINT · 7 DAYS
                          </span>
                          {isDone ? (
                            <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                              ✓ COMPLETED
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                              ● IN PROGRESS
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-extrabold font-display text-zinc-900 dark:text-white group-hover:text-amber-500 transition-colors truncate">
                          {proj.title}
                        </h3>
                      </div>

                      <button
                        onClick={(e) => handleDeleteProject(proj.projectId, e)}
                        className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer shrink-0"
                        title="Delete Project Sprint"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed font-medium">
                      {proj.description || 'Custom 7-day technical implementation plan.'}
                    </p>

                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-zinc-500 font-bold">Progress</span>
                        <span className="text-zinc-900 dark:text-white font-extrabold">{proj.completedDays || 0} / 7 Days ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${isDone ? 'bg-emerald-500' : 'bg-[#F5C542]'}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-xs font-bold text-amber-500 group-hover:translate-x-0.5 transition-transform">
                      <span>Open Sprint Schedule →</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: ACTIVE PROJECT SPRINT DETAIL */}
      {activeTab === 'sprint_detail' && activeProject && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-amber-400/80 dark:border-amber-500/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 rounded-full text-xs font-mono font-bold">
                  PROJECT SPRINT (7 DAYS)
                </span>
                <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full text-xs font-mono font-bold">
                  ASSIGNMENT PARSER
                </span>
              </div>

              <button
                onClick={() => handleTabSwitch('projects')}
                className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
              >
                ← Switch to Project List
              </button>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold font-display text-zinc-900 dark:text-white">
              {activeProject.title}
            </h2>
            <p className="text-xs text-zinc-500 font-medium">
              {activeProject.description || '7-Day Implementation Sprint generated from project assignment brief.'}
            </p>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest block">
              7-DAY SPRINT SCHEDULE ({projectStepsData.length} DAYS)
            </span>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
              {projectStepsData.map((step) => {
                const isDone = Boolean(step.completed);
                const formatted = formatTaskTitle(step.dayName);

                return (
                  <div
                    key={step._id || step.day}
                    className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                      isDone ? 'bg-emerald-50/20 dark:bg-emerald-950/10' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <label
                        htmlFor={`project-day-${step.day}`}
                        className="flex items-center mt-1 cursor-pointer select-none shrink-0 group"
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
                          id={`project-day-${step.day}`}
                          type="checkbox"
                          checked={isDone}
                          onChange={() => toggleProjectDayCompletion(step.day, isDone)}
                          className="sr-only"
                        />
                      </label>

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                            SPRINT DAY {step.day}
                          </span>
                          {isDone && (
                            <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                              ✓ COMPLETED
                            </span>
                          )}
                        </div>

                        <h4 className={`text-base font-extrabold font-display transition-colors ${
                          isDone ? 'text-zinc-400 dark:text-zinc-500 line-through' : 'text-zinc-900 dark:text-white'
                        }`}>
                          {formatted.mainTitle}
                        </h4>

                        <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                          {step.context || (step.tasks && step.tasks[0]?.title) || 'Sprint Day implementation objective.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <button
                        onClick={() => openConcept({ day: step.day, title: step.dayName })}
                        className="bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs px-3.5 py-2 rounded-full transition-all inline-flex items-center gap-1.5 shadow-pill cursor-pointer"
                      >
                        <BookOpen size={13} />
                        <span>Daily Concept</span>
                      </button>

                      <button
                        onClick={() => explainWithAI({ title: step.dayName, duration: '45 min' })}
                        className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs px-3.5 py-2 rounded-full hover:bg-[#F5C542] hover:text-zinc-950 transition-all inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Sparkles size={13} className="text-[#F5C542] dark:text-amber-600" />
                        <span>Explain with AI</span>
                      </button>

                      <button
                        onClick={() => startPractice({ title: step.dayName, duration: '45 min' })}
                        className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-bold text-xs px-3 py-2 rounded-full transition-all inline-flex items-center gap-1 cursor-pointer"
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
};

export default Roadmap;
