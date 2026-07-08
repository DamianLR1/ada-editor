import * as yaml from 'js-yaml';
import { parseYamlFile } from './parser';
import { parseRewardFile } from './rewardParser';
import { parseLootChestFile } from './lootChestParser';
import type { DungeonProject, PassthroughFile } from '../schema/project';

const TEXT_EXTENSIONS = ['.yml', '.yaml'];

function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

function readAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Importa una carpeta completa de dungeon (seleccionada con <input webkitdirectory>).
 * Espera la estructura: <NombreDungeon>/config.yml, /levels/*.yml, /stages/*.yml,
 * y cualquier otra cosa (rewards/, loot_chests/, spots/) se preserva tal cual.
 */
export async function importDungeonFolder(fileList: FileList): Promise<DungeonProject> {
  const files = Array.from(fileList);
  if (files.length === 0) throw new Error('No se seleccionaron archivos.');

  const firstPath = (files[0] as any).webkitRelativePath || files[0].name;
  const dungeonName = firstPath.split('/')[0];

  let configRaw: Record<string, any> = {};
  const levels: DungeonProject['levels'] = [];
  const stages: DungeonProject['stages'] = [];
  const rewards: DungeonProject['rewards'] = [];
  const lootChests: DungeonProject['lootChests'] = [];
  const passthroughFiles: PassthroughFile[] = [];

  for (const file of files) {
    const relPath: string = (file as any).webkitRelativePath || file.name;
    const withoutRoot = relPath.split('/').slice(1).join('/'); // quita "<NombreDungeon>/"
    if (!withoutRoot) continue;

    const lower = withoutRoot.toLowerCase();
    const isText = TEXT_EXTENSIONS.some((ext) => lower.endsWith(ext));

    if (withoutRoot === 'config.yml') {
      const text = await readAsText(file);
      configRaw = (yaml.load(text) as Record<string, any>) || {};
      continue;
    }

    if (lower.startsWith('levels/') && isText) {
      const text = await readAsText(file);
      levels.push(parseYamlFile(withoutRoot.split('/').pop()!, text));
      continue;
    }

    if (lower.startsWith('stages/') && isText) {
      const text = await readAsText(file);
      stages.push(parseYamlFile(withoutRoot.split('/').pop()!, text));
      continue;
    }

    if (lower.startsWith('rewards/') && isText) {
      const text = await readAsText(file);
      const raw = (yaml.load(text) as Record<string, any>) || {};
      rewards.push(parseRewardFile(withoutRoot.split('/').pop()!, raw));
      continue;
    }

    if (lower.startsWith('loot_chests/') && isText) {
      const text = await readAsText(file);
      const raw = (yaml.load(text) as Record<string, any>) || {};
      lootChests.push(parseLootChestFile(withoutRoot.split('/').pop()!, raw));
      continue;
    }

    // Todo lo demás (spots/*.yml, spots/*.schema2, etc.) se preserva sin
    // tocar para no perder datos al exportar.
    if (isText) {
      const text = await readAsText(file);
      passthroughFiles.push({ path: withoutRoot, isBinary: false, textContent: text });
    } else {
      const buf = await readAsArrayBuffer(file);
      passthroughFiles.push({ path: withoutRoot, isBinary: true, binaryContent: buf });
    }
  }

  return { dungeonName, configRaw, levels, stages, rewards, lootChests, passthroughFiles };
}
