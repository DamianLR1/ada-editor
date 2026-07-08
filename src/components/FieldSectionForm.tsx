import type { FieldDef } from '../schema/registry';
import { DynamicField } from './DynamicField';

interface Props {
  fields: FieldDef[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
}

const WIDE_TYPES = ['string_list', 'scalable_amount', 'var_definitions', 'map_number', 'map_string_list', 'map_text', 'attribute_scale_map'];

export function FieldSectionForm({ fields, values, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {fields.map((f) => (
        <div key={f.key} className={WIDE_TYPES.includes(f.type) ? 'sm:col-span-2' : ''}>
          <DynamicField field={f} value={values[f.key]} allValues={values} onChange={(v) => onChange(f.key, v)} />
        </div>
      ))}
    </div>
  );
}
