export function nowIso(): string {
  return new Date().toISOString();
}

export function addSeconds(iso: string, seconds: number): string {
  return new Date(new Date(iso).getTime() + seconds * 1000).toISOString();
}

export function isExpired(expiresAt: string): boolean {
  return Date.now() > new Date(expiresAt).getTime();
}

export function ageSeconds(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
}

export function secondsUntil(iso: string): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 1000));
}
