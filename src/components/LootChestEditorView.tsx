import { Plus } from 'lucide-react';
import type { LootChestFile } from '../yaml/lootChestParser';
import { newLootItemInstance } from '../yaml/lootChestParser';
import { ItemCard } from './ItemCard';
import { ScalableAmountField } from './ScalableAmountField';

interface Props {
  chest: LootChestFile;
  onChange: (c: LootChestFile) => void;
}

export function LootChestEditorView({ chest, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-amber-500/10 border border-amber-700/40 px-3 py-2 text-xs text-amber-300">
        ⚠ El formato de item no está verificado contra el código de <code>nightcore</code> (librería externa). Pasame
        un loot_chests/*.yml real para ajustar el schema si algo no coincide.
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-zinc-400">Ubicación del cofre (x,y,z)</label>
          <input
            className="w-full mt-1 rounded-md bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-sm text-zinc-100 font-mono"
            value={chest.location}
            onChange={(e) => onChange({ ...chest, location: e.target.value })}
          />
        </div>
        <div className="flex items-end pb-1.5">
          <label className="flex items-center gap-2 text-sm text-zinc-200">
            <input
              type="checkbox"
              checked={chest.uniqueOnly}
              onChange={(e) => onChange({ ...chest, uniqueOnly: e.target.checked })}
              className="accent-amber-500"
            />
            Cada item sale una sola vez por generación
          </label>
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-zinc-400 block mb-1">Cantidad de items a generar</label>
          <ScalableAmountField value={chest.itemsAmount} onChange={(v) => onChange({ ...chest, itemsAmount: v })} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-300">Items del pool ({chest.items.length})</h2>
        <button
          onClick={() => onChange({ ...chest, items: [...chest.items, newLootItemInstance()] })}
          className="flex items-center gap-1.5 text-sm text-amber-400 hover:text-amber-300"
        >
          <Plus size={15} /> Agregar item
        </button>
      </div>
      <div className="space-y-3">
        {chest.items.length === 0 && <p className="text-sm text-zinc-600">Sin items todavía.</p>}
        {chest.items.map((it) => (
          <ItemCard
            key={it.uid}
            values={it.itemValues}
            onChange={(v) => onChange({ ...chest, items: chest.items.map((x) => (x.uid === it.uid ? { ...x, itemValues: v } : x)) })}
            onRemove={() => onChange({ ...chest, items: chest.items.filter((x) => x.uid !== it.uid) })}
            extraHeader={
              <>
                <input
                  className="rounded-md bg-zinc-950 border border-zinc-700 px-2 py-1 text-sm text-emerald-300 font-mono w-40"
                  value={it.name}
                  onChange={(e) =>
                    onChange({ ...chest, items: chest.items.map((x) => (x.uid === it.uid ? { ...x, name: e.target.value } : x)) })
                  }
                />
                <label className="flex items-center gap-1.5 text-xs text-zinc-400">
                  Peso
                  <input
                    type="number"
                    className="w-16 rounded-md bg-zinc-950 border border-zinc-700 px-2 py-1 text-sm text-zinc-100"
                    value={it.weight}
                    onChange={(e) =>
                      onChange({
                        ...chest,
                        items: chest.items.map((x) => (x.uid === it.uid ? { ...x, weight: Number(e.target.value) } : x)),
                      })
                    }
                  />
                </label>
              </>
            }
          />
        ))}
      </div>
    </div>
  );
}
