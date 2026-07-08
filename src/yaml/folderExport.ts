import JSZip from 'jszip';
import * as yaml from 'js-yaml';
import type { DungeonProject } from '../schema/project';
import { serializeYamlFile } from './serializer';
import { serializeRewardFile } from './rewardParser';
import { serializeLootChestFile } from './lootChestParser';

export async function exportDungeonZip(project: DungeonProject): Promise<Blob> {
  const zip = new JSZip();
  const root = zip.folder(project.dungeonName)!;

  root.file('config.yml', yaml.dump(project.configRaw, { lineWidth: -1, noRefs: true }));

  const levelsFolder = root.folder('levels')!;
  project.levels.forEach((lvl) => {
    levelsFolder.file(lvl.fileName, serializeYamlFile(lvl));
  });

  const stagesFolder = root.folder('stages')!;
  project.stages.forEach((stg) => {
    stagesFolder.file(stg.fileName, serializeYamlFile(stg));
  });

  if (project.rewards.length > 0) {
    const rewardsFolder = root.folder('rewards')!;
    project.rewards.forEach((r) => {
      rewardsFolder.file(r.fileName, yaml.dump(serializeRewardFile(r), { lineWidth: -1, noRefs: true }));
    });
  }

  if (project.lootChests.length > 0) {
    const lootFolder = root.folder('loot_chests')!;
    project.lootChests.forEach((c) => {
      lootFolder.file(c.fileName, yaml.dump(serializeLootChestFile(c), { lineWidth: -1, noRefs: true }));
    });
  }

  project.passthroughFiles.forEach((f) => {
    if (f.isBinary && f.binaryContent) {
      root.file(f.path, f.binaryContent);
    } else if (f.textContent !== undefined) {
      root.file(f.path, f.textContent);
    }
  });

  return zip.generateAsync({ type: 'blob' });
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
