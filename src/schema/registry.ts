// ============================================================================
// ADAForge — Registry de tipos de AdvancedDungeonArena (8.5.x)
// Fuente: código fuente Java real del plugin (Core/src), NO la wiki pública
// (la wiki está incompleta: lista ~10 conditions / ~14 actions, el plugin
// real tiene 21 conditions -incl. 6 deprecadas- y 16 actions).
//
// Este archivo es la ÚNICA fuente de verdad de qué campos tiene cada tipo.
// Los formularios se generan dinámicamente a partir de acá.
// Los `id` son EXACTOS a lo que el plugin espera en el YAML. Todo lo demás
// (label, desc) es sólo para la UI y nunca se escribe al archivo.
// ============================================================================

export type FieldType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'select'
  | 'string_list'
  | 'mob_criteria'
  | 'scalable_amount'
  | 'var_definitions'
  | 'map_number'
  | 'map_string_list'
  | 'map_text'
  | 'attribute_scale_map';

export interface SelectOption {
  value: string;
  label: string;
}

export interface FieldDef {
  key: string;              // path dentro del objeto (puede tener puntos, ej. "Amount.Min")
  label: string;            // español
  desc?: string;            // español, ayuda contextual
  type: FieldType;
  options?: SelectOption[]; // para type: 'select'
  default?: unknown;
  placeholder?: string;
  showIf?: (values: Record<string, any>) => boolean; // visibilidad condicional
}

export interface TypeDef {
  id: string;               // id EXACTO del plugin
  label: string;            // español
  desc: string;              // español
  deprecated?: boolean;
  deprecatedNote?: string;
  fields: FieldDef[];
}

// ---------------------------------------------------------------------------
// Enums compartidos
// ---------------------------------------------------------------------------

// Nota: confirmado contra tu dungeon real (stage1-1.yml usa "less_or_equal"
// en minuscula) que Operator NO es un enum de Java tradicional sino un id
// tipo string (como ConditionId/ActionId), y se escribe en minuscula.
export const OPERATORS: SelectOption[] = [
  { value: 'greater_or_equal', label: '≥ (mayor o igual)' },
  { value: 'greater_than', label: '> (mayor que)' },
  { value: 'equal', label: '= (igual)' },
  { value: 'not_equal', label: '≠ (distinto)' },
  { value: 'less_or_equal', label: '≤ (menor o igual)' },
  { value: 'less_than', label: '< (menor que)' },
];

export const TARGETS: SelectOption[] = [
  { value: 'GLOBAL', label: 'Global (todo el dungeon)' },
  { value: 'ALL_PLAYERS', label: 'Todos los jugadores' },
  { value: 'ALIVE_PLAYERS', label: 'Jugadores vivos' },
  { value: 'EVENT_PLAYER', label: 'Jugador del evento' },
];

export const MOB_FACTIONS: SelectOption[] = [
  { value: 'ENEMY', label: 'Enemigo' },
  { value: 'ALLY', label: 'Aliado' },
];

export const MOB_PROVIDERS: SelectOption[] = [
  { value: 'ada', label: 'ADA (mob template propio)' },
  { value: 'mythicmobs', label: 'MythicMobs' },
];

export const VAR_OPERATIONS: SelectOption[] = [
  { value: 'PLUS', label: 'Sumar (+)' },
  { value: 'MINUS', label: 'Restar (-)' },
  { value: 'MULTIPLY', label: 'Multiplicar (×)' },
  { value: 'DIVIDE', label: 'Dividir (÷)' },
  { value: 'SET', label: 'Establecer (=)' },
];

export const SCALE_BASES: SelectOption[] = [
  { value: 'player_amount', label: 'Cantidad de jugadores' },
  { value: 'alive_player_amount', label: 'Jugadores vivos' },
  { value: 'dead_player_amount', label: 'Jugadores muertos' },
];

export const SCALE_TYPES: SelectOption[] = [
  { value: 'PLAIN', label: 'Suma (valor + escalador × base)' },
  { value: 'MULTIPLIER', label: 'Multiplicador (valor × (1 + escalador × base))' },
];

// ---------------------------------------------------------------------------
// Events (11) — DungeonEventType
// ---------------------------------------------------------------------------

export const EVENTS: SelectOption[] = [
  { value: 'DUNGEON_TICK', label: 'Tick del dungeon (cada segundo)' },
  { value: 'LEVEL_STARTED', label: 'Nivel iniciado' },
  { value: 'MOB_ELIMINATED', label: 'Mob eliminado (por cualquier causa)' },
  { value: 'MOB_KILLED', label: 'Mob asesinado (por un jugador)' },
  { value: 'MOB_SPAWNED', label: 'Mob spawneado' },
  { value: 'PLAYER_DEATH', label: 'Jugador murió' },
  { value: 'SPOT_CHANGED', label: 'Spot cambió de estado' },
  { value: 'STAGE_FINISHED', label: 'Stage finalizado' },
  { value: 'STAGE_STARTED', label: 'Stage iniciado' },
  { value: 'TASK_CREATED', label: 'Tarea creada' },
  { value: 'TASK_FINISHED', label: 'Tarea finalizada' },
];

// ---------------------------------------------------------------------------
// Conditions (21: 12 vigentes + 3 nuevas unificadas + 6 deprecadas)
// ---------------------------------------------------------------------------

const mobCriteriaFields: FieldDef[] = [
  { key: 'MobCriteria.Id', label: 'ID del mob', type: 'text', desc: 'Dejar vacío para no filtrar por ID específico' },
  { key: 'MobCriteria.Provider', label: 'Proveedor', type: 'select', options: [{ value: '', label: '(cualquiera)' }, ...MOB_PROVIDERS] },
  { key: 'MobCriteria.Faction', label: 'Facción', type: 'select', options: [{ value: '', label: '(cualquiera)' }, ...MOB_FACTIONS] },
  { key: 'MobCriteria.BornStage', label: 'Stage de nacimiento', type: 'text', desc: 'ID del stage donde nació el mob (opcional)' },
];

export const CONDITIONS: TypeDef[] = [
  {
    id: 'tick_interval',
    label: 'Intervalo de ticks',
    desc: 'Se cumple una vez cada N ticks (20 ticks = 1 segundo).',
    fields: [{ key: 'Interval', label: 'Intervalo (ticks)', type: 'number', default: 20 }],
  },
  {
    id: 'chance',
    label: 'Probabilidad',
    desc: 'Se cumple con una probabilidad aleatoria.',
    fields: [{ key: 'Chance', label: 'Probabilidad (%)', type: 'number', default: 100 }],
  },
  {
    id: 'mob_id',
    label: 'ID de mob',
    desc: 'El mob involucrado en el evento coincide con el ID indicado.',
    fields: [{ key: 'MobId', label: 'ID del mob', type: 'text', placeholder: 'ada:zombie_boss / mythicmobs:MiMob' }],
  },
  {
    id: 'task_id',
    label: 'ID de tarea',
    desc: 'La tarea involucrada en el evento coincide con el ID indicado.',
    fields: [{ key: 'TaskId', label: 'ID de la tarea', type: 'text' }],
  },
  {
    id: 'stage_id',
    label: 'ID de stage',
    desc: 'El stage actual coincide con el ID indicado.',
    fields: [{ key: 'StageId', label: 'ID del stage', type: 'text' }],
  },
  {
    id: 'spot_in_state',
    label: 'Spot en estado',
    desc: 'El spot indicado está actualmente en el estado indicado.',
    fields: [
      { key: 'SpotId', label: 'ID del spot', type: 'text' },
      { key: 'StateId', label: 'ID del estado', type: 'text' },
    ],
  },
  {
    id: 'spot_not_in_state',
    label: 'Spot NO en estado',
    desc: 'El spot indicado NO está actualmente en el estado indicado.',
    fields: [
      { key: 'SpotId', label: 'ID del spot', type: 'text' },
      { key: 'StateId', label: 'ID del estado', type: 'text' },
    ],
  },
  {
    id: 'task_present',
    label: 'Tarea presente',
    desc: 'La tarea indicada existe actualmente en el stage.',
    fields: [{ key: 'TaskId', label: 'ID de la tarea', type: 'text' }],
  },
  {
    id: 'task_not_present',
    label: 'Tarea NO presente',
    desc: 'La tarea indicada no existe actualmente en el stage.',
    fields: [{ key: 'TaskId', label: 'ID de la tarea', type: 'text' }],
  },
  {
    id: 'task_completed',
    label: 'Tarea completada',
    desc: 'La tarea indicada ya fue completada.',
    fields: [{ key: 'TaskId', label: 'ID de la tarea', type: 'text' }],
  },
  {
    id: 'task_incompleted',
    label: 'Tarea incompleta',
    desc: 'La tarea indicada todavía no fue completada.',
    fields: [{ key: 'TaskId', label: 'ID de la tarea', type: 'text' }],
  },
  {
    id: 'var_value',
    label: 'Valor de variable',
    desc: 'Compara el valor actual de una variable contra un número.',
    fields: [
      { key: 'Variable', label: 'Nombre de la variable', type: 'text' },
      { key: 'Operator', label: 'Operador', type: 'select', options: OPERATORS, default: 'equal' },
      { key: 'Value', label: 'Valor', type: 'number', default: 0 },
    ],
  },
  {
    id: 'mobs_amount',
    label: 'Cantidad de mobs vivos',
    desc: 'Compara la cantidad de mobs vivos que cumplen ciertos criterios. Reemplaza a las variantes deprecadas alive_mob_amount / alive_mobs_amount.',
    fields: [
      { key: 'Operator', label: 'Operador', type: 'select', options: OPERATORS, default: 'greater_or_equal' },
      { key: 'Value', label: 'Valor', type: 'number', default: 0 },
      ...mobCriteriaFields,
    ],
  },
  {
    id: 'mobs_killed',
    label: 'Cantidad de mobs asesinados',
    desc: 'Compara la cantidad de mobs asesinados que cumplen ciertos criterios. Reemplaza a killed_mob_amount / killed_mobs_amount.',
    fields: [
      { key: 'Operator', label: 'Operador', type: 'select', options: OPERATORS, default: 'greater_or_equal' },
      { key: 'Value', label: 'Valor', type: 'number', default: 0 },
      ...mobCriteriaFields,
    ],
  },
  {
    id: 'mobs_spawned',
    label: 'Cantidad de mobs spawneados',
    desc: 'Compara la cantidad de mobs spawneados que cumplen ciertos criterios. Reemplaza a spawned_mob_amount / spawned_mobs_amount.',
    fields: [
      { key: 'Operator', label: 'Operador', type: 'select', options: OPERATORS, default: 'greater_or_equal' },
      { key: 'Value', label: 'Valor', type: 'number', default: 0 },
      ...mobCriteriaFields,
    ],
  },
  // ---- Deprecadas (se leen si aparecen en un YAML existente, pero el editor
  // no las ofrece para crear condiciones nuevas) ----
  {
    id: 'alive_mob_amount',
    label: '(Deprecada) Cantidad de un mob vivo',
    desc: 'Variante vieja de mobs_amount filtrando por un solo MobId.',
    deprecated: true,
    deprecatedNote: 'Usá "Cantidad de mobs vivos" (mobs_amount) para condiciones nuevas.',
    fields: [
      { key: 'MobId', label: 'ID del mob', type: 'text' },
      { key: 'Operator', label: 'Operador', type: 'select', options: OPERATORS },
      { key: 'Value', label: 'Valor', type: 'number', default: 0 },
      { key: 'CheckFaction', label: 'Filtrar por facción', type: 'boolean', default: false },
      { key: 'Faction', label: 'Facción', type: 'select', options: MOB_FACTIONS, showIf: (v) => !!v['CheckFaction'] },
    ],
  },
  {
    id: 'alive_mobs_amount',
    label: '(Deprecada) Cantidad de mobs vivos',
    desc: 'Variante vieja de mobs_amount sin filtro de criterios (solo Faction opcional).',
    deprecated: true,
    deprecatedNote: 'Usá "Cantidad de mobs vivos" (mobs_amount) para condiciones nuevas.',
    fields: [
      { key: 'Operator', label: 'Operador', type: 'select', options: OPERATORS },
      { key: 'Value', label: 'Valor', type: 'number', default: 0 },
      { key: 'CheckFaction', label: 'Filtrar por facción', type: 'boolean', default: false },
      { key: 'Faction', label: 'Facción', type: 'select', options: MOB_FACTIONS, showIf: (v) => !!v['CheckFaction'] },
    ],
  },
  {
    id: 'killed_mob_amount',
    label: '(Deprecada) Cantidad de un mob asesinado',
    desc: 'Variante vieja de mobs_killed filtrando por un solo MobId.',
    deprecated: true,
    deprecatedNote: 'Usá "Cantidad de mobs asesinados" (mobs_killed) para condiciones nuevas.',
    fields: [
      { key: 'MobId', label: 'ID del mob', type: 'text' },
      { key: 'Operator', label: 'Operador', type: 'select', options: OPERATORS },
      { key: 'Value', label: 'Valor', type: 'number', default: 0 },
      { key: 'CheckFaction', label: 'Filtrar por facción', type: 'boolean', default: false },
      { key: 'Faction', label: 'Facción', type: 'select', options: MOB_FACTIONS, showIf: (v) => !!v['CheckFaction'] },
    ],
  },
  {
    id: 'killed_mobs_amount',
    label: '(Deprecada) Cantidad de mobs asesinados',
    desc: 'Variante vieja de mobs_killed sin filtro de criterios (solo Faction opcional).',
    deprecated: true,
    deprecatedNote: 'Usá "Cantidad de mobs asesinados" (mobs_killed) para condiciones nuevas.',
    fields: [
      { key: 'Operator', label: 'Operador', type: 'select', options: OPERATORS },
      { key: 'Value', label: 'Valor', type: 'number', default: 0 },
      { key: 'CheckFaction', label: 'Filtrar por facción', type: 'boolean', default: false },
      { key: 'Faction', label: 'Facción', type: 'select', options: MOB_FACTIONS, showIf: (v) => !!v['CheckFaction'] },
    ],
  },
  {
    id: 'spawned_mob_amount',
    label: '(Deprecada) Cantidad de un mob spawneado',
    desc: 'Variante vieja de mobs_spawned filtrando por un solo MobId.',
    deprecated: true,
    deprecatedNote: 'Usá "Cantidad de mobs spawneados" (mobs_spawned) para condiciones nuevas.',
    fields: [
      { key: 'MobId', label: 'ID del mob', type: 'text' },
      { key: 'Operator', label: 'Operador', type: 'select', options: OPERATORS },
      { key: 'Value', label: 'Valor', type: 'number', default: 0 },
      { key: 'CheckFaction', label: 'Filtrar por facción', type: 'boolean', default: false },
      { key: 'Faction', label: 'Facción', type: 'select', options: MOB_FACTIONS, showIf: (v) => !!v['CheckFaction'] },
    ],
  },
  {
    id: 'spawned_mobs_amount',
    label: '(Deprecada) Cantidad de mobs spawneados',
    desc: 'Variante vieja de mobs_spawned sin filtro de criterios (solo Faction opcional).',
    deprecated: true,
    deprecatedNote: 'Usá "Cantidad de mobs spawneados" (mobs_spawned) para condiciones nuevas.',
    fields: [
      { key: 'Operator', label: 'Operador', type: 'select', options: OPERATORS },
      { key: 'Value', label: 'Valor', type: 'number', default: 0 },
      { key: 'CheckFaction', label: 'Filtrar por facción', type: 'boolean', default: false },
      { key: 'Faction', label: 'Facción', type: 'select', options: MOB_FACTIONS, showIf: (v) => !!v['CheckFaction'] },
    ],
  },
];

// ---------------------------------------------------------------------------
// Actions (16) — ActionRegistry
// ---------------------------------------------------------------------------

export const ACTIONS: TypeDef[] = [
  {
    id: 'run_command',
    label: 'Ejecutar comando(s)',
    desc: 'Ejecuta uno o más comandos de consola.',
    fields: [
      { key: 'Commands', label: 'Comandos', type: 'string_list', desc: 'Uno por línea. Podés usar placeholders (%player_name%, etc.)' },
      { key: 'Target', label: 'Objetivo', type: 'select', options: TARGETS, default: 'GLOBAL' },
    ],
  },
  {
    id: 'add_task',
    label: 'Agregar tarea',
    desc: 'Agrega una tarea del stage actual (si no está agregada ya).',
    fields: [
      { key: 'TaskId', label: 'ID de la tarea', type: 'text' },
      { key: 'Replace', label: 'Reemplazar si ya existe', type: 'boolean', default: false },
    ],
  },
  {
    id: 'remove_task',
    label: 'Quitar tarea',
    desc: 'Quita una tarea activa del stage actual.',
    fields: [{ key: 'TaskId', label: 'ID de la tarea', type: 'text' }],
  },
  {
    id: 'set_stage',
    label: 'Cambiar de stage',
    desc: 'Mueve la partida al stage indicado.',
    fields: [{ key: 'StageId', label: 'ID del stage', type: 'text' }],
  },
  {
    id: 'set_level',
    label: 'Cambiar de nivel',
    desc: 'Mueve la partida al nivel indicado.',
    fields: [{ key: 'LevelId', label: 'ID del nivel', type: 'text' }],
  },
  {
    id: 'set_spot',
    label: 'Cambiar estado de spot',
    desc: 'Cambia el estado de un spot (ej. abrir/cerrar una puerta).',
    fields: [
      { key: 'SpotId', label: 'ID del spot', type: 'text' },
      { key: 'StateId', label: 'ID del estado', type: 'text' },
    ],
  },
  {
    id: 'spawn_mob',
    label: 'Spawnear mob',
    desc: 'Spawnea uno o más mobs en un spawner o ubicación.',
    fields: [
      { key: 'MobId', label: 'ID del mob', type: 'text', placeholder: 'ada:zombie_boss / mythicmobs:MiMob' },
      { key: 'Faction', label: 'Facción', type: 'select', options: MOB_FACTIONS, default: 'ENEMY' },
      { key: 'SpawnerId', label: 'ID del spawner', type: 'text', desc: 'Grupo de posiciones definido en Spawners del config.yml' },
      { key: 'Amount', label: 'Cantidad', type: 'scalable_amount' },
      { key: 'Level', label: 'Nivel del mob', type: 'scalable_amount' },
    ],
  },
  {
    id: 'dungeon_end',
    label: 'Finalizar dungeon',
    desc: 'Termina la partida actual tras una cuenta regresiva.',
    fields: [
      { key: 'Countdown', label: 'Cuenta regresiva (segundos)', type: 'number', default: 10 },
      { key: 'Completed', label: 'Victoria (completado)', type: 'boolean', default: true, desc: 'Si está apagado, se registra como derrota.' },
    ],
  },
  {
    id: 'reset_spot',
    label: 'Reiniciar spot',
    desc: 'Vuelve un spot a su estado por defecto.',
    fields: [{ key: 'SpotId', label: 'ID del spot', type: 'text' }],
  },
  {
    id: 'revive_players',
    label: 'Revivir jugadores',
    desc: 'Revive a los jugadores caídos.',
    fields: [{ key: 'Target', label: 'Objetivo', type: 'select', options: TARGETS, default: 'ALL_PLAYERS' }],
  },
  {
    id: 'give_reward',
    label: 'Entregar recompensa',
    desc: 'Entrega una recompensa (rewards/<id>.yml) a los jugadores.',
    fields: [
      { key: 'RewardId', label: 'ID de la recompensa', type: 'text' },
      { key: 'Target', label: 'Objetivo', type: 'select', options: TARGETS, default: 'ALIVE_PLAYERS' },
      { key: 'Instant', label: 'Entrega instantánea', type: 'boolean', default: false },
      { key: 'KeepOnDeath', label: 'Mantener si muere', type: 'boolean', default: true },
      { key: 'KeepOnDefeat', label: 'Mantener si se pierde', type: 'boolean', default: true },
    ],
  },
  {
    id: 'generate_loot',
    label: 'Generar botín',
    desc: 'Rellena cofres de botín (loot_chests).',
    fields: [
      { key: 'Specific', label: 'Cofres específicos', type: 'boolean', default: false, desc: 'Si está apagado, rellena TODOS los cofres del dungeon.' },
      { key: 'LootChestIds', label: 'IDs de cofres', type: 'string_list', showIf: (v) => !!v['Specific'] },
    ],
  },
  {
    id: 'define_variable',
    label: 'Definir variable(s)',
    desc: 'Crea una o más variables numéricas para usar en el dungeon.',
    fields: [{ key: 'Variables', label: 'Variables', type: 'var_definitions' }],
  },
  {
    id: 'modify_var',
    label: 'Modificar variable',
    desc: 'Modifica el valor de una variable existente.',
    fields: [
      { key: 'Variable', label: 'Nombre de la variable', type: 'text' },
      { key: 'Operation', label: 'Operación', type: 'select', options: VAR_OPERATIONS, default: 'PLUS' },
      { key: 'Value', label: 'Valor', type: 'number', default: 0 },
    ],
  },
  {
    id: 'reset_variable',
    label: 'Reiniciar variable(s)',
    desc: 'Reinicia una o más variables a su valor inicial.',
    fields: [{ key: 'Variables', label: 'Nombres de variables', type: 'string_list' }],
  },
  {
    id: 'create_var',
    label: '(Deprecada) Crear variable',
    desc: 'Variante vieja de define_variable, para una sola variable.',
    deprecated: true,
    deprecatedNote: 'Usá "Definir variable(s)" (define_variable) para acciones nuevas.',
    fields: [
      { key: 'Name', label: 'Nombre', type: 'text' },
      { key: 'InitialValue', label: 'Valor inicial', type: 'number', default: 0 },
      { key: 'Limited', label: 'Con límites', type: 'boolean', default: false },
      { key: 'MinValue', label: 'Mínimo', type: 'number', default: -1, showIf: (v) => !!v['Limited'] },
      { key: 'MaxValue', label: 'Máximo', type: 'number', default: -1, showIf: (v) => !!v['Limited'] },
    ],
  },
];

export function getConditionDef(id: string): TypeDef | undefined {
  return CONDITIONS.find((c) => c.id === id);
}

export function getActionDef(id: string): TypeDef | undefined {
  return ACTIONS.find((a) => a.id === id);
}

// ---------------------------------------------------------------------------
// Tasks (6) — TaskRegistry / TaskId. Van dentro de Stage.Tasks.<id>
// Campos comunes (TaskParams) se declaran aparte y se combinan con los
// campos propios de cada tipo al momento de renderizar (ver TaskCard).
// ---------------------------------------------------------------------------

export const TASK_PARAMS_FIELDS: FieldDef[] = [
  { key: 'Display', label: 'Texto mostrado al jugador', type: 'text', placeholder: 'Ej: Mata 10 zombies' },
  { key: 'Amount.Min', label: 'Cantidad mínima', type: 'number', default: 1 },
  { key: 'Amount.Max', label: 'Cantidad máxima', type: 'number', default: 1 },
  { key: 'PerPlayer', label: 'Progreso individual (no compartido)', type: 'boolean', default: false },
  { key: 'AutoAdd', label: 'Agregar automáticamente al iniciar el stage', type: 'boolean', default: true },
];

const areaTaskFields: FieldDef[] = [
  { key: 'Location', label: 'Ubicación (x,y,z)', type: 'text', placeholder: '-64,13,-1728' },
  { key: 'Radius', label: 'Radio', type: 'number', default: 3 },
  { key: 'Height', label: 'Altura', type: 'number', default: 3 },
];

export const TASKS: TypeDef[] = [
  {
    id: 'kill_mob',
    label: 'Matar un mob específico',
    desc: 'Matar una cantidad de un mob con un ID determinado.',
    fields: [{ key: 'MobId', label: 'ID del mob', type: 'text', placeholder: 'mythicmobs:MiMob' }],
  },
  {
    id: 'kill_mobs',
    label: 'Matar cualquier mob',
    desc: 'Matar cualquier cantidad de mobs, de cualquier tipo.',
    fields: [],
  },
  {
    id: 'kill_leftovers',
    label: 'Matar mobs restantes',
    desc: 'Matar todos los mobs que quedan vivos en el stage.',
    fields: [],
  },
  {
    id: 'move_to',
    label: 'Llegar a una zona',
    desc: 'El jugador debe llegar a una ubicación dentro de un radio/altura.',
    fields: areaTaskFields,
  },
  {
    id: 'stay_in',
    label: 'Permanecer en una zona',
    desc: 'El jugador debe permanecer dentro de una zona durante un tiempo (Amount = segundos).',
    fields: areaTaskFields,
  },
  {
    id: 'tick_pass',
    label: 'Esperar tiempo',
    desc: 'Simplemente esperar N segundos/ticks (Amount = cantidad).',
    fields: [],
  },
];

export function getTaskDef(id: string): TypeDef | undefined {
  return TASKS.find((t) => t.id === id);
}
