import { Plus, Trash2 } from 'lucide-react';
import type { VarDefinitionValue } from '../schema/fields';

interface Props {
  value: VarDefinitionValue[];
  onChange: (value: VarDefinitionValue[]) => void;
}

const inputClass =
  'rounded-md bg-zinc-950 border border-zinc-700 px-2 py-1 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500';

export function VarDefinitionsField({ value, onChange }: Props) {
  const update = (i: number, patch: Partial<VarDefinitionValue>) => {
    const next = [...value];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {value.map((def, i) => (
        <div key={i} className="flex items-center gap-2 bg-zinc-900/60 border border-zinc-700 rounded p-2">
          <input
            className={inputClass + ' flex-1'}
            placeholder="nombre_variable"
            value={def.name}
            onChange={(e) => update(i, { name: e.target.value })}
          />
          <input
            className={inputClass + ' w-24'}
            type="number"
            placeholder="Inicial"
            value={def.initial}
            onChange={(e) => update(i, { initial: Number(e.target.value) })}
          />
          <label className="flex items-center gap-1 text-xs text-zinc-400">
            <input
              type="checkbox"
              checked={def.hasBounds}
              onChange={(e) => update(i, { hasBounds: e.target.checked })}
              className="accent-amber-500"
            />
            Límites
          </label>
          {def.hasBounds && (
            <>
              <input
                className={inputClass + ' w-20'}
                type="number"
                placeholder="Min"
                value={def.min}
                onChange={(e) => update(i, { min: Number(e.target.value) })}
              />
              <input
                className={inputClass + ' w-20'}
                type="number"
                placeholder="Max"
                value={def.max}
                onChange={(e) => update(i, { max: Number(e.target.value) })}
              />
            </>
          )}
          <button
            type="button"
            onClick={() => onChange(value.filter((_, idx) => idx !== i))}
            className="text-zinc-500 hover:text-red-400"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, { name: 'nueva_var', initial: 0, hasBounds: false, min: 0, max: 0 }])}
        className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300"
      >
        <Plus size={14} /> Agregar variable
      </button>
    </div>
  );
}
