import { Sparkles, User, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import AIMessageRenderer from './AIMessageRenderer';

const ChatBubble = ({ message, isAI, timestamp, personaName }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex w-full ${isAI ? 'justify-start' : 'justify-end'} mb-5 font-sans`}>
      <div className={`flex max-w-[92%] md:max-w-[82%] gap-3.5 ${isAI ? 'flex-row' : 'flex-row-reverse'}`}>
        
        {/* Avatar badge */}
        <div className="flex-shrink-0 mt-1">
          <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shadow-sm ${
            isAI ? 'bg-[#F5C542] text-zinc-950 font-bold shadow-pill' : 'bg-zinc-900 text-white dark:bg-zinc-800 border border-zinc-700'
          }`}>
            {isAI ? <Sparkles size={18} /> : <User size={18} />}
          </div>
        </div>

        {/* Message Content Container */}
        <div className={`flex flex-col ${isAI ? 'items-start' : 'items-end'} flex-1 min-w-0`}>
          <div className={`rounded-3xl p-5 shadow-card border transition-all w-full ${
            isAI 
              ? 'bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100' 
              : 'bg-zinc-900 text-white dark:bg-zinc-800 border-zinc-800'
          }`}>
            {/* Top info badge */}
            <div className="flex items-center justify-between gap-4 mb-3 pb-2 border-b border-zinc-100 dark:border-zinc-800/80 text-[11px] font-medium text-zinc-400">
              <span className="font-mono font-bold text-amber-500">{isAI ? (personaName || 'Socratic Guide') : 'You'}</span>
              {isAI && (
                <button
                  onClick={handleCopy}
                  className="hover:text-amber-500 flex items-center gap-1.5 transition-colors cursor-pointer px-2 py-0.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-500 hover:bg-amber-50"
                  aria-label="Copy AI message"
                >
                  {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  <span className="font-mono text-[10px] font-bold">{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>

            {/* Main message text */}
            {isAI ? (
              <AIMessageRenderer text={message} />
            ) : (
              <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap font-sans font-medium text-zinc-100">
                {message}
              </div>
            )}
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
