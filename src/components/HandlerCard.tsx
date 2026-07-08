import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import type { EventHandlerInstance } from '../schema/types';
import { EVENTS, CONDITIONS, ACTIONS } from '../schema/registry';
import { newCondition, newAction } from '../yaml/parser';
import { ConditionCard } from './ConditionCard';
import { ActionCard } from './ActionCard';

interface Props {
  handler: EventHandlerInstance;
  onChange: (h: EventHandlerInstance) => void;
  onRemove: () => void;
}

export function HandlerCard({ handler, onChange, onRemove }: Props) {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-zinc-900/70">
        <button type="button" onClick={() => setOpen(!open)} className="text-zinc-400 hover:text-zinc-200">
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        <input
          className="rounded-md bg-zinc-950 border border-zinc-700 px-2 py-1 text-sm font-semibold text-amber-300 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
          value={handler.name}
          onChange={(e) => onChange({ ...handler, name: e.target.value })}
        />
        <select
          className="rounded-md bg-zinc-900 border border-zinc-700 px-2 py-1.5 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
          value={handler.event}
          onChange={(e) => onChange({ ...handler, event: e.target.value })}
        >
          {EVENTS.map((ev) => (
            <option key={ev.value} value={ev.value}>
              {ev.label}
            </option>
          ))}
        </select>
        <div className="flex-1" />
        <span className="text-[11px] text-zinc-500">
          {handler.conditions.length} cond · {handler.actions.length} acc
        </span>
        <button type="button" onClick={onRemove} className="text-zinc-500 hover:text-red-400">
          <Trash2 size={16} />
        </button>
      </div>

      {open && (
        <div className="p-4 space-y-5">
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs uppercase tracking-wide text-zinc-400 font-semibold">Conditions</h4>
              <button
                type="button"
                onClick={() =>
                  onChange({ ...handler, conditions: [...handler.conditions, newCondition(CONDITIONS[0].id)] })
                }
                className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300"
              >
                <Plus size={14} /> Agregar condition
              </button>
            </div>
            {handler.conditions.length === 0 && (
              <p className="text-[11px] text-zinc-600">Sin conditions — las actions se ejecutan siempre (salvo su propio RunIf/Chance).</p>
            )}
            {handler.conditions.map((c) => (
              <ConditionCard
                key={c.uid}
                condition={c}
                onChange={(nc) =>
                  onChange({ ...handler, conditions: handler.conditions.map((x) => (x.uid === nc.uid ? nc : x)) })
                }
                onRemove={() => onChange({ ...handler, conditions: handler.conditions.filter((x) => x.uid !== c.uid) })}
              />
            ))}
          </section>

          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs uppercase tracking-wide text-zinc-400 font-semibold">Actions</h4>
              <button
                type="button"
                onClick={() => onChange({ ...handler, actions: [...handler.actions, newAction(ACTIONS[0].id)] })}
                className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300"
              >
                <Plus size={14} /> Agregar action
              </button>
            </div>
            {handler.actions.length === 0 && (
              <p className="text-[11px] text-zinc-600">Sin actions — este script no hace nada todavía.</p>
            )}
            {handler.actions.map((a) => (
              <ActionCard
                key={a.uid}
                action={a}
                siblingConditions={handler.conditions}
                onChange={(na) =>
                  onChange({ ...handler, actions: handler.actions.map((x) => (x.uid === na.uid ? na : x)) })
                }
                onRemove={() => onChange({ ...handler, actions: handler.actions.filter((x) => x.uid !== a.uid) })}
              />
            ))}
          </section>
        </div>
      )}
    </div>
  );
}
