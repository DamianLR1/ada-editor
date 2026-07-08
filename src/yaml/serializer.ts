import * as yaml from 'js-yaml';
import type { ActionInstance, ConditionInstance, EventHandlerInstance, LoadedFile, TaskInstance } from '../schema/types';
import { getActionDef, getConditionDef, getTaskDef, TASK_PARAMS_FIELDS } from '../schema/registry';
import { serializeValuesToRaw, serializeValuesToRawFields } from '../schema/fields';

function serializeTask(t: TaskInstance): any {
  const typeDef = getTaskDef(t.type);
  const paramsRaw = serializeValuesToRawFields(TASK_PARAMS_FIELDS, t.values);
  const specificRaw = typeDef ? serializeValuesToRaw(typeDef, t.values) : {};
  return { Type: t.type, ...paramsRaw, ...specificRaw };
}

function serializeCondition(c: ConditionInstance): any {
  const typeDef = getConditionDef(c.type);
  const raw = typeDef ? serializeValuesToRaw(typeDef, c.values) : { ...c.values };
  raw.Type = c.type;
  raw.Cached = c.cached;
  return raw;
}

function serializeAction(a: ActionInstance): any {
  const typeDef = getActionDef(a.type);
  const raw = typeDef ? serializeValuesToRaw(typeDef, a.values) : { ...a.values };
  raw.Type = a.type;
  if (a.runIf && a.runIf.trim() !== '') raw.RunIf = a.runIf;
  if (a.chance !== 100) raw.Chance = a.chance;
  return raw;
}

function serializeHandler(h: EventHandlerInstance): any {
  const conditions: Record<string, any> = {};
  h.conditions.forEach((c) => {
    conditions[c.name] = serializeCondition(c);
  });

  const actions: Record<string, any> = {};
  h.actions.forEach((a) => {
    actions[a.name] = serializeAction(a);
  });

  const out: Record<string, any> = { Event: h.event };
  if (Object.keys(conditions).length > 0) out.Conditions = conditions;
  if (Object.keys(actions).length > 0) out.Actions = actions;
  return out;
}

export function serializeYamlFile(file: LoadedFile): string {
  const raw = { ...file.raw };

  const handlersRaw: Record<string, any> = {};
  file.handlers.forEach((h) => {
    handlersRaw[h.name] = serializeHandler(h);
  });

  if (Object.keys(handlersRaw).length > 0) {
    raw.EventHandlers = handlersRaw;
  } else {
    delete raw.EventHandlers;
  }

  if (file.kind === 'stage') {
    const tasksRaw: Record<string, any> = {};
    file.tasks.forEach((t) => {
      tasksRaw[t.name] = serializeTask(t);
    });
    raw.Tasks = tasksRaw;
  }

  return yaml.dump(raw, { lineWidth: -1, noRefs: true });
}
