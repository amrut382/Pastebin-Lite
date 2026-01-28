import { NextRequest, NextResponse } from 'next/server';
import { savePaste } from '@/lib/kv';
import { generateId, getCurrentTime, calculateExpiresAt } from '@/lib/utils';

interface CreatePasteRequest {
  content: string;
  ttl_seconds?: number;
  max_views?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreatePasteRequest = await request.json();

    // Validation
    if (!body.content || typeof body.content !== 'string' || body.content.trim().length === 0) {
      return NextResponse.json(
        { error: 'content is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (body.ttl_seconds !== undefined) {
      if (typeof body.ttl_seconds !== 'number' || !Number.isInteger(body.ttl_seconds) || body.ttl_seconds < 1) {
        return NextResponse.json(
          { error: 'ttl_seconds must be an integer >= 1' },
          { status: 400 }
        );
      }
    }

    if (body.max_views !== undefined) {
      if (typeof body.max_views !== 'number' || !Number.isInteger(body.max_views) || body.max_views < 1) {
        return NextResponse.json(
          { error: 'max_views must be an integer >= 1' },
          { status: 400 }
        );
      }
    }

    // Create paste
    const id = generateId();
    const testMode = process.env.TEST_MODE === '1';
    const testNowHeader = request.headers.get('x-test-now-ms') || undefined;
    const createdAt = getCurrentTime(testMode, testNowHeader);
    const expiresAt = calculateExpiresAt(body.ttl_seconds, createdAt);

    const paste = {
      id,
      content: body.content,
      created_at: createdAt,
      expires_at: expiresAt,
      max_views: body.max_views ?? null,
      views_used: 0,
    };

    const saved = await savePaste(paste);
    if (!saved) {
      return NextResponse.json(
        { error: 'Failed to save paste' },
        { status: 500 }
      );
    }

    // Get deployment domain from request
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const url = `${protocol}://${host}/p/${id}`;

    return NextResponse.json(
      {
        id,
        url,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
