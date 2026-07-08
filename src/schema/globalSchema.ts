import type { FieldDef } from './registry';

// Kit.java — global (kits/<id>.yml)
// ⚠️ Inventory/Equipment se guardan como NBT tag string crudo en el plugin
// real (ItemNbt.getTagString), no como el formato legible de Reward/LootChest.
// Fase 3 arranca con un campo de texto para pegar el NBT ya exportado desde
// el juego; un item-builder visual completo queda para más adelante.
export const KIT_FIELDS: FieldDef[] = [
  { key: 'Name', label: 'Nombre', type: 'text' },
  { key: 'Description', label: 'Descripción', type: 'string_list' },
  { key: 'Icon.Material', label: 'Ícono — Material', type: 'text', placeholder: 'CHEST' },
  { key: 'Icon.CustomModelData', label: 'Ícono — Custom Model Data', type: 'number', default: 0 },
  { key: 'Permission_Required', label: 'Requiere permiso', type: 'boolean', default: false },
  { key: 'Commands', label: 'Comandos al equipar', type: 'string_list' },
  { key: 'Cost', label: 'Costo por moneda', type: 'map_number' },
  {
    key: 'Attributes',
    label: 'Atributos (solo Amount — Multiplier no soportado aún)',
    type: 'map_number',
    desc: 'Ej: GENERIC_MAX_HEALTH -> 20. Si necesitás Multiplier, avisame para agregarlo.',
  },
  { key: 'Potion_Effects', label: 'Efectos de poción (nombre -> amplifier)', type: 'map_number' },
  {
    key: 'Inventory',
    label: 'Inventario (NBT crudo por slot 0-35)',
    type: 'map_text',
    desc: 'Pegá el tag NBT exportado desde el juego para cada slot. Item-builder visual: pendiente.',
  },
  {
    key: 'Equipment',
    label: 'Equipo (NBT crudo por slot: HEAD/CHEST/LEGS/FEET/HAND/OFF_HAND)',
    type: 'map_text',
  },
];

// MobTemplate.java — global (mobs/<id>.yml), provider "ada"
export const MOB_TEMPLATE_FIELDS: FieldDef[] = [
  { key: 'EntityType', label: 'Tipo de entidad', type: 'text', placeholder: 'ZOMBIE' },
  { key: 'DisplayName.Value', label: 'Nombre mostrado', type: 'text' },
  { key: 'DisplayName.AlwaysVisible', label: 'Nametag siempre visible', type: 'boolean', default: false },
  { key: 'Style', label: 'Variantes visuales', type: 'map_text', desc: 'Ej: color -> BLUE (según MobVariantRegistry)' },
  { key: 'Equipment', label: 'Equipo (NBT crudo por slot)', type: 'map_text' },
  { key: 'Attributes', label: 'Atributos escalables por nivel', type: 'attribute_scale_map' },
];
