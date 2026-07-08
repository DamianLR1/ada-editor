import type { FieldDef, TypeDef } from './registry';
import { getNested, setNested } from '../lib/nested';

// ---------------------------------------------------------------------------
// ScalableAmount (Initial.Min/Max/AsInteger + Scalers.<BASE>.{Value,Type})
// ---------------------------------------------------------------------------

export interface ScalableAmountValue {
  initialMin: string;
  initialMax: string;
  asInteger: boolean;
  scalers: Record<string, { value: number; type: string }>;
}

export function defaultScalableAmount(): ScalableAmountValue {
  return { initialMin: '0', initialMax: '0', asInteger: false, scalers: {} };
}

function readScalableAmount(raw: any): ScalableAmountValue {
  if (!raw) return defaultScalableAmount();
  const scalers: Record<string, { value: number; type: string }> = {};
  const rawScalers = raw.Scalers || {};
  Object.keys(rawScalers).forEach((k) => {
    scalers[k.toLowerCase()] = {
      value: Number(rawScalers[k]?.Value ?? 0),
      type: rawScalers[k]?.Type ?? 'PLAIN',
    };
  });
  return {
    initialMin: String(raw.Initial?.Min ?? '0'),
    initialMax: String(raw.Initial?.Max ?? '0'),
    asInteger: !!raw.Initial?.AsInteger,
    scalers,
  };
}

function writeScalableAmount(value: ScalableAmountValue): any {
  const scalers: Record<string, any> = {};
  Object.keys(value.scalers || {}).forEach((k) => {
    scalers[k.toUpperCase()] = {
      Value: value.scalers[k].value,
      Type: value.scalers[k].type,
    };
  });
  const out: Record<string, any> = {
    Initial: {
      Min: value.initialMin,
      Max: value.initialMax,
      AsInteger: value.asInteger,
    },
  };
  // El plugin omite la clave "Scalers" por completo cuando no hay escaladores
  // (ScalableAmount.write() hace config.remove + forEach sobre un mapa vacío).
  if (Object.keys(scalers).length > 0) {
    out.Scalers = scalers;
  }
  return out;
}

// ---------------------------------------------------------------------------
// VarDefinitions (define_variable's "Variables" map: name -> "initial;min;max")
// ---------------------------------------------------------------------------

export interface VarDefinitionValue {
  name: string;
  initial: number;
  hasBounds: boolean;
  min: number;
  max: number;
}

function readVarDefinitions(raw: any): VarDefinitionValue[] {
  if (!raw || typeof raw !== 'object') return [];
  return Object.keys(raw).map((name) => {
    const parts = String(raw[name]).split(';');
    const initial = Number(parts[0] ?? 0);
    if (parts.length >= 3) {
      return { name, initial, hasBounds: true, min: Number(parts[1]), max: Number(parts[2]) };
    }
    return { name, initial, hasBounds: false, min: 0, max: 0 };
  });
}

function writeVarDefinitions(list: VarDefinitionValue[]): Record<string, string> {
  const out: Record<string, string> = {};
  (list || []).forEach((def) => {
    out[def.name] = def.hasBounds ? `${def.initial};${def.min};${def.max}` : `${def.initial}`;
  });
  return out;
}

export function defaultScalableAmountValue(): ScalableAmountValue {
  return defaultScalableAmount();
}

export function parseScalableAmountRaw(raw: any): ScalableAmountValue {
  return readScalableAmount(raw);
}

export function serializeScalableAmountRaw(value: ScalableAmountValue): any {
  return writeScalableAmount(value);
}

function readAttributeScaleMap(raw: any): Record<string, { initial: number; perLevel: number; min: number; max: number }> {
  if (!raw || typeof raw !== 'object') return {};
  const out: Record<string, { initial: number; perLevel: number; min: number; max: number }> = {};
  Object.keys(raw).forEach((k) => {
    out[k] = {
      initial: Number(raw[k]?.Initial ?? 0),
      perLevel: Number(raw[k]?.PerLevel ?? 0),
      min: Number(raw[k]?.Min ?? 0),
      max: Number(raw[k]?.Max ?? 0),
    };
  });
  return out;
}

function writeAttributeScaleMap(value: Record<string, { initial: number; perLevel: number; min: number; max: number }>): any {
  const out: Record<string, any> = {};
  Object.keys(value || {}).forEach((k) => {
    out[k] = {
      Initial: value[k].initial,
      PerLevel: value[k].perLevel,
      Min: value[k].min,
      Max: value[k].max,
    };
  });
  return out;
}

// ---------------------------------------------------------------------------
// API genérica por FieldDef
// ---------------------------------------------------------------------------

export function defaultFieldValue(field: FieldDef): any {
  switch (field.type) {
    case 'boolean':
      return field.default ?? false;
    case 'number':
      return field.default ?? 0;
    case 'string_list':
      return field.default ?? [];
    case 'map_number':
      return field.default ?? {};
    case 'map_string_list':
      return field.default ?? {};
    case 'map_text':
      return field.default ?? {};
    case 'attribute_scale_map':
      return field.default ?? {};
    case 'scalable_amount':
      return defaultScalableAmount();
    case 'var_definitions':
      return [];
    case 'select':
      return field.default ?? field.options?.[0]?.value ?? '';
    default:
      return field.default ?? '';
  }
}

export function readFieldValue(field: FieldDef, rawSection: Record<string, any>): any {
  if (field.type === 'scalable_amount') {
    return readScalableAmount(getNested(rawSection, field.key));
  }
  if (field.type === 'var_definitions') {
    return readVarDefinitions(getNested(rawSection, field.key));
  }
  if (field.type === 'string_list') {
    const v = getNested(rawSection, field.key);
    return Array.isArray(v) ? v : v ? [String(v)] : [];
  }
  if (field.type === 'attribute_scale_map') {
    return readAttributeScaleMap(getNested(rawSection, field.key));
  }
  const v = getNested(rawSection, field.key);
  return v === undefined ? defaultFieldValue(field) : v;
}

export function writeFieldValue(field: FieldDef, rawSection: Record<string, any>, value: any): void {
  if (field.type === 'scalable_amount') {
    setNested(rawSection, field.key, writeScalableAmount(value as ScalableAmountValue));
    return;
  }
  if (field.type === 'var_definitions') {
    setNested(rawSection, field.key, writeVarDefinitions(value as VarDefinitionValue[]));
    return;
  }
  if (field.type === 'attribute_scale_map') {
    setNested(rawSection, field.key, writeAttributeScaleMap(value));
    return;
  }
  setNested(rawSection, field.key, value);
}

export function parseValuesFromRaw(typeDef: TypeDef, rawSection: Record<string, any>): Record<string, any> {
  return parseValuesFromFields(typeDef.fields, rawSection);
}

export function defaultValuesForType(typeDef: TypeDef): Record<string, any> {
  return defaultValuesForFields(typeDef.fields);
}

export function serializeValuesToRaw(typeDef: TypeDef, values: Record<string, any>): Record<string, any> {
  return serializeValuesToRawFields(typeDef.fields, values);
}

// Variantes standalone que reciben un FieldDef[] directamente (para formularios
// que no son un "tipo con Type" — ej. la config general del dungeon).
export function parseValuesFromFields(fields: FieldDef[], rawSection: Record<string, any>): Record<string, any> {
  const values: Record<string, any> = {};
  fields.forEach((f) => {
    values[f.key] = readFieldValue(f, rawSection || {});
  });
  return values;
}

export function defaultValuesForFields(fields: FieldDef[]): Record<string, any> {
  const values: Record<string, any> = {};
  fields.forEach((f) => {
    values[f.key] = defaultFieldValue(f);
  });
  return values;
}

export function serializeValuesToRawFields(fields: FieldDef[], values: Record<string, any>): Record<string, any> {
  const raw: Record<string, any> = {};
  fields.forEach((f) => {
    writeFieldValue(f, raw, values[f.key]);
  });
  return raw;
}
