import { Plus, Trash2 } from 'lucide-react';

interface Props {
  value: Record<string, number>;
  onChange: (value: Record<string, number>) => void;
  keyPlaceholder?: string;
}

const inputClass =
  'rounded-md bg-zinc-950 border border-zinc-700 px-2 py-1 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500';

export function MapNumberField({ value, onChange, keyPlaceholder }: Props) {
  const entries = Object.entries(value || {});

  const rename = (oldKey: string, newKey: string) => {
    const next = { ...value };
    delete next[oldKey];
    next[newKey] = value[oldKey];
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {entries.map(([k, v]) => (
        <div key={k} className="flex items-center gap-2">
          <input
            className={inputClass + ' flex-1'}
            placeholder={keyPlaceholder ?? 'clave'}
            value={k}
            onChange={(e) => rename(k, e.target.value)}
          />
          <input
            className={inputClass + ' w-28'}
            type="number"
            value={v}
            onChange={(e) => onChange({ ...value, [k]: Number(e.target.value) })}
          />
          <button
            type="button"
            onClick={() => {
              const next = { ...value };
              delete next[k];
              onChange(next);
            }}
            className="text-zinc-500 hover:text-red-400"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange({ ...value, ['nueva_clave']: 0 })}
        className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300"
      >
        <Plus size={14} /> Agregar
      </button>
    </div>
  );
}
