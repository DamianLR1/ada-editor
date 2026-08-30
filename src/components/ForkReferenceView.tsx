import { useMemo, useState } from 'react';
import { BookOpen, Search, Copy, Check } from 'lucide-react';
import { FORK_REFERENCE } from '../schema/forkReference';
import type { RefSection } from '../schema/forkReference';

function filterSections(query: string): RefSection[] {
  const q = query.trim().toLowerCase();
  if (!q) return FORK_REFERENCE;

  return FORK_REFERENCE.map((section) => ({
    ...section,
    rows: section.rows.filter(
      (row) => row.name.toLowerCase().includes(q) || row.desc.toLowerCase().includes(q)
    ),
  })).filter((section) => section.rows.length > 0);
}

function Snippet({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    // clipboard falla en http:// y en algunos navegadores embebidos; el bloque
    // sigue siendo seleccionable a mano, así que sólo se descarta el error.
    navigator.clipboard?.writeText(text).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      },
      () => {}
    );
  };

  return (
    <div className="relative">
      <pre className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 pr-10 text-[12px] leading-relaxed text-zinc-300 overflow-x-auto">
        {text}
      </pre>
      <button
        onClick={copy}
        title="Copiar"
        className="absolute top-2 right-2 rounded p-1 text-zinc-500 hover:text-amber-400 hover:bg-zinc-800"
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
      </button>
    </div>
  );
}

export function ForkReferenceView() {
  const [query, setQuery] = useState('');
  const sections = useMemo(() => filterSections(query), [query]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
          <BookOpen size={15} className="text-amber-400" /> Referencia del fork
        </h2>
        <p className="text-xs text-zinc-500 mt-1">
          Lo que este fork agrega sobre AdvancedDungeonArena 8.5.1. No se edita desde acá — vive en el
          config.yml global del plugin, en el lang, o son placeholders — pero es lo que más se consulta
          mientras armás una dungeon.
        </p>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-600" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar comando, placeholder, permiso…"
          className="w-full rounded-md bg-zinc-950 border border-zinc-700 pl-8 pr-2 py-1.5 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>

      {sections.length === 0 && (
        <p className="text-sm text-zinc-500 text-center py-8">Nada coincide con "{query}".</p>
      )}

      {sections.map((section) => (
        <section key={section.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-amber-300">{section.title}</h3>
          {section.blurb && <p className="text-xs text-zinc-400 leading-relaxed">{section.blurb}</p>}

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-zinc-500">
                  <th className="text-left font-semibold py-1 pr-4 w-[38%]">{section.columns[0]}</th>
                  <th className="text-left font-semibold py-1">{section.columns[1]}</th>
                </tr>
              </thead>
              <tbody>
                {section.rows.map((row) => (
                  <tr key={row.name} className="border-t border-zinc-800/70 align-top">
                    <td className="py-1.5 pr-4 font-mono text-[12px] text-zinc-200 break-all">{row.name}</td>
                    <td className="py-1.5 text-zinc-400 text-[13px]">{row.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {section.snippet && <Snippet text={section.snippet} />}
        </section>
      ))}
    </div>
  );
}
