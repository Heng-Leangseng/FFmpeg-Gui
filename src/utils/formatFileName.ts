export function formatFileName(name: string, maxLength = 28): string {
  if (name.length <= maxLength) return name;
  const dot = name.lastIndexOf('.');
  const ext = dot > 0 ? name.slice(dot) : '';
  const base = ext ? name.slice(0, dot) : name;
  const keep = Math.max(4, maxLength - ext.length - 1);
  const start = Math.ceil(keep * 0.6);
  const end = keep - start;
  return `${base.slice(0, start)}…${base.slice(Math.max(0, base.length - end))}${ext}`;
}
