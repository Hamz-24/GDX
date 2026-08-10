import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, BrainCircuit, Menu, X, LayoutDashboard, Map, CheckSquare, 
  MessageSquare, BarChart3, Settings, Database, Network, Archive, LogOut, 
  Moon, Sun, Clock, BookOpen 
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import CommandPalette from '../components/CommandPalette';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);

  // Canonical User Profile Context (Checklist Item 18)
  const canonicalProfile = {
    currentRole: 'Full-Stack Developer',
    targetRole: 'Backend Engineer',
    experience: 'Intermediate',
    timeline: '12 weeks',
    phase: 'Phase 3 · Software Architecture'
  };

  // Conceptual Navigation Groups
  const navGroups = [
    {
      group: 'WORK',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Map, label: 'Roadmap', path: '/roadmap' },
        { icon: CheckSquare, label: 'Focus & Tasks', path: '/tasks' },
        { icon: BookOpen, label: 'Daily Concept', path: '/concept' },
      ]
    },
    {
      group: 'INTELLIGENCE',
      items: [
        { icon: MessageSquare, label: 'AI Mentor', path: '/mentor' },
        { icon: Archive, label: 'Data Vault', path: '/vault' },
      ]
    },
    {
      group: 'REVIEW',
      items: [
        { icon: BarChart3, label: 'Weekly Insights', path: '/report' },
      ]
    }
  ];

  useEffect(() => {
    const handleGlobalKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'GX';
  const firstName = user?.name ? user.name.split(' ')[0] : 'Developer';

  return (
    <div className="flex flex-col min-h-screen bg-background text-text font-sans antialiased">
      
      {/* Command Palette */}
      <CommandPalette isOpen={cmdPaletteOpen} onClose={() => setCmdPaletteOpen(false)} />

      {/* TOP HEADER */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 shadow-sm shrink-0">
        
        {/* Top Bar */}
        <div className="max-w-[1500px] mx-auto px-6 lg:px-10 py-3.5 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileNavOpen(!mobileNavOpen)} 
              className="lg:hidden p-2 rounded-xl text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              {mobileNavOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F5C542] text-zinc-950 flex items-center justify-center font-bold shadow-pill">
                <BrainCircuit size={22} className="stroke-[2.5]" />
              </div>
              <div>
                <span className="font-display font-extrabold text-2xl tracking-tight text-zinc-900 dark:text-white leading-none block">
                  GuideX
                </span>
                <span className="text-[10px] font-mono font-bold text-zinc-400 block tracking-tight">
                  Your career. Engineered.
                </span>
              </div>
            </Link>

            <div className="hidden sm:block h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-2" />

            {/* Canonical Role Display */}
            <div className="hidden md:block">
              <h1 className="text-sm lg:text-base font-extrabold font-display text-zinc-900 dark:text-white tracking-tight flex items-center gap-1.5">
                {getGreeting()}, {firstName}!
              </h1>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                {canonicalProfile.currentRole} → <span className="text-zinc-900 dark:text-white font-extrabold">{canonicalProfile.targetRole}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCmdPaletteOpen(true)}
              className="hidden xl:flex items-center gap-3 px-4 py-1.5 bg-zinc-100/90 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 rounded-full text-xs text-zinc-400 hover:border-[#F5C542] transition-all shadow-sm w-64 text-left"
            >
              <Search size={15} />
              <span className="flex-1">Search or ⌘K...</span>
              <span className="bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded text-[10px] text-zinc-700 dark:text-zinc-300 font-mono font-bold">⌘K</span>
            </button>

            <Link
              to="/focus"
              className="hidden sm:inline-flex items-center gap-1.5 bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs px-4 py-2 rounded-full shadow-pill transition-all"
            >
              <Clock size={15} />
              <span>Focus Room</span>
            </Link>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-full text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Log out"
            >
              <LogOut size={18} />
            </button>

            <Link 
              to="/profile" 
              className="flex items-center gap-2.5 pl-1.5 pr-3.5 py-1 rounded-full bg-zinc-100/80 dark:bg-zinc-800/80 hover:bg-zinc-200/80 dark:hover:bg-zinc-700/80 border border-zinc-200/60 dark:border-zinc-700/60 transition-all shadow-sm"
            >
              <div className="w-7 h-7 rounded-full bg-[#F5C542] text-zinc-950 font-bold text-xs flex items-center justify-center font-display shadow-pill">
                {initials}
              </div>
              <span className="hidden md:inline-block text-xs font-bold text-zinc-900 dark:text-white font-display">
                {user?.name || 'Operator'}
              </span>
            </Link>
          </div>

        </div>

        {/* Grouped Horizontal Nav */}
        <div className="hidden lg:block border-t border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/50 px-6 lg:px-10 py-2">
          <div className="max-w-[1500px] mx-auto flex items-center gap-6 overflow-x-auto">
            {navGroups.map((group) => (
              <div key={group.group} className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold text-zinc-400 tracking-wider mr-1 uppercase">
                  {group.group}
                </span>

                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all duration-200 text-xs font-semibold whitespace-nowrap ${
                        isActive
                          ? 'bg-[#F5C542] text-zinc-950 font-bold shadow-pill'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon size={14} className={isActive ? 'text-zinc-950 stroke-[2.2]' : 'text-zinc-400 stroke-[1.8]'} />
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                ))}

                <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 ml-2" />
              </div>
            ))}
          </div>
        </div>

      </header>

      {/* Mobile Nav */}
      {mobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex">
          <div className="w-72 bg-[#161618] h-full p-6 flex flex-col justify-between text-white">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#F5C542] text-zinc-950 flex items-center justify-center font-bold">
                    <BrainCircuit size={20} />
                  </div>
                  <div>
                    <span className="font-display font-extrabold text-xl leading-none block">GuideX</span>
                    <span className="text-[9px] font-mono text-zinc-400">Your career. Engineered.</span>
                  </div>
                </div>
                <button onClick={() => setMobileNavOpen(false)}><X size={20} /></button>
              </div>

              <nav className="space-y-4">
                {navGroups.map((group) => (
                  <div key={group.group} className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase px-4 block">
                      {group.group}
                    </span>
                    {group.items.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileNavOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-2.5 rounded-2xl font-medium text-sm transition-all ${
                            isActive ? 'bg-[#F5C542] text-zinc-950 font-bold' : 'text-zinc-300 hover:bg-zinc-800'
                          }`
                        }
                      >
                        <item.icon size={18} />
                        <span>{item.label}</span>
                      </NavLink>
                    ))}
                  </div>
                ))}
              </nav>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-rose-400 hover:bg-rose-950/30 text-sm font-medium"
            >
              <LogOut size={18} />
              <span>Log out</span>
            </button>
          </div>
          <div className="flex-1" onClick={() => setMobileNavOpen(false)}></div>
        </div>
      )}

      {/* Main Area */}
      <main className="flex-1 p-6 md:p-8 lg:p-10 scroll-smooth bg-background">
        <div className="max-w-[1500px] mx-auto">
          <Outlet />
        </div>
      </main>

    </div>
  );
};

export default DashboardLayout;
