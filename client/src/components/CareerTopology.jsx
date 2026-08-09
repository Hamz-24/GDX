import { useState, useRef } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SKILL_NODES, SKILL_EDGES } from '../constants/userProfile';

const NODE_W = 136;
const NODE_H = 42;

const NODE_COLORS = {
  Target:      { fill: '#F5C542', stroke: '#D4A017', text: '#1a1a1a' },
  Mastered:    { fill: '#dcfce7', stroke: '#22c55e', text: '#166534' },
  Learning:    { fill: '#fef9c3', stroke: '#F5C542', text: '#78350f' },
  'Skill Gap': { fill: '#fee2e2', stroke: '#ef4444', text: '#991b1b' },
  'Not Started':{ fill: '#f4f4f5', stroke: '#a1a1aa', text: '#52525b' },
};

const NODE_COLORS_DARK = {
  Target:      { fill: '#F5C542', stroke: '#D4A017', text: '#1a1a1a' },
  Mastered:    { fill: '#14532d', stroke: '#22c55e', text: '#86efac' },
  Learning:    { fill: '#451a03', stroke: '#F5C542', text: '#fde68a' },
  'Skill Gap': { fill: '#450a0a', stroke: '#ef4444', text: '#fca5a5' },
  'Not Started':{ fill: '#27272a', stroke: '#52525b', text: '#a1a1aa' },
};

const STATUS_BADGE = {
  Mastered:    'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  Learning:    'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300',
  'Skill Gap': 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
  'Not Started':'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  Target:      'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300',
};

// Prerequisite map per node (for the detail panel)
const NODE_DETAILS = {
  root:        { importance: 'Target',       prereqs: [],                     nextRec: 'Complete all skill branches' },
  apis:        { importance: 'Critical',     prereqs: ['HTTP Basics'],         nextRec: 'Auth & JWT' },
  sql:         { importance: 'High',         prereqs: ['Relational Models'],   nextRec: 'DB Indexing & EXPLAIN' },
  sysdesign:   { importance: 'Critical for Senior', prereqs: ['APIs ✓', 'SQL ✓'], nextRec: 'Distributed Systems' },
  rest:        { importance: 'Core',         prereqs: ['HTTP ✓'],              nextRec: 'Auth & JWT' },
  auth:        { importance: 'Core',         prereqs: ['REST ✓'],              nextRec: 'Token refresh flows' },
  indexing:    { importance: 'Current Bottleneck', prereqs: ['SQL ✓'],         nextRec: 'EXPLAIN ANALYZE' },
  distributed: { importance: 'High Gap',     prereqs: ['System Design'],       nextRec: 'CAP Theorem' },
  caching:     { importance: 'Recommended',  prereqs: ['Redis Intro'],         nextRec: 'Cache eviction policies' },
};

const CareerTopology = ({ targetRole = 'Backend Engineer', height = 480 }) => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered]   = useState(null);
  const [pan, setPan]           = useState({ x: 0, y: 0 });
  const [scale, setScale]       = useState(1);
  const dragging = useRef(false);
  const lastPos  = useRef({ x: 0, y: 0 });

  // detect dark mode via class on <html>
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  const colors = isDark ? NODE_COLORS_DARK : NODE_COLORS;

  const getNode = (id) => SKILL_NODES.find(n => n.id === id);

  const onMouseDown = (e) => { if (e.target.closest('[data-node]')) return; dragging.current = true; lastPos.current = { x: e.clientX, y: e.clientY }; };
  const onMouseMove = (e) => { if (!dragging.current) return; setPan(p => ({ x: p.x + (e.clientX - lastPos.current.x), y: p.y + (e.clientY - lastPos.current.y) })); lastPos.current = { x: e.clientX, y: e.clientY }; };
  const onMouseUp   = () => { dragging.current = false; };
  const onWheel     = (e) => { e.preventDefault(); setScale(s => Math.min(2.2, Math.max(0.4, s * (e.deltaY > 0 ? 0.9 : 1.1)))); };

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">CAREER SKILL MAP</span>
          <h3 className="text-lg font-extrabold font-display text-zinc-900 dark:text-white mt-0.5">
            Where am I relative to {targetRole}?
          </h3>
        </div>

        <div className="flex items-center gap-3">
          {/* Legend */}
          <div className="hidden md:flex items-center gap-3 text-[10px] font-mono text-zinc-500">
            {[['bg-emerald-500','Mastered'],['bg-[#F5C542]','Learning'],['bg-rose-500','Gap'],['bg-zinc-400','Unstarted']].map(([bg,lbl]) => (
              <span key={lbl} className="flex items-center gap-1"><span className={`w-2 h-2 rounded-full ${bg} inline-block`} />{lbl}</span>
            ))}
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-full p-0.5 text-xs font-mono">
            <button onClick={() => setScale(s => Math.min(2.2, s + 0.15))} className="w-7 h-7 flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full font-bold">+</button>
            <button onClick={() => { setScale(1); setPan({ x: 0, y: 0 }); }} className="px-1.5 h-7 text-[10px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white">reset</button>
            <button onClick={() => setScale(s => Math.max(0.4, s - 0.15))} className="w-7 h-7 flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full font-bold">−</button>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div
        className="w-full rounded-[20px] bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 overflow-hidden cursor-grab active:cursor-grabbing select-none relative"
        style={{ height: `${height}px` }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
      >
        <svg width="100%" height="100%" viewBox="0 0 800 480" preserveAspectRatio="xMidYMid meet">
          <g transform={`translate(${pan.x},${pan.y}) scale(${scale})`} style={{ transformOrigin: '400px 240px' }}>

            {/* Edges */}
            {SKILL_EDGES.map(edge => {
              const fn = getNode(edge.from), tn = getNode(edge.to);
              if (!fn || !tn) return null;
              const y1 = fn.y + NODE_H / 2 + 2, y2 = tn.y - NODE_H / 2 - 2;
              const cy = (y1 + y2) / 2;
              const isActive = selected?.id === edge.from || selected?.id === edge.to || hovered?.id === edge.from || hovered?.id === edge.to;
              return (
                <path
                  key={`${edge.from}-${edge.to}`}
                  d={`M ${fn.x} ${y1} C ${fn.x} ${cy}, ${tn.x} ${cy}, ${tn.x} ${y2}`}
                  fill="none"
                  stroke={isActive ? '#F5C542' : isDark ? '#3f3f46' : '#d4d4d8'}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  strokeDasharray={isActive ? 'none' : '6 4'}
                  className="transition-all duration-200"
                />
              );
            })}

            {/* Nodes */}
            {SKILL_NODES.map(node => {
              const c = colors[node.status] || colors['Not Started'];
              const isSelected = selected?.id === node.id;
              const isHovered  = hovered?.id  === node.id;
              const isRoot     = node.status === 'Target';
              return (
                <g
                  key={node.id}
                  data-node="true"
                  transform={`translate(${node.x},${node.y})`}
                  onClick={() => setSelected(isSelected ? null : node)}
                  onMouseEnter={() => setHovered(node)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: 'pointer' }}
                >
                  <rect
                    x={-NODE_W / 2} y={-NODE_H / 2}
                    width={NODE_W} height={NODE_H}
                    rx={isRoot ? 14 : 9}
                    fill={c.fill}
                    stroke={isSelected ? '#F5C542' : isHovered ? '#F5C542' : c.stroke}
                    strokeWidth={isSelected ? 2.5 : isHovered ? 2 : isRoot ? 2 : 1.5}
                    filter={isRoot || isSelected ? 'drop-shadow(0 4px 14px rgba(245,197,66,0.4))' : isHovered ? 'drop-shadow(0 2px 8px rgba(245,197,66,0.25))' : 'none'}
                    className="transition-all duration-150"
                  />
                  <text x={0} y={isRoot ? -5 : -4} textAnchor="middle" fill={c.text}
                    fontSize={isRoot ? 11 : 10} fontWeight="700" fontFamily="'Inter',sans-serif" letterSpacing="0.2">
                    {node.label}
                  </text>
                  {!isRoot && (
                    <text x={0} y={11} textAnchor="middle" fill={c.text}
                      fontSize={8} opacity={0.7} fontFamily="'Inter',sans-serif">
                      {node.mastery}% · {node.status}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        <p className="absolute bottom-3 left-4 text-[10px] font-mono text-zinc-400 pointer-events-none">
          Drag to pan · Scroll to zoom · Click a node to inspect
        </p>
      </div>

      {/* Node detail panel (checklist 6) */}
      {selected && (() => {
        const detail = NODE_DETAILS[selected.id] || {};
        return (
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-[16px] p-5 space-y-4 bg-white dark:bg-zinc-900">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase">{selected.sub}</span>
                <h4 className="text-xl font-extrabold font-display text-zinc-900 dark:text-white mt-0.5">{selected.label}</h4>
                <div className="flex items-center gap-2 mt-1.5 text-xs font-mono">
                  <span className={`px-2.5 py-0.5 rounded-full font-bold ${STATUS_BADGE[selected.status]}`}>{selected.status}</span>
                  <span className="text-zinc-400">{selected.mastery}% mastery</span>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-white"><X size={16} /></button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs border-t border-zinc-100 dark:border-zinc-800 pt-3">
              <div>
                <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block mb-1">Target-role importance</span>
                <span className="font-bold text-zinc-900 dark:text-white">{detail.importance || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block mb-1">Prerequisites</span>
                <div className="space-y-0.5">
                  {(detail.prereqs || []).map(p => <div key={p} className="text-zinc-600 dark:text-zinc-300">{p}</div>)}
                  {!detail.prereqs?.length && <span className="text-zinc-400">None</span>}
                </div>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block mb-1">Next recommended</span>
                <span className="font-bold text-zinc-900 dark:text-white">{detail.nextRec}</span>
              </div>
            </div>

            <button
              onClick={() => { setSelected(null); navigate('/roadmap'); }}
              className="inline-flex items-center gap-1.5 bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs py-2 px-5 rounded-full shadow-pill transition-all"
            >
              Explore Skill <ChevronRight size={13} />
            </button>
          </div>
        );
      })()}
    </div>
  );
};

export default CareerTopology;
