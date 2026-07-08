import { ArrowRight, Layers, MapPin, Flag } from 'lucide-react';
import type { FlowNode } from '../lib/flow';

interface Props {
  nodes: FlowNode[];
  startStage: string;
  startLevel: string;
}

export function FlowView({ nodes, startStage, startLevel }: Props) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-zinc-500">
        Progresión detectada a partir de las acciones <code>set_stage</code>, <code>set_level</code> y{' '}
        <code>dungeon_end</code> en cada script. Solo es una vista de lectura.
      </p>

      {nodes.length === 0 && <p className="text-sm text-zinc-600">Todavía no hay Levels ni Stages en el proyecto.</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {nodes.map((n) => {
          const isStart = (n.kind === 'stage' && n.id === startStage) || (n.kind === 'level' && n.id === startLevel);
          return (
            <div key={`${n.kind}-${n.id}`} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 space-y-2">
              <div className="flex items-center gap-2">
                {n.kind === 'stage' ? <Layers size={14} className="text-emerald-400" /> : <MapPin size={14} className="text-sky-400" />}
                <span className="text-sm font-mono text-zinc-200">{n.id}</span>
                <span className="text-[10px] uppercase text-zinc-500">{n.kind}</span>
                {isStart && (
                  <span className="ml-auto flex items-center gap-1 text-[10px] text-amber-400">
                    <Flag size={11} /> inicio
                  </span>
                )}
              </div>
              {n.edges.length === 0 && <p className="text-[11px] text-zinc-600">Sin transiciones detectadas.</p>}
              <div className="space-y-1">
                {n.edges.map((e, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-zinc-400 pl-1">
                    <ArrowRight size={12} className="text-zinc-600 shrink-0" />
                    <span className="font-mono text-zinc-500">{e.fromScript}</span>
                    <span>→</span>
                    <span
                      className={
                        e.toKind === 'end' ? 'text-red-400 font-medium' : e.toKind === 'stage' ? 'text-emerald-300' : 'text-sky-300'
                      }
                    >
                      {e.toId || '(vacío)'}
                    </span>
                    {e.chance !== 100 && <span className="text-zinc-600">· {e.chance}%</span>}
                    {e.runIf && <span className="text-zinc-600 truncate">· si: {e.runIf}</span>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
