import type { LoadedFile } from './types';
import type { RewardFile } from '../yaml/rewardParser';
import type { LootChestFile } from '../yaml/lootChestParser';

export interface PassthroughFile {
  path: string;             // ruta relativa dentro de la carpeta de la dungeon (sin el nombre de la carpeta raíz)
  isBinary: boolean;
  textContent?: string;
  binaryContent?: ArrayBuffer;
}

export interface DungeonProject {
  dungeonName: string;               // nombre de la carpeta raíz (ej. "Cripta")
  configRaw: Record<string, any>;    // config.yml parseado
  levels: LoadedFile[];
  stages: LoadedFile[];
  rewards: RewardFile[];
  lootChests: LootChestFile[];
  passthroughFiles: PassthroughFile[]; // spots/*, y cualquier otro archivo no editable en esta fase
}

export function emptyProject(name: string): DungeonProject {
  return {
    dungeonName: name,
    configRaw: {
      WorldName: 'world_dungeons',
      StartLevel: 'default',
      StartStage: 'stage1',
      Name: name,
      Description: [],
      Prefix: '',
    },
    levels: [],
    stages: [],
    rewards: [],
    lootChests: [],
    passthroughFiles: [],
  };
}
