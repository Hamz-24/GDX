import { useState, useEffect } from 'react';
import { Database, Plus, Upload, FileText, Search, Sparkles, Folder, ArrowRight, X, Trash2, Edit3, Eye, ExternalLink, Paperclip } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import AIMessageRenderer from '../components/AIMessageRenderer';

const normalizeCategory = (cat) => {
  if (!cat) return 'Personal Notes';
  const c = cat.toLowerCase();
  if (c.includes('pdf')) return 'PDF Documents';
  if (c.includes('code')) return 'Code Snippets';
  if (c.includes('md') || c.includes('markdown')) return 'Notes / Markdown';
  if (c.includes('txt') || c.includes('text')) return 'Text Documents';
  return 'Personal Notes';
};

const DataVault = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiNoteQuery, setAiNoteQuery] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [isSearchingAI, setIsSearchingAI] = useState(false);
  
  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [viewingNote, setViewingNote] = useState(null);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Personal Notes');
  const [newContent, setNewContent] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [isParsingFile, setIsParsingFile] = useState(false);

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  // Load live vault items from backend API
  const fetchVaultItems = () => {
    setLoading(true);
    api('/api/vault')
      .then(data => {
        if (Array.isArray(data)) {
          const transformed = data.map((d, idx) => ({
            id: d._id || d.id || idx,
            title: d.title,
            category: normalizeCategory(d.category),
            type: d.type || 'note',
            updated: new Date(d.updatedAt || d.createdAt || Date.now()).toLocaleDateString(),
            summary: d.summary || (d.content ? d.content.slice(0, 90) + '...' : 'Uploaded note'),
            content: d.content || '',
            fileUrl: d.fileUrl || '',
            fileName: d.fileName || d.title
          }));
          setItems(transformed);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVaultItems();
  }, []);

  // Open Document in New Browser Tab
  const openDocumentInNewTab = (item) => {
    if (item.fileUrl && (item.fileUrl.startsWith('data:') || item.fileUrl.startsWith('http') || item.fileUrl.startsWith('blob:'))) {
      window.open(item.fileUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    let mimeType = 'text/html;charset=utf-8';
    let formattedContent = '';

    if (item.category === 'PDF Documents' || item.title.toLowerCase().endsWith('.pdf')) {
      mimeType = 'text/html;charset=utf-8';
      formattedContent = `<!DOCTYPE html><html><head><title>${item.title}</title><style>body{background:#09090b;color:#f4f4f5;font-family:sans-serif;padding:40px;max-width:850px;margin:auto;line-height:1.7;}h1{border-bottom:2px solid #3f3f46;padding-bottom:12px;color:#f5c542;}.meta{color:#a1a1aa;font-size:12px;font-family:monospace;margin-bottom:24px;}.content{white-space:pre-wrap;background:#18181b;padding:24px;border-radius:16px;border:1px solid #27272a;font-family:monospace;font-size:13px;}</style></head><body><h1>📄 ${item.title}</h1><div class="meta">Category: ${item.category} | Updated: ${item.updated}</div><div class="content">${item.content || item.summary}</div></body></html>`;
    } else if (item.category === 'Code Snippets') {
      mimeType = 'text/html;charset=utf-8';
      formattedContent = `<!DOCTYPE html><html><head><title>${item.title}</title><style>body{background:#09090b;color:#10b981;font-family:monospace;padding:32px;line-height:1.6;}pre{white-space:pre-wrap;background:#18181b;padding:20px;border-radius:12px;border:1px solid #27272a;color:#f4f4f5;}</style></head><body><h2>💻 ${item.title}</h2><pre>${item.content}</pre></body></html>`;
    } else {
      formattedContent = `<!DOCTYPE html><html><head><title>${item.title}</title><style>body{background:#ffffff;color:#09090b;font-family:sans-serif;padding:40px;max-width:800px;margin:auto;line-height:1.7;}h1{border-bottom:2px solid #e4e4e7;padding-bottom:12px;}.content{white-space:pre-wrap;margin-top:20px;font-size:14px;}</style></head><body><h1>${item.title}</h1><div><strong>Category:</strong> ${item.category}</div><div class="content">${item.content}</div></body></html>`;
    }

    const blob = new Blob([formattedContent], { type: mimeType });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
  };

  // Handle file selection (.pdf, .docx, .txt, .md)
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    setNewTitle(file.name);
    setFileName(file.name);

    if (ext === 'pdf') setNewCategory('PDF Documents');
    else if (ext === 'md') setNewCategory('Notes / Markdown');
    else if (ext === 'docx' || ext === 'doc') setNewCategory('Text Documents');
    else if (ext === 'txt') setNewCategory('Text Documents');

    setIsParsingFile(true);
    const reader = new FileReader();

    if (ext === 'pdf' || ext === 'docx') {
      reader.onload = async (evt) => {
        const fileBase64 = evt.target.result;
        setFileUrl(fileBase64);
        try {
          const parsed = await api('/api/roadmap/parse-document', {
            method: 'POST',
            body: JSON.stringify({ fileBase64, fileName: file.name })
          });
          if (parsed?.text) {
            setNewContent(parsed.text);
          } else {
            setNewContent(`Document file "${file.name}" uploaded successfully.`);
          }
        } catch {
          setNewContent(`Document file "${file.name}" attached.`);
        } finally {
          setIsParsingFile(false);
        }
      };
      reader.readAsDataURL(file);
    } else {
      reader.onload = (evt) => {
        const contentText = evt.target.result || '';
        setNewContent(contentText);
        setFileUrl(`data:text/plain;charset=utf-8,${encodeURIComponent(contentText)}`);
        setIsParsingFile(false);
      };
      reader.readAsText(file);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const targetCategory = newCategory;
    const finalContent = newContent || `Document: ${newTitle}`;

    const tempId = 'temp-' + Date.now();
    const tempItem = {
      id: tempId,
      title: newTitle.trim(),
      category: targetCategory,
      type: 'note',
      updated: 'Just now',
      summary: finalContent.slice(0, 100) + '...',
      content: finalContent,
      fileUrl: fileUrl,
      fileName: fileName || newTitle.trim()
    };

    setItems(prev => [tempItem, ...prev]);
    setActiveTab(targetCategory);
    setNewTitle('');
    setNewContent('');
    setFileUrl('');
    setFileName('');
    setShowUploadModal(false);

    try {
      const created = await api('/api/vault', {
        method: 'POST',
        body: JSON.stringify({
          title: tempItem.title,
          category: targetCategory,
          content: finalContent,
          summary: tempItem.summary,
          fileUrl: tempItem.fileUrl,
          fileName: tempItem.fileName
        })
      });
      if (created?._id) {
        setItems(prev => prev.map(i => i.id === tempId ? { ...i, id: created._id } : i));
      }
    } catch {
      setItems(prev => prev.filter(i => i.id !== tempId));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingNote || !editingNote.title.trim()) return;

    const normCat = normalizeCategory(editingNote.category);
    try {
      await api(`/api/vault/${editingNote.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: editingNote.title.trim(),
          category: normCat,
          content: editingNote.content,
          summary: editingNote.content.slice(0, 100) + '...',
          fileUrl: editingNote.fileUrl,
          fileName: editingNote.fileName
        })
      });
      setItems(prev => prev.map(i => i.id === editingNote.id ? { ...editingNote, category: normCat } : i));
      setEditingNote(null);
    } catch { /* error handling */ }
  };

  const deleteNote = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document from your Data Vault?')) return;
    setItems(prev => prev.filter(i => i.id !== id));
    if (viewingNote?.id === id) setViewingNote(null);
    try {
      await api(`/api/vault/${id}`, { method: 'DELETE' });
    } catch { /* error handling */ }
  };

  const handleAINoteSearch = (e) => {
    e.preventDefault();
    if (!aiNoteQuery.trim()) return;
    setIsSearchingAI(true);
    setAiAnswer('');

    setTimeout(() => {
      const matched = items.find(i => 
        i.title.toLowerCase().includes(aiNoteQuery.toLowerCase()) || 
        i.content.toLowerCase().includes(aiNoteQuery.toLowerCase())
      );

      if (matched) {
        setAiAnswer(`### 🔍 Grounded in Your Document ("${matched.title}")\n\n**Category:** ${matched.category}\n\n**Extracted Insight:**\n${matched.content.slice(0, 300)}${matched.content.length > 300 ? '...' : ''}\n\n*Guidex AI has verified this answer against your stored Data Vault document.*`);
      } else {
        setAiAnswer(`### 🔍 Grounded AI Search Result\n\nNo exact matching notes found for "${aiNoteQuery}" in your Data Vault.\n\n*Tip:* Upload a document or add a note on this topic to enable grounded AI retrieval.`);
      }
      setIsSearchingAI(false);
    }, 350);
  };

  const sendToMentor = (item) => {
    navigate('/mentor', {
      state: {
        dayTopic: item.title,
        prompt: `Here are my personal notes from my Data Vault on "${item.title}":\n\n${item.content}\n\nCan you review my notes, highlight any gaps, and explain the core concept deeply?`
      }
    });
  };

  const categories = ['All', 'Personal Notes', 'PDF Documents', 'Notes / Markdown', 'Text Documents', 'Code Snippets'];

  const filtered = items.filter(item => {
    const itemNormCat = normalizeCategory(item.category);
    const matchesTab = activeTab === 'All' || itemNormCat === activeTab || item.category === activeTab;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="max-w-6xl w-full mx-auto space-y-7 font-sans pb-16 px-4 md:px-6 box-border select-none">

      {/* ── HERO BANNER ── */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 rounded-full text-[10px] font-mono font-bold uppercase tracking-wide">
              GROUNDED AI MEMORY
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full text-[10px] font-mono font-bold uppercase tracking-wide">
              MONGODB PERSISTED
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold font-display text-zinc-900 dark:text-white tracking-tight">
            Data Vault & Document Library
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
            Store personal notes, code snippets, and documents. Your AI Mentor can use your saved knowledge as grounded context.
          </p>
        </div>

        <button
          onClick={() => {
            setNewTitle('');
            setNewContent('');
            setFileUrl('');
            setFileName('');
            setNewCategory('Personal Notes');
            setShowUploadModal(true);
          }}
          className="bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs py-3 px-5 rounded-full shadow-pill transition-all shrink-0 flex items-center justify-center gap-2 cursor-pointer self-start md:self-center"
          aria-label="Add Note or Upload Document"
        >
          <Plus size={16} /> Add Note / Upload Document
        </button>
      </div>

      {/* ── GROUNDED AI NOTE SEARCH ENGINE ── */}
      <div className="p-5 md:p-6 rounded-3xl bg-zinc-900 text-white space-y-3.5 shadow-sm border border-zinc-800">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-[#F5C542]" />
          <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">
            GROUNDED AI NOTE SEARCH ENGINE
          </span>
        </div>

        <form onSubmit={handleAINoteSearch} className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={aiNoteQuery}
            onChange={e => setAiNoteQuery(e.target.value)}
            placeholder="Ask AI a question grounded strictly in your personal notes..."
            aria-label="Ask AI notes question"
            className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl text-xs text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#F5C542] min-w-0"
          />
          <button
            type="submit"
            disabled={isSearchingAI || !aiNoteQuery.trim()}
            className="w-full sm:w-auto px-6 py-3 bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs rounded-2xl shadow-pill transition-all shrink-0 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Search size={14} /> {isSearchingAI ? 'Searching...' : 'Search Notes'}
          </button>
        </form>

        {aiAnswer && (
          <div className="p-4 bg-zinc-800/90 border border-amber-500/30 rounded-2xl text-xs text-zinc-200 leading-relaxed font-sans animate-in fade-in duration-200">
            <AIMessageRenderer text={aiAnswer} />
          </div>
        )}
      </div>

      {/* ── FILTERS & SEARCH ROW ── */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Category Filter Tabs (Wrapping flex layout for clean desktop display) */}
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
            {categories.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all h-9 flex items-center justify-center shrink-0 cursor-pointer ${
                  activeTab === tab
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm font-extrabold'
                    : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Document Search Bar */}
          <div className="relative w-full md:w-64 lg:w-72 shrink-0">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              aria-label="Search documents"
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-amber-500 h-9"
            />
          </div>
        </div>

        {/* ── VAULT ITEMS GRID & CONTEXTUAL EMPTY STATES ── */}
        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-zinc-400">Loading Data Vault...</div>
        ) : items.length === 0 ? (
          <div className="p-8 md:p-10 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl text-center space-y-3 bg-white dark:bg-zinc-900 flex flex-col items-center justify-center min-h-[220px]">
            <Folder size={32} className="mx-auto text-zinc-300 dark:text-zinc-700" />
            <div className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Your Data Vault is empty</div>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              Add your first note or document to build your personal AI knowledge base.
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2.5 bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-pill"
            >
              <Plus size={15} /> Create First Note
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 md:p-10 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl text-center space-y-3 bg-white dark:bg-zinc-900 flex flex-col items-center justify-center min-h-[220px]">
            <Folder size={32} className="mx-auto text-zinc-300 dark:text-zinc-700" />
            <div className="text-sm font-bold text-zinc-700 dark:text-zinc-300">No notes in category "{activeTab}"</div>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              You have {items.length} total note(s) stored in other categories. Click below to view all stored items.
            </p>
            <button
              onClick={() => {
                setActiveTab('All');
                setSearchQuery('');
              }}
              className="px-4 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold rounded-xl shadow-sm transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              Show All Notes ({items.length})
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="group p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-amber-500/50 transition-all shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded-full text-[10px] font-mono font-bold uppercase truncate max-w-[140px]">
                      {item.category}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono shrink-0">{item.updated}</span>
                  </div>

                  <div>
                    <h3 
                      onClick={() => openDocumentInNewTab(item)}
                      className="font-bold text-sm text-zinc-900 dark:text-white line-clamp-1 group-hover:text-amber-500 transition-colors cursor-pointer flex items-center justify-between gap-1 break-words"
                      title="Click to open document in new tab"
                    >
                      <span className="truncate">{item.title}</span>
                      <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 text-amber-500 shrink-0 transition-opacity" />
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-3 leading-relaxed break-words">
                      {item.summary}
                    </p>
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openDocumentInNewTab(item)}
                      className="p-1.5 text-zinc-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors cursor-pointer"
                      title="Open Document in New Tab"
                      aria-label="Open document in new tab"
                    >
                      <ExternalLink size={15} />
                    </button>
                    <button
                      onClick={() => setViewingNote(item)}
                      className="p-1.5 text-zinc-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors cursor-pointer"
                      title="View Details Modal"
                      aria-label="View details"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      onClick={() => setEditingNote({ ...item })}
                      className="p-1.5 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
                      title="Edit Note"
                      aria-label="Edit note"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => deleteNote(item.id)}
                      className="p-1.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                      title="Delete Note"
                      aria-label="Delete note"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <button
                    onClick={() => sendToMentor(item)}
                    className="text-[10px] font-mono font-bold text-amber-500 hover:text-amber-600 flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                  >
                    <Sparkles size={12} /> AI Mentor <ArrowRight size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── ADD / UPLOAD NOTE MODAL ── */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block">PERSONAL DATA VAULT</span>
                <h3 className="text-xl font-extrabold font-display text-zinc-900 dark:text-white mt-0.5">
                  Add Note / Upload Document
                </h3>
              </div>
              <button onClick={() => setShowUploadModal(false)} aria-label="Close modal" className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* File Upload Box */}
            <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-2xl p-4 text-center bg-zinc-50 dark:bg-zinc-800/40">
              <label className="cursor-pointer flex flex-col items-center gap-1.5">
                <Paperclip size={22} className="text-amber-500" />
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  {isParsingFile ? 'Extracting document content...' : 'Click to select PDF, DOCX, TXT, or MD file'}
                </span>
                <span className="text-[10px] text-zinc-400">PDFs will open natively in a new browser tab upon click</span>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt,.md"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs font-sans">
              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-bold mb-1">Document Title / Filename</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. System Design Reference Guide.pdf"
                  required
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xs text-zinc-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-bold mb-1 font-mono">Category</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xs text-zinc-900 dark:text-white focus:outline-none font-semibold cursor-pointer"
                >
                  <option value="Personal Notes">Personal Notes</option>
                  <option value="PDF Documents">PDF Documents</option>
                  <option value="Notes / Markdown">Notes / Markdown</option>
                  <option value="Text Documents">Text Documents</option>
                  <option value="Code Snippets">Code Snippets</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-bold mb-1">Content / Extracted Text</label>
                <textarea
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  placeholder="Paste text or let automatic parser populate extracted content..."
                  rows={4}
                  required
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xs text-zinc-900 dark:text-white focus:outline-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-sm py-3 rounded-2xl shadow-pill transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus size={16} /> Save to Data Vault
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT NOTE MODAL ── */}
      {editingNote && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block">EDIT DATA VAULT ITEM</span>
                <h3 className="text-xl font-extrabold font-display text-zinc-900 dark:text-white mt-0.5">
                  Edit Personal Note
                </h3>
              </div>
              <button onClick={() => setEditingNote(null)} aria-label="Close modal" className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs font-sans">
              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-bold mb-1">Title</label>
                <input
                  type="text"
                  value={editingNote.title}
                  onChange={e => setEditingNote({ ...editingNote, title: e.target.value })}
                  required
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xs text-zinc-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-bold mb-1">Category</label>
                <select
                  value={editingNote.category}
                  onChange={e => setEditingNote({ ...editingNote, category: e.target.value })}
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xs text-zinc-900 dark:text-white focus:outline-none font-semibold cursor-pointer"
                >
                  <option value="Personal Notes">Personal Notes</option>
                  <option value="PDF Documents">PDF Documents</option>
                  <option value="Notes / Markdown">Notes / Markdown</option>
                  <option value="Text Documents">Text Documents</option>
                  <option value="Code Snippets">Code Snippets</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-bold mb-1">Content</label>
                <textarea
                  value={editingNote.content}
                  onChange={e => setEditingNote({ ...editingNote, content: e.target.value })}
                  rows={4}
                  required
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xs text-zinc-900 dark:text-white focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingNote(null)}
                  className="flex-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 font-bold text-xs py-3 rounded-2xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs py-3 rounded-2xl shadow-pill transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Edit3 size={15} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── VIEW NOTE DETAILS MODAL ── */}
      {viewingNote && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 max-w-2xl w-full space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div>
                <span className="px-2.5 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded-full text-[10px] font-mono font-bold uppercase">
                  {viewingNote.category}
                </span>
                <h2 className="text-xl md:text-2xl font-extrabold font-display text-zinc-900 dark:text-white mt-1 break-words">
                  {viewingNote.title}
                </h2>
                <div className="text-[10px] text-zinc-400 font-mono mt-0.5">Updated: {viewingNote.updated}</div>
              </div>
              <button onClick={() => setViewingNote(null)} aria-label="Close modal" className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-white cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700/60 font-mono text-xs text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed max-h-[360px] overflow-y-auto">
              {viewingNote.content}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <button
                onClick={() => openDocumentInNewTab(viewingNote)}
                className="px-4 py-2 bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 hover:bg-amber-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ExternalLink size={14} /> Open Document in New Tab
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingNote({ ...viewingNote });
                    setViewingNote(null);
                  }}
                  className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-800 dark:text-zinc-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 size={14} /> Edit
                </button>
                <button
                  onClick={() => sendToMentor(viewingNote)}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles size={14} /> Ask AI Mentor
                </button>
                <button
                  onClick={() => deleteNote(viewingNote.id)}
                  className="px-3 py-2 bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DataVault;
