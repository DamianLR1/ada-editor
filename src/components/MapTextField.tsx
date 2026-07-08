import { Plus, Trash2 } from 'lucide-react';

interface Props {
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}

const inputClass =
  'rounded-md bg-zinc-950 border border-zinc-700 px-2 py-1 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500';

export function MapTextField({ value, onChange, keyPlaceholder, valuePlaceholder }: Props) {
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
        <div key={k} className="rounded-md border border-zinc-700 bg-zinc-900/50 p-2 space-y-1">
          <div className="flex items-center gap-2">
            <input
              className={inputClass + ' flex-1 font-mono'}
              placeholder={keyPlaceholder ?? 'clave'}
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
              className="text-zinc-500 hover:text-red-400"
            >
              <Trash2 size={14} />
            </button>
          </div>
          <textarea
            className={inputClass + ' w-full font-mono text-xs min-h-[45px]'}
            placeholder={valuePlaceholder ?? 'valor'}
            value={v}
            onChange={(e) => onChange({ ...value, [k]: e.target.value })}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange({ ...value, ['nueva_clave']: '' })}
        className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300"
      >
        <Plus size={14} /> Agregar
      </button>
    </div>
  );
}
