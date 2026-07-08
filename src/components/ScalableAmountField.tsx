import { Trash2 } from 'lucide-react';
import type { ScalableAmountValue } from '../schema/fields';
import { SCALE_BASES, SCALE_TYPES } from '../schema/registry';

interface Props {
  value: ScalableAmountValue;
  onChange: (value: ScalableAmountValue) => void;
}

const inputClass =
  'w-full rounded-md bg-zinc-950 border border-zinc-700 px-2 py-1 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500';

export function ScalableAmountField({ value, onChange }: Props) {
  const scalerKeys = Object.keys(value.scalers || {});
  const availableBases = SCALE_BASES.filter((b) => !scalerKeys.includes(b.value));

  return (
    <div className="rounded-md border border-zinc-700 bg-zinc-900/60 p-3 space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-[11px] text-zinc-500">Mínimo inicial</label>
          <input
            className={inputClass}
            value={value.initialMin}
            onChange={(e) => onChange({ ...value, initialMin: e.target.value })}
          />
        </div>
        <div>
          <label className="text-[11px] text-zinc-500">Máximo inicial</label>
          <input
            className={inputClass}
            value={value.initialMax}
            onChange={(e) => onChange({ ...value, initialMax: e.target.value })}
          />
        </div>
        <div className="flex items-end pb-1.5">
          <label className="flex items-center gap-1.5 text-xs text-zinc-300">
            <input
              type="checkbox"
              checked={value.asInteger}
              onChange={(e) => onChange({ ...value, asInteger: e.target.checked })}
              className="accent-amber-500"
            />
            Entero
          </label>
        </div>
      </div>

      {scalerKeys.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] text-zinc-500">Escaladores</p>
          {scalerKeys.map((k) => {
            const base = SCALE_BASES.find((b) => b.value === k);
            const scaler = value.scalers[k];
            return (
              <div key={k} className="flex items-center gap-2 bg-zinc-950/60 rounded p-2">
                <span className="text-xs text-amber-400 flex-1">{base?.label ?? k}</span>
                <input
                  className={inputClass + ' w-20'}
                  type="number"
                  value={scaler.value}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      scalers: { ...value.scalers, [k]: { ...scaler, value: Number(e.target.value) } },
                    })
                  }
                />
                <select
                  className={inputClass + ' w-40'}
                  value={scaler.type}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      scalers: { ...value.scalers, [k]: { ...scaler, type: e.target.value } },
                    })
                  }
                >
                  {SCALE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    const next = { ...value.scalers };
                    delete next[k];
                    onChange({ ...value, scalers: next });
                  }}
                  className="text-zinc-500 hover:text-red-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {availableBases.length > 0 && (
        <select
          className={inputClass + ' text-zinc-400'}
          value=""
          onChange={(e) => {
            if (!e.target.value) return;
            onChange({
              ...value,
              scalers: { ...value.scalers, [e.target.value]: { value: 0, type: 'PLAIN' } },
            });
          }}
        >
          <option value="">+ Agregar escalador...</option>
          {availableBases.map((b) => (
            <option key={b.value} value={b.value}>
              {b.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
