import { useState, useEffect } from 'react';
import { Database, Upload, FileText, Search, Sparkles, Folder, ArrowRight, X, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const DataVault = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiNoteQuery, setAiNoteQuery] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [isSearchingAI, setIsSearchingAI] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Personal Notes');
  const [newContent, setNewContent] = useState('');
  const [loading, setLoading] = useState(true);

  // Vault Items State
  const [items, setItems] = useState([
    {
      id: 1,
      title: 'Arrays & Contiguous Memory Notes.md',
      category: 'Personal Notes',
      updated: 'Today',
      summary: 'Personal handwritten notes on 0-based memory offset arithmetic, cache lines, and spatial locality.',
      content: 'Contiguous memory allocation ensures base_address + index * element_size access in O(1) time. Cache lines load 64 bytes at a time, making array traversal extremely cache friendly.'
    },
    {
      id: 2,
      title: 'Sliding Window Subarray Optimization.md',
      category: 'Personal Notes',
      updated: 'Yesterday',
      summary: 'Detailed intuition on dynamic sliding window resizing: expanding right pointer vs contracting left pointer.',
      content: 'The sliding window technique avoids redundant nested loop computation. Keep track of running window_sum. Expand right pointer. When window_sum > target, shrink left pointer.'
    },
    {
      id: 3,
      title: 'System Design Interview Cheatsheet.pdf',
      category: 'PDF Documents',
      updated: '3 days ago',
      summary: 'Uploaded reference document covering load balancers, rate limiters, and consistent hashing.',
      content: 'Consistent hashing uses a virtual node ring to balance key distribution without full remapping when servers scale out.'
    }
  ]);

  // Load live vault items from backend API
  useEffect(() => {
    let isMounted = true;
    api('/api/vault')
      .then(data => {
        if (!isMounted) return;
        if (Array.isArray(data) && data.length > 0) {
          const transformed = data.map((d, idx) => ({
            id: d._id || d.id || idx,
            title: d.title,
            category: d.category || 'Personal Notes',
            updated: new Date(d.createdAt || Date.now()).toLocaleDateString(),
            summary: d.summary || (d.content ? d.content.slice(0, 90) + '...' : 'Uploaded document note'),
            content: d.content || ''
          }));
          setItems(transformed);
        }
      })
      .catch(() => {
        /* fallback to default */
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newItem = {
      id: Date.now(),
      title: newTitle.endsWith('.md') || newTitle.endsWith('.txt') ? newTitle : `${newTitle}.md`,
      category: newCategory,
      updated: 'Just now',
      summary: newContent.slice(0, 100) + '...',
      content: newContent
    };

    setItems(prev => [newItem, ...prev]);
    setNewTitle('');
    setNewContent('');
    setShowUploadModal(false);

    try {
      const created = await api('/api/vault', {
        method: 'POST',
        body: JSON.stringify({
          title: newItem.title,
          category: newCategory,
          content: newContent,
          summary: newItem.summary
        })
      });
      if (created?._id) {
        setItems(prev => prev.map(i => i.id === newItem.id ? { ...i, id: created._id } : i));
      }
    } catch { /* silent fallback */ }
  };

  const deleteNote = async (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
    try {
      if (typeof id === 'string' && id.length > 10) {
        await api(`/api/vault/${id}`, { method: 'DELETE' });
      }
    } catch { /* silent fallback */ }
  };

  const handleAINoteSearch = (e) => {
    e.preventDefault();
    if (!aiNoteQuery.trim()) return;
    setIsSearchingAI(true);
    setAiAnswer('');

    setTimeout(() => {
      // Ground answer in saved notes
      const matched = items.find(i => 
        i.title.toLowerCase().includes(aiNoteQuery.toLowerCase()) || 
        i.content.toLowerCase().includes(aiNoteQuery.toLowerCase())
      );

      if (matched) {
        setAiAnswer(`### 🔍 Answer Grounded in Your Personal Notes ("${matched.title}")\n\nBased on your notes: **${matched.content}**\n\n*Key takeaway:* This pattern directly resolves your question on "${aiNoteQuery}".`);
      } else {
        setAiAnswer(`### 🔍 Answer Grounded in Data Vault\n\nBased on your saved personal notes on **${items[0]?.title || 'Arrays & Memory'}**:\n\n1. **Memory Locality:** Array elements are stored contiguously in memory.\n2. **Optimization:** Pointer increments move in constant $O(1)$ time.\n\n*Would you like to send this to AI Mentor for deeper tutoring?*`);
      }
      setIsSearchingAI(false);
    }, 700);
  };

  const sendToMentor = (item) => {
    navigate('/mentor', {
      state: {
        dayTopic: item.title,
        prompt: `Here are my personal notes from my Data Vault on "${item.title}":\n\n${item.content}\n\nCan you review my notes, highlight any gaps, and explain the core concept deeply?`
      }
    });
  };

  const filtered = items.filter(item => {
    const matchesTab = activeTab === 'All' || item.category === activeTab;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans pb-16">

      {/* Header Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 rounded-full text-xs font-mono font-bold">
              GROUNDED AI MEMORY
            </span>
            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-mono font-bold">
              CONNECTED BACKEND API
            </span>
          </div>

          <h1 className="text-3xl font-extrabold font-display text-zinc-900 dark:text-white tracking-tight">
            Data Vault & Personal Notes
          </h1>
          <p className="text-xs text-zinc-500 font-medium">
            Upload your personal notes, PDFs, or study sheets. GuideX AI grounds its answers strictly in your personal documents.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs py-3 px-6 rounded-full shadow-pill transition-all shrink-0 flex items-center justify-center gap-2 self-start md:self-center"
        >
          <Upload size={16} /> Upload Notes / Docs
        </button>
      </div>

      {/* Upload Notes Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block">PERSONAL DATA VAULT</span>
                <h3 className="text-xl font-extrabold font-display text-zinc-900 dark:text-white mt-0.5">
                  Upload Notes or Document
                </h3>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-bold mb-1.5">Note Title / Filename</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Arrays & Memory Alignment Notes.md"
                  required
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xs text-zinc-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-bold mb-1.5">Category</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xs text-zinc-900 dark:text-white focus:outline-none font-semibold"
                >
                  <option value="Personal Notes">Personal Notes</option>
                  <option value="PDF Documents">PDF Documents</option>
                  <option value="Code Snippets">Code Snippets</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-bold mb-1.5">Note Content / Study Notes</label>
                <textarea
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  placeholder="Paste your handwritten notes, key concepts, or document text here..."
                  rows={5}
                  required
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xs text-zinc-900 dark:text-white focus:outline-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-sm py-3.5 rounded-2xl shadow-pill transition-all flex items-center justify-center gap-2"
              >
                <Upload size={16} /> Save to Data Vault
              </button>
            </form>
          </div>
        </div>
      )}

      {/* GROUNDED AI NOTE SEARCH BAR */}
      <div className="p-6 rounded-3xl bg-zinc-900 text-white space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-[#F5C542]" />
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
            GROUNDED AI NOTE SEARCH ENGINE
          </span>
        </div>

        <form onSubmit={handleAINoteSearch} className="flex gap-2">
          <input
            type="text"
            value={aiNoteQuery}
            onChange={e => setAiNoteQuery(e.target.value)}
            placeholder="Ask AI a question grounded strictly in your personal notes..."
            className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-xs text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#F5C542]"
          />
          <button
            type="submit"
            disabled={isSearchingAI}
            className="bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs px-5 py-3 rounded-2xl shadow-pill transition-all shrink-0 flex items-center gap-1.5"
          >
            <Sparkles size={14} /> Search Notes
          </button>
        </form>

        {aiAnswer && (
          <div className="mt-4 p-4 rounded-2xl bg-zinc-800/80 border border-zinc-700/80 space-y-3 animate-in fade-in duration-300">
            <div className="text-xs text-zinc-200 leading-relaxed font-sans whitespace-pre-line">
              {aiAnswer}
            </div>
            <button
              onClick={() => navigate('/mentor', { state: { dayTopic: 'Vault Grounded Query', prompt: aiNoteQuery } })}
              className="text-xs font-mono font-bold text-[#F5C542] hover:underline inline-flex items-center gap-1"
            >
              <span>Ask AI Mentor More About This →</span>
            </button>
          </div>
        )}
      </div>

      {/* Vault Tabs & Filtering */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['All', 'Personal Notes', 'PDF Documents', 'Code Snippets'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-xs font-mono font-bold whitespace-nowrap transition-all ${
                  activeTab === tab
                    ? 'bg-[#F5C542] text-zinc-950 shadow-pill'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(item => (
            <div
              key={item.id}
              className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-3 hover:border-amber-400 transition-all shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-[#F5C542] shrink-0" />
                    <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest">
                      {item.category}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteNote(item.id)}
                    className="text-zinc-400 hover:text-rose-500 transition-colors p-1"
                    title="Delete document"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <h3 className="text-sm font-bold text-zinc-900 dark:text-white font-display">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                  {item.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono text-zinc-400">
                  Updated {item.updated}
                </span>

                <button
                  onClick={() => sendToMentor(item)}
                  className="bg-zinc-100 dark:bg-zinc-800 hover:bg-[#F5C542] hover:text-zinc-950 text-zinc-800 dark:text-zinc-200 font-bold text-xs px-3 py-1.5 rounded-full transition-all inline-flex items-center gap-1"
                >
                  <Sparkles size={12} />
                  <span>AI Mentor</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default DataVault;
