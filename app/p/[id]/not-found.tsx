import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container">
      <div className="not-found">
        <h1>404</h1>
        <h2>Paste Not Found</h2>
        <p>The paste you're looking for doesn't exist, has expired, or has exceeded its view limit.</p>
        <Link href="/" className="btn btn-primary" style={{ marginTop: '2rem' }}>
          Create New Paste
        </Link>
      </div>
    </div>
  );
}
