import type { FieldDef } from './registry';

// ⚠️ NO VERIFICADO CONTRA CÓDIGO FUENTE: la clase real (AdaptedItem /
// AdaptedItemStack) vive en la librería "nightcore" de NightExpress, que no
// está incluida en este repo ni en el jar (es una dependencia externa en
// tiempo de ejecución). Este schema usa el formato estándar que se ve en
// otros plugins NightExpress (mismo que ya conocés de CrateForge/ExcellentCrates).
// Pasame un rewards/*.yml real exportado desde el juego para ajustar esto
// con precisión si algo no coincide.
export const ITEM_FIELDS: FieldDef[] = [
  { key: 'Material', label: 'Material', type: 'text', placeholder: 'DIAMOND_SWORD' },
  { key: 'Amount', label: 'Cantidad', type: 'number', default: 1 },
  { key: 'Name', label: 'Nombre (MiniMessage)', type: 'text' },
  { key: 'Lore', label: 'Lore', type: 'string_list' },
  { key: 'CustomModelData', label: 'Custom Model Data', type: 'number', default: 0 },
  { key: 'Unbreakable', label: 'Irrompible', type: 'boolean', default: false },
  { key: 'Glow', label: 'Brillo (efecto encantado sin mostrar encantamientos)', type: 'boolean', default: false },
  { key: 'Enchantments', label: 'Encantamientos', type: 'map_number', desc: 'Ej: sharpness -> 5' },
];
