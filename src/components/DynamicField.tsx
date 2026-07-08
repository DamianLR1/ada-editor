import type { FieldDef } from '../schema/registry';
import { ScalableAmountField } from './ScalableAmountField';
import { VarDefinitionsField } from './VarDefinitionsField';
import { StringListField } from './StringListField';
import { MapNumberField } from './MapNumberField';
import { MapStringListField } from './MapStringListField';
import { MapTextField } from './MapTextField';
import { AttributeScaleMapField } from './AttributeScaleMapField';

interface Props {
  field: FieldDef;
  value: any;
  allValues: Record<string, any>;
  onChange: (value: any) => void;
}

const inputClass =
  'w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 placeholder:text-zinc-600';

export function DynamicField({ field, value, allValues, onChange }: Props) {
  if (field.showIf && !field.showIf(allValues)) return null;

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
        {field.label}
        <span className="text-zinc-600 font-mono text-[10px]">{field.key}</span>
      </label>
      {field.desc && <p className="text-[11px] text-zinc-500 -mt-0.5">{field.desc}</p>}

      {field.type === 'text' && (
        <input
          className={inputClass}
          type="text"
          value={value ?? ''}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {field.type === 'number' && (
        <input
          className={inputClass}
          type="number"
          value={value ?? 0}
          onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
        />
      )}

      {field.type === 'boolean' && (
        <label className="flex items-center gap-2 text-sm text-zinc-200">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-600 bg-zinc-900 accent-amber-500"
          />
          {value ? 'Sí' : 'No'}
        </label>
      )}

      {field.type === 'select' && (
        <select className={inputClass} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {field.type === 'string_list' && <StringListField value={value ?? []} onChange={onChange} />}

      {field.type === 'scalable_amount' && <ScalableAmountField value={value} onChange={onChange} />}

      {field.type === 'var_definitions' && <VarDefinitionsField value={value ?? []} onChange={onChange} />}

      {field.type === 'map_number' && <MapNumberField value={value ?? {}} onChange={onChange} />}

      {field.type === 'map_string_list' && <MapStringListField value={value ?? {}} onChange={onChange} />}

      {field.type === 'map_text' && <MapTextField value={value ?? {}} onChange={onChange} />}

      {field.type === 'attribute_scale_map' && <AttributeScaleMapField value={value ?? {}} onChange={onChange} />}
    </div>
  );
}
