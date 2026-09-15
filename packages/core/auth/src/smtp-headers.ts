function isSafeHeaderToken(value: string): boolean {
  return value.length > 0 && !/[\r\n]/.test(value);
}

export function formatReplyToHeader(name: string | undefined, email: string | undefined): string | undefined {
  const addr = (email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr) || !isSafeHeaderToken(addr)) {
    return undefined;
  }
  const display = (name || '').replace(/"/g, '').trim();
  if (!display || /[\r\n]/.test(display)) {
    return addr;
  }
  return `${display} <${addr}>`;
}
