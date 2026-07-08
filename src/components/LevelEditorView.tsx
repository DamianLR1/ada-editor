import type { LoadedFile } from '../schema/types';
import { newHandler } from '../yaml/parser';
import { HandlerCard } from './HandlerCard';
import { Plus } from 'lucide-react';

interface Props {
  level: LoadedFile;
  onChange: (l: LoadedFile) => void;
}

export function LevelEditorView({ level, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-zinc-400">Nombre</label>
          <input
            className="w-full mt-1 rounded-md bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-sm text-zinc-100"
            value={level.raw.Name ?? ''}
            onChange={(e) => onChange({ ...level, raw: { ...level.raw, Name: e.target.value } })}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-400">SpawnPos (x,y,z,yaw,pitch)</label>
          <input
            className="w-full mt-1 rounded-md bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-sm text-zinc-100 font-mono"
            value={level.raw.SpawnPos ?? ''}
            onChange={(e) => onChange({ ...level, raw: { ...level.raw, SpawnPos: e.target.value } })}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-zinc-400">Descripción</label>
          <textarea
            className="w-full mt-1 rounded-md bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-sm text-zinc-100 min-h-[50px]"
            value={level.raw.Description ?? ''}
            onChange={(e) => onChange({ ...level, raw: { ...level.raw, Description: e.target.value } })}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-300">Scripts (EventHandlers)</h2>
        <button
          onClick={() => onChange({ ...level, handlers: [...level.handlers, newHandler()] })}
          className="flex items-center gap-1.5 text-sm text-amber-400 hover:text-amber-300"
        >
          <Plus size={15} /> Agregar script
        </button>
      </div>
      <div className="space-y-4">
        {level.handlers.length === 0 && <p className="text-sm text-zinc-600">Este nivel todavía no tiene EventHandlers.</p>}
        {level.handlers.map((h) => (
          <HandlerCard
            key={h.uid}
            handler={h}
            onChange={(nh) => onChange({ ...level, handlers: level.handlers.map((x) => (x.uid === nh.uid ? nh : x)) })}
            onRemove={() => onChange({ ...level, handlers: level.handlers.filter((x) => x.uid !== h.uid) })}
          />
        ))}
      </div>
    </div>
  );
}
