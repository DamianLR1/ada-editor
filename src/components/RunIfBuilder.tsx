import type { ConditionInstance } from '../schema/types';

interface Props {
  value: string;
  onChange: (value: string) => void;
  availableConditions: ConditionInstance[];
}

export function RunIfBuilder({ value, onChange, availableConditions }: Props) {
  const append = (token: string) => {
    const needsSpace = value.length > 0 && !value.endsWith(' ');
    onChange(value + (needsSpace ? ' ' : '') + token + ' ');
  };

  const unknownNames = extractNames(value).filter(
    (n) => !availableConditions.some((c) => c.name === n)
  );

  return (
    <div className="space-y-1.5">
      <input
        className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-sm text-zinc-100 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
        placeholder="ej: cond_a && (cond_b || !cond_c)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="flex flex-wrap gap-1.5">
        {availableConditions.length === 0 && (
          <span className="text-[11px] text-zinc-600">Agregá conditions a este script para poder referenciarlas acá.</span>
        )}
        {availableConditions.map((c) => (
          <button
            key={c.uid}
            type="button"
            onClick={() => append(c.name)}
            className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-xs text-amber-300 hover:border-amber-500"
          >
            {c.name}
          </button>
        ))}
        {['&&', '||', '!', '(', ')'].map((op) => (
          <button
            key={op}
            type="button"
            onClick={() => append(op)}
            className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-700 text-xs text-zinc-400 hover:border-zinc-500 font-mono"
          >
            {op}
          </button>
        ))}
      </div>
      {unknownNames.length > 0 && (
        <p className="text-[11px] text-red-400">
          ⚠ Referencia condiciones inexistentes en este script: {unknownNames.join(', ')}
        </p>
      )}
    </div>
  );
}

function extractNames(expr: string): string[] {
  const matches = expr.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || [];
  return Array.from(new Set(matches));
}
