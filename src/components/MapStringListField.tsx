import { Plus, Trash2 } from 'lucide-react';

interface Props {
  value: Record<string, string[]>;
  onChange: (value: Record<string, string[]>) => void;
  keyPlaceholder?: string;
}

const inputClass =
  'rounded-md bg-zinc-950 border border-zinc-700 px-2 py-1 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500';

export function MapStringListField({ value, onChange, keyPlaceholder }: Props) {
  const entries = Object.entries(value || {});

  const rename = (oldKey: string, newKey: string) => {
    const next = { ...value };
    delete next[oldKey];
    next[newKey] = value[oldKey];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {entries.map(([k, positions]) => (
        <div key={k} className="rounded-md border border-zinc-700 bg-zinc-900/50 p-2 space-y-1.5">
          <div className="flex items-center gap-2">
            <input
              className={inputClass + ' flex-1 font-mono'}
              placeholder={keyPlaceholder ?? 'id_spawner'}
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
            className={inputClass + ' w-full font-mono min-h-[50px]'}
            placeholder={'Una posición por línea (x,y,z,yaw,pitch)'}
            value={(positions || []).join('\n')}
            onChange={(e) => onChange({ ...value, [k]: e.target.value.split('\n') })}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange({ ...value, ['nuevo_spawner']: [] })}
        className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300"
      >
        <Plus size={14} /> Agregar grupo de spawn
      </button>
    </div>
  );
}
