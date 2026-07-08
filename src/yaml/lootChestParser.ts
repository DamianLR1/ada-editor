import { ITEM_FIELDS } from '../schema/itemSchema';
import { parseValuesFromFields, defaultValuesForFields, serializeValuesToRawFields } from '../schema/fields';
import { nextUid } from '../schema/types';
import type { ScalableAmountValue } from '../schema/fields';
import { defaultScalableAmountValue, parseScalableAmountRaw, serializeScalableAmountRaw } from '../schema/fields';

export interface LootItemInstance {
  uid: string;
  name: string;             // clave dentro de "Items" en el YAML
  weight: number;
  itemValues: Record<string, any>;
}

export interface LootChestFile {
  fileName: string;
  location: string;          // "x,y,z" del bloque del cofre
  itemsAmount: ScalableAmountValue;
  uniqueOnly: boolean;
  items: LootItemInstance[];
}

export function newLootItemInstance(): LootItemInstance {
  return { uid: nextUid(), name: 'item1', weight: 10, itemValues: defaultValuesForFields(ITEM_FIELDS) };
}

export function parseLootChestFile(fileName: string, raw: Record<string, any>): LootChestFile {
  const itemsRaw = raw?.Items || {};
  const items: LootItemInstance[] = Object.keys(itemsRaw).map((key) => ({
    uid: nextUid(),
    name: key,
    weight: Number(itemsRaw[key]?.Weight ?? 1),
    itemValues: parseValuesFromFields(ITEM_FIELDS, itemsRaw[key]?.Item || {}),
  }));

  return {
    fileName,
    location: raw?.Location ?? '',
    itemsAmount: parseScalableAmountRaw(raw?.ItemsAmount),
    uniqueOnly: !!raw?.UniqueOnly,
    items,
  };
}

export function newLootChestFile(fileName: string): LootChestFile {
  return { fileName, location: '', itemsAmount: defaultScalableAmountValue(), uniqueOnly: false, items: [] };
}

export function serializeLootChestFile(chest: LootChestFile): Record<string, any> {
  const itemsRaw: Record<string, any> = {};
  chest.items.forEach((it) => {
    itemsRaw[it.name] = {
      Weight: it.weight,
      Item: serializeValuesToRawFields(ITEM_FIELDS, it.itemValues),
    };
  });
  return {
    Location: chest.location,
    ItemsAmount: serializeScalableAmountRaw(chest.itemsAmount),
    UniqueOnly: chest.uniqueOnly,
    Items: itemsRaw,
  };
}
