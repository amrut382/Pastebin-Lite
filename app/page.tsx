'use client';

import { useState } from 'react';

export default function Home() {
  const [content, setContent] = useState('');
  const [ttlSeconds, setTtlSeconds] = useState('');
  const [maxViews, setMaxViews] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ id: string; url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const body: any = { content };
      if (ttlSeconds) {
        body.ttl_seconds = parseInt(ttlSeconds, 10);
      }
      if (maxViews) {
        body.max_views = parseInt(maxViews, 10);
      }

      const response = await fetch('/api/pastes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create paste');
        return;
      }

      setResult(data);
      setContent('');
      setTtlSeconds('');
      setMaxViews('');
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Pastebin-Lite</h1>
      <p>Create a text paste and share it with a URL.</p>

      <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="content" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Content <span style={{ color: 'red' }}>*</span>
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={10}
            style={{
              width: '100%',
              padding: '0.5rem',
              fontFamily: 'monospace',
              fontSize: '14px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="ttl" style={{ display: 'block', marginBottom: '0.5rem' }}>
            TTL (seconds, optional)
          </label>
          <input
            type="number"
            id="ttl"
            value={ttlSeconds}
            onChange={(e) => setTtlSeconds(e.target.value)}
            min="1"
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="maxViews" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Max Views (optional)
          </label>
          <input
            type="number"
            id="maxViews"
            value={maxViews}
            onChange={(e) => setMaxViews(e.target.value)}
            min="1"
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
          }}
        >
          {loading ? 'Creating...' : 'Create Paste'}
        </button>
      </form>

      {error && (
        <div
          style={{
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: '#fee',
            color: '#c00',
            borderRadius: '4px',
          }}
        >
          Error: {error}
        </div>
      )}

      {result && (
        <div
          style={{
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: '#efe',
            borderRadius: '4px',
          }}
        >
          <p style={{ marginBottom: '0.5rem' }}>Paste created successfully!</p>
          <p>
            <strong>URL:</strong>{' '}
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#0070f3', wordBreak: 'break-all' }}
            >
              {result.url}
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
