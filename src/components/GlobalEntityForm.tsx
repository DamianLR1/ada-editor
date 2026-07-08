import type { FieldDef } from '../schema/registry';
import { parseValuesFromFields, writeFieldValue } from '../schema/fields';
import { FieldSectionForm } from './FieldSectionForm';

interface Props {
  fields: FieldDef[];
  raw: Record<string, any>;
  onChange: (raw: Record<string, any>) => void;
}

export function GlobalEntityForm({ fields, raw, onChange }: Props) {
  const values = parseValuesFromFields(fields, raw);

  const handleChange = (key: string, value: any) => {
    const next = { ...raw };
    const field = fields.find((f) => f.key === key)!;
    writeFieldValue(field, next, value);
    onChange(next);
  };

  return <FieldSectionForm fields={fields} values={values} onChange={handleChange} />;
}
