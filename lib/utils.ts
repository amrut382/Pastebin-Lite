import { PasteData } from './kv';

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

export function getCurrentTime(testMode: boolean, testNowHeader?: string): number {
  if (testMode && testNowHeader) {
    const testTime = parseInt(testNowHeader, 10);
    if (!isNaN(testTime)) {
      return testTime;
    }
  }
  return Date.now();
}

export function isPasteAvailable(
  paste: PasteData,
  currentTime: number
): { available: boolean; reason?: string } {
  // Check expiry
  if (paste.expires_at !== null && currentTime >= paste.expires_at) {
    return { available: false, reason: 'expired' };
  }

  // Check view limit
  if (paste.max_views !== null && paste.views_used >= paste.max_views) {
    return { available: false, reason: 'view_limit_exceeded' };
  }

  return { available: true };
}

export function calculateExpiresAt(
  ttlSeconds: number | undefined,
  createdAt: number
): number | null {
  if (ttlSeconds === undefined || ttlSeconds === null) {
    return null;
  }
  return createdAt + ttlSeconds * 1000;
}
