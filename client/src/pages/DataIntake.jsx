import { CheckSquare, Database, Loader, Sparkles, BookOpen, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../utils/api';

const DataIntake = () => {
  const [card, setCard] = useState(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [archived, setArchived] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/api/intake/today')
      .then(data => {
        setCard(data.card);
        setAcknowledged(data.acknowledged);
        setArchived(data.archived || []);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const acknowledgeCard = async () => {
    if (!card) return;
    try {
      await api(`/api/intake/${card._id}/acknowledge`, { method: 'POST' });
      setAcknowledged(true);
    } catch { /* silent fallback */ }
  };

  return (
    <div className="space-y-8 pb-16 w-full max-w-4xl mx-auto font-sans">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-card flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 rounded-full text-xs font-bold font-mono">
              Daily Micro-Learning Core
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-display text-zinc-900 dark:text-white tracking-tight">
            Daily Concept Ingestion
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 font-medium mt-1">
            Master one high-yield technical concept every day to build long-term retention.
          </p>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-[#F5C542] text-zinc-950 flex items-center justify-center font-bold shadow-pill">
          <BookOpen size={24} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader className="animate-spin text-[#F5C542]" size={32} /></div>
      ) : (
        <div className="space-y-6">
          {card && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-8 shadow-card space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-zinc-400 uppercase">
                  Today's Concept • {new Date().toLocaleDateString()}
                </span>
                <span className="px-3 py-1 bg-zinc-900 text-white text-[11px] font-bold rounded-full">
                  Core Engineering
                </span>
              </div>

              <div className="space-y-3 border-b border-zinc-100 dark:border-zinc-800 pb-6">
                <h2 className="text-2xl font-bold font-display text-zinc-900 dark:text-white">{card.concept}</h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 font-sans leading-relaxed">{card.body}</p>
              </div>

              <div>
                {acknowledged ? (
                  <div className="w-full py-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-full font-bold text-xs flex items-center justify-center gap-2">
                    <CheckCircle2 size={18} /> Daily Micro-Learning Acknowledged & Logged
                  </div>
                ) : (
                  <button 
                    onClick={acknowledgeCard} 
                    className="w-full bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs py-3.5 rounded-full shadow-pill transition-all inline-flex items-center justify-center gap-2"
                  >
                    <CheckSquare size={18} /> Acknowledge Daily Concept
                  </button>
                )}
              </div>
            </div>
          )}

          {archived.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-card space-y-4">
              <h3 className="text-base font-bold font-display text-zinc-900 dark:text-white">Completed Micro-Lessons Archive</h3>
              <div className="space-y-3">
                {archived.map(log => (
                  <div key={log._id} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between">
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white font-sans">{log.cardId?.concept || 'Technical Concept'}</h4>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold rounded-full font-mono">
                      Completed
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DataIntake;
