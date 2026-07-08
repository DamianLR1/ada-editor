import { Trash2 } from 'lucide-react';
import type { TaskInstance } from '../schema/types';
import { TASKS, TASK_PARAMS_FIELDS, getTaskDef } from '../schema/registry';
import { defaultValuesForFields, defaultValuesForType } from '../schema/fields';
import { TypeSelector } from './TypeSelector';
import { DynamicField } from './DynamicField';

interface Props {
  task: TaskInstance;
  onChange: (t: TaskInstance) => void;
  onRemove: () => void;
}

export function TaskCard({ task, onChange, onRemove }: Props) {
  const typeDef = getTaskDef(task.type);

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 space-y-2.5">
      <div className="flex items-center gap-2">
        <input
          className="flex-1 rounded-md bg-zinc-950 border border-zinc-700 px-2 py-1 text-sm text-emerald-300 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
          value={task.name}
          onChange={(e) => onChange({ ...task, name: e.target.value })}
        />
        <TypeSelector
          types={TASKS}
          value={task.type}
          onChange={(type) => {
            const nextDef = getTaskDef(type);
            onChange({
              ...task,
              type,
              values: {
                ...defaultValuesForFields(TASK_PARAMS_FIELDS),
                ...(nextDef ? defaultValuesForType(nextDef) : {}),
              },
            });
          }}
        />
        <button type="button" onClick={onRemove} className="text-zinc-500 hover:text-red-400 shrink-0">
          <Trash2 size={16} />
        </button>
      </div>

      {typeDef && <p className="text-[11px] text-zinc-500">{typeDef.desc}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TASK_PARAMS_FIELDS.map((f) => (
          <div key={f.key}>
            <DynamicField
              field={f}
              value={task.values[f.key]}
              allValues={task.values}
              onChange={(v) => onChange({ ...task, values: { ...task.values, [f.key]: v } })}
            />
          </div>
        ))}
        {typeDef?.fields.map((f) => (
          <div key={f.key} className={f.type === 'string_list' ? 'sm:col-span-2' : ''}>
            <DynamicField
              field={f}
              value={task.values[f.key]}
              allValues={task.values}
              onChange={(v) => onChange({ ...task, values: { ...task.values, [f.key]: v } })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
