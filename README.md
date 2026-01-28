# Pastebin-Lite

A simple pastebin service built with Next.js, TypeScript, and Vercel KV for persistence.

## Project Description

Pastebin-Lite allows users to:
- Create text pastes with optional TTL (time-to-live) and view limits
- Receive shareable URLs for their pastes
- View pastes via the shareable URL
- Automatically expire pastes when TTL expires or view limit is exceeded

## Features

- **Time-based expiry**: Pastes can be set to expire after a certain number of seconds
- **View limit**: Pastes can be limited to a maximum number of views
- **Serverless-ready**: Built for Vercel deployment with KV storage
- **Test mode**: Supports deterministic testing via `TEST_MODE` environment variable

## Persistence Layer

This project uses **Vercel KV** (Redis-compatible) for persistence. Vercel KV provides:
- Serverless-compatible storage
- Fast key-value operations
- Automatic scaling
- No manual database migrations required

The data model stores:
- `id`: Unique identifier for the paste
- `content`: The paste content
- `created_at`: Timestamp when paste was created
- `expires_at`: Timestamp when paste expires (null if no TTL)
- `max_views`: Maximum number of views allowed (null if unlimited)
- `views_used`: Current number of views

## Local Run Instructions

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Vercel KV account (free tier available)

### Setup Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Vercel KV:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Create a new KV database or use an existing one
   - Copy the `KV_REST_API_URL` and `KV_REST_API_TOKEN`

3. **Configure environment variables:**
   - Copy `.env.example` to `.env.local`
   - Fill in your Vercel KV credentials:
     ```
     KV_REST_API_URL=your_kv_url
     KV_REST_API_TOKEN=your_kv_token
     ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Alternative: Using Local Redis

If you prefer to use a local Redis instance instead of Vercel KV:

1. Install Redis locally
2. Update `lib/kv.ts` to use `@vercel/kv` with local Redis connection:
   ```typescript
   import { createClient } from '@vercel/kv';
   
   const kv = createClient({
     url: process.env.REDIS_URL || 'redis://localhost:6379',
     token: process.env.REDIS_TOKEN || '',
   });
   ```

### Testing

The project supports deterministic testing via the `TEST_MODE` environment variable:

1. Set `TEST_MODE=1` in your `.env.local`
2. Send requests with `x-test-now-ms` header to control the "current time" for expiry logic
3. This allows for predictable testing of TTL expiration

## API Endpoints

### GET /api/healthz
Health check endpoint. Returns `{ "ok": true }` if the persistence layer is reachable.

### POST /api/pastes
Create a new paste.

**Request body:**
```json
{
  "content": "string",
  "ttl_seconds": 60,
  "max_views": 5
}
```

**Response:**
```json
{
  "id": "string",
  "url": "https://<deployment-domain>/p/<id>"
}
```

### GET /api/pastes/:id
Fetch paste data (increments view count).

**Response:**
```json
{
  "content": "string",
  "remaining_views": 4,
  "expires_at": "ISO string or null"
}
```

### GET /p/:id
View paste as HTML page.

## Deployment

1. Push your code to a Git repository
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
4. Deploy!

The app will automatically build and deploy on Vercel.

## Project Structure

```
.
├── app/
│   ├── api/
│   │   ├── healthz/
│   │   │   └── route.ts          # Health check endpoint
│   │   └── pastes/
│   │       ├── route.ts          # POST /api/pastes
│   │       └── [id]/
│   │           └── route.ts      # GET /api/pastes/:id
│   ├── p/
│   │   └── [id]/
│   │       ├── page.tsx          # GET /p/:id (HTML view)
│   │       └── not-found.tsx     # 404 page
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── lib/
│   ├── kv.ts                     # Persistence layer
│   └── utils.ts                  # Utility functions
├── .env.example                  # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

## Notes

- Pastes are automatically cleaned up when they expire or exceed view limits
- Content is HTML-escaped to prevent XSS attacks
- The project uses serverless-safe storage (no in-memory storage)
- All API responses are JSON (except HTML view page)
