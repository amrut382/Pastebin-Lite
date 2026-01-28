import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPaste } from '@/lib/kv';
import { getCurrentTime, isPasteAvailable } from '@/lib/utils';
import { headers } from 'next/headers';

interface PageProps {
  params: { id: string };
}

async function getPasteData(id: string) {
  const paste = await getPaste(id);
  if (!paste) {
    return null;
  }

  const testMode = process.env.TEST_MODE === '1';
  const headersList = await headers();
  const testNowHeader = headersList.get('x-test-now-ms') || undefined;
  const currentTime = getCurrentTime(testMode, testNowHeader);

  const availability = isPasteAvailable(paste, currentTime);
  if (!availability.available) {
    return null;
  }

  return paste;
}

export default async function PastePage({ params }: PageProps) {
  const paste = await getPasteData(params.id);

  if (!paste) {
    notFound();
  }

  // Escape HTML to prevent XSS
  const escapeHtml = (text: string) => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  };

  const escapedContent = escapeHtml(paste.content);
  const formattedContent = escapedContent.split('\n').map((line, i) => (
    <span key={i}>
      {line}
      {i < escapedContent.split('\n').length - 1 && <br />}
    </span>
  ));

  return (
    <div className="container">
      <Link href="/" className="back-link">
        ← Back to create paste
      </Link>
      <div className="card">
        <h2>Paste Content</h2>
        <div className="paste-content">
          {formattedContent}
        </div>
      </div>
    </div>
  );
}
