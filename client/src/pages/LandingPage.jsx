import { Link } from 'react-router-dom';
import { ArrowRight, BrainCircuit, Target, Zap, Sparkles, Compass, CheckCircle2, FileText, BarChart3, Shield, Flame, Layers, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { user } = useAuth();

  const primaryTarget = user ? '/dashboard' : '/signup';
  const resumeTarget = user ? '/intake' : '/signup';

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col font-sans select-none overflow-x-hidden">
      
      {/* ── 1. TOP NAVBAR ── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#09090B]/90 border-b border-zinc-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-2xl bg-[#F5C542] text-zinc-950 flex items-center justify-center font-bold shadow-pill transition-transform group-hover:scale-105">
              <BrainCircuit size={20} />
            </div>
            <span className="font-display font-extrabold text-xl text-white tracking-tight">
              GuideX
            </span>
          </Link>

          {/* Anchor Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-mono text-zinc-400">
            <a href="#how-it-works" className="hover:text-amber-400 transition-colors">How It Works</a>
            <a href="#product-preview" className="hover:text-amber-400 transition-colors">Product</a>
            <a href="#features" className="hover:text-amber-400 transition-colors">Features</a>
            <a href="#roles" className="hover:text-amber-400 transition-colors">Supported Roles</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            {user ? (
              <Link 
                to="/dashboard" 
                className="bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs px-5 py-2 rounded-full shadow-pill transition-all inline-flex items-center gap-1.5"
              >
                <span>Go to Dashboard</span>
                <ArrowRight size={14} />
              </Link>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="px-5 py-2 rounded-full border border-zinc-800 hover:border-zinc-700 font-semibold text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 transition-all"
                >
                  Log In
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs px-5 py-2 rounded-full shadow-pill transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── 2. HERO SECTION ── */}
      <section className="px-6 pt-16 pb-14 max-w-5xl mx-auto w-full text-center relative">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-950/60 border border-amber-800/40 text-amber-400 text-xs font-bold font-mono mb-6">
          <Sparkles size={14} className="text-[#F5C542]" />
          <span>AI-POWERED CAREER DEVELOPMENT PLATFORM</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold font-display text-white leading-[1.15] tracking-tight mb-6 max-w-4xl mx-auto">
          Systematically Prepare for Your Target Technical Role
        </h1>

        <p className="text-sm md:text-base text-zinc-400 font-medium max-w-2xl mx-auto leading-relaxed mb-10">
          GuideX turns your target role, current skills, and resume into a personalized roadmap with daily tasks, AI guidance, focused execution, and measurable progress.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link 
            to={primaryTarget} 
            className="bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-sm px-8 py-3.5 rounded-full shadow-pill transition-all inline-flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <span>Build My Personal Roadmap</span>
            <ArrowRight size={18} />
          </Link>

          <a 
            href="#how-it-works"
            className="px-7 py-3.5 rounded-full border border-zinc-800 hover:border-zinc-700 font-semibold text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 transition-all w-full sm:w-auto text-center"
          >
            See How It Works
          </a>
        </div>

        {/* Immediate Value Proposition Card: What is GuideX? */}
        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 max-w-xl mx-auto text-left shadow-lg flex items-start gap-4">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#F5C542] flex items-center justify-center shrink-0 mt-0.5">
            <Target size={18} />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block">
              WHAT IS GUIDEX?
            </span>
            <p className="text-xs sm:text-sm font-medium text-zinc-200 leading-relaxed">
              "A personalized AI system that turns technical career preparation into a structured daily execution plan."
            </p>
          </div>
        </div>
      </section>

      {/* ── 3. HOW GUIDEX WORKS VISUAL FLOW ── */}
      <section id="how-it-works" className="px-6 py-16 max-w-6xl mx-auto w-full border-t border-zinc-800/80">
        <div className="text-center space-y-2 mb-10">
          <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block">
            HOW GUIDEX WORKS
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold font-display text-white">
            From Target Role to Daily Mastery in 4 Steps
          </h2>
        </div>

        {/* Connected Process Chain */}
        <div className="hidden md:flex items-center justify-between gap-2 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 font-mono text-[11px] font-bold text-zinc-400 mb-8 max-w-3xl mx-auto">
          <span className="text-amber-400">Target Role</span>
          <ArrowRight size={14} className="text-zinc-600" />
          <span className="text-zinc-200">Skill Gap</span>
          <ArrowRight size={14} className="text-zinc-600" />
          <span className="text-zinc-200">Personalized Roadmap</span>
          <ArrowRight size={14} className="text-zinc-600" />
          <span className="text-amber-400">Daily Execution</span>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
            <span className="text-xs font-mono font-bold text-amber-500 block">01</span>
            <h3 className="text-base font-bold font-display text-white">Choose Your Target</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
              Select the technical role you want to prepare for.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
            <span className="text-xs font-mono font-bold text-amber-500 block">02</span>
            <h3 className="text-base font-bold font-display text-white">Find Your Gaps</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
              GuideX analyzes your current level, goals, and resume to identify missing skills.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
            <span className="text-xs font-mono font-bold text-amber-500 block">03</span>
            <h3 className="text-base font-bold font-display text-white">Get Your Roadmap</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
              Receive a structured roadmap divided into weeks, days, concepts, and tasks.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
            <span className="text-xs font-mono font-bold text-amber-500 block">04</span>
            <h3 className="text-base font-bold font-display text-white">Execute & Improve</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
              Complete tasks, use AI mentors, run focus sessions, and track your progress.
            </p>
          </div>
        </div>
      </section>

      {/* ── 4. REALISTIC GUIDEX DASHBOARD PREVIEW ── */}
      <section id="product-preview" className="px-6 py-16 max-w-6xl mx-auto w-full border-t border-zinc-800/80">
        <div className="text-center space-y-2 mb-12">
          <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block">
            PRODUCT PREVIEW
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold font-display text-white">
            Your entire technical preparation system in one place.
          </h2>
          <p className="text-xs md:text-sm text-zinc-400 max-w-xl mx-auto font-medium">
            Know what to learn today, why you're learning it, and what to do next.
          </p>
        </div>

        {/* Realistic Dashboard Mockup Window */}
        <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-4 sm:p-8 shadow-2xl shadow-amber-500/5 relative">
          {/* Top Window Controls */}
          <div className="flex items-center justify-between pb-6 border-b border-zinc-800/80 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-3 text-[11px] font-mono text-zinc-500 hidden sm:inline-block">guidex.app/dashboard</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                LIVE DASHBOARD
              </span>
            </div>
          </div>

          {/* Dashboard Preview Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
            
            {/* Today's Objective Card */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block">
                  TODAY · DAY 12 · BACKEND ENGINEERING
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  On Track
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold font-display text-white">
                  Master REST API Authentication
                </h3>
                <p className="text-xs text-zinc-400 font-medium mt-1">
                  Deep dive into JWT tokens, refresh tokens, and authentication middleware patterns.
                </p>
              </div>

              {/* Tasks List */}
              <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                <div className="flex items-center justify-between text-xs font-mono p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
                  <span className="flex items-center gap-2 text-zinc-300 line-through text-zinc-500">
                    <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                    <span>Understand JWT authentication</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">DONE</span>
                </div>

                <div className="flex items-center justify-between text-xs font-mono p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
                  <span className="flex items-center gap-2 text-zinc-300 line-through text-zinc-500">
                    <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                    <span>Implement authentication middleware</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">DONE</span>
                </div>

                <div className="flex items-center justify-between text-xs font-mono p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
                  <span className="flex items-center gap-2 text-zinc-200">
                    <span className="w-3.5 h-3.5 rounded-md border border-zinc-600 inline-block shrink-0" />
                    <span>Complete API challenge</span>
                  </span>
                  <span className="text-[10px] text-amber-400 font-bold">PENDING</span>
                </div>
              </div>
            </div>

            {/* Metrics Sidebar */}
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-center space-y-1">
                <span className="text-3xl font-extrabold font-mono text-white block">68%</span>
                <span className="text-[11px] font-mono text-zinc-400 font-medium block">Roadmap Progress</span>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-center space-y-1">
                <span className="text-3xl font-extrabold font-mono text-white block">42 min</span>
                <span className="text-[11px] font-mono text-zinc-400 font-medium block">Focus Session Logged</span>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-center space-y-1">
                <span className="text-3xl font-extrabold font-mono text-amber-400 block">7 Day Streak 🔥</span>
                <span className="text-[11px] font-mono text-zinc-400 font-medium block">Active Momentum</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 5. RESUME → SKILL GAP → ROADMAP SECTION ── */}
      <section className="px-6 py-16 max-w-6xl mx-auto w-full border-t border-zinc-800/80">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6 text-left">
            <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block">
              RESUME & GAP ANALYSIS
            </span>

            <h2 className="text-3xl md:text-4xl font-extrabold font-display text-white leading-tight">
              Already have a resume? Start there.
            </h2>

            <p className="text-sm text-zinc-400 font-medium leading-relaxed">
              GuideX analyzes your experience, identifies skill gaps, and turns those gaps into a focused preparation roadmap.
            </p>

            {/* Visual Process Flow */}
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 font-mono text-xs font-bold text-zinc-300 space-y-2">
              <div className="flex items-center gap-2">
                <FileText size={15} className="text-amber-400" />
                <span>Your Resume</span>
                <ArrowRight size={14} className="text-zinc-600 ml-auto" />
              </div>
              <div className="flex items-center gap-2 text-zinc-400 pl-4 border-l border-zinc-800">
                <span>Skill Gap Analysis</span>
                <ArrowRight size={14} className="text-zinc-600 ml-auto" />
              </div>
              <div className="flex items-center gap-2 text-zinc-400 pl-4 border-l border-zinc-800">
                <span>Priority Skills</span>
                <ArrowRight size={14} className="text-zinc-600 ml-auto" />
              </div>
              <div className="flex items-center gap-2 text-amber-400 pl-4 border-l border-amber-500/40">
                <span>Personalized Roadmap & Daily Tasks</span>
              </div>
            </div>

            <div>
              <Link 
                to={resumeTarget}
                className="bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs px-6 py-3 rounded-full shadow-pill transition-all inline-flex items-center gap-2"
              >
                <span>Analyze My Resume</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Right Visual Box */}
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4 text-left">
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">
              GAP MATCH ENGINE
            </span>
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Target Role: Software Engineer</span>
                <span className="text-amber-400 font-mono font-bold text-[11px]">8 Gaps Identified</span>
              </div>
              <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                Resume highlights Python & SQL. Adding System Design, Concurrent Processing, and Distributed Caching to your daily roadmap.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ── 6. OUTCOME-FOCUSED FEATURE CARDS ── */}
      <section id="features" className="px-6 py-16 max-w-6xl mx-auto w-full border-t border-zinc-800/80">
        <div className="text-center space-y-2 mb-12">
          <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block">
            CORE CAPABILITIES
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold font-display text-white">
            Engineered for High-Intent Technical Execution
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 hover:border-zinc-700 transition-all space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F5C542] text-zinc-950 flex items-center justify-center shadow-pill">
              <BrainCircuit size={22} />
            </div>
            <h3 className="text-lg font-bold font-display text-white">Structured AI Roadmaps</h3>
            <p className="text-xs text-zinc-400 font-medium leading-relaxed">
              Personalized weeks, days, concepts, and tasks designed around your target role and experience.
            </p>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 hover:border-zinc-700 transition-all space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-800 text-white flex items-center justify-center">
              <Compass size={22} />
            </div>
            <h3 className="text-lg font-bold font-display text-white">AI Mentor</h3>
            <p className="text-xs text-zinc-400 font-medium leading-relaxed">
              Get guidance from specialized AI mentors designed for learning, architecture, coding, and career preparation.
            </p>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 hover:border-zinc-700 transition-all space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F5C542] text-zinc-950 flex items-center justify-center shadow-pill">
              <Zap size={22} />
            </div>
            <h3 className="text-lg font-bold font-display text-white">Focus Room & Telemetry</h3>
            <p className="text-xs text-zinc-400 font-medium leading-relaxed">
              Turn your roadmap into focused execution with timed sessions and performance tracking.
            </p>
          </div>
        </div>
      </section>

      {/* ── 7. BUILT FOR TECHNICAL CAREER PREPARATION ── */}
      <section id="roles" className="px-6 py-16 max-w-6xl mx-auto w-full border-t border-zinc-800/80">
        <div className="text-center space-y-2 mb-10">
          <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block">
            SUPPORTED PATHWAYS
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold font-display text-white">
            Built for serious technical preparation.
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            'Software Engineering',
            'Backend Development',
            'Full-Stack Development',
            'AI / ML',
            'Data Engineering',
            'Quant / Trading Development'
          ].map((role) => (
            <div key={role} className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center hover:border-amber-500/40 transition-all">
              <span className="text-xs font-mono font-bold text-zinc-200 block">{role}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 8. PROGRESS / OUTCOMES SECTION ── */}
      <section className="px-6 py-16 max-w-6xl mx-auto w-full border-t border-zinc-800/80">
        <div className="text-center space-y-3 mb-12">
          <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block">
            MEASURABLE EXECUTION
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold font-display text-white">
            Stop collecting courses. Start building competence.
          </h2>
          <p className="text-xs md:text-sm text-zinc-400 max-w-xl mx-auto font-medium">
            GuideX turns preparation into measurable execution.
          </p>
        </div>

        {/* 6 Concept Tracking Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
          {[
            { label: 'Roadmap Progress', icon: Layers },
            { label: 'Daily Completion', icon: CheckCircle2 },
            { label: 'Focus Time', icon: Clock },
            { label: 'Streaks', icon: Flame },
            { label: 'Skill Coverage', icon: Target },
            { label: 'Weekly Insights', icon: BarChart3 }
          ].map(({ label, icon: Icon }) => (
            <div key={label} className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
              <Icon size={20} className="text-[#F5C542] mx-auto" />
              <span className="text-xs font-mono font-bold text-zinc-200 block">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 9. FINAL CTA ── */}
      <section className="px-6 py-20 max-w-5xl mx-auto w-full text-center relative border-t border-zinc-800/80">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

        <h2 className="text-3xl md:text-5xl font-extrabold font-display text-white tracking-tight mb-4">
          Know what to learn. Know what to do next.
        </h2>

        <p className="text-xs sm:text-sm text-zinc-400 font-medium max-w-md mx-auto leading-relaxed mb-8">
          Build a personalized technical preparation roadmap with GuideX.
        </p>

        <Link 
          to={primaryTarget} 
          className="bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-sm px-9 py-4 rounded-full shadow-pill transition-all inline-flex items-center gap-2"
        >
          <span>Start My Roadmap</span>
          <ArrowRight size={18} />
        </Link>
      </section>

      {/* ── 10. FOOTER ── */}
      <footer className="border-t border-zinc-800/80 bg-[#09090B] py-8 text-center text-xs font-mono text-zinc-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#F5C542] text-zinc-950 flex items-center justify-center font-bold">
              <BrainCircuit size={14} />
            </div>
            <span className="font-display font-bold text-white text-sm">GuideX</span>
          </div>
          <span>© 2026 GuideX. Your career. Engineered.</span>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
