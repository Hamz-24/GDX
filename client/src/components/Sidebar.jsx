import {
  LayoutDashboard, Map, CheckSquare, MessageSquare, BarChart3, Settings,
  BrainCircuit, Database, Network, Archive, LogOut, Moon, Sun, HelpCircle, Bell
} from 'lucide-react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Database, label: 'Intake', path: '/intake' },
    { icon: MessageSquare, label: 'AI Mentor', path: '/mentor' },
    { icon: Map, label: 'Roadmap', path: '/roadmap' },
    { icon: Network, label: 'Blueprint', path: '/blueprint' },
    { icon: CheckSquare, label: 'Focus & Tasks', path: '/tasks' },
    { icon: Archive, label: 'Data Vault', path: '/vault' },
    { icon: BarChart3, label: 'Weekly Insights', path: '/report' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'GX';

  return (
    <aside className="hidden md:flex flex-col w-[260px] lg:w-[280px] h-screen bg-[#161618] text-white fixed z-30 select-none font-sans">
      {/* Brand Header */}
      <div className="px-7 py-7 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#F5C542] text-zinc-950 flex items-center justify-center shadow-pill">
          <BrainCircuit size={22} className="stroke-[2.5]" />
        </div>
        <span className="font-display font-extrabold text-2xl tracking-tight text-white">
          GuideX
        </span>
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto pt-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-200 font-medium text-sm ${
                isActive
                  ? 'bg-[#F5C542] text-zinc-950 font-bold shadow-pill'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} className={isActive ? 'text-zinc-950 stroke-[2.2]' : 'text-zinc-400 stroke-[1.8]'} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Focus CTA Banner Widget */}
      <div className="px-4 my-3">
        <div className="p-4 rounded-3xl bg-zinc-900/90 border border-zinc-800 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-display uppercase tracking-wider text-[#F5C542]">Focus Room</span>
            <span className="w-2 h-2 rounded-full bg-[#F5C542] animate-ping"></span>
          </div>
          <p className="text-xs text-zinc-400 leading-snug">Pomodoro telemetry & soundscape focus.</p>
          <Link
            to="/focus"
            className="mt-1 w-full bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs py-2 px-4 rounded-full text-center transition-all shadow-pill"
          >
            Start Focus Session
          </Link>
        </div>
      </div>

      {/* Bottom Nav Links */}
      <div className="p-4 border-t border-zinc-800/80 space-y-1">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3.5 px-4 py-2.5 rounded-2xl transition-all font-medium text-sm ${
              isActive ? 'bg-[#F5C542] text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`
          }
        >
          <Settings size={18} />
          <span>Settings & Profile</span>
        </NavLink>

        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all text-sm font-medium"
        >
          <div className="flex items-center gap-3.5">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 uppercase">
            {theme}
          </span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-all text-sm font-medium"
        >
          <LogOut size={18} />
          <span>Log out</span>
        </button>
      </div>

      {/* User Footer Badge */}
      <div className="px-6 py-4 border-t border-zinc-800/50 bg-zinc-950/50 flex items-center justify-between">
        <Link to="/profile" className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-full bg-[#F5C542] text-zinc-950 font-bold text-xs flex items-center justify-center flex-shrink-0 font-display">
            {initials}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate font-display">{user?.name || 'Operator'}</p>
            <p className="text-[11px] text-zinc-400 truncate">{user?.email || 'user@guidex.ai'}</p>
          </div>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
