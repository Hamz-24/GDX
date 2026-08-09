import { Sparkles, User, Copy, Check } from 'lucide-react';
import { useState } from 'react';

const ChatBubble = ({ message, isAI, timestamp, personaName }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex w-full ${isAI ? 'justify-start' : 'justify-end'} mb-6 font-sans`}>
      <div className={`flex max-w-[90%] md:max-w-[78%] gap-3.5 ${isAI ? 'flex-row' : 'flex-row-reverse'}`}>
        
        {/* Avatar badge */}
        <div className="flex-shrink-0 mt-1">
          <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shadow-sm ${
            isAI ? 'bg-[#F5C542] text-zinc-950 font-bold shadow-pill' : 'bg-zinc-900 text-white dark:bg-zinc-800'
          }`}>
            {isAI ? <Sparkles size={18} /> : <User size={18} />}
          </div>
        </div>

        {/* Message Content Container */}
        <div className={`flex flex-col ${isAI ? 'items-start' : 'items-end'}`}>
          <div className={`rounded-3xl p-5 shadow-card border transition-all ${
            isAI 
              ? 'bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100' 
              : 'bg-zinc-900 text-white dark:bg-zinc-800 border-zinc-800'
          }`}>
            {/* Top info badge */}
            <div className="flex items-center justify-between gap-4 mb-2 pb-2 border-b border-zinc-100 dark:border-zinc-800/80 text-[11px] font-medium text-zinc-400">
              <span>{isAI ? (personaName || 'AI Mentor') : 'You'}</span>
              {isAI && (
                <button onClick={handleCopy} className="hover:text-zinc-700 dark:hover:text-zinc-200 flex items-center gap-1 transition-colors">
                  {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>

            {/* Main message text */}
            <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap font-sans">
              {message}
            </div>
          </div>

          {timestamp && (
            <span className="text-[10px] font-mono text-zinc-400 font-medium mt-1.5 px-2">
              {timestamp}
            </span>
          )}
        </div>

      </div>
    </div>
  );
};

export default ChatBubble;
