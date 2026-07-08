import { Plus, Trash2 } from 'lucide-react';

export interface AttributeScale {
  initial: number;
  perLevel: number;
  min: number;
  max: number;
}

interface Props {
  value: Record<string, AttributeScale>;
  onChange: (value: Record<string, AttributeScale>) => void;
}

const inputClass =
  'rounded-md bg-zinc-950 border border-zinc-700 px-2 py-1 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500 w-full';

export function AttributeScaleMapField({ value, onChange }: Props) {
  const entries = Object.entries(value || {});

  const rename = (oldKey: string, newKey: string) => {
    const next = { ...value };
    delete next[oldKey];
    next[newKey] = value[oldKey];
    onChange(next);
  };

  const update = (key: string, patch: Partial<AttributeScale>) => {
    onChange({ ...value, [key]: { ...value[key], ...patch } });
  };

  return (
    <div className="space-y-2">
      {entries.map(([k, scale]) => (
        <div key={k} className="rounded-md border border-zinc-700 bg-zinc-900/50 p-2 space-y-1.5">
          <div className="flex items-center gap-2">
            <input
              className={inputClass + ' font-mono'}
              placeholder="nombre_atributo (ej: GENERIC_MAX_HEALTH)"
              value={k}
              onChange={(e) => rename(k, e.target.value)}
            />
            <button
              type="button"
              onClick={() => {
                const next = { ...value };
                delete next[k];
                onChange(next);
              }}
              className="text-zinc-500 hover:text-red-400 shrink-0"
            >
              <Trash2 size={14} />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            <div>
              <label className="text-[10px] text-zinc-500">Inicial</label>
              <input
                className={inputClass}
                type="number"
                value={scale.initial}
                onChange={(e) => update(k, { initial: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500">Por nivel</label>
              <input
                className={inputClass}
                type="number"
                value={scale.perLevel}
                onChange={(e) => update(k, { perLevel: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500">Mínimo</label>
              <input
                className={inputClass}
                type="number"
                value={scale.min}
                onChange={(e) => update(k, { min: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500">Máximo</label>
              <input
                className={inputClass}
                type="number"
                value={scale.max}
                onChange={(e) => update(k, { max: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange({ ...value, ['nuevo_atributo']: { initial: 0, perLevel: 0, min: 0, max: 0 } })}
        className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300"
      >
        <Plus size={14} /> Agregar atributo
      </button>
    </div>
  );
}
