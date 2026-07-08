import * as yaml from 'js-yaml';
import type {
  ActionInstance,
  ConditionInstance,
  EventHandlerInstance,
  LoadedFile,
  TaskInstance,
} from '../schema/types';
import { nextUid } from '../schema/types';
import { getActionDef, getConditionDef, getTaskDef, TASK_PARAMS_FIELDS } from '../schema/registry';
import { parseValuesFromRaw, defaultValuesForType, parseValuesFromFields, defaultValuesForFields } from '../schema/fields';

function parseTask(name: string, raw: any): TaskInstance {
  const type = String(raw?.Type ?? '');
  const typeDef = getTaskDef(type);
  const values = {
    ...parseValuesFromFields(TASK_PARAMS_FIELDS, raw),
    ...(typeDef ? parseValuesFromRaw(typeDef, raw) : {}),
  };
  return { uid: nextUid(), name, type, values };
}

function parseCondition(name: string, raw: any): ConditionInstance {
  const type = String(raw?.Type ?? '');
  const typeDef = getConditionDef(type);
  const values = typeDef ? parseValuesFromRaw(typeDef, raw) : { ...raw };
  return {
    uid: nextUid(),
    name,
    type,
    cached: !!raw?.Cached,
    values,
  };
}

function parseAction(name: string, raw: any): ActionInstance {
  const type = String(raw?.Type ?? '');
  const typeDef = getActionDef(type);
  const values = typeDef ? parseValuesFromRaw(typeDef, raw) : { ...raw };
  return {
    uid: nextUid(),
    name,
    type,
    runIf: raw?.RunIf ?? '',
    chance: raw?.Chance !== undefined ? Number(raw.Chance) : 100,
    values,
  };
}

function parseHandler(name: string, raw: any): EventHandlerInstance {
  const conditions: ConditionInstance[] = [];
  const conditionsRaw = raw?.Conditions || {};
  Object.keys(conditionsRaw).forEach((cName) => {
    conditions.push(parseCondition(cName, conditionsRaw[cName]));
  });

  const actions: ActionInstance[] = [];
  const actionsRaw = raw?.Actions || {};
  Object.keys(actionsRaw).forEach((aName) => {
    actions.push(parseAction(aName, actionsRaw[aName]));
  });

  return {
    uid: nextUid(),
    name,
    event: raw?.Event ?? 'DUNGEON_TICK',
    conditions,
    actions,
  };
}

export function parseYamlFile(fileName: string, text: string): LoadedFile {
  const raw = (yaml.load(text) as Record<string, any>) || {};

  const handlers: EventHandlerInstance[] = [];
  const rawHandlers = raw?.EventHandlers || {};
  Object.keys(rawHandlers).forEach((hName) => {
    handlers.push(parseHandler(hName, rawHandlers[hName]));
  });

  const tasks: TaskInstance[] = [];
  const rawTasks = raw?.Tasks || {};
  Object.keys(rawTasks).forEach((tName) => {
    tasks.push(parseTask(tName, rawTasks[tName]));
  });

  let kind: LoadedFile['kind'] = 'unknown';
  if ('SpawnPos' in raw) kind = 'level';
  else if ('Tasks' in raw) kind = 'stage';

  return { kind, raw, handlers, tasks, fileName };
}

export function newEmptyFile(fileName: string, kind: 'level' | 'stage'): LoadedFile {
  const raw: Record<string, any> =
    kind === 'level'
      ? { Name: 'Nuevo Nivel', Description: 'Level description.', SpawnPos: '0,64,0,0,0' }
      : { Name: 'Nuevo Stage', Description: '', Tasks: {} };
  return { kind, raw, handlers: [], tasks: [], fileName };
}

export function newHandler(): EventHandlerInstance {
  return {
    uid: nextUid(),
    name: 'nuevo_script',
    event: 'DUNGEON_TICK',
    conditions: [],
    actions: [],
  };
}

export function newCondition(type: string): ConditionInstance {
  const typeDef = getConditionDef(type);
  return {
    uid: nextUid(),
    name: type,
    type,
    cached: false,
    values: typeDef ? defaultValuesForType(typeDef) : {},
  };
}

export function newAction(type: string): ActionInstance {
  const typeDef = getActionDef(type);
  return {
    uid: nextUid(),
    name: type,
    type,
    runIf: '',
    chance: 100,
    values: typeDef ? defaultValuesForType(typeDef) : {},
  };
}

export function newTask(type: string): TaskInstance {
  const typeDef = getTaskDef(type);
  return {
    uid: nextUid(),
    name: type,
    type,
    values: {
      ...defaultValuesForFields(TASK_PARAMS_FIELDS),
      ...(typeDef ? defaultValuesForType(typeDef) : {}),
    },
  };
}
