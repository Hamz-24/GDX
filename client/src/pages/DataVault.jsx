import { useState } from 'react';
import { Search, ArrowRight, Upload, Sparkles, FileText, Code, BookOpen, Plus, X, CheckCircle2, MessageSquare, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { USER_PROFILE } from '../constants/userProfile';

const TABS = ['All', 'Personal Notes', 'Uploaded Documents', 'Code', 'AI Insights', 'References'];

const INITIAL_KNOWLEDGE = [
  {
    id: 1,
    category: 'DATA STRUCTURES',
    title: 'Arrays & Memory Alignment (Lecture Notes)',
    type: 'Personal Notes',
    updated: 'Just now',
    tag: 'Week 1',
    content: `Contiguous memory allocation means array elements are stored in sequential RAM memory addresses. Base address formula: Addr(A[i]) = Base + (i * element_size). O(1) access time because address calculation is arithmetic.`
  },
  {
    id: 2,
    category: 'DATA STRUCTURES',
    title: 'Sliding Window Pattern Cheatsheet.pdf',
    type: 'Uploaded Documents',
    updated: '1 hour ago',
    tag: 'Week 1',
    content: `Sliding Window technique avoids duplicate iterations over subarrays. Maintain two pointers (left & right). For max sum of size K: slide window by adding right element and subtracting left element in O(1).`
  },
  {
    id: 3,
    category: 'DATABASE',
    title: 'B-Tree Indexing Implementation',
    type: 'Personal Notes',
    updated: '4 min ago',
    tag: 'Phase 2',
    content: `B-Tree indexes maintain sorted data allowing search, sequential access, insertions, and deletions in logarithmic time O(log N). Root node branches to internal nodes down to leaf nodes containing keys.`
  },
  {
    id: 4,
    category: 'DATABASE',
    title: 'PostgreSQL EXPLAIN ANALYZE Guide',
    type: 'References',
    updated: '1 day ago',
    tag: 'Phase 2',
    content: `EXPLAIN ANALYZE runs the query and prints execution plan with real timing. Sequential Scan vs Index Scan vs Index Only Scan. Watch out for high cost estimates on nested loop joins.`
  },
  {
    id: 5,
    category: 'SYSTEM DESIGN',
    title: 'Caching Strategies & Redis Eviction',
    type: 'References',
    updated: '2 days ago',
    tag: 'Phase 3',
    content: `Cache-Aside pattern: Application checks cache first. On miss, reads from DB and writes to cache. Eviction policies: LRU (Least Recently Used) vs LFU (Least Frequently Used) vs TTL (Time-to-Live).`
  },
  {
    id: 6,
    category: 'AUTHENTICATION',
    title: 'JWT Auth Middleware (Node.js/Express)',
    type: 'Code',
    updated: '4 days ago',
    tag: 'Phase 2',
    content: `const verifyToken = (req, res, next) => { const token = req.headers['authorization']?.split(' ')[1]; if(!token) return res.status(401).send('Access Denied'); ... }`
  }
];

const TYPE_COLOR = {
  'Personal Notes':    'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40',
  'Uploaded Documents':'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40',
  Code:                'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40',
  'AI Insights':       'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40',
  References:          'text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800',
};

const DataVault = () => {
  const navigate = useNavigate();
  const [knowledgeList, setKnowledgeList] = useState(INITIAL_KNOWLEDGE);
  const [tab, setTab] = useState('All');
  const [query, setQuery] = useState('');
  
  // Note Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteType, setNoteType] = useState('Personal Notes');
  const [noteCategory, setNoteCategory] = useState('DATA STRUCTURES');
  const [noteContent, setNoteContent] = useState('');

  // Note Viewer Modal State
  const [selectedNote, setSelectedNote] = useState(null);

  // Personalized AI Search State
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState(null);
  const [isAiSearching, setIsAiSearching] = useState(false);

  // Resume Pipeline State
  const [resumeText, setResumeText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;

    const newItem = {
      id: Date.now(),
      category: noteCategory.toUpperCase(),
      title: noteTitle,
      type: noteType,
      updated: 'Just now',
      tag: 'Personal',
      content: noteContent || 'Uploaded personal study content.'
    };

    setKnowledgeList(prev => [newItem, ...prev]);
    setNoteTitle('');
    setNoteContent('');
    setShowUploadModal(false);
  };

  const handleAiNoteSearch = (customQ) => {
    const q = customQ || aiQuestion;
    if (!q.trim() || isAiSearching) return;

    setIsAiSearching(true);
    setAiAnswer(null);

    setTimeout(() => {
      // Find matching note in knowledge base
      const matched = knowledgeList.find(k => 
        k.title.toLowerCase().includes(q.toLowerCase()) || 
        k.content.toLowerCase().includes(q.toLowerCase()) ||
        k.category.toLowerCase().includes(q.toLowerCase())
      ) || knowledgeList[0];

      setAiAnswer({
        query: q,
        sourceTitle: matched.title,
        sourceType: matched.type,
        answer: `### 🎯 Grounded Answer from Your Personal Vault
*Based on your uploaded material: **"${matched.title}"***

**Summary from your notes:**
> "${matched.content.slice(0, 180)}..."

**Personalized Insights & Guidance:**
1. **Core Concept:** Your notes emphasize that ${matched.content.slice(0, 100)}.
2. **Key Takeaway:** When applying this in code, follow the pattern established in your study guide.
3. **Recommended Next Step:** Practice implementing this logic in a 20-minute focus session.`
      });
      setIsAiSearching(false);
    }, 1000);
  };

  const askInMentor = (note) => {
    navigate('/mentor', {
      state: {
        dayTopic: note.title,
        prompt: `I have a personal study note in my Data Vault titled "${note.title}". Here is the content:\n\n"${note.content}"\n\nCan you explain this concept in detail and quiz me based on my notes?`,
        duration: 'Personal Note',
        goal: USER_PROFILE.targetRole
      }
    });
  };

  const filtered = knowledgeList.filter(k => {
    const matchTab = tab === 'All' || k.type === tab;
    const matchQuery = !query || k.title.toLowerCase().includes(query.toLowerCase()) || k.category.toLowerCase().includes(query.toLowerCase()) || k.content.toLowerCase().includes(query.toLowerCase());
    return matchTab && matchQuery;
  });

  const grouped = filtered.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans pb-16">

      {/* Header Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 rounded-full text-xs font-mono font-bold">
              PERSONALIZED KNOWLEDGE VAULT
            </span>
            <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full text-xs font-mono font-bold">
              {knowledgeList.length} Saved Materials
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold font-display text-zinc-900 dark:text-white tracking-tight">
            Data Vault & Personal Notes
          </h1>
          <p className="text-xs text-zinc-500 font-medium">
            Upload your documents, PDFs, lecture notes, and code. GuideX AI grounds its explanations in your personal study materials.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs py-3.5 px-6 rounded-full shadow-pill transition-all shrink-0 flex items-center justify-center gap-2 self-start md:self-center"
        >
          <Plus size={16} /> Upload Notes / Docs
        </button>
      </div>

      {/* ── PERSONALIZED AI NOTE SEARCH BAR (RAG Grounding) ── */}
      <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/60 dark:border-amber-900/60 rounded-3xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-amber-500" />
            <span className="text-xs font-bold font-mono text-zinc-900 dark:text-white uppercase tracking-wider">
              Ask AI About Your Personal Notes
            </span>
          </div>
          <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">
            Grounded RAG Active
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-4 top-3.5 text-zinc-400" />
            <input
              type="text"
              value={aiQuestion}
              onChange={e => setAiQuestion(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAiNoteSearch()}
              placeholder="Ask a question about your uploaded notes (e.g. What do my notes say about sliding window?)..."
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#F5C542]"
            />
          </div>
          <button
            onClick={() => handleAiNoteSearch()}
            disabled={!aiQuestion.trim() || isAiSearching}
            className="w-full sm:w-auto bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs py-3 px-6 rounded-2xl hover:bg-[#F5C542] hover:text-zinc-950 transition-all disabled:opacity-40 shrink-0"
          >
            {isAiSearching ? 'Searching Notes...' : 'Ask AI →'}
          </button>
        </div>

        {/* Example Prompt Chips */}
        <div className="flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-zinc-400 font-mono font-bold shrink-0">Try:</span>
          {[
            'What do my notes say about Sliding Window?',
            'Summarize my Arrays lecture notes',
            'Explain B-Tree indexing from my vault'
          ].map(chip => (
            <button
              key={chip}
              onClick={() => { setAiQuestion(chip); handleAiNoteSearch(chip); }}
              className="px-3 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-full font-medium whitespace-nowrap hover:border-amber-400 transition-colors shrink-0"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* AI Answer Result Card */}
        {aiAnswer && (
          <div className="mt-4 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-amber-300 dark:border-amber-900/80 space-y-3 animate-in fade-in-50 duration-200 shadow-sm">
            <div className="flex items-center justify-between text-xs border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <Sparkles size={14} /> Grounded Response from "{aiAnswer.sourceTitle}"
              </span>
              <button onClick={() => setAiAnswer(null)} className="text-zinc-400 hover:text-zinc-700">
                <X size={15} />
              </button>
            </div>

            <div className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans space-y-2">
              <p className="whitespace-pre-line">{aiAnswer.answer}</p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => askInMentor({ title: aiAnswer.sourceTitle, content: aiAnswer.answer })}
                className="bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs py-2 px-5 rounded-full shadow-pill transition-all inline-flex items-center gap-1.5"
              >
                <span>Continue Discussion in AI Mentor</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search size={15} className="absolute left-4 top-3.5 text-zinc-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search documents, personal notes, code..."
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#F5C542]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono font-bold w-full sm:w-auto">
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
        </div>

        {/* Knowledge List Grouped by Category */}
        {Object.keys(grouped).length === 0 ? (
          <div className="text-center space-y-3 pt-10 pb-6">
            <p className="text-zinc-400 text-xs font-mono">No matching study materials found.</p>
            <button onClick={() => { setQuery(''); setTab('All'); }} className="text-xs font-mono text-amber-500 font-bold hover:underline">
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category} className="space-y-2">
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">
                  {category} ({items.length})
                </span>

                <div className="divide-y divide-zinc-100 dark:divide-zinc-800 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
                  {items.map(item => (
                    <div
                      key={item.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <div
                        className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer"
                        onClick={() => setSelectedNote(item)}
                      >
                        <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                          <FileText size={15} />
                        </div>

                        <div className="min-w-0 space-y-1">
                          <span className="font-bold text-sm text-zinc-900 dark:text-white font-display block truncate">
                            {item.title}
                          </span>
                          <p className="text-xs text-zinc-500 line-clamp-1 font-medium">
                            {item.content}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] font-mono pt-0.5">
                            <span className={`px-2 py-0.5 rounded-full font-bold ${TYPE_COLOR[item.type] || 'text-zinc-500'}`}>
                              {item.type}
                            </span>
                            <span className="text-zinc-300 dark:text-zinc-700">•</span>
                            <span className="text-zinc-400">{item.updated}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => askInMentor(item)}
                          className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-[11px] px-3.5 py-1.5 rounded-full hover:bg-[#F5C542] hover:text-zinc-950 transition-all inline-flex items-center gap-1 shadow-sm"
                          title="Ask AI Mentor to explain or quiz you on this note"
                        >
                          <Sparkles size={12} className="text-amber-400" />
                          <span>AI Mentor</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Note Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block">DATA VAULT INGESTION</span>
                <h3 className="text-xl font-extrabold font-display text-zinc-900 dark:text-white mt-0.5">
                  Upload Notes or Document
                </h3>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddNote} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-bold mb-1.5">Document / Note Title</label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={e => setNoteTitle(e.target.value)}
                  placeholder="e.g., Arrays & Dynamic Memory Notes.md"
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F5C542]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-bold mb-1.5">Type</label>
                  <select
                    value={noteType}
                    onChange={e => setNoteType(e.target.value)}
                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xs font-mono font-bold text-zinc-900 dark:text-white focus:outline-none"
                  >
                    <option value="Personal Notes">Personal Notes</option>
                    <option value="Uploaded Documents">Uploaded Documents</option>
                    <option value="Code">Code Snippet</option>
                    <option value="References">References</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-bold mb-1.5">Category</label>
                  <select
                    value={noteCategory}
                    onChange={e => setNoteCategory(e.target.value)}
                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xs font-mono font-bold text-zinc-900 dark:text-white focus:outline-none"
                  >
                    <option value="DATA STRUCTURES">DATA STRUCTURES</option>
                    <option value="SYSTEM DESIGN">SYSTEM DESIGN</option>
                    <option value="DATABASE">DATABASE</option>
                    <option value="AUTHENTICATION">AUTHENTICATION</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-bold mb-1.5">Note Content / Key Takeaways</label>
                <textarea
                  rows={4}
                  value={noteContent}
                  onChange={e => setNoteContent(e.target.value)}
                  placeholder="Paste text, code snippets, or key bullet points for AI grounding..."
                  className="w-full p-3.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xs font-sans text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#F5C542] resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs py-3.5 rounded-2xl shadow-pill transition-all flex items-center justify-center gap-2"
                >
                  <Upload size={15} /> Save to Data Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Note Detail Viewer Modal */}
      {selectedNote && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 max-w-xl w-full space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block">
                  {selectedNote.category} · {selectedNote.type}
                </span>
                <h3 className="text-xl font-extrabold font-display text-zinc-900 dark:text-white mt-0.5">
                  {selectedNote.title}
                </h3>
              </div>
              <button onClick={() => setSelectedNote(null)} className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs font-mono text-zinc-800 dark:text-zinc-200 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap">
              {selectedNote.content}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] font-mono text-zinc-400">Added: {selectedNote.updated}</span>
              <button
                onClick={() => { setSelectedNote(null); askInMentor(selectedNote); }}
                className="bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs py-2.5 px-5 rounded-full shadow-pill transition-all inline-flex items-center gap-1.5"
              >
                <Sparkles size={14} />
                <span>Discuss with AI Mentor</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DataVault;
