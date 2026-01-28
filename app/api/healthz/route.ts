import { NextResponse } from 'next/server';
import { checkPersistence } from '@/lib/mongodb';

export async function GET() {
  try {
    const persistenceOk = await checkPersistence();
    
    return NextResponse.json(
      { ok: persistenceOk },
      { status: persistenceOk ? 200 : 503 }
    );
  } catch (error) {
    return NextResponse.json(
      { ok: false },
      { status: 503 }
    );
  }
}
