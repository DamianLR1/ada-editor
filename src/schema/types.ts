// Modelo interno de un script (EventHandler) de ADA.
//
// IMPORTANTE (confirmado en DungeonEventHandler.java del codigo fuente real):
// - "RunIf" y "Chance" viven a nivel de cada ACTION (no del handler completo,
//   y no son parte de los campos propios de cada tipo de accion).
// - "Cached" vive a nivel de cada CONDITION (no es un campo propio del tipo).
// - Tanto Conditions como Actions llevan su propio "Type" dentro del YAML.
//
// Los "values" de Condition/Action se guardan como objeto plano
// (Record<string, any>) siguiendo las keys EXACTAS del plugin (definidas en
// registry.ts), para poder serializar 1:1 al YAML sin transformar nada.

export interface ConditionInstance {
  uid: string;              // id interno de React, no se serializa
  name: string;             // clave dentro de "Conditions" en el YAML
  type: string;             // "Type"
  cached: boolean;          // "Cached" (default false)
  values: Record<string, any>;
}

export interface ActionInstance {
  uid: string;
  name: string;             // clave dentro de "Actions" en el YAML
  type: string;             // "Type"
  runIf: string;            // "RunIf" (string vacio = sin condicion)
  chance: number;           // "Chance" (default 100)
  values: Record<string, any>;
}

export interface TaskInstance {
  uid: string;
  name: string;             // clave dentro de "Tasks" en el YAML
  type: string;              // "Type"
  values: Record<string, any>; // incluye tanto TASK_PARAMS_FIELDS como los campos propios del tipo
}

export interface EventHandlerInstance {
  uid: string;
  name: string;                       // clave dentro de "EventHandlers" en el YAML
  event: string;                       // "Event"
  conditions: ConditionInstance[];
  actions: ActionInstance[];
}

export interface LoadedFile {
  kind: 'level' | 'stage' | 'unknown';
  raw: Record<string, any>;           // objeto completo tal cual se parseo del YAML
  handlers: EventHandlerInstance[];    // EventHandlers extraidos y parseados para editar
  tasks: TaskInstance[];               // Tasks extraidas (solo aplica a Stages; vacio en Levels)
  fileName: string;
}

let uidCounter = 0;
export function nextUid(): string {
  uidCounter += 1;
  return `u${uidCounter}_${Date.now().toString(36)}`;
}
