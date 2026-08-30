import {
  LayoutDashboard, Layers, MapPin, Gift, Package, ScrollText, Zap, ListChecks,
  Skull, Variable, CircleAlert, AlertTriangle, CheckCircle2, HelpCircle,
} from 'lucide-react';
import type { ReactNode } from 'react';
import type { Overview } from '../lib/overview';
import type { ValidationIssue } from '../lib/validate';
import type { DungeonMap } from '../lib/map';

interface Props {
  overview: Overview;
  issues: ValidationIssue[];
  map: DungeonMap;
  dungeonName: string;
  onGoTo: (view: 'validation' | 'flow' | 'map') => void;
}

function Stat({ icon, label, value, hint }: { icon: ReactNode; label: string; value: number | string; hint?: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-zinc-500">
        {icon}
        {label}
      </div>
      <p className="text-2xl font-semibold text-zinc-100 mt-1 tabular-nums">{value}</p>
      {hint && <p className="text-[11px] text-zinc-600 mt-0.5">{hint}</p>}
    </div>
  );
}

function Chips({ items, empty }: { items: string[]; empty: string }) {
  if (items.length === 0) return <p className="text-xs text-zinc-600">{empty}</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span key={item} className="rounded-md bg-zinc-800/70 border border-zinc-700/60 px-2 py-0.5 text-[11px] font-mono text-zinc-300">
          {item}
        </span>
      ))}
    </div>
  );
}

export function OverviewView({ overview, issues, map, dungeonName, onGoTo }: Props) {
  const errors = issues.filter((i) => i.severity === 'error').length;
  const warnings = issues.length - errors;
  const maxAction = overview.topActions[0]?.count ?? 1;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
          <LayoutDashboard size={15} className="text-amber-400" /> Resumen — {dungeonName}
        </h2>
        <p className="text-xs text-zinc-500 mt-1">
          Todo lo que tiene la dungeon de un vistazo. Los números salen de los archivos que importaste, así que
          cambian a medida que editás.
        </p>
      </div>

      {/* Estado del proyecto */}
      <button
        onClick={() => onGoTo('validation')}
        className={`w-full text-left rounded-xl border p-4 flex items-start gap-3 transition hover:brightness-110 ${
          errors > 0
            ? 'border-red-900/50 bg-red-500/5'
            : warnings > 0
              ? 'border-amber-900/50 bg-amber-500/5'
              : 'border-emerald-800/40 bg-emerald-500/5'
        }`}
      >
        {errors > 0 ? (
          <CircleAlert size={20} className="text-red-400 shrink-0" />
        ) : warnings > 0 ? (
          <AlertTriangle size={20} className="text-amber-400 shrink-0" />
        ) : (
          <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
        )}
        <div>
          <p className={`text-sm font-medium ${errors > 0 ? 'text-red-300' : warnings > 0 ? 'text-amber-300' : 'text-emerald-300'}`}>
            {errors > 0
              ? `${errors} referencia(s) rota(s) — la dungeon puede fallar al cargar`
              : warnings > 0
                ? `Sin errores, ${warnings} advertencia(s)`
                : 'Sin referencias rotas'}
          </p>
          <p className="text-xs text-zinc-500 mt-0.5">Clic para ver el detalle en Validación.</p>
        </div>
      </button>

      {/* Contenido */}
      <div>
        <p className="text-[11px] uppercase tracking-wide text-zinc-500 font-semibold mb-2">Contenido</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat icon={<Layers size={12} />} label="Stages" value={overview.stages} />
          <Stat icon={<MapPin size={12} />} label="Niveles" value={overview.levels} />
          <Stat icon={<Gift size={12} />} label="Rewards" value={overview.rewards} />
          <Stat icon={<Package size={12} />} label="Loot chests" value={overview.lootChests} />
        </div>
      </div>

      {/* Lógica */}
      <div>
        <p className="text-[11px] uppercase tracking-wide text-zinc-500 font-semibold mb-2">Lógica</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat icon={<ScrollText size={12} />} label="Scripts" value={overview.scripts} hint="EventHandlers" />
          <Stat icon={<Zap size={12} />} label="Acciones" value={overview.actions} />
          <Stat icon={<HelpCircle size={12} />} label="Condiciones" value={overview.conditions} />
          <Stat icon={<ListChecks size={12} />} label="Tareas" value={overview.tasks} hint="objetivos de stage" />
        </div>
      </div>

      {/* Mundo */}
      <div>
        <p className="text-[11px] uppercase tracking-wide text-zinc-500 font-semibold mb-2">Mundo</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat icon={<Skull size={12} />} label="Spawners" value={overview.spawnerGroups} hint={`${overview.spawnerPositions} posición(es)`} />
          <Stat
            icon={<MapPin size={12} />}
            label="Región"
            value={map.bounds ? `${map.bounds.maxX - map.bounds.minX + 1}×${map.bounds.maxZ - map.bounds.minZ + 1}` : '—'}
            hint={map.bounds ? 'bloques (X×Z)' : 'sin Cuboid definido'}
          />
          <Stat icon={<Skull size={12} />} label="Mobs distintos" value={overview.mobIds.length} />
          <Stat icon={<Variable size={12} />} label="Variables" value={overview.variables.length} />
        </div>
        {map.outside.length > 0 && (
          <button onClick={() => onGoTo('map')} className="mt-2 text-xs text-amber-400 hover:underline">
            {map.outside.length} posición(es) fuera de la región — ver en el mapa
          </button>
        )}
      </div>

      {overview.unknownTypes.length > 0 && (
        <div className="rounded-xl border border-amber-900/50 bg-amber-500/5 p-4">
          <p className="text-sm text-amber-300 flex items-center gap-2">
            <AlertTriangle size={15} /> Tipos que el editor no conoce
          </p>
          <p className="text-xs text-amber-400/70 mt-1">
            O hay un typo en el YAML, o el plugin agregó tipos nuevos y hay que sumarlos a{' '}
            <code>src/schema/registry.ts</code>. Se conservan al exportar, pero no se pueden editar con formulario.
          </p>
          <div className="mt-2">
            <Chips items={overview.unknownTypes} empty="" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
          <p className="text-xs font-semibold text-zinc-300">Acciones más usadas</p>
          {overview.topActions.length === 0 && <p className="text-xs text-zinc-600">Todavía no hay acciones.</p>}
          {overview.topActions.map((row) => (
            <div key={row.key} className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-300">{row.label}</span>
                <span className="text-zinc-500 tabular-nums">{row.count}</span>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div className="h-full rounded-full bg-amber-500/70" style={{ width: `${(row.count / maxAction) * 100}%` }} />
              </div>
            </div>
          ))}
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-4">
          <div>
            <p className="text-xs font-semibold text-zinc-300 mb-2">Mobs que spawnea</p>
            <Chips items={overview.mobIds} empty="Ninguna acción spawn_mob todavía." />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-300 mb-2">Variables definidas</p>
            <Chips items={overview.variables} empty="Ninguna variable definida en scripts." />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-300 mb-2">Eventos escuchados</p>
            <Chips items={overview.events.map((e) => `${e.key} (${e.count})`)} empty="Ningún script todavía." />
          </div>
        </section>
      </div>

      <button
        onClick={() => onGoTo('flow')}
        className="w-full rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition"
      >
        Ver el flujo completo de stages y levels →
      </button>
    </div>
  );
}
