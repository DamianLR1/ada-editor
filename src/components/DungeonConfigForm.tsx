import { useState } from 'react';
import {
  DUNGEON_GENERAL_FIELDS,
  DUNGEON_AREA_FIELDS,
  DUNGEON_SPAWNERS_FIELDS,
  DUNGEON_FEATURES_FIELDS,
  DUNGEON_GAME_FIELDS,
} from '../schema/dungeonSchema';
import { parseValuesFromFields, writeFieldValue } from '../schema/fields';
import type { FieldDef } from '../schema/registry';
import { FieldSectionForm } from './FieldSectionForm';

interface Props {
  raw: Record<string, any>;
  onChange: (raw: Record<string, any>) => void;
}

const TABS: { id: string; label: string; fields: FieldDef[] }[] = [
  { id: 'general', label: 'General', fields: DUNGEON_GENERAL_FIELDS },
  { id: 'area', label: 'Área y Lobby', fields: DUNGEON_AREA_FIELDS },
  { id: 'spawners', label: 'Spawners', fields: DUNGEON_SPAWNERS_FIELDS },
  { id: 'features', label: 'Features', fields: DUNGEON_FEATURES_FIELDS },
  { id: 'game', label: 'Ajustes de partida', fields: DUNGEON_GAME_FIELDS },
];

export function DungeonConfigForm({ raw, onChange }: Props) {
  const [tab, setTab] = useState('general');
  const activeTab = TABS.find((t) => t.id === tab)!;
  const values = parseValuesFromFields(activeTab.fields, raw);

  const handleFieldChange = (key: string, value: any) => {
    const next = { ...raw };
    const field = activeTab.fields.find((f) => f.key === key)!;
    writeFieldValue(field, next, value);
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1 border-b border-zinc-800 pb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-md text-sm ${
              tab === t.id ? 'bg-amber-500/15 text-amber-300 border border-amber-600/40' : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <FieldSectionForm fields={activeTab.fields} values={values} onChange={handleFieldChange} />
    </div>
  );
}
