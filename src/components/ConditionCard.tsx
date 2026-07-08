import { Trash2 } from 'lucide-react';
import type { ConditionInstance } from '../schema/types';
import { CONDITIONS, getConditionDef } from '../schema/registry';
import { defaultValuesForType } from '../schema/fields';
import { TypeSelector } from './TypeSelector';
import { DynamicField } from './DynamicField';

interface Props {
  condition: ConditionInstance;
  onChange: (c: ConditionInstance) => void;
  onRemove: () => void;
}

export function ConditionCard({ condition, onChange, onRemove }: Props) {
  const typeDef = getConditionDef(condition.type);

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 space-y-2.5">
      <div className="flex items-center gap-2">
        <input
          className="flex-1 rounded-md bg-zinc-950 border border-zinc-700 px-2 py-1 text-sm text-amber-300 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
          value={condition.name}
          onChange={(e) => onChange({ ...condition, name: e.target.value })}
        />
        <TypeSelector
          types={CONDITIONS}
          value={condition.type}
          onChange={(type) => {
            const nextDef = getConditionDef(type);
            onChange({ ...condition, type, values: nextDef ? defaultValuesForType(nextDef) : {} });
          }}
        />
        <label className="flex items-center gap-1 text-xs text-zinc-400 whitespace-nowrap">
          <input
            type="checkbox"
            checked={condition.cached}
            onChange={(e) => onChange({ ...condition, cached: e.target.checked })}
            className="accent-amber-500"
          />
          Cached
        </label>
        <button type="button" onClick={onRemove} className="text-zinc-500 hover:text-red-400 shrink-0">
          <Trash2 size={16} />
        </button>
      </div>

      {typeDef && (
        <>
          <p className="text-[11px] text-zinc-500">{typeDef.desc}</p>
          {typeDef.deprecated && (
            <p className="text-[11px] text-amber-500">⚠ {typeDef.deprecatedNote}</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {typeDef.fields.map((f) => (
              <div key={f.key} className={f.type === 'scalable_amount' || f.type === 'string_list' || f.type === 'var_definitions' ? 'sm:col-span-2' : ''}>
                <DynamicField
                  field={f}
                  value={condition.values[f.key]}
                  allValues={condition.values}
                  onChange={(v) => onChange({ ...condition, values: { ...condition.values, [f.key]: v } })}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
