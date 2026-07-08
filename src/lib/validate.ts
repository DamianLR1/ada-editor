import type { DungeonProject } from '../schema/project';
import type { LoadedFile, ActionInstance, ConditionInstance } from '../schema/types';

export interface ValidationIssue {
  severity: 'error' | 'warning';
  location: string;   // ej. "Stage stage1-1 > script llegada > action set_stage"
  message: string;
}

function fileId(fileName: string): string {
  return fileName.replace(/\.ya?ml$/i, '');
}

function collectDefinedVariables(files: LoadedFile[]): Set<string> {
  const vars = new Set<string>();
  files.forEach((f) => {
    f.handlers.forEach((h) => {
      h.actions.forEach((a) => {
        if (a.type === 'define_variable') {
          const list = a.values['Variables'] || [];
          (list as any[]).forEach((v) => vars.add(v.name));
        }
        if (a.type === 'create_var' && a.values['Name']) {
          vars.add(String(a.values['Name']));
        }
      });
    });
  });
  return vars;
}

function checkAction(
  a: ActionInstance,
  location: string,
  ctx: {
    stageIds: Set<string>;
    levelIds: Set<string>;
    rewardIds: Set<string>;
    lootChestIds: Set<string>;
    spotIds: Set<string>;
    spawnerIds: Set<string>;
    taskIdsInThisStage: Set<string> | null; // null si es un Level (no aplica)
    variableNames: Set<string>;
  },
  issues: ValidationIssue[]
) {
  const loc = `${location} > action "${a.name}" (${a.type})`;

  const checkRef = (value: any, set: Set<string>, label: string) => {
    const v = String(value ?? '').trim();
    if (!v) {
      issues.push({ severity: 'warning', location: loc, message: `${label} está vacío.` });
      return;
    }
    if (!set.has(v)) {
      issues.push({ severity: 'error', location: loc, message: `${label} "${v}" no existe.` });
    }
  };

  switch (a.type) {
    case 'set_stage':
      checkRef(a.values['StageId'], ctx.stageIds, 'StageId');
      break;
    case 'set_level':
      checkRef(a.values['LevelId'], ctx.levelIds, 'LevelId');
      break;
    case 'give_reward':
      checkRef(a.values['RewardId'], ctx.rewardIds, 'RewardId');
      break;
    case 'generate_loot':
      if (a.values['Specific']) {
        const ids: string[] = a.values['LootChestIds'] || [];
        ids.filter(Boolean).forEach((id) => checkRef(id, ctx.lootChestIds, `LootChestIds (${id})`));
      }
      break;
    case 'set_spot':
    case 'reset_spot':
      if (ctx.spotIds.size > 0) checkRef(a.values['SpotId'], ctx.spotIds, 'SpotId');
      break;
    case 'spawn_mob':
      if (a.values['SpawnerId'] && ctx.spawnerIds.size > 0) {
        checkRef(a.values['SpawnerId'], ctx.spawnerIds, 'SpawnerId');
      }
      break;
    case 'add_task':
    case 'remove_task':
      if (ctx.taskIdsInThisStage) checkRef(a.values['TaskId'], ctx.taskIdsInThisStage, 'TaskId');
      break;
    case 'modify_var':
      checkRef(a.values['Variable'], ctx.variableNames, 'Variable');
      break;
    case 'reset_variable': {
      const names: string[] = a.values['Variables'] || [];
      names.filter(Boolean).forEach((n) => checkRef(n, ctx.variableNames, `Variable (${n})`));
      break;
    }
  }
}

function checkCondition(
  c: ConditionInstance,
  location: string,
  ctx: { variableNames: Set<string> },
  issues: ValidationIssue[]
) {
  if (c.type === 'var_value') {
    const v = String(c.values['Variable'] ?? '').trim();
    if (v && !ctx.variableNames.has(v)) {
      issues.push({
        severity: 'error',
        location: `${location} > condition "${c.name}" (var_value)`,
        message: `Variable "${v}" no está definida por ninguna acción define_variable en el proyecto.`,
      });
    }
  }
}

export function validateProject(project: DungeonProject): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const stageIds = new Set(project.stages.map((s) => fileId(s.fileName)));
  const levelIds = new Set(project.levels.map((l) => fileId(l.fileName)));
  const rewardIds = new Set(project.rewards.map((r) => fileId(r.fileName)));
  const lootChestIds = new Set(project.lootChests.map((c) => fileId(c.fileName)));
  const spotIds = new Set(
    project.passthroughFiles
      .filter((f) => f.path.toLowerCase().startsWith('spots/') && f.path.toLowerCase().endsWith('.yml'))
      .map((f) => fileId(f.path.split('/').pop()!))
  );
  const spawnerIds = new Set(Object.keys(project.configRaw?.Spawners || {}));
  const variableNames = collectDefinedVariables([...project.levels, ...project.stages]);

  // Config general
  const startStage = String(project.configRaw?.StartStage ?? '').trim();
  if (startStage && !stageIds.has(startStage)) {
    issues.push({ severity: 'error', location: 'Configuración general > StartStage', message: `El stage inicial "${startStage}" no existe.` });
  }
  const startLevel = String(project.configRaw?.StartLevel ?? '').trim();
  if (startLevel && !levelIds.has(startLevel)) {
    issues.push({ severity: 'error', location: 'Configuración general > StartLevel', message: `El nivel inicial "${startLevel}" no existe.` });
  }

  const checkFile = (file: LoadedFile, kindLabel: string) => {
    const taskIdsInThisStage = file.kind === 'stage' ? new Set(file.tasks.map((t) => t.name)) : null;
    file.handlers.forEach((h) => {
      const location = `${kindLabel} ${fileId(file.fileName)} > script "${h.name}"`;
      h.conditions.forEach((c) => checkCondition(c, location, { variableNames }, issues));
      h.actions.forEach((a) =>
        checkAction(
          a,
          location,
          { stageIds, levelIds, rewardIds, lootChestIds, spotIds, spawnerIds, taskIdsInThisStage, variableNames },
          issues
        )
      );
    });
  };

  project.levels.forEach((l) => checkFile(l, 'Level'));
  project.stages.forEach((s) => checkFile(s, 'Stage'));

  return issues;
}
