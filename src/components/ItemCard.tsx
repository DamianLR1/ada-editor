import { Trash2 } from 'lucide-react';
import { ITEM_FIELDS } from '../schema/itemSchema';
import { FieldSectionForm } from './FieldSectionForm';

interface Props {
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
  onRemove: () => void;
  extraHeader?: React.ReactNode;
}

export function ItemCard({ values, onChange, onRemove, extraHeader }: Props) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 space-y-2.5">
      <div className="flex items-center gap-2">
        {extraHeader}
        <div className="flex-1" />
        <button type="button" onClick={onRemove} className="text-zinc-500 hover:text-red-400 shrink-0">
          <Trash2 size={16} />
        </button>
      </div>
      <FieldSectionForm fields={ITEM_FIELDS} values={values} onChange={(k, v) => onChange({ ...values, [k]: v })} />
    </div>
  );
}
