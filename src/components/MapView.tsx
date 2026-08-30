import { useMemo, useState } from 'react';
import { Map as MapIcon, Home, Skull, Package, AlertTriangle, Ruler } from 'lucide-react';
import type { DungeonMap, MapMarker, MarkerKind } from '../lib/map';

interface Props {
  map: DungeonMap;
}

const VIEW = 720; // lado del lienzo en px; el mundo se escala para entrar acá
const PAD = 28;

const KIND_STYLE: Record<MarkerKind, { color: string; label: string }> = {
  lobby: { color: '#fbbf24', label: 'Lobby' },
  spawner: { color: '#f87171', label: 'Spawners' },
  chest: { color: '#34d399', label: 'Loot chests' },
};

// Paleta para distinguir grupos de spawners entre sí.
const GROUP_COLORS = ['#f87171', '#fb923c', '#c084fc', '#38bdf8', '#f472b6', '#a3e635', '#2dd4bf'];

export function MapView({ map }: Props) {
  const [visible, setVisible] = useState<Record<MarkerKind, boolean>>({ lobby: true, spawner: true, chest: true });
  const [hovered, setHovered] = useState<MapMarker | null>(null);

  const spawnerGroups = useMemo(
    () => [...new Set(map.markers.filter((m) => m.kind === 'spawner').map((m) => m.group))].sort(),
    [map.markers]
  );

  const colorFor = (marker: MapMarker): string => {
    if (marker.kind !== 'spawner') return KIND_STYLE[marker.kind].color;
    const index = spawnerGroups.indexOf(marker.group);
    return GROUP_COLORS[index % GROUP_COLORS.length];
  };

  // Encuadre: el cuboide si existe, si no la nube de marcadores. Siempre cuadrado
  // para que no se deforme la proporción del mundo.
  const frame = useMemo(() => {
    const xs: number[] = [];
    const zs: number[] = [];
    if (map.bounds) {
      xs.push(map.bounds.minX, map.bounds.maxX);
      zs.push(map.bounds.minZ, map.bounds.maxZ);
    }
    map.markers.forEach((m) => {
      xs.push(m.x);
      zs.push(m.z);
    });
    if (xs.length === 0) return null;

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minZ = Math.min(...zs);
    const maxZ = Math.max(...zs);
    const span = Math.max(maxX - minX, maxZ - minZ, 1);
    const scale = (VIEW - PAD * 2) / span;

    return {
      minX, maxX, minZ, maxZ, span, scale,
      // Centra el eje más corto dentro del lienzo cuadrado.
      offsetX: PAD + ((span - (maxX - minX)) * scale) / 2,
      offsetZ: PAD + ((span - (maxZ - minZ)) * scale) / 2,
      toPx: (x: number, z: number) => ({
        px: PAD + ((span - (maxX - minX)) * scale) / 2 + (x - minX) * scale,
        pz: PAD + ((span - (maxZ - minZ)) * scale) / 2 + (z - minZ) * scale,
      }),
    };
  }, [map]);

  const shown = map.markers.filter((m) => visible[m.kind]);

  if (!frame) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-800 p-12 text-center text-zinc-500 text-sm">
        Todavía no hay nada con coordenadas. Definí <code className="text-zinc-400">Cuboid.Min</code> y{' '}
        <code className="text-zinc-400">Cuboid.Max</code> en la configuración general y el mapa se dibuja solo.
      </div>
    );
  }

  const box = map.bounds
    ? {
        a: frame.toPx(map.bounds.minX, map.bounds.minZ),
        b: frame.toPx(map.bounds.maxX, map.bounds.maxZ),
      }
    : null;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
            <MapIcon size={15} className="text-amber-400" /> Mapa de la dungeon
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Vista cenital: eje X hacia la derecha, eje Z hacia abajo, igual que un mapa de Minecraft. Pasá el mouse
            por un punto para ver sus coordenadas exactas.
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {(Object.keys(KIND_STYLE) as MarkerKind[]).map((kind) => {
            const count = map.markers.filter((m) => m.kind === kind).length;
            return (
              <button
                key={kind}
                onClick={() => setVisible({ ...visible, [kind]: !visible[kind] })}
                className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs transition ${
                  visible[kind]
                    ? 'border-zinc-700 bg-zinc-800 text-zinc-200'
                    : 'border-zinc-800 bg-transparent text-zinc-600'
                }`}
              >
                <span className="h-2 w-2 rounded-full" style={{ background: KIND_STYLE[kind].color }} />
                {KIND_STYLE[kind].label}
                <span className="text-zinc-500">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {map.bounds && (
        <div className="flex items-center gap-4 text-xs text-zinc-400 flex-wrap">
          <span className="flex items-center gap-1.5">
            <Ruler size={13} className="text-zinc-600" />
            {map.bounds.maxX - map.bounds.minX + 1} × {map.bounds.maxY - map.bounds.minY + 1} ×{' '}
            {map.bounds.maxZ - map.bounds.minZ + 1} bloques
          </span>
          <span className="font-mono text-zinc-600">
            {map.bounds.minX},{map.bounds.minY},{map.bounds.minZ} → {map.bounds.maxX},{map.bounds.maxY},
            {map.bounds.maxZ}
          </span>
        </div>
      )}

      {map.outside.length > 0 && (
        <div className="rounded-lg border border-amber-900/50 bg-amber-500/5 p-3 text-sm text-amber-300 flex gap-2">
          <AlertTriangle size={15} className="shrink-0 mt-0.5" />
          <div>
            <p>{map.outside.length} posición(es) caen fuera de la región de la dungeon.</p>
            <p className="text-[11px] text-amber-400/70 mt-1 font-mono">
              {map.outside.slice(0, 6).map((m) => `${m.label} (${m.x},${m.y},${m.z})`).join(' · ')}
              {map.outside.length > 6 && ` … +${map.outside.length - 6}`}
            </p>
          </div>
        </div>
      )}

      <div className="relative rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
        <svg viewBox={`0 0 ${VIEW} ${VIEW}`} className="w-full h-auto block">
          <defs>
            <pattern id="grid" width="36" height="36" patternUnits="userSpaceOnUse">
              <path d="M 36 0 L 0 0 0 36" fill="none" stroke="#27272a" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width={VIEW} height={VIEW} fill="url(#grid)" />

          {box && (
            <>
              <rect
                x={Math.min(box.a.px, box.b.px)}
                y={Math.min(box.a.pz, box.b.pz)}
                width={Math.abs(box.b.px - box.a.px)}
                height={Math.abs(box.b.pz - box.a.pz)}
                fill="#f59e0b"
                fillOpacity="0.05"
                stroke="#f59e0b"
                strokeOpacity="0.5"
                strokeWidth="1.5"
                strokeDasharray="6 4"
              />
              <text
                x={Math.min(box.a.px, box.b.px) + 6}
                y={Math.min(box.a.pz, box.b.pz) - 6}
                fill="#a16207"
                fontSize="11"
                fontFamily="ui-monospace, monospace"
              >
                región
              </text>
            </>
          )}

          {shown.map((marker, i) => {
            const { px, pz } = frame.toPx(marker.x, marker.z);
            const color = colorFor(marker);
            const isLobby = marker.kind === 'lobby';
            const isHovered = hovered === marker;

            return (
              <g
                key={`${marker.kind}-${marker.group}-${i}`}
                onMouseEnter={() => setHovered(marker)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: 'pointer' }}
              >
                {isHovered && <circle cx={px} cy={pz} r={12} fill={color} fillOpacity="0.2" />}
                {isLobby ? (
                  <rect x={px - 6} y={pz - 6} width={12} height={12} fill={color} stroke="#18181b" strokeWidth="1.5" />
                ) : (
                  <circle
                    cx={px}
                    cy={pz}
                    r={marker.kind === 'chest' ? 5.5 : 4.5}
                    fill={color}
                    stroke={marker.inside ? '#18181b' : '#ef4444'}
                    strokeWidth={marker.inside ? 1.2 : 2}
                  />
                )}
              </g>
            );
          })}
        </svg>

        {hovered && (
          <div className="absolute bottom-3 left-3 rounded-lg border border-zinc-700 bg-zinc-900/95 px-3 py-2 text-xs shadow-lg">
            <p className="text-zinc-200 font-medium">{hovered.label}</p>
            <p className="text-zinc-500 font-mono mt-0.5">
              x {hovered.x} · y {hovered.y} · z {hovered.z}
            </p>
            {!hovered.inside && <p className="text-red-400 mt-0.5">Fuera de la región</p>}
          </div>
        )}
      </div>

      {spawnerGroups.length > 0 && visible.spawner && (
        <div className="flex items-center gap-3 flex-wrap text-xs">
          <span className="text-zinc-500 flex items-center gap-1.5">
            <Skull size={13} /> Grupos de spawners:
          </span>
          {spawnerGroups.map((group, i) => (
            <span key={group} className="flex items-center gap-1.5 text-zinc-300">
              <span className="h-2 w-2 rounded-full" style={{ background: GROUP_COLORS[i % GROUP_COLORS.length] }} />
              <span className="font-mono">{group}</span>
              <span className="text-zinc-600">
                {map.markers.filter((m) => m.kind === 'spawner' && m.group === group).length}
              </span>
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 text-[11px] text-zinc-600">
        <span className="flex items-center gap-1.5">
          <Home size={12} /> cuadrado = lobby
        </span>
        <span className="flex items-center gap-1.5">
          <Package size={12} /> círculo grande = loot chest
        </span>
        <span>· borde rojo = fuera de la región</span>
      </div>
    </div>
  );
}
