import { Link } from 'react-router-dom';
import { ArrowRight, BrainCircuit, Target, Zap, Sparkles, Compass } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#F4F4F6] dark:bg-[#09090B] flex flex-col font-sans select-none">
      
      {/* Top Navbar */}
      <nav className="max-w-7xl mx-auto w-full px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#F5C542] text-zinc-950 flex items-center justify-center font-bold shadow-pill">
            <BrainCircuit size={22} />
          </div>
          <span className="font-display font-extrabold text-2xl text-zinc-900 dark:text-white tracking-tight">
            GuideX
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="px-5 py-2 rounded-full border border-zinc-300 dark:border-zinc-700 font-semibold text-xs text-zinc-800 dark:text-white hover:bg-white dark:hover:bg-zinc-800 transition-all">
            Log In
          </Link>
          <Link to="/signup" className="bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs px-6 py-2 rounded-full shadow-pill transition-all">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 max-w-5xl mx-auto w-full">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-xs font-bold font-mono mb-6">
          <Sparkles size={14} /> AI-Powered Career Development Platform
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold font-display text-zinc-900 dark:text-white leading-tight tracking-tight mb-6 max-w-4xl">
          Systematically Prepare for Your Target Technical Role
        </h1>

        <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-300 font-medium max-w-2xl leading-relaxed mb-10">
          Remove the confusion of deciding what to learn. GuideX builds a personalized, structured roadmap divided into phases, weeks, milestones, and daily tasks with an interactive AI mentor.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
          <Link 
            to="/signup" 
            className="bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-sm px-8 py-3.5 rounded-full shadow-pill transition-all inline-flex items-center justify-center gap-2"
          >
            <span>Start Personal Roadmap</span>
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left w-full">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-card">
            <div className="w-12 h-12 rounded-2xl bg-[#F5C542] text-zinc-950 flex items-center justify-center mb-4 shadow-pill">
              <BrainCircuit size={24} />
            </div>
            <h3 className="text-base font-bold font-display text-zinc-900 dark:text-white mb-1">Structured AI Roadmaps</h3>
            <p className="text-xs text-zinc-500 font-medium leading-relaxed">Generates phases, weeks, days, and tasks tailored to your role and experience.</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-card">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center mb-4">
              <Compass size={24} />
            </div>
            <h3 className="text-base font-bold font-display text-zinc-900 dark:text-white mb-1">4 AI Mentor Personas</h3>
            <p className="text-xs text-zinc-500 font-medium leading-relaxed">Socratic Guide, Tech Architect, Code Critic, and Career Strategist for deep learning.</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-card">
            <div className="w-12 h-12 rounded-2xl bg-[#F5C542] text-zinc-950 flex items-center justify-center mb-4 shadow-pill">
              <Zap size={24} />
            </div>
            <h3 className="text-base font-bold font-display text-zinc-900 dark:text-white mb-1">Focus Room & Telemetry</h3>
            <p className="text-xs text-zinc-500 font-medium leading-relaxed">Pomodoro timer with soundscapes and performance telemetry analysis.</p>
          </div>
        </div>

      </main>

    </div>
  );
};

export default LandingPage;
