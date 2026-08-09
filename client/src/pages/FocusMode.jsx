import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import Card from '../components/Card';

const FocusMode = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 mins
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto h-full flex flex-col items-center justify-center pt-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Focus Mode</h1>
        <p className="text-textMuted">Eliminate distractions and get to work.</p>
      </div>

      <div className="relative mb-12">
        {/* Glow effect */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[80px] pointer-events-none transition-all duration-1000 ${
          isActive ? 'bg-primary/40 scale-110' : 'bg-[#27272a]/40 scale-100'
        }`} />
        
        <div className="relative z-10 w-64 h-64 sm:w-80 sm:h-80 rounded-full border-[6px] border-[#27272a] flex flex-col items-center justify-center bg-card shadow-2xl">
          <div className="text-6xl sm:text-7xl font-bold tracking-tighter text-white mb-4">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <span className="text-textMuted tracking-widest uppercase text-sm font-medium">
            Time Remaining
          </span>
        </div>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={toggleTimer}
          className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg active:scale-95 ${
            isActive 
              ? 'bg-orange-500/20 text-orange-500 border border-orange-500/50 hover:bg-orange-500/30' 
              : 'bg-primary text-white hover:bg-primaryHover shadow-primary/20'
          }`}
        >
          {isActive ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
          {isActive ? 'Pause' : 'Start Focus'}
        </button>
        
        <button 
          onClick={resetTimer}
          className="flex items-center gap-2 px-6 py-4 rounded-xl border border-border bg-background text-textMuted hover:text-white transition-colors active:scale-95"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      <Card className="w-full mt-12 bg-background border-[#27272a]" title="Suggested Task for this Session">
        <div className="flex items-center gap-4">
          <div className="w-2 h-10 bg-primary rounded-full" />
          <div>
            <h3 className="font-semibold text-white">Understand React State</h3>
            <p className="text-sm text-textMuted">Read the official documentation on useState.</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FocusMode;
