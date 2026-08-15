import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, ArrowRight, Trash2, RotateCcw } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import ChatBubble from '../components/ChatBubble';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const PERSONAS = [
  { id: 'socratic',   name: 'Socratic Guide',   tag: 'Interactivity', prompt: 'Guides thinking through step-by-step daily questions.' },
  { id: 'architect',  name: 'Tech Architect',    tag: 'Code & Logic',  prompt: 'Explains code structures, memory layout, and Big-O complexity.' },
  { id: 'critic',     name: 'Code Critic',       tag: 'Code Review',   prompt: 'Reviews edge cases, null pointers, and boundary bugs.' },
  { id: 'strategist', name: 'Interview Coach',   tag: 'Interviews',    prompt: 'Prepares for technical coding assessments and mock interviews.' },
];

const Mentor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const passedState = location.state;

  const [persona, setPersona] = useState('socratic');
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const bottomRef = useRef(null);
  const autoSentRef = useRef(false);

  const activeGoal = user?.goal || 'DATA STRUCTURES';
  const activeLevel = user?.level || 'Beginner';
  const rawTopic = passedState?.dayTopic || activeGoal;
  const activeTopic = rawTopic.replace(/^Practice:\s*/i, '').trim();

  // Load chat history from backend API
  const fetchChatHistory = async () => {
    setLoadingHistory(true);
    try {
      const history = await api('/api/mentor/history');
      if (Array.isArray(history) && history.length > 0) {
        const mapped = history.map((m, idx) => ({
          id: m._id || m.id || idx,
          sender: m.role === 'user' ? 'user' : 'ai',
          text: m.content,
          createdAt: m.createdAt || new Date().toISOString()
        }));
        setMessages(mapped);
      } else {
        setMessages([
          {
            id: 'welcome-1',
            sender: 'ai',
            text: `Hello ${user?.name?.split(' ')[0] || 'Developer'}! 👋 Welcome to your Socratic AI Guide session.\n\nI'm here to help you master **${activeGoal}**. What concept or problem would you like to explore today?`,
            createdAt: new Date().toISOString()
          }
        ]);
      }
    } catch {
      setMessages([
        {
          id: 'welcome-1',
          sender: 'ai',
          text: `Hello ${user?.name?.split(' ')[0] || 'Developer'}! 👋 Welcome to your Socratic AI Guide session.\n\nI'm here to help you master **${activeGoal}**. What concept or problem would you like to explore today?`,
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchChatHistory();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Auto-send passed topic prompt if navigated from Roadmap/Vault
  useEffect(() => {
    if (passedState?.dayTopic && !autoSentRef.current) {
      autoSentRef.current = true;
      const initialPrompt = passedState.prompt || `Can you explain ${activeTopic}?`;
      send(initialPrompt);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const send = async (overrideText) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim() || isTyping) return;

    const userMsgObj = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: textToSend.trim(),
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsgObj]);
    if (!overrideText) setInput('');
    setIsTyping(true);

    try {
      const res = await api('/api/mentor/chat', {
        method: 'POST',
        body: JSON.stringify({ message: textToSend.trim(), persona, topic: activeTopic })
      });
      setMessages(prev => [
        ...prev,
        { id: 'ai-' + Date.now(), sender: 'ai', text: res.reply, createdAt: new Date().toISOString() }
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          sender: 'ai',
          text: 'AI Mentor is temporarily unavailable. Please try again in a moment.',
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChatHistory = async () => {
    if (!window.confirm('Are you sure you want to clear your chat history with AI Mentor?')) return;
    try {
      await api('/api/mentor/history', { method: 'DELETE' });
    } catch { /* skip */ }
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'ai',
        text: `Chat history cleared. Ready to start fresh on **${activeGoal}**!`,
        createdAt: new Date().toISOString()
      }
    ]);
  };

  const currentPersona = PERSONAS.find(p => p.id === persona);

  const recommendedQuestions = [
    `Show me a Python code snippet for ${activeTopic}`,
    `What are 3 critical edge cases in ${activeTopic}?`,
    `Give me a 3-minute practice quiz on ${activeTopic}`,
    `How would a FAANG interviewer evaluate ${activeTopic}?`
  ];

  return (
    <div className="font-sans pt-1 pb-6 max-w-7xl mx-auto space-y-4">
      <div className="flex flex-col lg:flex-row gap-6 items-start" style={{ minHeight: 'calc(100vh - 160px)' }}>

        {/* ── LEFT: Chat Workspace ── */}
        <div className="flex-1 w-full flex flex-col space-y-4 min-h-[550px] lg:min-h-[680px]">

          {/* Header Banner */}
          <div className="p-4 md:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F5C542] text-zinc-950 flex items-center justify-center font-bold shadow-pill shrink-0">
                <Sparkles size={20} />
              </div>
              <div>
                <h1 className="text-lg font-extrabold font-display text-zinc-900 dark:text-white tracking-tight">
                  Socratic AI Mentor & Code Tutor
                </h1>
                <p className="text-xs text-zinc-500 font-medium line-clamp-1">
                  Guiding your learning step-by-step for <strong className="text-amber-500">{activeGoal}</strong> ({activeLevel})
                </p>
              </div>
            </div>

            <button
              onClick={clearChatHistory}
              className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-zinc-600 dark:text-zinc-400 hover:text-rose-600 rounded-2xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              title="Clear Chat History"
              aria-label="Clear chat history"
            >
              <Trash2 size={14} /> <span className="hidden sm:inline">Clear History</span>
            </button>
          </div>

          {/* Active Context Banner if navigated from Roadmap/Vault */}
          {passedState?.dayTopic && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-amber-500 shrink-0" />
                <div>
                  <span className="font-mono font-bold text-amber-800 dark:text-amber-300 uppercase text-[10px] block">
                    ACTIVE TUTORING TOPIC
                  </span>
                  <span className="text-zinc-800 dark:text-zinc-200 font-bold">{activeTopic}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/roadmap')}
                className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 hover:underline shrink-0"
              >
                Roadmap →
              </button>
            </div>
          )}

          {/* Persona Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-none">
            {PERSONAS.map(p => (
              <button
                key={p.id}
                onClick={() => setPersona(p.id)}
                className={`px-4 py-2 rounded-full text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
                  persona === p.id
                    ? 'bg-[#F5C542] text-zinc-950 shadow-pill'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          <p className="text-xs text-zinc-400 shrink-0 px-1">
            <strong className="text-zinc-700 dark:text-zinc-300 font-mono">{currentPersona?.name}:</strong> {currentPersona?.prompt}
          </p>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-[360px] max-h-[560px] scrollbar-thin">
            {loadingHistory ? (
              <div className="p-8 text-center text-xs font-mono text-zinc-400">Loading chat history...</div>
            ) : (
              messages.map(msg => (
                <ChatBubble
                  key={msg.id}
                  message={msg.text}
                  isAI={msg.sender === 'ai'}
                  personaName={msg.sender === 'ai' ? currentPersona?.name : 'You'}
                  timestamp={new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                />
              ))
            )}

            {isTyping && (
              <div className="flex items-center gap-3 text-xs font-mono text-zinc-400 pl-12 py-3">
                <div className="flex gap-1.5">
                  {[0, 150, 300].map(d => (
                    <span key={d} className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
                <span className="font-bold text-amber-500">{currentPersona?.name} is thinking...</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input Box */}
          <div className="shrink-0 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <form onSubmit={e => { e.preventDefault(); send(); }} className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={`Ask ${currentPersona?.name} about ${activeTopic}...`}
                disabled={isTyping}
                aria-label="Ask AI Mentor"
                className="flex-1 px-5 py-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#F5C542] disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isTyping || !input.trim()}
                aria-label="Send message"
                className="w-12 h-12 rounded-full bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 flex items-center justify-center shadow-pill transition-all shrink-0 disabled:opacity-40 cursor-pointer"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>

        {/* ── RIGHT: Mentoring Context Sidebar ── */}
        <div className="w-full lg:w-72 shrink-0 space-y-5">

          {/* Mentoring context card */}
          <div className="p-5 rounded-3xl bg-zinc-900 text-white space-y-4 shadow-sm border border-zinc-800">
            <div>
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-widest block">
                MENTORING CONTEXT
              </span>
              <h3 className="text-base font-extrabold font-display mt-1 leading-snug text-white">
                {activeTopic}
              </h3>
              <span className="text-xs text-zinc-400 font-mono block mt-1">
                Persona: <strong className="text-amber-400">{currentPersona?.name}</strong>
              </span>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-zinc-800 text-xs font-mono">
              <div className="flex justify-between gap-2">
                <span className="text-zinc-400">Target Goal</span>
                <span className="font-bold text-white text-right truncate max-w-[140px]">{activeGoal}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-zinc-400">Level</span>
                <span className="font-bold text-amber-400 text-right">{activeLevel}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-zinc-400">Persona Focus</span>
                <span className="font-bold text-emerald-400 text-right">{currentPersona?.tag}</span>
              </div>
            </div>
          </div>

          {/* Dynamic Recommended Questions */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block px-1">
              RECOMMENDED QUESTIONS
            </span>
            {recommendedQuestions.map(q => (
              <button
                key={q}
                onClick={() => send(q)}
                disabled={isTyping}
                className="w-full text-left text-xs py-3 px-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:border-amber-300 hover:text-zinc-900 dark:hover:text-white transition-all font-medium leading-snug cursor-pointer disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Start Practice Session Action */}
          <button
            onClick={() => navigate('/focus', { state: { task: { title: `Practice: ${activeTopic}`, minutes: 25 } } })}
            className="w-full bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs py-3.5 rounded-2xl shadow-pill transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Start Practice Session</span>
            <ArrowRight size={15} />
          </button>

        </div>
      </div>
    </div>
  );
};

export default Mentor;
