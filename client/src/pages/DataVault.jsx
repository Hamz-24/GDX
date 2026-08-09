import { useState } from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { USER_PROFILE } from '../constants/userProfile';

const TABS = ['All', 'Notes', 'Code', 'AI Insights', 'References', 'URLs'];

const KNOWLEDGE = [
  { id: 1, category: 'DATABASE',          title: 'B-Tree Indexing',                  type: 'Notes',      updated: '4 min ago',   tag: 'Phase 2' },
  { id: 2, category: 'DATABASE',          title: 'PostgreSQL EXPLAIN ANALYZE',        type: 'References', updated: '1 day ago',   tag: 'Phase 2' },
  { id: 3, category: 'QUERY OPTIMIZATION',title: 'EXPLAIN ANALYZE Query Plans',       type: 'AI Insights',updated: 'Yesterday',   tag: 'Recommended' },
  { id: 4, category: 'SYSTEM DESIGN',     title: 'Caching Strategies & Redis',        type: 'References', updated: '2 days ago',  tag: 'Phase 3' },
  { id: 5, category: 'SYSTEM DESIGN',     title: 'REST vs GraphQL Tradeoffs',         type: 'Notes',      updated: '3 days ago',  tag: 'Phase 2' },
  { id: 6, category: 'AUTHENTICATION',    title: 'JWT & Refresh Token Patterns',      type: 'Code',       updated: '4 days ago',  tag: 'Phase 2' },
  { id: 7, category: 'DISTRIBUTED',       title: 'CAP Theorem Explained',             type: 'AI Insights',updated: '5 days ago',  tag: 'Phase 4' },
];

const TYPE_COLOR = {
  Notes:      'text-emerald-600 dark:text-emerald-400',
  References: 'text-sky-600 dark:text-sky-400',
  Code:       'text-violet-600 dark:text-violet-400',
  'AI Insights':'text-amber-600 dark:text-amber-400',
  URLs:       'text-zinc-500',
};

const DataVault = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('All');
  const [query, setQuery] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  const runAnalysis = () => {
    if (!resumeText.trim() || analyzing) return;
    setAnalyzing(true);
    setTimeout(() => { setAnalyzing(false); setAnalyzed(true); }, 1200);
  };

  const filtered = KNOWLEDGE.filter(k => {
    const matchTab   = tab === 'All' || k.type === tab;
    const matchQuery = !query || k.title.toLowerCase().includes(query.toLowerCase()) || k.category.toLowerCase().includes(query.toLowerCase());
    return matchTab && matchQuery;
  });

  // Group filtered by category
  const grouped = filtered.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="max-w-3xl mx-auto space-y-10 font-sans pb-16">

      {/* Header */}
      <div className="space-y-1.5 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block">
          KNOWLEDGE BASE · {USER_PROFILE.targetRole}
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold font-display text-zinc-900 dark:text-white tracking-tight">
          Vault
        </h1>
        <p className="text-xs text-zinc-500 font-medium">
          Everything you've studied, saved, and learned — searchable in one place.
        </p>
      </div>

      {/* ── SEARCH FIRST — checklist 18 ── */}
      <div className="relative">
        <Search size={15} className="absolute left-4 top-3.5 text-zinc-400" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search your knowledge..."
          className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[14px] text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#F5C542]"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto text-xs font-mono font-bold">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
              tab === t ? 'bg-[#F5C542] text-zinc-950 shadow-pill' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Knowledge list — grouped, not card grid */}
      {Object.keys(grouped).length === 0 ? (
        <div className="text-center space-y-3 pt-10">
          <p className="text-zinc-400 text-sm font-medium">Nothing found for "{query}"</p>
          <button onClick={() => { setQuery(''); setTab('All'); }} className="text-xs font-mono text-amber-500 hover:underline">Clear search</button>
        </div>
      ) : (
        <div className="space-y-7">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="space-y-0">
              <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block mb-2">
                {category}
              </span>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {items.map(item => (
                  <div key={item.id}
                    className="py-3 flex items-center justify-between gap-4 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 -mx-2 px-2 rounded-[8px] transition-colors">
                    <div className="min-w-0">
                      <span className="font-bold text-sm text-zinc-900 dark:text-white block truncate">{item.title}</span>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] font-mono">
                        <span className={TYPE_COLOR[item.type] || 'text-zinc-400'}>{item.type}</span>
                        <span className="text-zinc-300 dark:text-zinc-700">·</span>
                        <span className="text-zinc-400">{item.updated}</span>
                      </div>
                    </div>
                    <span className="shrink-0 text-[10px] font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                      {item.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="h-px bg-zinc-200 dark:bg-zinc-800" />

      {/* ── AI SKILL ANALYSIS PIPELINE — checklist 19 ── */}
      <div className="space-y-5">
        <div>
          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">SKILL ANALYSIS</span>
          <h2 className="text-xl font-extrabold font-display text-zinc-900 dark:text-white mt-0.5">
            Update Your Roadmap
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Paste your resume or a job description to re-calibrate your {USER_PROFILE.targetRole} roadmap.
          </p>
        </div>

        {/* AI pipeline visual */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-[10px] font-mono font-bold text-zinc-400">
          {['INPUT', 'AI ANALYSIS', 'SKILLS DETECTED', 'SKILL GAPS', 'ROADMAP CHANGES', 'REVIEW'].map((step, i, arr) => (
            <div key={step} className="flex sm:flex-col items-center gap-1 flex-1">
              <div className={`px-2 py-1.5 rounded text-center text-[9px] w-full ${
                analyzed ? 'text-zinc-900 dark:text-white' : i === 0 ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'
              }`}>
                {step}
              </div>
              {i < arr.length - 1 && <span className="text-zinc-300 dark:text-zinc-700 sm:rotate-90">→</span>}
            </div>
          ))}
        </div>

        {!analyzed ? (
          <div className="space-y-3">
            <textarea
              rows={3}
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              placeholder="Paste resume or job description..."
              className="w-full p-4 rounded-[14px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#F5C542] resize-none"
            />
            <button
              onClick={runAnalysis}
              disabled={!resumeText.trim() || analyzing}
              className="bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs py-2.5 px-6 rounded-full shadow-pill transition-all disabled:opacity-40"
            >
              {analyzing ? 'Analyzing...' : 'Analyze →'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center font-mono">
              <div>
                <div className="text-3xl font-extrabold text-zinc-900 dark:text-white">17</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Skills detected</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-rose-500">4</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Skill gaps</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-amber-500">3</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Roadmap changes</div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs font-mono text-zinc-600 dark:text-zinc-300">
              <div className="flex items-center gap-2"><span className="text-emerald-500">+</span> System Design added to roadmap</div>
              <div className="flex items-center gap-2"><span className="text-emerald-500">+</span> AWS Fundamentals added</div>
              <div className="flex items-center gap-2"><span className="text-amber-500">↑</span> Distributed Systems priority increased</div>
              <div className="flex items-center gap-2"><span className="text-zinc-400">↓</span> Frontend priority reduced</div>
            </div>

            <button onClick={() => navigate('/roadmap')}
              className="inline-flex items-center gap-1.5 bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs py-2.5 px-6 rounded-full shadow-pill transition-all">
              Review Changes <ArrowRight size={13} />
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default DataVault;
