import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import ChatBubble from '../components/ChatBubble';
import { USER_PROFILE, PHASES } from '../constants/userProfile';

const PERSONAS = [
  { id: 'socratic',   name: 'Socratic Guide',   tag: 'Interactivity', prompt: 'Guides thinking through questions.' },
  { id: 'architect',  name: 'Tech Architect',    tag: 'System Design', prompt: 'Explains systems structurally.' },
  { id: 'critic',     name: 'Code Critic',       tag: 'Code Review',   prompt: 'Reviews quality and edge cases.' },
  { id: 'strategist', name: 'Career Strategist', tag: 'Interviews',    prompt: 'Prepares for interviews and negotiation.' },
];

const AI_REPLIES = {
  socratic:   "Your reasoning is on the right track. Now consider the cold-start problem — when cache miss rates spike, how does that interact with your DB connection pool limit? Walk me through the failure path.",
  architect:  "Architecturally, LRU is the safer default under high-write QPS. LFU risks cache pollution when access patterns shift — a real risk during production traffic spikes. I'd pair this with a TTL policy.",
  critic:     "Correct instinct, but let's stress-test it. What happens to LRU under a sequential scan? You'd evict your entire working set. That's why PostgreSQL uses clock-sweep instead. Handle this case.",
  strategist: "Strong answer. In a system design interview, follow up with: 'I'd pair this with a TTL policy to bound staleness.' That signals production awareness to the interviewer.",
};

const currentPhase = PHASES.find(p => p.current) || PHASES[1];

const Mentor = () => {
  const [persona, setPersona]           = useState('socratic');
  const [input, setInput]               = useState('');
  const [isTyping, setIsTyping]         = useState(false);
  const [messages, setMessages]         = useState([{
    id: 1, sender: 'ai',
    text: `Based on your roadmap, you're ready to move into ${currentPhase.title.toLowerCase()} — but your caching fundamentals are still weak. What eviction policy (LRU vs LFU) would you choose for high-frequency write workloads, and why?`,
    createdAt: new Date().toISOString()
  }]);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  const send = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: input, createdAt: new Date().toISOString() }]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: AI_REPLIES[persona], createdAt: new Date().toISOString() }]);
      setIsTyping(false);
    }, 1100);
  };

  const currentPersona = PERSONAS.find(p => p.id === persona);

  return (
    <div className="font-sans pb-4" style={{ minHeight: 'calc(100vh - 120px)' }}>
      <div className="flex flex-col lg:flex-row gap-6 h-full" style={{ minHeight: 'calc(100vh - 160px)' }}>

        {/* ── LEFT: Conversation ── */}
        <div className="flex-1 flex flex-col space-y-4 min-h-0">

          {/* Persona selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
            {PERSONAS.map(p => (
              <button key={p.id} onClick={() => setPersona(p.id)}
                className={`px-4 py-2 rounded-full text-xs font-mono font-bold whitespace-nowrap transition-all ${
                  persona === p.id ? 'bg-[#F5C542] text-zinc-950 shadow-pill' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                }`}>
                {p.name}
              </button>
            ))}
          </div>
          <p className="text-xs text-zinc-400 shrink-0">
            <strong className="text-zinc-700 dark:text-zinc-300">{currentPersona?.name}:</strong>{' '}{currentPersona?.prompt}
          </p>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1 min-h-0" style={{ maxHeight: 'calc(100vh - 380px)' }}>
            {messages.map(msg => (
              <ChatBubble key={msg.id}
                message={msg.text}
                isAI={msg.sender === 'ai'}
                personaName={msg.sender === 'ai' ? currentPersona?.name : 'You'}
                timestamp={new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              />
            ))}
            {isTyping && (
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 pl-12 py-2">
                <div className="flex gap-1">
                  {[0, 150, 300].map(d => <span key={d} className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                </div>
                <span>{currentPersona?.name} is thinking...</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="shrink-0 flex items-center gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask about system design, caching, or your roadmap..."
              className="flex-1 px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#F5C542]"
            />
            <button onClick={send}
              className="w-11 h-11 rounded-full bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 flex items-center justify-center shadow-pill transition-all shrink-0">
              <Send size={15} />
            </button>
          </div>
        </div>

        {/* ── RIGHT: Career context — checklist 15 ── */}
        <div className="w-full lg:w-60 shrink-0 space-y-5">

          {/* Mentoring context block — dark, distinctive */}
          <div className="p-4 rounded-[16px] bg-zinc-900 text-white space-y-3">
            <div>
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-widest block">MENTORING ON</span>
              <h3 className="text-base font-extrabold font-display mt-0.5">{currentPhase.title}</h3>
              <span className="text-xs text-zinc-400">Phase 2 · {USER_PROFILE.targetRole}</span>
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-800 text-xs font-mono">
              {[
                { label: 'Target role', value: USER_PROFILE.targetRole,         color: 'text-white' },
                { label: 'Current skill', value: '35% System Design',            color: 'text-amber-400' },
                { label: 'Biggest gap', value: 'Distributed Systems',            color: 'text-rose-400' },
                { label: 'Recommended', value: 'Caching Fundamentals',           color: 'text-emerald-400' },
              ].map(row => (
                <div key={row.label} className="flex justify-between gap-2">
                  <span className="text-zinc-400 shrink-0">{row.label}</span>
                  <span className={`font-bold text-right ${row.color}`}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Why this focus — checklist 20 */}
          <div className="space-y-1 text-xs text-zinc-500">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">WHY THIS FOCUS?</span>
            <p className="leading-relaxed">
              System Design is your largest skill gap for {USER_PROFILE.targetRole}. Based on{' '}
              <strong className="text-zinc-800 dark:text-zinc-200">3 signals</strong>: quiz scores, roadmap phase, and target-role requirements.
            </p>
          </div>

          {/* Quick starters */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">ASK ABOUT</span>
            {[
              'LRU vs LFU cache eviction',
              'Why distributed systems matter',
              'How to approach system design interviews',
              'CAP theorem in plain English',
            ].map(q => (
              <button key={q} onClick={() => setInput(q)}
                className="w-full text-left text-xs py-2 px-2.5 rounded-[8px] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-colors">
                {q}
              </button>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Mentor;
