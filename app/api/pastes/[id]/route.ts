import { NextRequest, NextResponse } from 'next/server';
import { getPaste, incrementViews } from '@/lib/kv';
import { getCurrentTime, isPasteAvailable } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const paste = await getPaste(id);

    if (!paste) {
      return NextResponse.json(
        { error: 'Paste not found' },
        { status: 404 }
      );
    }

    // Check if paste is available
    const testMode = process.env.TEST_MODE === '1';
    const testNowHeader = request.headers.get('x-test-now-ms') || undefined;
    const currentTime = getCurrentTime(testMode, testNowHeader);

    const availability = isPasteAvailable(paste, currentTime);
    if (!availability.available) {
      return NextResponse.json(
        { error: 'Paste not available' },
        { status: 404 }
      );
    }

    // Increment view count BEFORE returning
    await incrementViews(id);

    // Fetch updated paste to get current view count
    const updatedPaste = await getPaste(id);
    if (!updatedPaste) {
      return NextResponse.json(
        { error: 'Paste not found' },
        { status: 404 }
      );
    }

    const remainingViews = updatedPaste.max_views !== null
      ? Math.max(0, updatedPaste.max_views - updatedPaste.views_used)
      : null;

    const expiresAt = updatedPaste.expires_at !== null
      ? new Date(updatedPaste.expires_at).toISOString()
      : null;

    return NextResponse.json({
      content: updatedPaste.content,
      remaining_views: remainingViews,
      expires_at: expiresAt,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
