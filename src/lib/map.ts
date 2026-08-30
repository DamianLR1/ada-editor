// Extrae del proyecto todo lo que tiene una posición en el mundo, para poder
// dibujarlo en un mapa cenital (X horizontal, Z vertical, como un mapa de MC).
//
// Formatos, confirmados contra el código del plugin:
// - Cuboid.Min / Cuboid.Max -> BlockPos "x,y,z"
// - LobbyPos                -> ExactPos "x,y,z,yaw,pitch" (los dos últimos se ignoran acá)
// - Spawners.<id>.Positions -> lista de BlockPos "x,y,z"
// - loot_chests/<f>.yml Location -> BlockPos "x,y,z"

import type { DungeonProject } from '../schema/project';

export type MarkerKind = 'lobby' | 'spawner' | 'chest';

export interface MapMarker {
  kind: MarkerKind;
  group: string; // id del spawner / nombre del cofre / "Lobby"
  label: string;
  x: number;
  y: number;
  z: number;
  inside: boolean; // dentro del cuboide de la dungeon
}

export interface MapBounds {
  minX: number;
  minY: number;
  minZ: number;
  maxX: number;
  maxY: number;
  maxZ: number;
}

export interface DungeonMap {
  bounds: MapBounds | null;
  markers: MapMarker[];
  outside: MapMarker[]; // los que caen fuera del cuboide: siempre es un error de config
}

export function parsePos(raw: unknown): { x: number; y: number; z: number } | null {
  if (raw === null || raw === undefined) return null;
  const parts = String(raw).split(',').map((p) => Number(p.trim()));
  if (parts.length < 3) return null;
  const [x, y, z] = parts;
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) return null;
  return { x, y, z };
}

function readBounds(configRaw: Record<string, any>): MapBounds | null {
  const min = parsePos(configRaw?.Cuboid?.Min);
  const max = parsePos(configRaw?.Cuboid?.Max);
  if (!min || !max) return null;

  // El plugin normaliza el cuboide, así que min/max pueden venir al revés.
  return {
    minX: Math.min(min.x, max.x),
    minY: Math.min(min.y, max.y),
    minZ: Math.min(min.z, max.z),
    maxX: Math.max(min.x, max.x),
    maxY: Math.max(min.y, max.y),
    maxZ: Math.max(min.z, max.z),
  };
}

function isInside(bounds: MapBounds | null, x: number, y: number, z: number): boolean {
  if (!bounds) return true; // sin región definida no hay nada que violar
  return (
    x >= bounds.minX && x <= bounds.maxX &&
    y >= bounds.minY && y <= bounds.maxY &&
    z >= bounds.minZ && z <= bounds.maxZ
  );
}

export function computeMap(project: DungeonProject): DungeonMap {
  const bounds = readBounds(project.configRaw || {});
  const markers: MapMarker[] = [];

  const push = (kind: MarkerKind, group: string, label: string, pos: { x: number; y: number; z: number }) => {
    markers.push({ kind, group, label, ...pos, inside: isInside(bounds, pos.x, pos.y, pos.z) });
  };

  const lobby = parsePos(project.configRaw?.LobbyPos);
  if (lobby) push('lobby', 'Lobby', 'Lobby', lobby);

  const spawners = project.configRaw?.Spawners || {};
  Object.keys(spawners).forEach((id) => {
    const positions: unknown[] = spawners[id]?.Positions ?? [];
    (Array.isArray(positions) ? positions : []).forEach((raw, i) => {
      const pos = parsePos(raw);
      if (pos) push('spawner', id, `${id} #${i + 1}`, pos);
    });
  });

  project.lootChests.forEach((chest) => {
    const pos = parsePos(chest.location);
    if (pos) push('chest', chest.fileName.replace(/\.ya?ml$/i, ''), chest.fileName.replace(/\.ya?ml$/i, ''), pos);
  });

  return { bounds, markers, outside: markers.filter((m) => !m.inside) };
}
