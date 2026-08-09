import { User, Mail, Target, Award, Save, Loader, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Profile = () => {
  const { user, setUser, logout } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const form = e.target;
    try {
      const updated = await api('/api/profile', {
        method: 'PATCH',
        body: JSON.stringify({ name: form.name.value, goal: form.goal.value, level: form.level.value }),
      });
      setUser(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { /* silent fallback */ }
    finally { setSaving(false); }
  };

  if (!user) return <div className="flex justify-center py-24"><Loader className="animate-spin text-[#F5C542]" size={32} /></div>;

  const initials = user.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'GX';

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto font-sans">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-card flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-[#F5C542] text-zinc-950 font-extrabold font-display text-2xl flex items-center justify-center shadow-pill shrink-0">
          {initials}
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-display text-zinc-900 dark:text-white tracking-tight">
            {user.name}
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 font-medium mt-0.5">
            {user.email} • <span className="text-amber-500 font-bold uppercase">{user.level || 'Intermediate'}</span>
          </p>
        </div>
      </div>

      {/* Account Details Form (Inspired by ThinkPath Account Details screen) */}
      <form onSubmit={handleSave} className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-card space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-lg font-bold font-display text-zinc-900 dark:text-white">
            Account Details & Target Career Role
          </h2>
          {saved && (
            <span className="text-xs font-bold font-mono text-emerald-500 flex items-center gap-1">
              <CheckCircle2 size={14} /> Saved Successfully
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold font-mono text-zinc-500 dark:text-zinc-400 uppercase">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input 
                name="name" 
                type="text" 
                className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white pl-11 pr-4 py-3 rounded-full text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#F5C542]" 
                defaultValue={user.name} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold font-mono text-zinc-500 dark:text-zinc-400 uppercase">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input 
                type="email" 
                className="w-full bg-zinc-100/60 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 text-zinc-400 pl-11 pr-4 py-3 rounded-full text-sm font-sans cursor-not-allowed" 
                defaultValue={user.email} 
                disabled 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold font-mono text-zinc-500 dark:text-zinc-400 uppercase">
              Target Career Role
            </label>
            <div className="relative">
              <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input 
                name="goal" 
                type="text" 
                className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white pl-11 pr-4 py-3 rounded-full text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#F5C542]" 
                defaultValue={user.goal || 'AI/ML Engineer'} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold font-mono text-zinc-500 dark:text-zinc-400 uppercase">
              Experience Level
            </label>
            <div className="relative">
              <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <select 
                name="level" 
                className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white pl-11 pr-4 py-3 rounded-full text-sm font-sans focus:outline-none cursor-pointer" 
                defaultValue={user.level || 'intermediate'}
              >
                <option value="beginner">Beginner / Entry Level</option>
                <option value="intermediate">Intermediate / Mid Level</option>
                <option value="advanced">Advanced / Senior Level</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
          <button 
            type="submit" 
            disabled={saving} 
            className="bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs py-3 px-8 rounded-full shadow-pill transition-all inline-flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={16} />
            <span>{saving ? 'Saving Changes...' : 'Save Account Settings'}</span>
          </button>
        </div>
      </form>

      {/* Account Logout Box */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-card flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold font-display text-zinc-900 dark:text-white">Account Session</h3>
          <p className="text-xs text-zinc-500 font-sans mt-0.5">Sign out of your active GuideX session on this device.</p>
        </div>
        <button 
          onClick={logout} 
          className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs py-2.5 px-6 rounded-full transition-all"
        >
          Log Out
        </button>
      </div>

    </div>
  );
};

export default Profile;
