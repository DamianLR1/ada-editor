import type { LoadedFile } from '../schema/types';
import { newHandler, newTask } from '../yaml/parser';
import { HandlerCard } from './HandlerCard';
import { TaskCard } from './TaskCard';
import { TASKS } from '../schema/registry';
import { Plus } from 'lucide-react';

interface Props {
  stage: LoadedFile;
  onChange: (s: LoadedFile) => void;
}

export function StageEditorView({ stage, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-zinc-400">Nombre</label>
          <input
            className="w-full mt-1 rounded-md bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-sm text-zinc-100"
            value={stage.raw.Name ?? ''}
            onChange={(e) => onChange({ ...stage, raw: { ...stage.raw, Name: e.target.value } })}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-400">Descripción</label>
          <input
            className="w-full mt-1 rounded-md bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-sm text-zinc-100"
            value={stage.raw.Description ?? ''}
            onChange={(e) => onChange({ ...stage, raw: { ...stage.raw, Description: e.target.value } })}
          />
        </div>
      </div>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-300">Tasks</h2>
          <button
            onClick={() => onChange({ ...stage, tasks: [...stage.tasks, newTask(TASKS[0].id)] })}
            className="flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300"
          >
            <Plus size={15} /> Agregar task
          </button>
        </div>
        {stage.tasks.length === 0 && <p className="text-sm text-zinc-600">Este stage todavía no tiene tasks.</p>}
        <div className="space-y-3">
          {stage.tasks.map((t) => (
            <TaskCard
              key={t.uid}
              task={t}
              onChange={(nt) => onChange({ ...stage, tasks: stage.tasks.map((x) => (x.uid === nt.uid ? nt : x)) })}
              onRemove={() => onChange({ ...stage, tasks: stage.tasks.filter((x) => x.uid !== t.uid) })}
            />
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-300">Scripts (EventHandlers)</h2>
          <button
            onClick={() => onChange({ ...stage, handlers: [...stage.handlers, newHandler()] })}
            className="flex items-center gap-1.5 text-sm text-amber-400 hover:text-amber-300"
          >
            <Plus size={15} /> Agregar script
          </button>
        </div>
        {stage.handlers.length === 0 && <p className="text-sm text-zinc-600">Este stage todavía no tiene EventHandlers.</p>}
        <div className="space-y-4">
          {stage.handlers.map((h) => (
            <HandlerCard
              key={h.uid}
              handler={h}
              onChange={(nh) => onChange({ ...stage, handlers: stage.handlers.map((x) => (x.uid === nh.uid ? nh : x)) })}
              onRemove={() => onChange({ ...stage, handlers: stage.handlers.filter((x) => x.uid !== h.uid) })}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
