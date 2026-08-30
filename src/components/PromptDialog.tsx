import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

export interface PromptRequest {
  title: string;
  hint?: string;
  label: string;
  suffix?: string; // ej. ".yml", se muestra pegado al input pero no se agrega solo
  initial: string;
  confirmLabel: string;
  onConfirm: (value: string) => void;
}

interface Props {
  request: PromptRequest | null;
  onClose: () => void;
}

export function PromptDialog({ request, onClose }: Props) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!request) return;
    setValue(request.initial);
    // El foco tiene que ir después del render para que el input exista.
    const id = window.setTimeout(() => inputRef.current?.select(), 0);
    return () => window.clearTimeout(id);
  }, [request]);

  if (!request) return null;

  const trimmed = value.trim();
  const submit = () => {
    if (!trimmed) return;
    request.onConfirm(trimmed);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-4 pb-2">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">{request.title}</h3>
            {request.hint && <p className="text-xs text-zinc-500 mt-0.5">{request.hint}</p>}
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
            <X size={16} />
          </button>
        </div>

        <div className="px-4 pb-4 space-y-3">
          <label className="block">
            <span className="text-[11px] text-zinc-500">{request.label}</span>
            <div className="flex items-center gap-1 mt-1">
              <input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submit();
                  if (e.key === 'Escape') onClose();
                }}
                className="flex-1 rounded-md bg-zinc-950 border border-zinc-700 px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
              />
              {request.suffix && <span className="text-sm text-zinc-500 font-mono">{request.suffix}</span>}
            </div>
          </label>

          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-400 hover:bg-zinc-800"
            >
              Cancelar
            </button>
            <button
              onClick={submit}
              disabled={!trimmed}
              className="rounded-md bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-zinc-950 font-medium px-3 py-1.5 text-sm"
            >
              {request.confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
