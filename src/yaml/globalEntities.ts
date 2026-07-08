import * as yaml from 'js-yaml';
import JSZip from 'jszip';

export interface GlobalEntityFile {
  fileName: string;
  raw: Record<string, any>;
}

export function parseGlobalFiles(fileList: FileList): Promise<GlobalEntityFile[]> {
  const files = Array.from(fileList);
  return Promise.all(
    files.map(
      (file) =>
        new Promise<GlobalEntityFile>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const raw = (yaml.load(String(reader.result)) as Record<string, any>) || {};
              resolve({ fileName: file.name, raw });
            } catch (err) {
              reject(err);
            }
          };
          reader.onerror = () => reject(reader.error);
          reader.readAsText(file);
        })
    )
  );
}

export async function exportGlobalZip(kits: GlobalEntityFile[], mobTemplates: GlobalEntityFile[]): Promise<Blob> {
  const zip = new JSZip();
  if (kits.length > 0) {
    const kitsFolder = zip.folder('kits')!;
    kits.forEach((k) => kitsFolder.file(k.fileName, yaml.dump(k.raw, { lineWidth: -1, noRefs: true })));
  }
  if (mobTemplates.length > 0) {
    const mobsFolder = zip.folder('mobs')!;
    mobTemplates.forEach((m) => mobsFolder.file(m.fileName, yaml.dump(m.raw, { lineWidth: -1, noRefs: true })));
  }
  return zip.generateAsync({ type: 'blob' });
}
