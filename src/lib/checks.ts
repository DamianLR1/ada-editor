// Self-check de la lógica pura del editor: lo que puede romperse en silencio y
// no lo agarra TypeScript. Sin framework de tests a propósito.
//
//   npm run check
//
// No se importa desde ningún lado, así que no entra al bundle.

import { computeMap, parsePos } from './map';
import { layoutFlow } from './layout';
import { computeOverview } from './overview';
import { readFieldValue, writeFieldValue } from '../schema/fields';
import type { FieldDef } from '../schema/registry';
import type { DungeonProject } from '../schema/project';
import type { FlowNode } from './flow';
import { nextUid } from '../schema/types';

function check(condition: boolean, what: string): void {
  if (!condition) throw new Error('FALLO: ' + what);
}

function baseProject(over: Partial<DungeonProject> = {}): DungeonProject {
  return {
    dungeonName: 'Cripta',
    configRaw: {},
    levels: [],
    stages: [],
    rewards: [],
    lootChests: [],
    passthroughFiles: [],
    ...over,
  };
}

// ---------------------------------------------------------------------------

function checkParsePos() {
  check(JSON.stringify(parsePos('10,64,-20')) === JSON.stringify({ x: 10, y: 64, z: -20 }), 'BlockPos simple');
  // LobbyPos trae yaw y pitch de más: se ignoran, no invalidan la posición.
  check(parsePos('1,2,3,90,0')?.x === 1, 'ExactPos con yaw/pitch');
  check(parsePos(' 1 , 2 , 3 ')?.y === 2, 'espacios alrededor');
  check(parsePos('1,2') === null, 'faltan componentes');
  check(parsePos('a,b,c') === null, 'no numérico');
  check(parsePos('') === null, 'vacío');
  check(parsePos(undefined) === null, 'undefined');
}

function checkMap() {
  const project = baseProject({
    configRaw: {
      // A propósito al revés: el cuboide del plugin se normaliza, el mapa también debe.
      Cuboid: { Min: '10,70,10', Max: '0,60,0' },
      LobbyPos: '5,64,5,90,0',
      Spawners: {
        entrada: { Positions: ['1,64,1', '2,64,2'] },
        fondo: { Positions: ['9,64,9'] },
        vacio: {},
      },
    },
    lootChests: [{ fileName: 'cofre1.yml', location: '500,64,500', itemsAmount: null as any, uniqueOnly: false, items: [] }],
  });

  const map = computeMap(project);

  check(map.bounds !== null, 'hay bounds');
  check(map.bounds!.minX === 0 && map.bounds!.maxX === 10, 'bounds normalizados en X');
  check(map.bounds!.minY === 60 && map.bounds!.maxY === 70, 'bounds normalizados en Y');

  check(map.markers.filter((m) => m.kind === 'lobby').length === 1, 'un lobby');
  check(map.markers.filter((m) => m.kind === 'spawner').length === 3, 'tres posiciones de spawner');
  check(map.markers.filter((m) => m.kind === 'chest').length === 1, 'un cofre');

  // El cofre está lejísimos: tiene que salir marcado como fuera de la región.
  check(map.outside.length === 1 && map.outside[0].kind === 'chest', 'cofre fuera de la región');

  const sinRegion = computeMap(baseProject({ configRaw: { LobbyPos: '1,2,3' } }));
  check(sinRegion.bounds === null, 'sin Cuboid no hay bounds');
  check(sinRegion.outside.length === 0, 'sin región nada puede estar afuera');
}

function checkSpawnersRoundTrip() {
  // El plugin lee Spawners.<id>.Positions. Si el editor escribe la lista pelada,
  // los spawners exportados no cargan: por eso este check existe.
  const field: FieldDef = { key: 'Spawners', label: 'Spawners', type: 'spawners' };

  const yamlDelPlugin = { Spawners: { entrada: { Positions: ['1,2,3', '4,5,6'] } } };
  const enLaUi = readFieldValue(field, yamlDelPlugin);
  check(Array.isArray(enLaUi.entrada) && enLaUi.entrada.length === 2, 'lee Positions como lista');

  const deVuelta: Record<string, any> = {};
  writeFieldValue(field, deVuelta, enLaUi);
  check(Array.isArray(deVuelta.Spawners.entrada.Positions), 'escribe bajo Positions');
  check(JSON.stringify(deVuelta) === JSON.stringify(yamlDelPlugin), 'ida y vuelta sin pérdida');

  const vacio = readFieldValue(field, {});
  check(JSON.stringify(vacio) === '{}', 'sin Spawners devuelve mapa vacío');
}

function checkLayout() {
  const nodes: FlowNode[] = [
    { kind: 'stage', id: 's1', edges: [{ fromScript: 'ir', toKind: 'stage', toId: 's2', chance: 100, runIf: '' }] },
    { kind: 'stage', id: 's2', edges: [{ fromScript: 'fin', toKind: 'end', toId: 'Victoria', chance: 100, runIf: '' }] },
    { kind: 'stage', id: 'huerfano', edges: [] },
  ];

  const layout = layoutFlow(nodes, 's1', '', { s1: 2, s2: 0 });
  const byId = new Map(layout.nodes.map((n) => [n.key, n]));

  check(byId.get('stage:s1')!.depth === 0, 's1 es la columna 0');
  check(byId.get('stage:s1')!.isStart, 's1 marcado como inicio');
  check(byId.get('stage:s2')!.depth === 1, 's2 es la columna 1');
  check(byId.has('end:Victoria'), 'se creó el nodo terminal Victoria');
  check(byId.get('end:Victoria')!.depth === 2, 'Victoria queda después de s2');

  // Lo inalcanzable va a una columna aparte al final, no mezclado con el camino real.
  const huerfano = byId.get('stage:huerfano')!;
  check(!huerfano.reachable, 'huerfano marcado como inalcanzable');
  check(huerfano.depth > byId.get('end:Victoria')!.depth, 'huerfano en la última columna');

  check(layout.edges.length === 2, 'dos aristas');
  check(layout.width > 0 && layout.height > 0, 'el lienzo tiene tamaño');

  // Una arista a un stage que no existe es una referencia rota: la reporta la
  // validación, el diagrama simplemente no la dibuja.
  const rota = layoutFlow(
    [{ kind: 'stage', id: 's1', edges: [{ fromScript: 'x', toKind: 'stage', toId: 'noexiste', chance: 100, runIf: '' }] }],
    's1', '', {}
  );
  check(rota.edges.length === 0, 'no se dibuja una arista rota');

  check(layoutFlow([], '', '', {}).nodes.length === 0, 'proyecto vacío no rompe');
}

function checkOverview() {
  const stage = {
    kind: 'stage' as const,
    fileName: 'stage1.yml',
    raw: {},
    tasks: [{ uid: nextUid(), name: 't1', type: 'kill_mobs', values: {} }],
    handlers: [
      {
        uid: nextUid(),
        name: 'script1',
        event: 'STAGE_STARTED',
        conditions: [{ uid: nextUid(), name: 'c1', type: 'chance', cached: false, values: {} }],
        actions: [
          { uid: nextUid(), name: 'a1', type: 'spawn_mob', runIf: '', chance: 100, values: { MobId: 'ada:zombie' } },
          { uid: nextUid(), name: 'a2', type: 'spawn_mob', runIf: '', chance: 100, values: { MobId: 'ada:zombie' } },
          { uid: nextUid(), name: 'a3', type: 'create_var', runIf: '', chance: 100, values: { Name: 'oleada' } },
          { uid: nextUid(), name: 'a4', type: 'accion_inventada', runIf: '', chance: 100, values: {} },
        ],
      },
    ],
  };

  const overview = computeOverview(
    baseProject({ stages: [stage], configRaw: { Spawners: { a: { Positions: ['1,1,1', '2,2,2'] } } } })
  );

  check(overview.stages === 1 && overview.tasks === 1, 'cuenta stages y tareas');
  check(overview.scripts === 1 && overview.conditions === 1 && overview.actions === 4, 'cuenta lógica');
  check(overview.mobIds.length === 1, 'el mismo MobId no se cuenta dos veces');
  check(overview.variables.includes('oleada'), 'toma la variable de create_var');
  check(overview.spawnerGroups === 1 && overview.spawnerPositions === 2, 'cuenta posiciones de spawner');
  check(overview.topActions[0].key === 'spawn_mob', 'spawn_mob es la acción más usada');
  check(overview.unknownTypes.includes('action:accion_inventada'), 'detecta un Type desconocido');
}

checkParsePos();
checkMap();
checkSpawnersRoundTrip();
checkLayout();
checkOverview();
console.log('checks: OK');
