// Números del proyecto para el panel de resumen. Todo se deriva de lo ya
// parseado: no lee archivos ni vuelve a tocar el YAML.

import type { DungeonProject } from '../schema/project';
import type { LoadedFile } from '../schema/types';
import { getActionDef, getConditionDef, getTaskDef } from '../schema/registry';

export interface Tally {
  key: string;
  label: string;
  count: number;
}

export interface Overview {
  levels: number;
  stages: number;
  rewards: number;
  lootChests: number;
  passthrough: number;

  scripts: number;
  actions: number;
  conditions: number;
  tasks: number;

  spawnerGroups: number;
  spawnerPositions: number;

  mobIds: string[];
  variables: string[];

  topActions: Tally[];
  events: Tally[];
  unknownTypes: string[]; // Type que el registry no conoce: o es un typo, o el plugin cambió
}

function tally(counts: Map<string, number>, label: (key: string) => string): Tally[] {
  return [...counts.entries()]
    .map(([key, count]) => ({ key, label: label(key), count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

export function computeOverview(project: DungeonProject): Overview {
  const files: LoadedFile[] = [...project.levels, ...project.stages];

  let scripts = 0;
  let actions = 0;
  let conditions = 0;
  let tasks = 0;

  const actionCounts = new Map<string, number>();
  const eventCounts = new Map<string, number>();
  const mobIds = new Set<string>();
  const variables = new Set<string>();
  const unknown = new Set<string>();

  files.forEach((file) => {
    tasks += file.tasks.length;
    file.tasks.forEach((t) => {
      if (t.type && !getTaskDef(t.type)) unknown.add(`task:${t.type}`);
    });

    file.handlers.forEach((handler) => {
      scripts += 1;
      eventCounts.set(handler.event, (eventCounts.get(handler.event) ?? 0) + 1);

      handler.conditions.forEach((c) => {
        conditions += 1;
        if (c.type && !getConditionDef(c.type)) unknown.add(`condition:${c.type}`);
      });

      handler.actions.forEach((a) => {
        actions += 1;
        actionCounts.set(a.type, (actionCounts.get(a.type) ?? 0) + 1);
        if (a.type && !getActionDef(a.type)) unknown.add(`action:${a.type}`);

        if (a.type === 'spawn_mob' && a.values['MobId']) mobIds.add(String(a.values['MobId']));
        if (a.type === 'create_var' && a.values['Name']) variables.add(String(a.values['Name']));
        if (a.type === 'define_variable') {
          (a.values['Variables'] || []).forEach((v: any) => v?.name && variables.add(String(v.name)));
        }
      });
    });
  });

  const spawners = project.configRaw?.Spawners || {};
  const spawnerGroups = Object.keys(spawners).length;
  const spawnerPositions = Object.keys(spawners).reduce((sum, id) => {
    const positions = spawners[id]?.Positions;
    return sum + (Array.isArray(positions) ? positions.length : 0);
  }, 0);

  return {
    levels: project.levels.length,
    stages: project.stages.length,
    rewards: project.rewards.length,
    lootChests: project.lootChests.length,
    passthrough: project.passthroughFiles.length,

    scripts,
    actions,
    conditions,
    tasks,

    spawnerGroups,
    spawnerPositions,

    mobIds: [...mobIds].sort(),
    variables: [...variables].sort(),

    topActions: tally(actionCounts, (key) => getActionDef(key)?.label ?? key).slice(0, 8),
    events: tally(eventCounts, (key) => key),
    unknownTypes: [...unknown].sort(),
  };
}
