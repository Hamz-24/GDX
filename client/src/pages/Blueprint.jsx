import { useState, useRef } from 'react';
import { Sparkles, ArrowRight, Layers, ZoomIn, ZoomOut, RotateCcw, X, ShieldCheck, Info, Play, CheckCircle2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { USER_PROFILE } from '../constants/userProfile';

/* ── DIAGRAMMATIC ARCHITECTURE NODES ── */
const DIAGRAM_NODES = [
  // LAYER 1: MEMORY & ARRAYS
  {
    id: 'n1',
    layer: 'memory',
    stepNum: '01',
    label: 'Contiguous Memory & Arrays',
    sub: 'RAM Base + (i * size)',
    status: 'Mastered',
    mastery: 95,
    x: 80,
    y: 120,
    diagramType: 'Memory Array Grid',
    asciiDiagram: `[ 0x100: Val 10 ] -> [ 0x104: Val 20 ] -> [ 0x108: Val 30 ]
   ↑ (Base Addr)       ↑ (Offset +4)      ↑ (Offset +8)`,
    description: 'Contiguous block of RAM. O(1) random access via arithmetic index computation.',
    prereqs: ['Memory Addressing Basics'],
    unlocks: ['Pointer Chains', 'Sliding Window Engine']
  },
  {
    id: 'n2',
    layer: 'memory',
    stepNum: '01',
    label: 'Sliding Window Engine',
    sub: 'Two-Pointer Bounds',
    status: 'In Progress',
    mastery: 50,
    x: 320,
    y: 120,
    diagramType: 'Window Bounds Diagram',
    asciiDiagram: `Array: [ 2 | 1 | 5 | 1 | 3 | 2 ]
        [ L ======= R ] -> Sum = 8 (Slide R+1, L+1)`,
    description: 'Maintains sub-array bounds (L, R) dynamically without nested loop O(N^2) overhead.',
    prereqs: ['Contiguous Memory & Arrays'],
    unlocks: ['Call Stack & Node Chains']
  },

  // LAYER 2: POINTERS & STACKS
  {
    id: 'n3',
    layer: 'pointers',
    stepNum: '02',
    label: 'Linked Node Chains',
    sub: 'Non-Contiguous Pointers',
    status: 'Upcoming',
    mastery: 20,
    x: 560,
    y: 120,
    diagramType: 'Pointer Node Map',
    asciiDiagram: `[ Node A | Next* ] ---> [ Node B | Next* ] ---> [ NULL ]
  0x200                   0x450`,
    description: 'Nodes scattered in heap memory connected via pointer references.',
    prereqs: ['Contiguous Memory & Arrays'],
    unlocks: ['Call Stack & Recursion', 'Tree Branches']
  },
  {
    id: 'n4',
    layer: 'pointers',
    stepNum: '02',
    label: 'Call Stack & Recursion',
    sub: 'LIFO Memory Frames',
    status: 'Upcoming',
    mastery: 15,
    x: 200,
    y: 300,
    diagramType: 'Call Stack Frame',
    asciiDiagram: `| Frame 3: solve(n-2) |  <-- Stack Top (Push/Pop O(1))
| Frame 2: solve(n-1) |
| Frame 1: main()     |  <-- Stack Base`,
    description: 'Last-In First-Out system call stack frame allocation during function calls.',
    prereqs: ['Sliding Window Engine'],
    unlocks: ['Binary Tree Traversal']
  },

  // LAYER 3: TREES & GRAPHS
  {
    id: 'n5',
    layer: 'trees',
    stepNum: '03',
    label: 'Binary Tree Branching',
    sub: 'Hierarchical Nodes',
    status: 'Locked',
    mastery: 0,
    x: 440,
    y: 300,
    diagramType: 'Tree Branching Map',
    asciiDiagram: `          ( Root: 10 )
          /          \\
    ( Left: 5 )    ( Right: 15 )`,
    description: 'Hierarchical node structure where each parent node points to Left and Right child pointers.',
    prereqs: ['Linked Node Chains', 'Call Stack & Recursion'],
    unlocks: ['Graph Adjacency Grid', 'Priority Heap Tree']
  },
  {
    id: 'n6',
    layer: 'trees',
    stepNum: '03',
    label: 'Graph Adjacency Grid',
    sub: 'Non-Linear Graph Nodes',
    status: 'Locked',
    mastery: 0,
    x: 680,
    y: 300,
    diagramType: 'Graph Edge Matrix',
    asciiDiagram: `Vertex A ---> [ Vertex B, Vertex C ]
Vertex B ---> [ Vertex D ]
(BFS Queue Traversal / DFS Stack Exploration)`,
    description: 'Graph connections represented via Adjacency Lists with BFS/DFS exploration algorithms.',
    prereqs: ['Binary Tree Branching'],
    unlocks: ['Dynamic Programming Table']
  },

  // LAYER 4: HEAPS & OPTIMIZATION
  {
    id: 'n7',
    layer: 'optimization',
    stepNum: '04',
    label: 'Priority Heap Tree',
    sub: 'Min/Max Complete Tree',
    status: 'Locked',
    mastery: 0,
    x: 320,
    y: 480,
    diagramType: 'Heap Array Representation',
    asciiDiagram: `Array Rep: [ MinVal | Child1 | Child2 | ... ]
Left Child = 2i + 1  |  Right Child = 2i + 2`,
    description: 'Complete binary tree stored as an array for O(1) Min/Max access and O(log N) Heapify.',
    prereqs: ['Binary Tree Branching'],
    unlocks: ['Dynamic Programming Table']
  },
  {
    id: 'n8',
    layer: 'optimization',
    stepNum: '04',
    label: 'Dynamic Programming Table',
    sub: 'Subproblem Memoization',
    status: 'Locked',
    mastery: 0,
    x: 580,
    y: 480,
    diagramType: 'DP Memoization Matrix',
    asciiDiagram: `DP Table: [ 0 | 1 | 1 | 2 | 3 | 5 | 8 | 13 ]
  Lookup: Memo[N] = Memo[N-1] + Memo[N-2]`,
    description: 'Avoids redundant re-computation by caching overlapping subproblem answers in a lookup table.',
    prereqs: ['Priority Heap Tree', 'Graph Adjacency Grid'],
    unlocks: ['Production Mastery & Interview Ready']
  }
];

/* ── DIAGRAM CONNECTIONS / FLOW ARROWS ── */
const DIAGRAM_CONNECTIONS = [
  { from: 'n1', to: 'n2', label: 'Sequential Array' },
  { from: 'n1', to: 'n3', label: 'Pointers' },
  { from: 'n2', to: 'n4', label: 'Recursion Frame' },
  { from: 'n3', to: 'n5', label: 'Node Branching' },
  { from: 'n4', to: 'n5', label: 'DFS Stack' },
  { from: 'n5', to: 'n6', label: 'Graph Edges' },
  { from: 'n5', to: 'n7', label: 'Complete Tree' },
  { from: 'n6', to: 'n8', label: 'State Table' },
  { from: 'n7', to: 'n8', label: 'Memo Matrix' },
];

const LAYER_COLORS = {
  memory:       { border: '#F5C542', bg: '#fefce8', darkBg: '#451a03', text: '#78350f', name: 'Memory & Arrays' },
  pointers:     { border: '#38bdf8', bg: '#f0f9ff', darkBg: '#0c4a6e', text: '#0369a1', name: 'Pointers & Stacks' },
  trees:        { border: '#a855f7', bg: '#faf5ff', darkBg: '#3b0764', text: '#7e22ce', name: 'Trees & Graphs' },
  optimization: { border: '#22c55e', bg: '#f0fdf4', darkBg: '#14532d', text: '#15803d', name: 'Optimization & DP' },
};

const Blueprint = () => {
  const navigate = useNavigate();
  const [selectedNode, setSelectedNode] = useState(DIAGRAM_NODES[0]);
  const [activeLayer, setActiveLayer] = useState('all');
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const explainDiagramWithAI = (node) => {
    navigate('/mentor', {
      state: {
        dayTopic: `Diagrammatic Explanation of ${node.label}`,
        prompt: `Explain the visual architecture diagram of "${node.label}" (${node.diagramType}). Explain the memory/code flow:\n\n\`\`\`\n${node.asciiDiagram}\n\`\`\`\nProvide step-by-step intuition for a Beginner in ${USER_PROFILE.targetRole}.`,
        goal: USER_PROFILE.targetRole
      }
    });
  };

  const startPracticeNode = (node) => {
    navigate('/focus', {
      state: {
        task: { title: `Diagram Practice: ${node.label}`, minutes: 25 }
      }
    });
  };

  const filteredNodes = activeLayer === 'all'
    ? DIAGRAM_NODES
    : DIAGRAM_NODES.filter(n => n.layer === activeLayer);

  const visIds = new Set(filteredNodes.map(n => n.id));
  const filteredEdges = DIAGRAM_CONNECTIONS.filter(e => visIds.has(e.from) && visIds.has(e.to));

  const getNode = (id) => DIAGRAM_NODES.find(n => n.id === id);

  const onDown = (e) => {
    if (e.target.closest('[data-node]')) return;
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };
  const onMove = (e) => {
    if (!dragging.current) return;
    setPan(p => ({ x: p.x + (e.clientX - lastPos.current.x), y: p.y + (e.clientY - lastPos.current.y) }));
    lastPos.current = { x: e.clientX, y: e.clientY };
  };
  const onUp = () => { dragging.current = false; };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans pb-16">

      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 rounded-full text-xs font-mono font-bold">
              DIAGRAMMATIC BLUEPRINT
            </span>
            <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full text-xs font-mono font-bold">
              GOAL: {USER_PROFILE.targetRole.toUpperCase()}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold font-display text-zinc-900 dark:text-white tracking-tight">
            System Architectural Diagram
          </h1>
          <p className="text-xs text-zinc-500 font-medium">
            Interactive visual diagram mapping how memory, pointers, trees, and dynamic programming connect visually.
          </p>
        </div>

        {/* Filter Layer Chips */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          <button
            onClick={() => setActiveLayer('all')}
            className={`px-3 py-1.5 rounded-full font-bold transition-all ${
              activeLayer === 'all' ? 'bg-[#F5C542] text-zinc-950 shadow-pill' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            All Layers
          </button>
          {Object.entries(LAYER_COLORS).map(([key, c]) => (
            <button
              key={key}
              onClick={() => setActiveLayer(key)}
              className={`px-3 py-1.5 rounded-full font-bold transition-all ${
                activeLayer === key ? 'bg-[#F5C542] text-zinc-950 shadow-pill' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── INTERACTIVE CANVAS DIAGRAM ── */}
      <div
        className="w-full rounded-3xl bg-zinc-900 text-white border border-zinc-800 overflow-hidden cursor-grab active:cursor-grabbing select-none relative shadow-xl"
        style={{ height: '520px' }}
        onMouseDown={onDown}
        onMouseMove={onMove}
        onMouseUp={onUp}
        onMouseLeave={onUp}
      >
        {/* Canvas Controls */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-1 bg-zinc-800/90 backdrop-blur-md p-1 rounded-full border border-zinc-700 text-xs font-mono">
          <button onClick={() => setScale(s => Math.min(2, s + 0.15))} className="w-7 h-7 flex items-center justify-center hover:bg-zinc-700 rounded-full font-bold text-zinc-200">+</button>
          <button onClick={() => { setScale(1); setPan({ x: 0, y: 0 }); }} className="px-2 h-7 text-[10px] text-zinc-400 hover:text-white">reset</button>
          <button onClick={() => setScale(s => Math.max(0.5, s - 0.15))} className="w-7 h-7 flex items-center justify-center hover:bg-zinc-700 rounded-full font-bold text-zinc-200">−</button>
        </div>

        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 text-[10px] font-mono text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-[#F5C542] animate-pulse" />
          <span>Interactive Architectural Canvas · Click any block to inspect diagram</span>
        </div>

        {/* SVG Diagram Canvas */}
        <svg width="100%" height="100%" viewBox="0 0 900 600" preserveAspectRatio="xMidYMid meet">
          <defs>
            <pattern id="blueprint-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#27272a" strokeWidth="1" opacity="0.4" />
            </pattern>
            <marker id="bp-arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#F5C542" />
            </marker>
          </defs>

          {/* Grid Background */}
          <rect width="100%" height="100%" fill="url(#blueprint-grid)" />

          <g transform={`translate(${pan.x},${pan.y}) scale(${scale})`} style={{ transformOrigin: '450px 300px' }}>

            {/* Connection Flow Arrows */}
            {filteredEdges.map(e => {
              const fn = getNode(e.from), tn = getNode(e.to);
              if (!fn || !tn) return null;
              const isSel = selectedNode?.id === e.from || selectedNode?.id === e.to;
              const pathD = `M ${fn.x + 80} ${fn.y + 25} C ${fn.x + 80} ${(fn.y + tn.y)/2}, ${tn.x - 40} ${(fn.y + tn.y)/2}, ${tn.x - 60} ${tn.y + 25}`;

              return (
                <g key={`${e.from}-${e.to}`}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isSel ? '#F5C542' : '#52525b'}
                    strokeWidth={isSel ? 2.5 : 1.5}
                    strokeDasharray={isSel ? 'none' : '5 4'}
                    markerEnd="url(#bp-arrow)"
                    className="transition-all duration-200"
                  />
                </g>
              );
            })}

            {/* Diagram Architectural Blocks */}
            {filteredNodes.map(node => {
              const isSel = selectedNode?.id === node.id;
              const layerStyle = LAYER_COLORS[node.layer] || LAYER_COLORS.memory;

              return (
                <g
                  key={node.id}
                  data-node="true"
                  transform={`translate(${node.x - 70},${node.y})`}
                  onClick={() => setSelectedNode(node)}
                  style={{ cursor: 'pointer' }}
                >
                  <rect
                    x={0}
                    y={0}
                    width={160}
                    height={54}
                    rx={12}
                    fill={isSel ? '#18181b' : '#0f0f12'}
                    stroke={isSel ? '#F5C542' : layerStyle.border}
                    strokeWidth={isSel ? 2.5 : 1.5}
                    filter={isSel ? 'drop-shadow(0 0 16px rgba(245,197,66,0.35))' : 'none'}
                    className="transition-all duration-150"
                  />

                  {/* Step Eyebrow */}
                  <text x={12} y={16} fill={layerStyle.border} fontSize={8} fontWeight="800" fontFamily="monospace">
                    STEP {node.stepNum} · {node.layer.toUpperCase()}
                  </text>

                  {/* Title */}
                  <text x={12} y={32} fill="#ffffff" fontSize={10} fontWeight="700" fontFamily="'Inter',sans-serif">
                    {node.label.length > 20 ? node.label.slice(0, 18) + '...' : node.label}
                  </text>

                  {/* Subtitle */}
                  <text x={12} y={45} fill="#a1a1aa" fontSize={8} fontFamily="'Inter',sans-serif">
                    {node.sub}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* ── SELECTED DIAGRAM NODE INSPECTOR PANEL ── */}
      {selectedNode && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 space-y-5 shadow-lg animate-in fade-in-50 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-mono font-bold">
                  STEP {selectedNode.stepNum} DIAGRAM BREAKDOWN
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  Type: {selectedNode.diagramType}
                </span>
              </div>
              <h3 className="text-2xl font-extrabold font-display text-zinc-900 dark:text-white mt-1">
                {selectedNode.label}
              </h3>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => explainDiagramWithAI(selectedNode)}
                className="bg-[#F5C542] hover:bg-[#E5B532] text-zinc-950 font-bold text-xs py-2.5 px-5 rounded-full shadow-pill transition-all inline-flex items-center gap-1.5"
              >
                <Sparkles size={14} />
                <span>Explain Diagram with AI</span>
              </button>

              <button
                onClick={() => startPracticeNode(selectedNode)}
                className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs py-2.5 px-4 rounded-full hover:bg-[#F5C542] hover:text-zinc-950 transition-all inline-flex items-center gap-1"
              >
                <span>Practice</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>

          {/* ASCII / Visual Schema Box */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">
              VISUAL SCHEMATIC / MEMORY DIAGRAM
            </span>
            <div className="p-4 rounded-2xl bg-zinc-900 text-amber-400 font-mono text-xs overflow-x-auto leading-relaxed border border-zinc-800 shadow-inner">
              <pre>{selectedNode.asciiDiagram}</pre>
            </div>
          </div>

          {/* Rationale & Flow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60 space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase block">Prerequisite Diagram Flow</span>
              <span className="font-bold text-zinc-900 dark:text-white block">
                {selectedNode.prereqs.join(', ')}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60 space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase block">Unlocks Diagram Path</span>
              <span className="font-bold text-zinc-900 dark:text-white block">
                {selectedNode.unlocks.join(', ')}
              </span>
            </div>
          </div>

          <p className="text-xs text-zinc-500 font-medium leading-relaxed">
            <strong className="text-zinc-800 dark:text-zinc-200">Architectural Note:</strong> {selectedNode.description}
          </p>
        </div>
      )}

    </div>
  );
};

export default Blueprint;
