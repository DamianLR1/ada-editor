# ADAForge

Editor visual de dungeons para [AdvancedDungeonArena](https://github.com/DamianLR1/advanced-dugeon-arena),
el fork 8.5.1 con agregados para servidores RPG.

Es 100% frontend: **los archivos nunca salen de tu navegador**. Importás la carpeta de una dungeon,
la editás, y te bajás un `.zip` con la misma estructura para pegar en el server.

## Qué se puede editar

| Sección | Archivos |
|---|---|
| Configuración general | `config.yml` — mundo, región, lobby, spawners, features, GameSettings |
| Niveles | `levels/*.yml` — scripts (EventHandlers) |
| Stages | `stages/*.yml` — scripts + tareas |
| Rewards | `rewards/*.yml` |
| Loot chests | `loot_chests/*.yml` |
| Kits y mob templates | globales, se importan y exportan aparte |

Lo que el editor todavía no entiende (`spots/*`, cualquier archivo extra) **se conserva tal cual**
al exportar, así que no perdés nada.

## Lo que trae

- **Resumen del proyecto.** Un panel con todo de un vistazo: stages, niveles, scripts, acciones,
  tareas, spawners, tamaño de la región, mobs que spawnea, variables y estado de la validación.
- **Mapa de la dungeon.** Vista cenital con la región, el lobby, cada spawner y cada loot chest en
  su posición real. Lo que quedó fuera de la región se marca en rojo, que es el error de config más
  típico y el más difícil de ver leyendo YAML.
- **Diagrama de flujo.** El recorrido de stages y levels dibujado en columnas por profundidad, con
  las probabilidades y condiciones de cada salto. Los nodos inalcanzables salen punteados.
- **Formularios generados desde un registry.** `src/schema/registry.ts` es la única fuente de verdad:
  21 conditions, 17 actions y 6 tasks, con los nombres de campo exactos que espera el plugin. Está
  sacado del código Java real, no de la wiki (que está incompleta).
- **Validación cruzada.** Detecta referencias rotas antes de subir nada: `StageId`, `LevelId`,
  `RewardId`, `SpotId`, `SpawnerId`, `TaskId` y variables usadas sin definir.
- **Referencia del fork.** Comandos, placeholders, records, permisos y claves de lang que agrega el
  fork, buscables, sin salir de la página.

Los agregados del fork aparecen marcados con `[fork]` en la interfaz: la acción `clear_mobs`, los
scalers `average_level` y `difficulty`, y la bossbar de objetivos.

## Desarrollo

```bash
npm install
npm run dev      # servidor local
npm run build    # genera dist/
npm run check    # self-check de la logica pura (mapa, flujo, resumen, spawners)
npm run lint
```

Requiere Node 20+.

## Deploy

Ya está configurado para GitHub Pages. Ver [DEPLOY.md](DEPLOY.md) — cada push a `main` publica solo.
