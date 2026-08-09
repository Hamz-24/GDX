import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, Lock, BrainCircuit } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const form = e.target;
    try {
      await login(form.email.value, form.password.value);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F4F6] dark:bg-[#09090B] flex flex-col items-center justify-center p-4 font-sans select-none">
      
      {/* Brand Logo Header */}
      <Link to="/" className="mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#F5C542] text-zinc-950 flex items-center justify-center font-bold shadow-pill">
          <BrainCircuit size={22} />
        </div>
        <span className="font-display font-extrabold text-2xl text-zinc-900 dark:text-white tracking-tight">
          GuideX
        </span>
      </Link>

      {/* Login Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl w-full max-w-md p-8 shadow-card space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold font-display text-zinc-900 dark:text-white">Welcome back</h2>
          <p className="text-xs text-zinc-500 font-medium">Log in to access your personalized career roadmap.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold font-mono text-zinc-500 dark:text-zinc-400 uppercase">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input
                name="email"
                type="email"
                className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white pl-11 pr-4 py-3 rounded-full text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#F5C542]"
                placeholder="name@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold font-mono text-zinc-500 dark:text-zinc-400 uppercase">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input
                name="password"
                type="password"
                className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white pl-11 pr-4 py-3 rounded-full text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#F5C542]"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs py-3.5 rounded-full shadow-pill transition-all inline-flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            <span>{loading ? 'Logging in...' : 'Log In to Dashboard'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 text-center">
          <p className="text-xs text-zinc-500 font-medium">
            Don't have an account?{' '}
            <Link to="/signup" className="text-zinc-900 dark:text-white font-bold hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
