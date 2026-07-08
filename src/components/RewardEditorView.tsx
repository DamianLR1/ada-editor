import { Plus } from 'lucide-react';
import type { RewardFile } from '../yaml/rewardParser';
import { newItemInstance } from '../yaml/rewardParser';
import { ItemCard } from './ItemCard';
import { StringListField } from './StringListField';

interface Props {
  reward: RewardFile;
  onChange: (r: RewardFile) => void;
}

export function RewardEditorView({ reward, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-amber-500/10 border border-amber-700/40 px-3 py-2 text-xs text-amber-300">
        ⚠ El formato de item no está verificado contra el código de <code>nightcore</code> (librería externa). Si al
        importar un reward real ves campos vacíos o al exportar el juego no lo reconoce, pasame el YAML real para
        ajustar el schema.
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-zinc-400">Nombre</label>
          <input
            className="w-full mt-1 rounded-md bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-sm text-zinc-100"
            value={reward.name}
            onChange={(e) => onChange({ ...reward, name: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-zinc-400">Descripción</label>
          <StringListField value={reward.description} onChange={(v) => onChange({ ...reward, description: v })} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-zinc-400">Comandos al entregar</label>
          <StringListField value={reward.commands} onChange={(v) => onChange({ ...reward, commands: v })} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-300">Items ({reward.items.length})</h2>
        <button
          onClick={() => onChange({ ...reward, items: [...reward.items, newItemInstance()] })}
          className="flex items-center gap-1.5 text-sm text-amber-400 hover:text-amber-300"
        >
          <Plus size={15} /> Agregar item
        </button>
      </div>
      <div className="space-y-3">
        {reward.items.length === 0 && <p className="text-sm text-zinc-600">Sin items todavía.</p>}
        {reward.items.map((it) => (
          <ItemCard
            key={it.uid}
            values={it.values}
            onChange={(v) => onChange({ ...reward, items: reward.items.map((x) => (x.uid === it.uid ? { ...x, values: v } : x)) })}
            onRemove={() => onChange({ ...reward, items: reward.items.filter((x) => x.uid !== it.uid) })}
          />
        ))}
      </div>
    </div>
  );
}
