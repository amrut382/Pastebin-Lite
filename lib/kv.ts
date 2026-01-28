import { kv } from '@vercel/kv';

export interface PasteData {
  id: string;
  content: string;
  created_at: number;
  expires_at: number | null;
  max_views: number | null;
  views_used: number;
}

const PASTE_PREFIX = 'paste:';

export async function getPaste(id: string): Promise<PasteData | null> {
  try {
    const data = await kv.get<PasteData>(`${PASTE_PREFIX}${id}`);
    return data;
  } catch (error) {
    console.error('Error fetching paste:', error);
    return null;
  }
}

export async function savePaste(paste: PasteData): Promise<boolean> {
  try {
    await kv.set(`${PASTE_PREFIX}${paste.id}`, paste);
    return true;
  } catch (error) {
    console.error('Error saving paste:', error);
    return false;
  }
}

export async function incrementViews(id: string): Promise<boolean> {
  try {
    const paste = await getPaste(id);
    if (!paste) {
      return false;
    }
    paste.views_used += 1;
    await savePaste(paste);
    return true;
  } catch (error) {
    console.error('Error incrementing views:', error);
    return false;
  }
}

export async function checkPersistence(): Promise<boolean> {
  try {
    await kv.ping();
    return true;
  } catch (error) {
    console.error('Persistence check failed:', error);
    return false;
  }
}
