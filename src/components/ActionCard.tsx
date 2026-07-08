import { Trash2 } from 'lucide-react';
import type { ActionInstance, ConditionInstance } from '../schema/types';
import { ACTIONS, getActionDef } from '../schema/registry';
import { defaultValuesForType } from '../schema/fields';
import { TypeSelector } from './TypeSelector';
import { DynamicField } from './DynamicField';
import { RunIfBuilder } from './RunIfBuilder';

interface Props {
  action: ActionInstance;
  siblingConditions: ConditionInstance[];
  onChange: (a: ActionInstance) => void;
  onRemove: () => void;
}

export function ActionCard({ action, siblingConditions, onChange, onRemove }: Props) {
  const typeDef = getActionDef(action.type);

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 space-y-2.5">
      <div className="flex items-center gap-2">
        <input
          className="flex-1 rounded-md bg-zinc-950 border border-zinc-700 px-2 py-1 text-sm text-sky-300 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
          value={action.name}
          onChange={(e) => onChange({ ...action, name: e.target.value })}
        />
        <TypeSelector
          types={ACTIONS}
          value={action.type}
          onChange={(type) => {
            const nextDef = getActionDef(type);
            onChange({ ...action, type, values: nextDef ? defaultValuesForType(nextDef) : {} });
          }}
        />
        <button type="button" onClick={onRemove} className="text-zinc-500 hover:text-red-400 shrink-0">
          <Trash2 size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-zinc-400">Probabilidad de ejecución (%)</label>
          <input
            type="number"
            className="w-full mt-1 rounded-md bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
            value={action.chance}
            onChange={(e) => onChange({ ...action, chance: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-400">RunIf (condición, opcional)</label>
          <div className="mt-1">
            <RunIfBuilder
              value={action.runIf}
              onChange={(v) => onChange({ ...action, runIf: v })}
              availableConditions={siblingConditions}
            />
          </div>
        </div>
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
                  value={action.values[f.key]}
                  allValues={action.values}
                  onChange={(v) => onChange({ ...action, values: { ...action.values, [f.key]: v } })}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
