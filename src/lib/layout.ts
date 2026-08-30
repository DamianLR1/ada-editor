// Acomoda el grafo de stages/levels en columnas por profundidad, para dibujarlo
// como diagrama en vez de una lista de tarjetas.
//
// Columna = distancia (en saltos) desde el nodo inicial. Lo que no se alcanza
// desde el inicio va a una columna extra al final: normalmente eso significa
// que quedó código muerto, y verlo separado es justamente la gracia.

import type { FlowNode } from './flow';

export const NODE_W = 168;
export const NODE_H = 46;
export const COL_GAP = 232;
export const ROW_GAP = 74;
export const PAD = 24;

export interface LaidOutNode {
  key: string;
  kind: 'stage' | 'level' | 'end';
  id: string;
  x: number;
  y: number;
  depth: number;
  isStart: boolean;
  reachable: boolean;
  taskCount: number;
}

export interface LaidOutEdge {
  from: string;
  to: string;
  fromScript: string;
  chance: number;
  runIf: string;
  toKind: 'stage' | 'level' | 'end';
}

export interface FlowLayout {
  nodes: LaidOutNode[];
  edges: LaidOutEdge[];
  width: number;
  height: number;
}

function nodeKey(kind: string, id: string): string {
  return `${kind}:${id}`;
}

export function layoutFlow(
  nodes: FlowNode[],
  startStage: string,
  startLevel: string,
  taskCounts: Record<string, number> = {}
): FlowLayout {
  const byKey = new Map<string, FlowNode>();
  nodes.forEach((n) => byKey.set(nodeKey(n.kind, n.id), n));

  // Nodos terminales (Victoria / Derrota) no vienen del proyecto: los crea dungeon_end.
  const terminals = new Set<string>();
  nodes.forEach((n) => n.edges.forEach((e) => {
    if (e.toKind === 'end') terminals.add(nodeKey('end', e.toId || 'Fin'));
  }));

  const startKey = byKey.has(nodeKey('stage', startStage))
    ? nodeKey('stage', startStage)
    : byKey.has(nodeKey('level', startLevel))
      ? nodeKey('level', startLevel)
      : nodes.length > 0
        ? nodeKey(nodes[0].kind, nodes[0].id)
        : '';

  // BFS desde el inicio para asignar profundidad.
  const depth = new Map<string, number>();
  if (startKey) {
    depth.set(startKey, 0);
    const queue = [startKey];
    while (queue.length > 0) {
      const key = queue.shift()!;
      const current = depth.get(key)!;
      const node = byKey.get(key);
      if (!node) continue;

      node.edges.forEach((e) => {
        const target = nodeKey(e.toKind === 'end' ? 'end' : e.toKind, e.toKind === 'end' ? e.toId || 'Fin' : e.toId);
        if (!byKey.has(target) && !terminals.has(target)) return;
        if (depth.has(target)) return;
        depth.set(target, current + 1);
        queue.push(target);
      });
    }
  }

  const allKeys = [...byKey.keys(), ...terminals];
  const maxDepth = allKeys.reduce((max, key) => Math.max(max, depth.get(key) ?? -1), 0);
  const orphanDepth = maxDepth + 1;

  const columns = new Map<number, string[]>();
  allKeys.forEach((key) => {
    const d = depth.get(key) ?? orphanDepth;
    if (!columns.has(d)) columns.set(d, []);
    columns.get(d)!.push(key);
  });
  columns.forEach((keys) => keys.sort());

  const laidOut: LaidOutNode[] = [];
  columns.forEach((keys, d) => {
    keys.forEach((key, row) => {
      const [kind, ...rest] = key.split(':');
      const id = rest.join(':');
      laidOut.push({
        key,
        kind: kind as LaidOutNode['kind'],
        id,
        x: PAD + d * COL_GAP,
        y: PAD + row * ROW_GAP,
        depth: d,
        isStart: key === startKey,
        reachable: depth.has(key),
        taskCount: taskCounts[id] ?? 0,
      });
    });
  });

  const edges: LaidOutEdge[] = [];
  nodes.forEach((n) => {
    const from = nodeKey(n.kind, n.id);
    n.edges.forEach((e) => {
      const to = nodeKey(e.toKind === 'end' ? 'end' : e.toKind, e.toKind === 'end' ? e.toId || 'Fin' : e.toId);
      if (!byKey.has(to) && !terminals.has(to)) return; // referencia rota: lo reporta la validación
      edges.push({ from, to, fromScript: e.fromScript, chance: e.chance, runIf: e.runIf, toKind: e.toKind });
    });
  });

  const maxRow = [...columns.values()].reduce((max, keys) => Math.max(max, keys.length), 0);
  const maxCol = [...columns.keys()].reduce((max, d) => Math.max(max, d), 0);

  return {
    nodes: laidOut,
    edges,
    width: PAD * 2 + maxCol * COL_GAP + NODE_W,
    height: PAD * 2 + Math.max(0, maxRow - 1) * ROW_GAP + NODE_H,
  };
}
