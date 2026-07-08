import type { DungeonProject } from '../schema/project';
import type { LoadedFile } from '../schema/types';

export interface FlowEdge {
  fromScript: string;
  toKind: 'stage' | 'level' | 'end';
  toId: string;
  chance: number;
  runIf: string;
}

export interface FlowNode {
  kind: 'stage' | 'level';
  id: string;
  edges: FlowEdge[];
}

function fileId(fileName: string): string {
  return fileName.replace(/\.ya?ml$/i, '');
}

function edgesForFile(file: LoadedFile): FlowEdge[] {
  const edges: FlowEdge[] = [];
  file.handlers.forEach((h) => {
    h.actions.forEach((a) => {
      if (a.type === 'set_stage') {
        edges.push({ fromScript: h.name, toKind: 'stage', toId: String(a.values['StageId'] ?? ''), chance: a.chance, runIf: a.runIf });
      } else if (a.type === 'set_level') {
        edges.push({ fromScript: h.name, toKind: 'level', toId: String(a.values['LevelId'] ?? ''), chance: a.chance, runIf: a.runIf });
      } else if (a.type === 'dungeon_end') {
        edges.push({ fromScript: h.name, toKind: 'end', toId: a.values['Completed'] ? 'Victoria' : 'Derrota', chance: a.chance, runIf: a.runIf });
      }
    });
  });
  return edges;
}

export function computeFlow(project: DungeonProject): FlowNode[] {
  const nodes: FlowNode[] = [];
  project.stages.forEach((s) => nodes.push({ kind: 'stage', id: fileId(s.fileName), edges: edgesForFile(s) }));
  project.levels.forEach((l) => nodes.push({ kind: 'level', id: fileId(l.fileName), edges: edgesForFile(l) }));
  return nodes;
}
