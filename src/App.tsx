import { useMemo, useRef, useState } from 'react';
import { FolderOpen, Download, Swords, Plus, Settings, Trash2, Shield, Ghost, ShieldCheck, GitBranch, BookOpen } from 'lucide-react';
import type { DungeonProject } from './schema/project';
import { emptyProject } from './schema/project';
import { newEmptyFile } from './yaml/parser';
import { importDungeonFolder } from './yaml/folderImport';
import { exportDungeonZip, downloadBlob } from './yaml/folderExport';
import { newRewardFile } from './yaml/rewardParser';
import { newLootChestFile } from './yaml/lootChestParser';
import type { GlobalEntityFile } from './yaml/globalEntities';
import { parseGlobalFiles, exportGlobalZip } from './yaml/globalEntities';
import { KIT_FIELDS, MOB_TEMPLATE_FIELDS } from './schema/globalSchema';
import { DungeonConfigForm } from './components/DungeonConfigForm';
import { LevelEditorView } from './components/LevelEditorView';
import { StageEditorView } from './components/StageEditorView';
import { RewardEditorView } from './components/RewardEditorView';
import { LootChestEditorView } from './components/LootChestEditorView';
import { GlobalEntityForm } from './components/GlobalEntityForm';
import { ValidationView } from './components/ValidationView';
import { FlowView } from './components/FlowView';
import { ForkReferenceView } from './components/ForkReferenceView';
import { validateProject } from './lib/validate';
import { computeFlow } from './lib/flow';

type Selection =
  | { type: 'config' }
  | { type: 'validation' }
  | { type: 'flow' }
  | { type: 'level'; index: number }
  | { type: 'stage'; index: number }
  | { type: 'reward'; index: number }
  | { type: 'lootchest'; index: number }
  | { type: 'kit'; index: number }
  | { type: 'mobtemplate'; index: number }
  | { type: 'reference' };

export default function App() {
  const [project, setProject] = useState<DungeonProject | null>(null);
  const [kits, setKits] = useState<GlobalEntityFile[]>([]);
  const [mobTemplates, setMobTemplates] = useState<GlobalEntityFile[]>([]);
  const [selection, setSelection] = useState<Selection>({ type: 'config' });
  const [error, setError] = useState<string | null>(null);

  const validationIssues = useMemo(() => (project ? validateProject(project) : []), [project]);
  const flowNodes = useMemo(() => (project ? computeFlow(project) : []), [project]);

  const folderInputRef = useRef<HTMLInputElement>(null);
  const kitsInputRef = useRef<HTMLInputElement>(null);
  const mobsInputRef = useRef<HTMLInputElement>(null);

  const handleImportFolder = async (fileList: FileList) => {
    try {
      const proj = await importDungeonFolder(fileList);
      setProject(proj);
      setSelection({ type: 'config' });
      setError(null);
    } catch (err) {
      setError('No se pudo importar la carpeta: ' + (err as Error).message);
    }
  };

  const handleExport = async () => {
    if (!project) return;
    const blob = await exportDungeonZip(project);
    downloadBlob(blob, `${project.dungeonName}.zip`);
  };

  const handleImportKits = async (fileList: FileList) => {
    try {
      const parsed = await parseGlobalFiles(fileList);
      setKits([...kits, ...parsed]);
    } catch (err) {
      setError('No se pudieron importar los kits: ' + (err as Error).message);
    }
  };

  const handleImportMobs = async (fileList: FileList) => {
    try {
      const parsed = await parseGlobalFiles(fileList);
      setMobTemplates([...mobTemplates, ...parsed]);
    } catch (err) {
      setError('No se pudieron importar los mob templates: ' + (err as Error).message);
    }
  };

  const handleExportGlobal = async () => {
    const blob = await exportGlobalZip(kits, mobTemplates);
    downloadBlob(blob, 'adaforge-globales.zip');
  };

  const addLevel = () => {
    if (!project) return;
    const name = window.prompt('Nombre del archivo (sin .yml):', 'nuevo_nivel');
    if (!name) return;
    setProject({ ...project, levels: [...project.levels, newEmptyFile(`${name}.yml`, 'level')] });
    setSelection({ type: 'level', index: project.levels.length });
  };

  const addStage = () => {
    if (!project) return;
    const name = window.prompt('Nombre del archivo (sin .yml):', 'nuevo_stage');
    if (!name) return;
    setProject({ ...project, stages: [...project.stages, newEmptyFile(`${name}.yml`, 'stage')] });
    setSelection({ type: 'stage', index: project.stages.length });
  };

  const addReward = () => {
    if (!project) return;
    const name = window.prompt('Nombre del archivo (sin .yml):', 'nueva_recompensa');
    if (!name) return;
    setProject({ ...project, rewards: [...project.rewards, newRewardFile(`${name}.yml`)] });
    setSelection({ type: 'reward', index: project.rewards.length });
  };

  const addLootChest = () => {
    if (!project) return;
    const name = window.prompt('Nombre del archivo (sin .yml):', 'nuevo_cofre');
    if (!name) return;
    setProject({ ...project, lootChests: [...project.lootChests, newLootChestFile(`${name}.yml`)] });
    setSelection({ type: 'lootchest', index: project.lootChests.length });
  };

  const addKit = () => {
    const name = window.prompt('Nombre del archivo (sin .yml):', 'nuevo_kit');
    if (!name) return;
    setKits([...kits, { fileName: `${name}.yml`, raw: { Name: name } }]);
    setSelection({ type: 'kit', index: kits.length });
  };

  const addMobTemplate = () => {
    const name = window.prompt('Nombre del archivo (sin .yml):', 'nuevo_mob');
    if (!name) return;
    setMobTemplates([...mobTemplates, { fileName: `${name}.yml`, raw: { EntityType: 'ZOMBIE' } }]);
    setSelection({ type: 'mobtemplate', index: mobTemplates.length });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3 flex-wrap">
          <div className="h-9 w-9 rounded-lg bg-amber-500/10 border border-amber-600/40 flex items-center justify-center">
            <Swords size={18} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-zinc-50">ADAForge</h1>
            <p className="text-xs text-zinc-500">Editor visual para AdvancedDungeonArena - Fase 3</p>
          </div>
          <div className="flex-1" />
          <input
            ref={folderInputRef}
            type="file"
            // @ts-ignore
            webkitdirectory=""
            directory=""
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleImportFolder(e.target.files)}
          />
          <button
            onClick={() => folderInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-3 py-1.5 text-sm"
          >
            <FolderOpen size={15} /> Importar carpeta de dungeon
          </button>
          <button
            onClick={() => {
              const name = window.prompt('Nombre de la dungeon:', 'NuevaDungeon');
              if (name) {
                setProject(emptyProject(name));
                setSelection({ type: 'config' });
              }
            }}
            className="flex items-center gap-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-3 py-1.5 text-sm"
          >
            <Plus size={15} /> Nueva dungeon
          </button>
          {project && (
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 rounded-md bg-amber-600 hover:bg-amber-500 text-zinc-950 font-medium px-3 py-1.5 text-sm"
            >
              <Download size={15} /> Exportar dungeon .zip
            </button>
          )}
        </div>
      </header>

      {error && <p className="max-w-7xl mx-auto px-6 pt-4 text-sm text-red-400">{error}</p>}

      <div className="max-w-7xl mx-auto px-6 py-6 flex gap-6">
        <aside className="w-64 shrink-0 space-y-5">
          {project && (
            <>
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-500 font-semibold px-1 mb-1">{project.dungeonName}</p>
                <button
                  onClick={() => setSelection({ type: 'config' })}
                  className={`w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-left ${
                    selection.type === 'config' ? 'bg-amber-500/15 text-amber-300' : 'text-zinc-300 hover:bg-zinc-900'
                  }`}
                >
                  <Settings size={15} /> Configuración general
                </button>
                <button
                  onClick={() => setSelection({ type: 'validation' })}
                  className={`w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-left ${
                    selection.type === 'validation' ? 'bg-amber-500/15 text-amber-300' : 'text-zinc-300 hover:bg-zinc-900'
                  }`}
                >
                  <ShieldCheck size={15} /> Validación
                  {validationIssues.length > 0 && (
                    <span className="ml-auto text-[10px] rounded-full bg-red-500/20 text-red-300 px-1.5 py-0.5">
                      {validationIssues.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setSelection({ type: 'flow' })}
                  className={`w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-left ${
                    selection.type === 'flow' ? 'bg-amber-500/15 text-amber-300' : 'text-zinc-300 hover:bg-zinc-900'
                  }`}
                >
                  <GitBranch size={15} /> Flujo del dungeon
                </button>
              </div>

              <SidebarList
                label="Niveles"
                items={project.levels.map((l) => String(l.raw.Name ?? l.fileName))}
                selectedIndex={selection.type === 'level' ? selection.index : -1}
                onSelect={(i) => setSelection({ type: 'level', index: i })}
                onAdd={addLevel}
                onRemove={(i) => {
                  setProject({ ...project, levels: project.levels.filter((_, idx) => idx !== i) });
                  setSelection({ type: 'config' });
                }}
              />

              <SidebarList
                label="Stages"
                items={project.stages.map((s) => String(s.raw.Name ?? s.fileName))}
                selectedIndex={selection.type === 'stage' ? selection.index : -1}
                onSelect={(i) => setSelection({ type: 'stage', index: i })}
                onAdd={addStage}
                onRemove={(i) => {
                  setProject({ ...project, stages: project.stages.filter((_, idx) => idx !== i) });
                  setSelection({ type: 'config' });
                }}
              />

              <SidebarList
                label="Rewards"
                items={project.rewards.map((r) => r.name)}
                selectedIndex={selection.type === 'reward' ? selection.index : -1}
                onSelect={(i) => setSelection({ type: 'reward', index: i })}
                onAdd={addReward}
                onRemove={(i) => {
                  setProject({ ...project, rewards: project.rewards.filter((_, idx) => idx !== i) });
                  setSelection({ type: 'config' });
                }}
              />

              <SidebarList
                label="Loot Chests"
                items={project.lootChests.map((c) => c.fileName)}
                selectedIndex={selection.type === 'lootchest' ? selection.index : -1}
                onSelect={(i) => setSelection({ type: 'lootchest', index: i })}
                onAdd={addLootChest}
                onRemove={(i) => {
                  setProject({ ...project, lootChests: project.lootChests.filter((_, idx) => idx !== i) });
                  setSelection({ type: 'config' });
                }}
              />

              {project.passthroughFiles.length > 0 && (
                <div className="text-[11px] text-zinc-600 px-1">
                  {project.passthroughFiles.length} archivo(s) adicionales (spots) se conservan sin editar.
                </div>
              )}
              <div className="border-t border-zinc-800" />
            </>
          )}

          <div>
            <button
              onClick={() => setSelection({ type: 'reference' })}
              className={`w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-left ${
                selection.type === 'reference' ? 'bg-amber-500/15 text-amber-300' : 'text-zinc-300 hover:bg-zinc-900'
              }`}
            >
              <BookOpen size={15} /> Referencia del fork
            </button>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500 font-semibold px-1 mb-1">Globales (fuera de la dungeon)</p>
            <input
              ref={kitsInputRef}
              type="file"
              accept=".yml,.yaml"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleImportKits(e.target.files)}
            />
            <input
              ref={mobsInputRef}
              type="file"
              accept=".yml,.yaml"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleImportMobs(e.target.files)}
            />

            <SidebarList
              label="Kits"
              icon={<Shield size={13} />}
              items={kits.map((k) => String(k.raw.Name ?? k.fileName))}
              selectedIndex={selection.type === 'kit' ? selection.index : -1}
              onSelect={(i) => setSelection({ type: 'kit', index: i })}
              onAdd={addKit}
              onRemove={(i) => setKits(kits.filter((_, idx) => idx !== i))}
              onImport={() => kitsInputRef.current?.click()}
            />

            <SidebarList
              label="Mob Templates"
              icon={<Ghost size={13} />}
              items={mobTemplates.map((m) => String(m.raw.EntityType ?? m.fileName))}
              selectedIndex={selection.type === 'mobtemplate' ? selection.index : -1}
              onSelect={(i) => setSelection({ type: 'mobtemplate', index: i })}
              onAdd={addMobTemplate}
              onRemove={(i) => setMobTemplates(mobTemplates.filter((_, idx) => idx !== i))}
              onImport={() => mobsInputRef.current?.click()}
            />

            {(kits.length > 0 || mobTemplates.length > 0) && (
              <button
                onClick={handleExportGlobal}
                className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-3 py-1.5 text-xs"
              >
                <Download size={13} /> Exportar globales .zip
              </button>
            )}
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          {!project && selection.type === 'config' && kits.length === 0 && mobTemplates.length === 0 && (
            <div className="rounded-xl border border-dashed border-zinc-800 p-12 text-center text-zinc-500 text-sm">
              Importá la carpeta completa de una dungeon, o creá una nueva, para empezar. También podés cargar Kits o
              Mob Templates globales desde el panel de la izquierda sin necesidad de una dungeon abierta.
            </div>
          )}

          {selection.type === 'reference' && <ForkReferenceView />}

          {project && selection.type === 'config' && (
            <DungeonConfigForm raw={project.configRaw} onChange={(raw) => setProject({ ...project, configRaw: raw })} />
          )}
          {project && selection.type === 'validation' && <ValidationView issues={validationIssues} />}
          {project && selection.type === 'flow' && (
            <FlowView
              nodes={flowNodes}
              startStage={String(project.configRaw?.StartStage ?? '')}
              startLevel={String(project.configRaw?.StartLevel ?? '')}
            />
          )}
          {project && selection.type === 'level' && project.levels[selection.index] && (
            <LevelEditorView
              level={project.levels[selection.index]}
              onChange={(l) => setProject({ ...project, levels: project.levels.map((x, i) => (i === selection.index ? l : x)) })}
            />
          )}
          {project && selection.type === 'stage' && project.stages[selection.index] && (
            <StageEditorView
              stage={project.stages[selection.index]}
              onChange={(s) => setProject({ ...project, stages: project.stages.map((x, i) => (i === selection.index ? s : x)) })}
            />
          )}
          {project && selection.type === 'reward' && project.rewards[selection.index] && (
            <RewardEditorView
              reward={project.rewards[selection.index]}
              onChange={(r) => setProject({ ...project, rewards: project.rewards.map((x, i) => (i === selection.index ? r : x)) })}
            />
          )}
          {project && selection.type === 'lootchest' && project.lootChests[selection.index] && (
            <LootChestEditorView
              chest={project.lootChests[selection.index]}
              onChange={(c) => setProject({ ...project, lootChests: project.lootChests.map((x, i) => (i === selection.index ? c : x)) })}
            />
          )}
          {selection.type === 'kit' && kits[selection.index] && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                <Shield size={15} className="text-sky-400" /> Kit — {kits[selection.index].fileName}
              </h2>
              <GlobalEntityForm
                fields={KIT_FIELDS}
                raw={kits[selection.index].raw}
                onChange={(raw) => setKits(kits.map((k, i) => (i === selection.index ? { ...k, raw } : k)))}
              />
            </div>
          )}
          {selection.type === 'mobtemplate' && mobTemplates[selection.index] && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                <Ghost size={15} className="text-emerald-400" /> Mob Template — {mobTemplates[selection.index].fileName}
              </h2>
              <GlobalEntityForm
                fields={MOB_TEMPLATE_FIELDS}
                raw={mobTemplates[selection.index].raw}
                onChange={(raw) => setMobTemplates(mobTemplates.map((m, i) => (i === selection.index ? { ...m, raw } : m)))}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function SidebarList({
  label,
  icon,
  items,
  selectedIndex,
  onSelect,
  onAdd,
  onRemove,
  onImport,
}: {
  label: string;
  icon?: React.ReactNode;
  items: string[];
  selectedIndex: number;
  onSelect: (i: number) => void;
  onAdd: () => void;
  onRemove: (i: number) => void;
  onImport?: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between px-1 mb-1">
        <p className="text-xs uppercase tracking-wide text-zinc-500 font-semibold flex items-center gap-1">
          {icon} {label} ({items.length})
        </p>
        <div className="flex items-center gap-1.5">
          {onImport && (
            <button onClick={onImport} className="text-zinc-500 hover:text-amber-400" title="Importar archivos">
              <FolderOpen size={13} />
            </button>
          )}
          <button onClick={onAdd} className="text-zinc-500 hover:text-amber-400" title="Agregar nuevo">
            <Plus size={14} />
          </button>
        </div>
      </div>
      <div className="space-y-0.5">
        {items.map((name, i) => (
          <div key={i} className="group flex items-center">
            <button
              onClick={() => onSelect(i)}
              className={`flex-1 text-left rounded-md px-3 py-1.5 text-sm truncate ${
                selectedIndex === i ? 'bg-amber-500/15 text-amber-300' : 'text-zinc-400 hover:bg-zinc-900'
              }`}
            >
              {name}
            </button>
            <button onClick={() => onRemove(i)} className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 px-1">
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
