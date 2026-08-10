import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, BookOpen, CheckCircle2, ArrowRight, Code, HelpCircle, ShieldAlert } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import ChatBubble from '../components/ChatBubble';
import { USER_PROFILE } from '../constants/userProfile';
import api from '../utils/api';

const PERSONAS = [
  { id: 'socratic',   name: 'Socratic Guide',   tag: 'Interactivity', prompt: 'Guides thinking through step-by-step daily questions.' },
  { id: 'architect',  name: 'Tech Architect',    tag: 'Code & Logic',  prompt: 'Explains code structures, memory layout, and $O(N)$ Big-O complexity.' },
  { id: 'critic',     name: 'Code Critic',       tag: 'Code Review',   prompt: 'Reviews edge cases, null pointers, and boundary bugs.' },
  { id: 'strategist', name: 'Interview Coach',   tag: 'Interviews',    prompt: 'Prepares for technical coding assessments and mock interviews.' },
];

const generateDynamicAIReply = (persona, userText, activeTopic) => {
  if (persona === 'socratic') {
    return `### 💡 Socratic Insight on "${userText}"\nTo build deep intuition for **${activeTopic}**, let's reason through this step-by-step:\n\n1. **The Core Question:** If we increase the size of our input by 100x, how does the memory or pointer traversal behave?\n2. **Think about this:** What exact condition triggers pointer contraction?\n3. **Challenge:** What is the minimal test case that could break your logic?\n\n*Reply with your hypothesis and I'll guide you to the exact solution!*`;
  }

  if (persona === 'architect') {
    return `### 🏗️ Technical Architecture & Code Blueprint\n**Topic:** ${activeTopic} · **Context:** ${userText}\n\n#### 1. Memory & Algorithmic Complexity\n- **Time Complexity:** $\\mathcal{O}(N)$ linear single-pass traversal.\n- **Space Complexity:** $\\mathcal{O}(1)$ auxiliary space allocation.\n\n\`\`\`python\ndef execute_optimal_solution(arr, target):\n    left = 0\n    current_sum = 0\n    for right in range(len(arr)):\n        current_sum += arr[right]\n        while current_sum > target:\n            current_sum -= arr[left]\n            left += 1\n    return current_sum\n\`\`\`\n\n*Would you like me to adapt this blueprint for C++, Java, or Go?*`;
  }

  if (persona === 'critic') {
    return `### ⚠️ Code Review & Edge Case Stress-Test\n**Reviewing:** "${userText}" for **${activeTopic}**\n\n#### Potential Failure Modes to Patch:\n1. **Empty / Null Input:** Check \`arr == None\` or \`len(arr) == 0\`.\n2. **Off-by-One Range Errors:** Ensure \`right - left + 1\` is used when calculating length.\n\n\`\`\`python\nif not arr:\n    return 0\n\`\`\`\n\n*Check these edge cases in your implementation!*`;
  }

  return `### 🎯 Technical Interview Strategy\n**Targeting:** ${USER_PROFILE.targetRole} · **Domain:** ${activeTopic}\n\n#### How Interviewers Grade This Topic:\n1. **Communication (25%):** State your approach before writing code.\n2. **Implementation Speed (50%):** Write clean variable names.\n3. **Optimization (25%):** Be ready to explain space trade-offs.\n\n*Would you like to do a quick 3-minute mock interview question on this right now?*`;
};

const Mentor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const passedState = location.state;

  const [persona, setPersona] = useState('socratic');
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Initialize conversation
  const [messages, setMessages] = useState(() => {
    if (passedState?.dayTopic) {
      return [
        {
          id: 1,
          sender: 'user',
          text: passedState.prompt || `Can you explain ${passedState.dayTopic}?`,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          sender: 'ai',
          text: `### 📘 Daily Topic Guide: ${passedState.dayTopic}\n**Target Goal:** ${passedState.goal || USER_PROFILE.targetRole}\n\nKey milestones for today:\n- **Memory Layout:** Contiguous sequential RAM allocation.\n- **Complexity:** Aim for $\\mathcal{O}(N)$ linear time complexity.\n\nAsk me any questions or pick a recommended question on the right!`,
          createdAt: new Date().toISOString()
        }
      ];
    }
    return [
      {
        id: 1,
        sender: 'ai',
        text: `Welcome to your GuideX AI Mentor session! Connected to Express backend API. You're currently focused on **${USER_PROFILE.targetRole}**. What would you like to master today?`,
        createdAt: new Date().toISOString()
      }
    ];
  });

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const send = async (overrideText) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim()) return;

    setMessages(prev => [
      ...prev,
      { id: Date.now(), sender: 'user', text: textToSend, createdAt: new Date().toISOString() }
    ]);
    if (!overrideText) setInput('');
    setIsTyping(true);

    const activeTopic = passedState?.dayTopic || USER_PROFILE.targetRole;

    try {
      // Send to backend API
      const res = await api('/api/mentor/chat', {
        method: 'POST',
        body: JSON.stringify({ message: textToSend, persona, topic: activeTopic })
      });

      if (res?.reply) {
        setMessages(prev => [
          ...prev,
          { id: Date.now() + 1, sender: 'ai', text: res.reply, createdAt: new Date().toISOString() }
        ]);
        setIsTyping(false);
        return;
      }
    } catch {
      /* Fallback to dynamic persona reply */
    }

    setTimeout(() => {
      const aiReply = generateDynamicAIReply(persona, textToSend, activeTopic);
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, sender: 'ai', text: aiReply, createdAt: new Date().toISOString() }
      ]);
      setIsTyping(false);
    }, 700);
  };

  const currentPersona = PERSONAS.find(p => p.id === persona);
  const activeTopic = passedState?.dayTopic || USER_PROFILE.targetRole;

  return (
    <div className="font-sans pb-4" style={{ minHeight: 'calc(100vh - 120px)' }}>
      <div className="flex flex-col lg:flex-row gap-6 h-full" style={{ minHeight: 'calc(100vh - 160px)' }}>

        {/* ── LEFT: Chat Workspace ── */}
        <div className="flex-1 flex flex-col space-y-4 min-h-0">

          {/* Active Context Banner if navigated from Roadmap/Vault */}
          {passedState?.dayTopic && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-amber-500 shrink-0" />
                <div>
                  <span className="font-mono font-bold text-amber-800 dark:text-amber-300 uppercase text-[10px] block">
                    ACTIVE TUTORING CONTEXT
                  </span>
                  <span className="text-zinc-800 dark:text-zinc-200 font-bold">{passedState.dayTopic}</span>
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
          <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
            {PERSONAS.map(p => (
              <button
                key={p.id}
                onClick={() => setPersona(p.id)}
                className={`px-4 py-2 rounded-full text-xs font-mono font-bold whitespace-nowrap transition-all ${
                  persona === p.id
                    ? 'bg-[#F5C542] text-zinc-950 shadow-pill'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          <p className="text-xs text-zinc-400 shrink-0">
            <strong className="text-zinc-700 dark:text-zinc-300">{currentPersona?.name}:</strong> {currentPersona?.prompt}
          </p>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0" style={{ maxHeight: 'calc(100vh - 380px)' }}>
            {messages.map(msg => (
              <ChatBubble
                key={msg.id}
                message={msg.text}
                isAI={msg.sender === 'ai'}
                personaName={msg.sender === 'ai' ? currentPersona?.name : 'You'}
                timestamp={new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              />
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 pl-12 py-2">
                <div className="flex gap-1">
                  {[0, 150, 300].map(d => (
                    <span key={d} className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
                <span>{currentPersona?.name} is composing your answer...</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input Box */}
          <div className="shrink-0 flex items-center gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder={`Ask ${currentPersona?.name} about ${activeTopic}...`}
              className="flex-1 px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#F5C542]"
            />
            <button
              onClick={() => send()}
              className="w-11 h-11 rounded-full bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 flex items-center justify-center shadow-pill transition-all shrink-0"
            >
              <Send size={15} />
            </button>
          </div>
        </div>

        {/* ── RIGHT: Mentoring Context Sidebar ── */}
        <div className="w-full lg:w-64 shrink-0 space-y-5">

          {/* Mentoring context card */}
          <div className="p-5 rounded-3xl bg-zinc-900 text-white space-y-4 shadow-sm">
            <div>
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-widest block">
                MENTORING CONTEXT
              </span>
              <h3 className="text-base font-extrabold font-display mt-1 leading-snug">
                {activeTopic}
              </h3>
              <span className="text-xs text-zinc-400 font-mono block mt-1">
                Persona: {currentPersona?.name}
              </span>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-zinc-800 text-xs font-mono">
              <div className="flex justify-between gap-2">
                <span className="text-zinc-400">Target Goal</span>
                <span className="font-bold text-white text-right">{USER_PROFILE.targetRole}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-zinc-400">Level</span>
                <span className="font-bold text-amber-400 text-right">Beginner</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-zinc-400">Persona Focus</span>
                <span className="font-bold text-emerald-400 text-right">{currentPersona?.tag}</span>
              </div>
            </div>
          </div>

          {/* Quick Questions */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">
              RECOMMENDED QUESTIONS
            </span>
            {[
              `Show me Python code for ${activeTopic}`,
              `What are 3 edge cases to watch out for?`,
              `Give me a 3-minute practice quiz`,
              `How would an interviewer evaluate this?`
            ].map(q => (
              <button
                key={q}
                onClick={() => send(q)}
                className="w-full text-left text-xs py-2.5 px-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-all font-medium"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Start Practice Session Action */}
          <button
            onClick={() => navigate('/focus', { state: { task: { title: activeTopic, minutes: 25 } } })}
            className="w-full bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs py-3 rounded-2xl shadow-pill transition-all flex items-center justify-center gap-1.5"
          >
            <span>Start Practice Session</span>
            <ArrowRight size={14} />
          </button>

        </div>
      </div>
    </div>
  );
};

export default Mentor;
