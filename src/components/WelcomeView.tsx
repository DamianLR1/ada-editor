import { FolderOpen, Plus, BookOpen, ShieldCheck, GitBranch, Map as MapIcon, Lock, FileCheck2 } from 'lucide-react';
import type { ReactNode } from 'react';

interface Props {
  onImport: () => void;
  onCreate: () => void;
  onReference: () => void;
}

function Feature({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-zinc-200">
        <span className="text-amber-400">{icon}</span>
        {title}
      </div>
      <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">{children}</p>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="shrink-0 h-6 w-6 rounded-full bg-amber-500/15 text-amber-400 text-xs font-semibold flex items-center justify-center">
        {n}
      </span>
      <div>
        <p className="text-sm text-zinc-200">{title}</p>
        <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

export function WelcomeView({ onImport, onCreate, onReference }: Props) {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-amber-500/10 via-zinc-900/40 to-zinc-900/40 p-8">
        <h1 className="text-2xl font-semibold text-zinc-100">Armá tu dungeon sin escribir YAML</h1>
        <p className="text-sm text-zinc-400 mt-2 max-w-2xl leading-relaxed">
          Editor visual para <span className="text-zinc-200">AdvancedDungeonArena</span>. Importás la carpeta de una
          dungeon, la editás con formularios que ya conocen todos los campos del plugin, y te bajás un{' '}
          <code className="text-zinc-300">.zip</code> listo para pegar en el server.
        </p>

        <div className="flex flex-wrap gap-2 mt-5">
          <button
            onClick={onImport}
            className="flex items-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-medium px-4 py-2 text-sm transition"
          >
            <FolderOpen size={16} /> Importar carpeta de dungeon
          </button>
          <button
            onClick={onCreate}
            className="flex items-center gap-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-4 py-2 text-sm transition"
          >
            <Plus size={16} /> Empezar una nueva
          </button>
          <button
            onClick={onReference}
            className="flex items-center gap-2 rounded-lg bg-transparent hover:bg-zinc-900 border border-zinc-800 text-zinc-400 px-4 py-2 text-sm transition"
          >
            <BookOpen size={16} /> Ver la referencia
          </button>
        </div>

        <p className="flex items-center gap-1.5 text-[11px] text-zinc-500 mt-5">
          <Lock size={12} /> Todo corre en tu navegador. Los archivos nunca se suben a ningún lado.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Step n={1} title="Importá la carpeta">
          Elegí la carpeta completa de la dungeon — la que tiene <code>config.yml</code>, <code>levels/</code>,{' '}
          <code>stages/</code>. Se lee entera, incluidos rewards y loot chests.
        </Step>
        <Step n={2} title="Editá con formularios">
          Cada acción, condición y tarea tiene su formulario con los campos exactos que espera el plugin, y una
          explicación de qué hace cada uno.
        </Step>
        <Step n={3} title="Exportá el .zip">
          Sale con la misma estructura de carpetas. Lo descomprimís sobre el server y listo.
        </Step>
      </section>

      <section>
        <p className="text-[11px] uppercase tracking-wide text-zinc-500 font-semibold mb-3">Qué te da</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Feature icon={<MapIcon size={15} />} title="Mapa de la dungeon">
            Vista cenital con la región, el lobby, cada spawner y cada loot chest en su posición real. Los que quedaron
            fuera de la región se marcan en rojo, que es el error de config más típico y el más difícil de ver a mano.
          </Feature>
          <Feature icon={<GitBranch size={15} />} title="Diagrama de flujo">
            El recorrido de stages y levels dibujado a partir de las acciones reales. Se ve de una si un stage quedó
            inalcanzable o si falta un camino a la victoria.
          </Feature>
          <Feature icon={<ShieldCheck size={15} />} title="Validación cruzada">
            Detecta referencias rotas antes de subir nada: stages, levels, rewards, loot chests, spots, spawners,
            tareas y variables usadas sin definir.
          </Feature>
          <Feature icon={<FileCheck2 size={15} />} title="Nada se pierde">
            Lo que el editor todavía no sabe editar (como <code>spots/</code>) se conserva tal cual al exportar. No hay
            forma de que la exportación borre algo que no vio.
          </Feature>
        </div>
      </section>

      <p className="text-xs text-zinc-600 text-center">
        También podés cargar Kits y Mob Templates globales desde el panel de la izquierda, sin abrir una dungeon.
      </p>
    </div>
  );
}
