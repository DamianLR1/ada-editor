import { ITEM_FIELDS } from '../schema/itemSchema';
import { parseValuesFromFields, defaultValuesForFields, serializeValuesToRawFields } from '../schema/fields';
import { nextUid } from '../schema/types';

export interface ItemInstance {
  uid: string;
  values: Record<string, any>;
}

export interface RewardFile {
  fileName: string;
  name: string;
  description: string[];
  items: ItemInstance[];
  commands: string[];
}

export function newItemInstance(): ItemInstance {
  return { uid: nextUid(), values: defaultValuesForFields(ITEM_FIELDS) };
}

export function parseRewardFile(fileName: string, raw: Record<string, any>): RewardFile {
  const itemsRaw = raw?.Items || {};
  const items: ItemInstance[] = Object.keys(itemsRaw).map((key) => ({
    uid: nextUid(),
    values: parseValuesFromFields(ITEM_FIELDS, itemsRaw[key]),
  }));

  return {
    fileName,
    name: raw?.Name ?? fileName.replace(/\.ya?ml$/, ''),
    description: Array.isArray(raw?.Description) ? raw.Description : raw?.Description ? [String(raw.Description)] : [],
    items,
    commands: Array.isArray(raw?.Commands) ? raw.Commands : [],
  };
}

export function newRewardFile(fileName: string): RewardFile {
  return { fileName, name: fileName.replace(/\.ya?ml$/, ''), description: [], items: [], commands: [] };
}

export function serializeRewardFile(reward: RewardFile): Record<string, any> {
  const itemsRaw: Record<string, any> = {};
  reward.items.forEach((it, i) => {
    itemsRaw[String(i)] = serializeValuesToRawFields(ITEM_FIELDS, it.values);
  });
  return {
    Name: reward.name,
    Description: reward.description,
    Items: itemsRaw,
    Commands: reward.commands,
  };
}
