// Utilidades genéricas para leer/escribir valores anidados usando una key
// tipo "Amount.Min" dentro de un objeto plano { Amount: { Min: ... } }.

export function getNested(obj: Record<string, any> | undefined, path: string): any {
  if (!obj) return undefined;
  const parts = path.split('.');
  let cur: any = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

export function setNested(obj: Record<string, any>, path: string, value: any): void {
  const parts = path.split('.');
  let cur: any = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (typeof cur[p] !== 'object' || cur[p] === null) {
      cur[p] = {};
    }
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
}
