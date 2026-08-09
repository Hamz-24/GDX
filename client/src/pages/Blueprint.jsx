import { useState, useRef } from 'react';
import { X, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { USER_PROFILE } from '../constants/userProfile';

/**
 * Blueprint — "How are my skills connected?"
 * Dashboard = where am I relative to target? (high-level topology)
 * Blueprint = how are skills connected? (prerequisite dependency graph)
 */

const CLUSTERS = {
  foundation: { label: 'FOUNDATION',    border: '#38bdf8', bg: '#f0f9ff', darkBg: '#0c4a6e', text: '#0369a1' },
  backend:    { label: 'BACKEND CORE',  border: '#F5C542', bg: '#fefce8', darkBg: '#451a03', text: '#92400e' },
  scale:      { label: 'SCALABILITY',   border: '#f97316', bg: '#fff7ed', darkBg: '#431407', text: '#9a3412' },
  systems:    { label: 'DISTRIBUTED',   border: '#a855f7', bg: '#faf5ff', darkBg: '#3b0764', text: '#7e22ce' },
};

const NODES = [
  // Foundation
  { id: 'http',    label: 'HTTP & Networking', cluster: 'foundation', status: 'Mastered',    mastery: 96, x: 90,  y: 80  },
  { id: 'ds',      label: 'Data Structures',   cluster: 'foundation', status: 'Mastered',    mastery: 88, x: 280, y: 80  },
  { id: 'sql',     label: 'SQL Basics',         cluster: 'foundation', status: 'Mastered',    mastery: 85, x: 470, y: 80  },
  // Backend Core
  { id: 'rest',    label: 'REST APIs',          cluster: 'backend',    status: 'Mastered',    mastery: 98, x: 90,  y: 230 },
  { id: 'auth',    label: 'Auth & JWT',         cluster: 'backend',    status: 'Learning',    mastery: 70, x: 260, y: 230 },
  { id: 'index',   label: 'DB Indexing',        cluster: 'backend',    status: 'Learning',    mastery: 55, x: 440, y: 230 },
  { id: 'orm',     label: 'ORM & Queries',      cluster: 'backend',    status: 'Learning',    mastery: 60, x: 620, y: 230 },
  // Scalability
  { id: 'cache',   label: 'Redis & Caching',    cluster: 'scale',      status: 'Not Started', mastery: 10, x: 150, y: 380 },
  { id: 'queues',  label: 'Message Queues',      cluster: 'scale',      status: 'Not Started', mastery: 5,  x: 370, y: 380 },
  { id: 'lb',      label: 'Load Balancing',      cluster: 'scale',      status: 'Skill Gap',   mastery: 20, x: 570, y: 380 },
  // Distributed
  { id: 'dist',    label: 'Distributed Sys',     cluster: 'systems',    status: 'Skill Gap',   mastery: 25, x: 220, y: 510 },
  { id: 'cap',     label: 'CAP Theorem',          cluster: 'systems',    status: 'Skill Gap',   mastery: 15, x: 440, y: 510 },
  { id: 'micro',   label: 'Microservices',        cluster: 'systems',    status: 'Not Started', mastery: 0,  x: 640, y: 510 },
];

// Prerequisite edges: from = prerequisite, to = what it unlocks
const EDGES = [
  { from: 'http',  to: 'rest'   },
  { from: 'http',  to: 'auth'   },
  { from: 'ds',    to: 'index'  },
  { from: 'sql',   to: 'index'  },
  { from: 'sql',   to: 'orm'    },
  { from: 'rest',  to: 'auth'   },
  { from: 'index', to: 'orm'    },
  { from: 'rest',  to: 'cache'  },
  { from: 'orm',   to: 'cache'  },
  { from: 'rest',  to: 'queues' },
  { from: 'cache', to: 'lb'     },
  { from: 'lb',    to: 'dist'   },
  { from: 'queues',to: 'dist'   },
  { from: 'dist',  to: 'cap'    },
  { from: 'dist',  to: 'micro'  },
];

const STATUS_COLORS = {
  Mastered:    { fill: '#dcfce7', stroke: '#22c55e', text: '#166534' },
  Learning:    { fill: '#fef9c3', stroke: '#F5C542', text: '#78350f' },
  'Skill Gap': { fill: '#fee2e2', stroke: '#ef4444', text: '#991b1b' },
  'Not Started':{ fill: '#f4f4f5', stroke: '#a1a1aa', text: '#52525b' },
};

const NODE_W = 138, NODE_H = 42;

const Blueprint = () => {
  const navigate = useNavigate();
  const [selected, setSelected]   = useState(null);
  const [filter, setFilter]       = useState('all');
  const [scale, setScale]         = useState(1);
  const [pan, setPan]             = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastPos  = useRef({ x: 0, y: 0 });

  const visNodes = filter === 'all' ? NODES : NODES.filter(n => n.cluster === filter);
  const visIds   = new Set(visNodes.map(n => n.id));
  const visEdges = EDGES.filter(e => visIds.has(e.from) && visIds.has(e.to));

  const getNode = (id) => NODES.find(n => n.id === id);

  const onDown = (e) => { if (e.target.closest('[data-node]')) return; dragging.current = true; lastPos.current = { x: e.clientX, y: e.clientY }; };
  const onMove = (e) => { if (!dragging.current) return; setPan(p => ({ x: p.x + (e.clientX - lastPos.current.x), y: p.y + (e.clientY - lastPos.current.y) })); lastPos.current = { x: e.clientX, y: e.clientY }; };
  const onUp   = () => { dragging.current = false; };
  const onWheel= (e) => { e.preventDefault(); setScale(s => Math.min(2, Math.max(0.4, s * (e.deltaY > 0 ? 0.9 : 1.1)))); };

  return (
    <div className="space-y-6 font-sans pb-16">

      {/* Header */}
      <div className="space-y-1.5 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block">
          SKILL DEPENDENCY GRAPH · {USER_PROFILE.targetRole}
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold font-display text-zinc-900 dark:text-white tracking-tight">
          How Are My Skills Connected?
        </h1>
        <p className="text-xs text-zinc-500 font-medium">
          Arrows show prerequisite relationships. Click a node to see what it unlocks and requires.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
          <Filter size={13} className="text-zinc-400" />
          <button onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-full font-bold transition-all ${filter === 'all' ? 'bg-[#F5C542] text-zinc-950 shadow-pill' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}>
            All
          </button>
          {Object.entries(CLUSTERS).map(([key, c]) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-full font-bold transition-all ${filter === key ? 'bg-[#F5C542] text-zinc-950 shadow-pill' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}>
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-full p-0.5 text-xs font-mono">
          <button onClick={() => setScale(s => Math.min(2, s + 0.15))} className="w-7 h-7 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full font-bold text-zinc-700 dark:text-zinc-200">+</button>
          <button onClick={() => { setScale(1); setPan({ x: 0, y: 0 }); }} className="px-1.5 h-7 text-[10px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white">reset</button>
          <button onClick={() => setScale(s => Math.max(0.4, s - 0.15))} className="w-7 h-7 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full font-bold text-zinc-700 dark:text-zinc-200">−</button>
        </div>
      </div>

      {/* Canvas */}
      <div className="w-full rounded-[20px] bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 overflow-hidden cursor-grab active:cursor-grabbing select-none relative"
        style={{ height: '580px' }}
        onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp} onWheel={onWheel}>

        <svg width="100%" height="100%" viewBox="0 0 800 620" preserveAspectRatio="xMidYMid meet">
          <defs>
            <marker id="arrow"        markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#d4d4d8" /></marker>
            <marker id="arrow-active" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#F5C542" /></marker>
          </defs>

          <g transform={`translate(${pan.x},${pan.y}) scale(${scale})`} style={{ transformOrigin: '400px 310px' }}>

            {/* Cluster backgrounds */}
            {Object.entries(CLUSTERS).map(([key, c]) => {
              const cNodes = visNodes.filter(n => n.cluster === key);
              if (!cNodes.length) return null;
              const xs = cNodes.map(n => n.x), ys = cNodes.map(n => n.y);
              const x1 = Math.min(...xs) - NODE_W/2 - 18, x2 = Math.max(...xs) + NODE_W/2 + 18;
              const y1 = Math.min(...ys) - NODE_H/2 - 28, y2 = Math.max(...ys) + NODE_H/2 + 16;
              return (
                <g key={key}>
                  <rect x={x1} y={y1} width={x2-x1} height={y2-y1} rx={14} fill={c.bg} stroke={c.border} strokeWidth={1} opacity={0.55} />
                  <text x={x1+10} y={y1+16} fontSize={9} fontWeight="700" fill={c.text} fontFamily="'Inter',monospace" letterSpacing="1">{c.label}</text>
                </g>
              );
            })}

            {/* Prerequisite edges with arrowheads */}
            {visEdges.map(e => {
              const fn = getNode(e.from), tn = getNode(e.to);
              if (!fn || !tn) return null;
              const y1 = fn.y + NODE_H/2, y2 = tn.y - NODE_H/2 - 6, cy = (y1+y2)/2;
              const active = selected?.id === e.from || selected?.id === e.to;
              return (
                <path key={`${e.from}-${e.to}`}
                  d={`M ${fn.x} ${y1} C ${fn.x} ${cy}, ${tn.x} ${cy}, ${tn.x} ${y2}`}
                  fill="none" stroke={active ? '#F5C542' : '#d4d4d8'} strokeWidth={active ? 2 : 1.5}
                  markerEnd={active ? 'url(#arrow-active)' : 'url(#arrow)'}
                  className="transition-all duration-200" />
              );
            })}

            {/* Nodes */}
            {visNodes.map(node => {
              const c = STATUS_COLORS[node.status] || STATUS_COLORS['Not Started'];
              const isSel = selected?.id === node.id;
              return (
                <g key={node.id} data-node="true"
                  transform={`translate(${node.x},${node.y})`}
                  onClick={() => setSelected(isSel ? null : node)}
                  style={{ cursor: 'pointer' }}>
                  <rect x={-NODE_W/2} y={-NODE_H/2} width={NODE_W} height={NODE_H} rx={8}
                    fill={c.fill} stroke={isSel ? '#F5C542' : c.stroke} strokeWidth={isSel ? 2.5 : 1.5}
                    filter={isSel ? 'drop-shadow(0 4px 14px rgba(245,197,66,0.4))' : 'none'}
                    className="transition-all duration-150" />
                  <text x={0} y={-4} textAnchor="middle" fill={c.text} fontSize={10} fontWeight="700" fontFamily="'Inter',sans-serif">{node.label}</text>
                  <text x={0} y={11} textAnchor="middle" fill={c.text} fontSize={8} opacity={0.7} fontFamily="'Inter',sans-serif">{node.mastery}% · {node.status}</text>
                </g>
              );
            })}
          </g>
        </svg>

        <p className="absolute bottom-3 left-4 text-[10px] font-mono text-zinc-400 pointer-events-none">
          Arrows = prerequisites · Drag to pan · Scroll to zoom · Click to inspect
        </p>
      </div>

      {/* Node detail — checklist 17 */}
      {selected && (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-[16px] p-5 space-y-4 bg-white dark:bg-zinc-900">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">{CLUSTERS[selected.cluster]?.label} · {selected.status}</span>
              <h4 className="text-xl font-extrabold font-display text-zinc-900 dark:text-white mt-0.5">{selected.label}</h4>
            </div>
            <button onClick={() => setSelected(null)} className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-white"><X size={16} /></button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs border-t border-zinc-100 dark:border-zinc-800 pt-3">
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Mastery</span>
              <span className="font-bold text-zinc-900 dark:text-white text-lg">{selected.mastery}%</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Required for</span>
              <span className="font-bold text-zinc-900 dark:text-white">
                {CLUSTERS[NODES.find(n => EDGES.some(e => e.from === selected.id && e.to === n.id))?.cluster]?.label || '—'}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Prerequisites</span>
              <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                {EDGES.filter(e => e.to === selected.id).map(e => getNode(e.from)?.label).filter(Boolean).join(', ') || 'None'}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Unlocks</span>
              <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                {EDGES.filter(e => e.from === selected.id).map(e => getNode(e.to)?.label).filter(Boolean).join(', ') || 'None'}
              </span>
            </div>
          </div>

          <button onClick={() => { setSelected(null); navigate('/focus', { state: { task: { title: `Study ${selected.label}`, minutes: 25 } } }); }}
            className="inline-flex items-center gap-1.5 bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs py-2 px-5 rounded-full shadow-pill transition-all">
            Study This Skill →
          </button>
        </div>
      )}
    </div>
  );
};

export default Blueprint;
