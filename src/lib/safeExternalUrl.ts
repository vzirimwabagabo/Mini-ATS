export function safeExternalUrl(value?: string): string | undefined {
  if (!value) return undefined;

  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:' || url.username || url.password) return undefined;
    return url.href;
  } catch {
    return undefined;
  }
}