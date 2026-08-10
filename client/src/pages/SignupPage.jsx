import { Link, useNavigate } from 'react';
import { ArrowRight, Mail, Lock, User, Target, BrainCircuit, Check } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CORE_GOALS, TIMELINES, LEVELS } from '../constants/userProfile';

const SignupPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState('DATA STRUCTURES');

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const form = e.target;
    try {
      await register(
        form.name.value,
        form.email.value,
        form.password.value,
        selectedGoal,
        form.level.value,
        form.timelineWeeks.value
      );
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F4F6] dark:bg-[#09090B] flex flex-col items-center justify-center p-4 py-12 font-sans select-none">
      
      {/* Brand Header */}
      <Link to="/" className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#F5C542] text-zinc-950 flex items-center justify-center font-bold shadow-pill">
          <BrainCircuit size={22} />
        </div>
        <span className="font-display font-extrabold text-2xl text-zinc-900 dark:text-white tracking-tight">
          GuideX
        </span>
      </Link>

      {/* Signup Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-card space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold font-display text-zinc-900 dark:text-white">Create your account</h2>
          <p className="text-xs text-zinc-500 font-medium">Select your core engineering goal & AI curriculum parameters.</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold font-mono text-zinc-500 dark:text-zinc-400 uppercase">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input name="name" type="text" className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white pl-11 pr-4 py-2.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#F5C542]" placeholder="Sally Mindset" required />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold font-mono text-zinc-500 dark:text-zinc-400 uppercase">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input name="email" type="email" className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white pl-11 pr-4 py-2.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#F5C542]" placeholder="sallymind@gmail.com" required />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold font-mono text-zinc-500 dark:text-zinc-400 uppercase">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input name="password" type="password" className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white pl-11 pr-4 py-2.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#F5C542]" placeholder="••••••••" required />
            </div>
          </div>

          {/* 4 CORE GOAL DOMAIN CARDS */}
          <div className="space-y-2">
            <label className="text-xs font-bold font-mono text-zinc-500 dark:text-zinc-400 uppercase block">
              Select Core Goal (4 Curated Domains)
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
                      : 'bg-zinc-100 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700/60 hover:border-amber-300'
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold font-mono text-zinc-500 dark:text-zinc-400 uppercase">Level</label>
              <select name="level" className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white px-4 py-2.5 rounded-full text-xs font-semibold focus:outline-none cursor-pointer" required defaultValue="Basic / Beginner">
                {LEVELS.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold font-mono text-zinc-500 dark:text-zinc-400 uppercase">Timeline</label>
              <select name="timelineWeeks" className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white px-4 py-2.5 rounded-full text-xs font-semibold focus:outline-none cursor-pointer" required defaultValue="4 Weeks">
                {TIMELINES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs py-3.5 rounded-full shadow-pill transition-all inline-flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            <span>{loading ? 'Generating Roadmap...' : 'Get Started & Create Roadmap'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 text-center">
          <p className="text-xs text-zinc-500 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-zinc-900 dark:text-white font-bold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
