import { useMemo, useState } from 'react';
import { GitBranch, Flag, AlertTriangle } from 'lucide-react';
import type { FlowNode } from '../lib/flow';
import { layoutFlow, NODE_W, NODE_H } from '../lib/layout';
import type { LaidOutEdge, LaidOutNode } from '../lib/layout';

interface Props {
  nodes: FlowNode[];
  startStage: string;
  startLevel: string;
  taskCounts: Record<string, number>;
  onOpen?: (kind: 'stage' | 'level', id: string) => void;
}

const COLORS = {
  stage: { stroke: '#34d399', fill: '#064e3b', text: '#a7f3d0' },
  level: { stroke: '#38bdf8', fill: '#0c4a6e', text: '#bae6fd' },
  end: { stroke: '#f87171', fill: '#7f1d1d', text: '#fecaca' },
};

function edgePath(from: LaidOutNode, to: LaidOutNode): string {
  const x1 = from.x + NODE_W;
  const y1 = from.y + NODE_H / 2;
  const x2 = to.x;
  const y2 = to.y + NODE_H / 2;

  // Si el destino está a la izquierda o en la misma columna, la curva se va por
  // arriba, para no dibujar una recta encima de los nodos del medio.
  if (x2 <= x1) {
    const lift = Math.min(from.y, to.y) - 26;
    return `M ${x1} ${y1} C ${x1 + 50} ${lift}, ${x2 - 50} ${lift}, ${x2} ${y2}`;
  }
  const mid = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`;
}

export function FlowView({ nodes, startStage, startLevel, taskCounts, onOpen }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const layout = useMemo(
    () => layoutFlow(nodes, startStage, startLevel, taskCounts),
    [nodes, startStage, startLevel, taskCounts]
  );

  const byKey = useMemo(() => {
    const map = new Map<string, LaidOutNode>();
    layout.nodes.forEach((n) => map.set(n.key, n));
    return map;
  }, [layout]);

  const orphans = layout.nodes.filter((n) => !n.reachable);
  const isDimmed = (edge: LaidOutEdge) => hovered !== null && edge.from !== hovered && edge.to !== hovered;

  if (layout.nodes.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-800 p-12 text-center text-zinc-500 text-sm">
        Todavía no hay Levels ni Stages en el proyecto.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
          <GitBranch size={15} className="text-amber-400" /> Flujo de la dungeon
        </h2>
        <p className="text-xs text-zinc-500 mt-1">
          Progresión deducida de las acciones <code className="text-zinc-400">set_stage</code>,{' '}
          <code className="text-zinc-400">set_level</code> y <code className="text-zinc-400">dungeon_end</code>. Cada
          columna es un salto desde el inicio. Clic en un nodo para abrirlo.
        </p>
      </div>

      {orphans.length > 0 && (
        <div className="rounded-lg border border-amber-900/50 bg-amber-500/5 p-3 text-sm text-amber-300 flex gap-2">
          <AlertTriangle size={15} className="shrink-0 mt-0.5" />
          <div>
            <p>{orphans.length} nodo(s) no se alcanzan desde el inicio.</p>
            <p className="text-[11px] text-amber-400/70 mt-1 font-mono">{orphans.map((o) => o.id).join(' · ')}</p>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-2 overflow-x-auto">
        <svg
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          width={layout.width}
          height={layout.height}
          className="max-w-none"
        >
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#52525b" />
            </marker>
          </defs>

          {layout.edges.map((edge, i) => {
            const from = byKey.get(edge.from);
            const to = byKey.get(edge.to);
            if (!from || !to) return null;

            return (
              <g key={i} opacity={isDimmed(edge) ? 0.15 : 1}>
                <path
                  d={edgePath(from, to)}
                  fill="none"
                  stroke={edge.toKind === 'end' ? '#7f1d1d' : '#3f3f46'}
                  strokeWidth="1.6"
                  markerEnd="url(#arrow)"
                />
                {(edge.chance !== 100 || edge.runIf) && (
                  <text
                    x={(from.x + NODE_W + to.x) / 2}
                    y={(from.y + to.y) / 2 + NODE_H / 2 - 6}
                    fill="#71717a"
                    fontSize="9.5"
                    textAnchor="middle"
                    fontFamily="ui-monospace, monospace"
                  >
                    {edge.chance !== 100 ? `${edge.chance}%` : ''}
                    {edge.chance !== 100 && edge.runIf ? ' · ' : ''}
                    {edge.runIf ? `si ${edge.runIf}` : ''}
                  </text>
                )}
              </g>
            );
          })}

          {layout.nodes.map((node) => {
            const c = COLORS[node.kind];
            const clickable = node.kind !== 'end' && !!onOpen;

            return (
              <g
                key={node.key}
                onMouseEnter={() => setHovered(node.key)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => clickable && onOpen?.(node.kind as 'stage' | 'level', node.id)}
                style={{ cursor: clickable ? 'pointer' : 'default' }}
                opacity={node.reachable ? 1 : 0.55}
              >
                <rect
                  x={node.x}
                  y={node.y}
                  width={NODE_W}
                  height={NODE_H}
                  rx="8"
                  fill={c.fill}
                  fillOpacity={hovered === node.key ? 0.7 : 0.4}
                  stroke={node.isStart ? '#fbbf24' : c.stroke}
                  strokeWidth={node.isStart ? 2 : 1.3}
                  strokeDasharray={node.reachable ? undefined : '5 3'}
                />
                <text x={node.x + 12} y={node.y + 19} fill={c.text} fontSize="12.5" fontFamily="ui-monospace, monospace">
                  {node.id.length > 20 ? node.id.slice(0, 19) + '…' : node.id}
                </text>
                <text x={node.x + 12} y={node.y + 34} fill="#71717a" fontSize="9.5">
                  {node.kind === 'end' ? 'FIN' : node.kind.toUpperCase()}
                  {node.kind === 'stage' && node.taskCount > 0 ? ` · ${node.taskCount} tarea(s)` : ''}
                </text>
                {node.isStart && <circle cx={node.x + NODE_W - 12} cy={node.y + 12} r="4" fill="#fbbf24" />}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex items-center gap-4 text-[11px] text-zinc-600 flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm" style={{ background: COLORS.stage.stroke }} /> stage
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm" style={{ background: COLORS.level.stroke }} /> level
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm" style={{ background: COLORS.end.stroke }} /> fin de partida
        </span>
        <span className="flex items-center gap-1.5">
          <Flag size={11} className="text-amber-400" /> borde ámbar = inicio
        </span>
        <span>· punteado = inalcanzable</span>
      </div>
    </div>
  );
}
