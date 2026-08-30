// ============================================================================
// Referencia de lo que agrega el FORK sobre AdvancedDungeonArena 8.5.1.
//
// Son cosas que NO se editan dentro de la carpeta de una dungeon (viven en el
// config.yml global del plugin, en el lang, o son placeholders), pero que se
// consultan todo el tiempo mientras armás una dungeon. Por eso están acá y no
// como formulario.
//
// Fuente: CHANGES.md del fork (github.com/DamianLR1/advanced-dugeon-arena).
// ============================================================================

export interface RefRow {
  name: string;
  desc: string;
}

export interface RefSection {
  id: string;
  title: string;
  blurb?: string;
  columns: [string, string];
  rows: RefRow[];
  snippet?: string;
}

export const FORK_REFERENCE: RefSection[] = [
  {
    id: 'comandos',
    title: 'Comandos',
    columns: ['Comando', 'Qué hace'],
    rows: [
      {
        name: '/ada clearmobs [dungeon]',
        desc: 'Elimina todos los mobs de la dungeon sin contarlos como kills. Sin argumento usa la dungeon donde estás parado.',
      },
      {
        name: '/ada setvar <dungeon> <variable> <valor>',
        desc: 'Fija una variable desde afuera de la partida. Es lo que usan los menús para elegir dificultad antes de entrar.',
      },
      {
        name: '/ada records <dungeon> [solo|group]',
        desc: 'Muestra en el chat el top de tiempos. Sin el segundo argumento, el combinado.',
      },
      {
        name: '/ada resetrecords <dungeon>',
        desc: 'Borra todos los records de esa dungeon (memoria y base de datos).',
      },
    ],
  },
  {
    id: 'dificultad',
    title: 'Dificultad',
    blurb:
      'El scaler "difficulty" lee la variable del mismo nombre. Su valor neutro es 0: sin tocar nada, la ' +
      'dungeon queda exactamente como la configuraste. Se setea desde afuera con /ada setvar, así que no ' +
      'hace falta definirla con define_variable.',
    columns: ['Valor', 'Efecto'],
    rows: [
      { name: '0', desc: 'Neutro. PLAIN suma 0 y MULTIPLIER multiplica por 1: los valores quedan como los escribiste.' },
      { name: '1', desc: 'Aplica el escalador una vez. Con MULTIPLIER 0.5 los valores quedan x1.5.' },
      { name: '2', desc: 'Aplica el escalador dos veces. Con MULTIPLIER 0.5 quedan x2.' },
    ],
    snippet: [
      '# Desde el menú (TrMenu, etc.) antes de entrar:',
      '/ada setvar cripta difficulty 0    # fácil',
      '/ada setvar cripta difficulty 1    # normal',
      '/ada setvar cripta difficulty 2    # difícil',
    ].join('\n'),
  },
  {
    id: 'records',
    title: 'Records de tiempo',
    blurb:
      'Se configura en el config.yml GLOBAL del plugin, no por dungeon. Guarda una entrada por victoria con ' +
      'la duración, el grupo, la dificultad y la fecha. Sólo persiste lo que entra al top, así que la tabla ' +
      'queda acotada a "dungeons x 2 x TopSize" filas.',
    columns: ['Opción', 'Qué hace'],
    rows: [
      { name: 'Records.Enabled', desc: 'Activa la funcionalidad completa. Por defecto true.' },
      { name: 'Records.TopSize', desc: 'Cuántos records se guardan por dungeon, para solo y para grupo por separado. Por defecto 10.' },
      { name: 'Records.NameSeparator', desc: 'Cómo se unen los nombres del grupo en los placeholders. Por defecto ", ".' },
    ],
    snippet: ['Records:', '  Enabled: true', '  TopSize: 10', '  NameSeparator: ", "'].join('\n'),
  },
  {
    id: 'ph-dungeon',
    title: 'Placeholders — dungeon',
    blurb: 'Requieren PlaceholderAPI. Reemplazá <id> por el id de la dungeon.',
    columns: ['Placeholder', 'Devuelve'],
    rows: [
      { name: '%ada_dungeon_<id>_stage%', desc: 'Nombre del stage actual ("-" en lobby).' },
      { name: '%ada_dungeon_<id>_stage_id%', desc: 'ID del stage actual ("-" en lobby).' },
      { name: '%ada_dungeon_<id>_level%', desc: 'Nombre del level actual ("-" en lobby).' },
      { name: '%ada_dungeon_<id>_level_id%', desc: 'ID del level actual ("-" en lobby).' },
      { name: '%ada_dungeon_<id>_difficulty%', desc: 'Dificultad actual.' },
      { name: '%ada_dungeon_<id>_average_level%', desc: 'Nivel promedio del grupo adentro.' },
      { name: '%ada_dungeon_<id>_min_players%', desc: 'Mínimo de jugadores del config.' },
      { name: '%ada_dungeon_<id>_max_players%', desc: 'Máximo de jugadores del config.' },
      { name: '%ada_dungeon_<id>_var_<nombre>%', desc: 'Cualquier variable de la dungeon, valor crudo. El más útil para menús.' },
    ],
  },
  {
    id: 'ph-cooldown',
    title: 'Placeholders — cooldown',
    blurb:
      'Se resuelven contra el jugador que pide el placeholder, no contra una instancia. Leen del caché de ' +
      'usuarios cargados y nunca consultan la base de datos.',
    columns: ['Placeholder', 'Devuelve'],
    rows: [
      { name: '%ada_cooldown_<id>%', desc: 'Cooldown restante del jugador, o "Ninguno".' },
      { name: '%ada_cooldown_ready_<id>%', desc: 'Sí / No — si ya puede entrar.' },
    ],
  },
  {
    id: 'ph-top',
    title: 'Placeholders — top de tiempos',
    blurb:
      'Formato: %ada_top_<dungeon>_[solo|group]_<puesto>_<campo>%. El [solo|group] es opcional; sin él es el ' +
      'top combinado. El puesto arranca en 1. Los slots vacíos devuelven "Ninguno" / "0" / "-", nunca el ' +
      'placeholder crudo, así que un top de 10 se puede pintar entero desde el día uno.',
    columns: ['Campo', 'Devuelve'],
    rows: [
      { name: 'names', desc: 'Nombres del grupo, separados por NameSeparator.' },
      { name: 'name', desc: 'Sólo el primer nombre.' },
      { name: 'time', desc: 'Tiempo formateado (HH:mm:ss).' },
      { name: 'time_short', desc: 'Tiempo formateado corto.' },
      { name: 'time_raw', desc: 'Tiempo en milisegundos.' },
      { name: 'size', desc: 'Cuántos jugadores eran.' },
      { name: 'difficulty', desc: 'Dificultad a la que se jugó esa run.' },
      { name: 'date', desc: 'Fecha del record.' },
    ],
    snippet: [
      '%ada_top_cripta_1_names%',
      '%ada_top_cripta_1_time%',
      '%ada_top_cripta_solo_3_time_raw%',
      '%ada_top_cripta_group_2_size%',
    ].join('\n'),
  },
  {
    id: 'ph-personal',
    title: 'Placeholders — récord personal',
    blurb:
      'Se resuelven contra el jugador que pide el placeholder. Salen de la fila del usuario, sin escanear la ' +
      'tabla del top.',
    columns: ['Placeholder', 'Devuelve'],
    rows: [
      { name: '%ada_record_<dungeon>%', desc: 'Su mejor tiempo, formateado.' },
      { name: '%ada_record_raw_<dungeon>%', desc: 'Su mejor tiempo en milisegundos.' },
      { name: '%ada_clears_<dungeon>%', desc: 'Cuántas veces la completó.' },
      { name: '%ada_lastclear_<dungeon>%', desc: 'Fecha de su última victoria.' },
      { name: '%ada_player_record%', desc: 'Su mejor tiempo en la dungeon donde está parado.' },
      { name: '%ada_player_clears%', desc: 'Sus completadas en la dungeon donde está parado.' },
    ],
  },
  {
    id: 'permisos',
    title: 'Permisos',
    blurb: 'Todos cuelgan de dungeonarena.command.*, así que quien tenga el comodín ya los hereda.',
    columns: ['Permiso', 'Para qué'],
    rows: [
      { name: 'dungeonarena.command.clearmobs', desc: '/ada clearmobs' },
      { name: 'dungeonarena.command.setvar', desc: '/ada setvar' },
      { name: 'dungeonarena.command.records', desc: '/ada records' },
      { name: 'dungeonarena.command.resetrecords', desc: '/ada resetrecords' },
    ],
  },
  {
    id: 'lang',
    title: 'Claves de idioma',
    blurb: 'Se generan solas en el archivo de lang al arrancar el server. Se editan ahí.',
    columns: ['Clave', 'Uso'],
    rows: [
      { name: 'UI.BossBar.Task', desc: 'Texto de la bossbar con el objetivo actual.' },
      { name: 'UI.BossBar.NoTasks', desc: 'Texto de la bossbar cuando no quedan objetivos pendientes.' },
      { name: 'Dungeon.Admin.ClearMobs', desc: 'Confirmación de /ada clearmobs.' },
      { name: 'Dungeon.Admin.SetVar', desc: 'Confirmación de /ada setvar.' },
      { name: 'Dungeon.Records.Header', desc: 'Encabezado del top en chat.' },
      { name: 'Dungeon.Records.Entry', desc: 'Cada línea del top en chat.' },
      { name: 'Dungeon.Records.Empty', desc: 'Cuando la dungeon no tiene records.' },
      { name: 'Dungeon.Admin.ResetRecords', desc: 'Confirmación de /ada resetrecords.' },
    ],
  },
];
