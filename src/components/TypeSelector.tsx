import type { TypeDef } from '../schema/registry';

interface Props {
  types: TypeDef[];
  value: string;
  onChange: (type: string) => void;
}

export function TypeSelector({ types, value, onChange }: Props) {
  const active = types.filter((t) => !t.deprecated);
  const deprecated = types.filter((t) => t.deprecated);

  return (
    <select
      className="rounded-md bg-zinc-900 border border-zinc-700 px-2 py-1.5 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500 min-w-[220px]"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <optgroup label="Vigentes">
        {active.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </optgroup>
      {deprecated.length > 0 && (
        <optgroup label="Deprecadas (solo lectura recomendada)">
          {deprecated.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </optgroup>
      )}
    </select>
  );
}
