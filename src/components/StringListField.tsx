interface Props {
  value: string[];
  onChange: (value: string[]) => void;
}

export function StringListField({ value, onChange }: Props) {
  const text = (value || []).join('\n');

  return (
    <textarea
      className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-sm text-zinc-100 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 min-h-[70px]"
      value={text}
      placeholder={'Uno por línea...'}
      onChange={(e) => onChange(e.target.value.split('\n'))}
    />
  );
}
