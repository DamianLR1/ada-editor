import type { FieldDef } from './registry';

// Campos para la sección "General" del config.yml (clase DungeonConfig.java)
export const DUNGEON_GENERAL_FIELDS: FieldDef[] = [
  { key: 'WorldName', label: 'Mundo', type: 'text', placeholder: 'world_dungeons' },
  { key: 'StartLevel', label: 'Nivel inicial', type: 'text', desc: 'ID del level con el que arranca la partida (archivo en levels/)' },
  { key: 'StartStage', label: 'Stage inicial', type: 'text', desc: 'ID del stage con el que arranca la partida (archivo en stages/)' },
  { key: 'Name', label: 'Nombre visible', type: 'text', desc: 'Soporta MiniMessage (colores, gradientes)' },
  { key: 'Description', label: 'Descripción', type: 'string_list' },
  { key: 'Prefix', label: 'Prefijo de chat', type: 'text' },
  { key: 'Icon.Material', label: 'Ícono — Material', type: 'text', placeholder: 'DIAMOND_SWORD', desc: 'Confirmar formato exacto (Material/CustomModelData) contra un config real antes de usar en producción.' },
  { key: 'Icon.CustomModelData', label: 'Ícono — Custom Model Data', type: 'number', default: 0 },
];

export const DUNGEON_AREA_FIELDS: FieldDef[] = [
  { key: 'LobbyPos', label: 'Posición del lobby (x,y,z,yaw,pitch)', type: 'text', placeholder: '0,64,0,0,0' },
  { key: 'Cuboid.Min', label: 'Región — esquina mínima (x,y,z)', type: 'text', placeholder: '-100,0,-1800' },
  { key: 'Cuboid.Max', label: 'Región — esquina máxima (x,y,z)', type: 'text', placeholder: '0,100,-1700' },
];

export const DUNGEON_SPAWNERS_FIELDS: FieldDef[] = [
  {
    key: 'Spawners',
    label: 'Grupos de spawners',
    type: 'map_string_list',
    desc: 'Cada grupo tiene un ID (referenciado por SpawnerId en la acción spawn_mob) y una o más posiciones "x,y,z".',
  },
];

// Features.java
export const DUNGEON_FEATURES_FIELDS: FieldDef[] = [
  { key: 'Features.Permission_Required', label: 'Requiere permiso para entrar', type: 'boolean', default: false },
  {
    key: 'Features.Entrance.Cooldown.Mode',
    label: 'Modo de cooldown de reingreso',
    type: 'select',
    options: [
      { value: 'RANK', label: 'Por rango (LuckPerms group)' },
      { value: 'PERMISSION', label: 'Por permiso' },
    ],
    default: 'RANK',
  },
  { key: 'Features.Entrance.Cooldown.Permission_Prefix', label: 'Prefijo de permiso (modo PERMISSION)', type: 'text' },
  { key: 'Features.Entrance.Cooldown.Default_Value', label: 'Cooldown por defecto (segundos)', type: 'number', default: 0 },
  { key: 'Features.Entrance.Cooldown.Values', label: 'Cooldown por rango/permiso', type: 'map_number', desc: 'Segundos por grupo o permiso específico (sobreescribe el valor por defecto)' },
  { key: 'Features.Entrance.Commands', label: 'Comandos al entrar', type: 'string_list' },
  { key: 'Features.Entrance.Payment', label: 'Costo de entrada por moneda', type: 'map_number', desc: 'Ej: vault -> 100 (requiere Vault u otra integración de economía)' },
  { key: 'Features.Exit.Commands', label: 'Comandos al salir', type: 'string_list' },
  {
    key: 'Features.ItemFilter.Mode',
    label: 'Modo de filtro de items',
    type: 'text',
    desc: 'Confirmar valores exactos del enum ItemFilterMode antes de usar en producción (ej. BAN_SPECIFIC / ALLOW_SPECIFIC).',
  },
  { key: 'Features.ItemFilter.Criteria.Materials', label: 'Materiales filtrados', type: 'string_list' },
  { key: 'Features.ItemFilter.Criteria.Names', label: 'Nombres filtrados', type: 'string_list' },
  { key: 'Features.ItemFilter.Criteria.Lores', label: 'Lore filtrado', type: 'string_list' },
  {
    key: 'Features.LevelRequirement.Provider',
    label: 'Integración de nivel de jugador',
    type: 'select',
    options: [
      { value: 'mmocore', label: 'MMOCore' },
      { value: 'auroralevels', label: 'AuroraLevels' },
    ],
    default: 'mmocore',
  },
  { key: 'Features.LevelRequirement.MinLevel', label: 'Nivel mínimo (-1 = sin límite)', type: 'number', default: -1 },
  { key: 'Features.LevelRequirement.MaxLevel', label: 'Nivel máximo (-1 = sin límite)', type: 'number', default: -1 },
];

// GameSettings.java
export const DUNGEON_GAME_FIELDS: FieldDef[] = [
  { key: 'Game.General.Timeleft', label: 'Tiempo límite de partida (segundos, -1 = sin límite)', type: 'number', default: -1 },
  { key: 'Game.General.Lobby_Prepare_Time', label: 'Espera antes de iniciar (segundos)', type: 'number', default: 10 },
  { key: 'Game.General.Leave_On_Death', label: 'Sale de la dungeon al morir', type: 'boolean', default: false },
  { key: 'Game.General.Adventure_Mode', label: 'Forzar modo aventura', type: 'boolean', default: false },
  { key: 'Game.General.MinPlayers', label: 'Jugadores mínimos', type: 'number', default: 1 },
  { key: 'Game.General.MaxPlayers', label: 'Jugadores máximos', type: 'number', default: 4 },
  { key: 'Game.General.PlayerLives', label: 'Vidas por jugador (-1 = ilimitadas)', type: 'number', default: -1 },
  { key: 'Game.General.KeepInventory.Enabled', label: 'Mantener inventario al morir', type: 'boolean', default: false },
  { key: 'Game.General.KeepInventory.LivesRequired', label: 'Vidas requeridas para mantener inventario', type: 'number', default: 1 },
  { key: 'Game.General.AllowedCommands', label: 'Comandos permitidos dentro de partida', type: 'string_list' },

  { key: 'Game.Announcements.OnStart', label: 'Anuncio al iniciar', type: 'string_list' },
  { key: 'Game.Announcements.OnEnd', label: 'Anuncio al finalizar', type: 'string_list' },

  { key: 'Game.Scoreboard.Enabled', label: 'Scoreboard propio activado', type: 'boolean', default: false },
  { key: 'Game.Scoreboard.Id', label: 'ID del scoreboard', type: 'text' },

  { key: 'Game.VanillaFeatures.Exhaust.Enabled', label: 'Hambre activada', type: 'boolean', default: true },
  { key: 'Game.VanillaFeatures.HealthRegain.Enabled', label: 'Regeneración de vida activada', type: 'boolean', default: true },
  { key: 'Game.VanillaFeatures.HealthRegain.DisabledFrom.Food', label: 'Bloquear regeneración por comida', type: 'boolean', default: false },
  { key: 'Game.VanillaFeatures.HealthRegain.DisabledFrom.Saturation', label: 'Bloquear regeneración por saturación', type: 'boolean', default: false },
  { key: 'Game.VanillaFeatures.HealthRegain.DisabledFrom.Potions', label: 'Bloquear regeneración por pociones', type: 'boolean', default: false },
  { key: 'Game.VanillaFeatures.HealthRegain.DisabledFrom.Other', label: 'Bloquear otras fuentes de regeneración', type: 'boolean', default: false },
  { key: 'Game.VanillaFeatures.Item_Durability.Enabled', label: 'Durabilidad de items activada', type: 'boolean', default: true },

  { key: 'Game.PlayerActions.Allow_Item_Drop', label: 'Permitir soltar items', type: 'boolean', default: true },
  { key: 'Game.PlayerActions.Allow_Item_Pickup', label: 'Permitir recoger items', type: 'boolean', default: true },

  { key: 'Game.Mobs.DropXP', label: 'Los mobs sueltan experiencia vanilla', type: 'boolean', default: false },
  { key: 'Game.Mobs.DropLoot', label: 'Los mobs sueltan loot vanilla', type: 'boolean', default: false },
  { key: 'Game.Mobs.AllowedExternalSpawns', label: 'Tipos de spawn externos permitidos', type: 'string_list', desc: 'Ej: CUSTOM' },

  { key: 'Game.Kits.Enabled', label: 'Habilitar kits para esta dungeon', type: 'boolean', default: false },

  { key: 'Game.Integrations.Pets_Enabled', label: 'Permitir mascotas', type: 'boolean', default: true },
  { key: 'Game.Integrations.Mcmmo_Enabled', label: 'Integración con mcMMO', type: 'boolean', default: true },
];
